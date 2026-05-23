/**
 * /api/hotmart-webhook
 *
 * UNIFICADO. Esta es la ÚNICA URL que se configura en Hotmart.
 *
 * Hotmart documentación: https://developers.hotmart.com/docs/en/start/webhooks/
 *
 * Eventos manejados:
 *   - PURCHASE_APPROVED   → upsert purchases + CAPI Purchase + tag "comprador"
 *   - PURCHASE_COMPLETE   → idem (algunos productos lo emiten en lugar de APPROVED)
 *   - PURCHASE_REFUNDED   → update status='refunded'  + tag "reembolsado"
 *   - PURCHASE_CHARGEBACK → update status='chargeback' + tag "chargeback"
 *   - CHARGEBACK          → alias del anterior (Hotmart usó ambos nombres en el tiempo)
 *   - PURCHASE_CANCELED   → update status='refunded' (lo tratamos como refund a fines de acceso)
 *
 * Por qué Supabase, CAPI y Systeme van juntos:
 *   Hotmart sólo permite UNA URL de webhook por producto. Antes había dos
 *   endpoints (/api/hotmart-webhook para CAPI/Systeme y /api/pwa/webhook/hotmart
 *   para Supabase) y eso obligaba a elegir cuál perder. Ahora todos los efectos
 *   ocurren en este handler, en orden:
 *     1. Supabase (CRÍTICO: sin esto el comprador no puede entrar a la PWA)
 *     2. CAPI Meta (importante para optimización de ads, pero no rompe UX)
 *     3. Systeme (email marketing tags, no rompe nada)
 *   Si alguno falla, los siguientes se intentan igual y el response final
 *   reporta el estado de cada uno. Hotmart recibe 200 siempre que el evento
 *   sea reconocido para no reintentar.
 *
 * Seguridad: si HOTMART_HOTTOK está configurado, validamos el header
 * 'x-hotmart-hottok'. Si no, aceptamos pero logueamos warning.
 *
 * Idempotencia: la tabla purchases tiene UNIQUE en hotmart_transaction.
 * El upsert con ignoreDuplicates evita compras duplicadas si Hotmart
 * reintenta el mismo evento.
 *
 * GET: 200 OK — para que Hotmart valide el endpoint cuando lo configuras.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendCapiEvent, upsertSystemeContact } from '@/lib/tracking';
import { sendBienvenidaEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';

/* ─── Tipos del payload de Hotmart (parcial, solo lo que usamos) ──── */

type HotmartBuyer = {
  email?: string;
  name?: string;
  document?: string;
  ip?: string;
  fbc?: string;
  fbp?: string;
};

type HotmartPurchase = {
  transaction?: string;
  status?: string;
  price?: { value?: number; currency_value?: string };
  approved_date?: number;
  tracking?: { fbc?: string; fbp?: string };
};

type HotmartProduct = {
  id?: number | string;
  name?: string;
};

type HotmartPayload = {
  event?: string;
  id?: string;
  data?: {
    buyer?: HotmartBuyer;
    purchase?: HotmartPurchase;
    product?: HotmartProduct;
  };
};

/* ─── Helpers ──────────────────────────────────────────────────────── */

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.length > 3;
}

/**
 * Determina si Supabase está configurado. Si falta cualquiera de las dos
 * env vars, devolvemos false y skippeamos las escrituras (con warning).
 * Esto permite que el funnel siga andando en staging sin DB.
 */
function hasSupabase(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/* ─── Acciones por tipo de evento ──────────────────────────────────── */

type ApprovedResult = {
  supabase: 'ok' | 'skipped' | string;
  capi: 'ok' | 'skipped' | string;
  systeme: 'ok' | 'skipped' | string;
  email: 'ok' | 'skipped' | string;
};

async function handleApproved(payload: HotmartPayload): Promise<ApprovedResult> {
  const buyer = payload.data?.buyer ?? {};
  const purchase = payload.data?.purchase ?? {};
  const product = payload.data?.product ?? {};
  const email = (buyer.email ?? '').trim().toLowerCase();

  const value = purchase.price?.value ?? 0;
  const currency = purchase.price?.currency_value ?? 'USD';

  // ─── 1. Supabase upsert (CRÍTICO para acceso a PWA) ─────────────
  let supabaseStatus: ApprovedResult['supabase'] = 'skipped';
  if (hasSupabase()) {
    try {
      const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
      const supabase = createPwaServiceClient();
      const purchasedAt =
        typeof purchase.approved_date === 'number'
          ? new Date(purchase.approved_date).toISOString()
          : new Date().toISOString();

      const { error } = await supabase.from('purchases').upsert(
        {
          email,
          hotmart_transaction: purchase.transaction ?? null,
          product_id: product.id != null ? String(product.id) : null,
          product_name: typeof product.name === 'string' ? product.name : null,
          amount: typeof value === 'number' ? value : null,
          currency,
          status: 'approved',
          purchased_at: purchasedAt,
        },
        { onConflict: 'hotmart_transaction', ignoreDuplicates: true },
      );

      if (error) {
        console.error('[hotmart] supabase upsert error:', error.message);
        supabaseStatus = `error:${error.message}`;
      } else {
        supabaseStatus = 'ok';
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[hotmart] supabase exception:', msg);
      supabaseStatus = `exception:${msg}`;
    }
  } else {
    console.warn('[hotmart] Supabase env vars missing, skipping DB write');
  }

  // ─── 2. Meta CAPI (deduplicación con Pixel client-side) ─────────
  const fbc =
    (typeof buyer.fbc === 'string' && buyer.fbc) ||
    (typeof purchase.tracking?.fbc === 'string' && purchase.tracking.fbc) ||
    undefined;
  const fbp =
    (typeof buyer.fbp === 'string' && buyer.fbp) ||
    (typeof purchase.tracking?.fbp === 'string' && purchase.tracking.fbp) ||
    undefined;

  const capiRes = await sendCapiEvent({
    event_name: 'Purchase',
    action_source: 'website',
    user_data: {
      email,
      ipAddress: buyer.ip,
      fbc,
      fbp,
    },
    custom_data: {
      value,
      currency,
      content_name:
        typeof product.name === 'string' ? product.name : 'Protocolo Anti-Hinchazon',
      content_ids: product.id ? [String(product.id)] : undefined,
    },
  });

  // ─── 3. Systeme tag "comprador" ────────────────────────────────
  const systemeRes = await upsertSystemeContact({
    email,
    nombre: buyer.name,
    tags: ['comprador'],
    fields: purchase.transaction ? { hotmart_transaction: purchase.transaction } : {},
  });

  // ─── 4. Resend: email de bienvenida + acceso a la app ──────────
  // Detectamos el plan desde el product name o price.
  let plan = '1sem';
  if (value >= 25000) plan = '8sem';
  else if (value >= 15000) plan = '4sem';

  const emailSent = await sendBienvenidaEmail({
    to: email,
    nombre: buyer.name,
    plan,
  }).catch(() => false);

  return {
    supabase: supabaseStatus,
    capi: capiRes.ok ? 'ok' : `skipped:${capiRes.reason ?? capiRes.error}`,
    systeme: systemeRes.ok ? 'ok' : `skipped:${systemeRes.reason ?? systemeRes.error}`,
    email: emailSent ? 'ok' : 'skipped',
  };
}

/**
 * Handler común para refund/chargeback/canceled.
 * `dbStatus` es el valor que escribimos en `purchases.status`.
 * `tag` es la etiqueta de Systeme.
 */
async function handleStatusChange(
  payload: HotmartPayload,
  dbStatus: 'refunded' | 'chargeback',
  tag: string,
): Promise<{ supabase: string; systeme: string }> {
  const buyer = payload.data?.buyer ?? {};
  const purchase = payload.data?.purchase ?? {};
  const email = (buyer.email ?? '').trim().toLowerCase();
  const transaction = purchase.transaction;

  // ─── Supabase: marcar status ───────────────────────────────────
  let supabaseStatus = 'skipped';
  if (hasSupabase()) {
    try {
      const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
      const supabase = createPwaServiceClient();

      // Si tenemos transaction, filtramos por ahí (más preciso).
      // Si no, fallback por email (puede afectar varias filas, pero es
      // lo correcto: ese cliente perdió acceso a todo).
      const query = supabase.from('purchases').update({ status: dbStatus });
      const filtered = transaction
        ? query.eq('hotmart_transaction', transaction)
        : query.eq('email', email);

      const { error } = await filtered;
      if (error) {
        console.error(`[hotmart] supabase ${dbStatus} update error:`, error.message);
        supabaseStatus = `error:${error.message}`;
      } else {
        supabaseStatus = 'ok';
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[hotmart] supabase exception:', msg);
      supabaseStatus = `exception:${msg}`;
    }
  }

  // ─── Systeme tag ───────────────────────────────────────────────
  const systemeRes = await upsertSystemeContact({ email, tags: [tag] });

  return {
    supabase: supabaseStatus,
    systeme: systemeRes.ok ? 'ok' : `skipped:${systemeRes.reason ?? systemeRes.error}`,
  };
}

/* ─── HTTP handlers ────────────────────────────────────────────────── */

export async function GET() {
  return NextResponse.json({ ok: true, service: 'hotmart-webhook' });
}

export async function POST(req: NextRequest) {
  // 1. Validación de seguridad
  const expectedHottok = process.env.HOTMART_HOTTOK;
  const receivedHottok = req.headers.get('x-hotmart-hottok');
  if (expectedHottok) {
    if (!receivedHottok || receivedHottok !== expectedHottok) {
      console.warn('[hotmart] hottok inválido o ausente');
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  } else {
    console.warn('[hotmart] HOTMART_HOTTOK no configurado, aceptando sin validar');
  }

  // 2. Parse body
  let body: HotmartPayload;
  try {
    body = (await req.json()) as HotmartPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const event = body.event ?? '';
  const email = (body.data?.buyer?.email ?? '').trim();

  // Sin email no podemos hacer nada útil — Hotmart nunca debería mandar esto,
  // pero lo manejamos por si una integración middleware se rompe.
  if (!email || !isValidEmail(email)) {
    console.warn(`[hotmart] evento ${event} sin email válido`);
    return NextResponse.json({ ok: true, ignored: 'no_email' });
  }

  // 3. Routing por tipo de evento
  switch (event) {
    case 'PURCHASE_APPROVED':
    case 'PURCHASE_COMPLETE': {
      const result = await handleApproved(body);
      return NextResponse.json({ ok: true, event, ...result });
    }

    case 'PURCHASE_REFUNDED': {
      const result = await handleStatusChange(body, 'refunded', 'reembolsado');
      return NextResponse.json({ ok: true, event, ...result });
    }

    case 'PURCHASE_CHARGEBACK':
    case 'CHARGEBACK': {
      const result = await handleStatusChange(body, 'chargeback', 'chargeback');
      return NextResponse.json({ ok: true, event, ...result });
    }

    case 'PURCHASE_CANCELED': {
      // Lo tratamos como refund a efectos de acceso: el comprador pierde el producto.
      // Tag distinto en Systeme para poder segmentar después si querés.
      const result = await handleStatusChange(body, 'refunded', 'cancelado');
      return NextResponse.json({ ok: true, event, ...result });
    }

    default: {
      // Eventos no manejados: 200 para que Hotmart no reintente.
      console.log(`[hotmart] evento no manejado: ${event}`);
      return NextResponse.json({ ok: true, ignored: event });
    }
  }
}

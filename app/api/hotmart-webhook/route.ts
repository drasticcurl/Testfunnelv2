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
import { getStore } from '@/lib/admin/store';
import { inferUtmSource, cleanUtmValue } from '@/lib/utm';

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
  funnel: 'ok' | 'skipped' | string;
};

/**
 * Puente de atribución por email contra `clientes`.
 *
 * Hotmart NO manda UTMs/fbclid en el payload del webhook (a diferencia de
 * Shopify, que los trae en el checkout). Pero el lead guardó sus UTMs + fbclid
 * + fbc/fbp en `clientes` cuando completó el quiz (/api/submit-quiz). Los
 * recuperamos por email para:
 *   1. atribuir la venta a la campaña real en /admin/funnel (no "(directo)")
 *   2. persistir los UTMs en `purchases` (sección Ventas filtra por canal)
 *   3. enriquecer el match del Purchase de Meta CAPI con los fbc/fbp del funnel
 *
 * Best-effort: si no hay Supabase / lead / match, devolvemos vacío y el flujo
 * sigue igual que antes (email-only). Nunca tira.
 */
async function bridgeAttributionByEmail(
  supabase: ReturnType<typeof import('@/lib/pwa/supabase').createPwaServiceClient>,
  email: string,
): Promise<{ utms: Record<string, string>; fbc?: string; fbp?: string }> {
  const utms: Record<string, string> = {};
  let fbc: string | undefined;
  let fbp: string | undefined;
  try {
    const { data } = await supabase
      .from('clientes')
      .select('fbc, fbp, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid')
      .eq('email', email)
      .maybeSingle();
    if (data) {
      const row = data as Record<string, unknown>;
      const asStr = (v: unknown): string | undefined =>
        typeof v === 'string' && v.length > 0 ? v : undefined;
      fbc = asStr(row.fbc);
      fbp = asStr(row.fbp);
      // Normalizamos igual que el webhook de Shopify: inferimos source="facebook"
      // si vino fbclid sin utm_source, y limpiamos el resto (encoding/espacios).
      const source = inferUtmSource(row as Record<string, string>);
      if (source) utms.utm_source = source;
      const medium = cleanUtmValue(asStr(row.utm_medium));
      if (medium) utms.utm_medium = medium;
      const campaign = cleanUtmValue(asStr(row.utm_campaign));
      if (campaign) utms.utm_campaign = campaign;
      const content = cleanUtmValue(asStr(row.utm_content));
      if (content) utms.utm_content = content;
      const term = cleanUtmValue(asStr(row.utm_term));
      if (term) utms.utm_term = term;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[hotmart] attribution bridge lookup failed:', msg);
  }
  return { utms, fbc, fbp };
}

async function handleApproved(payload: HotmartPayload): Promise<ApprovedResult> {
  const buyer = payload.data?.buyer ?? {};
  const purchase = payload.data?.purchase ?? {};
  const product = payload.data?.product ?? {};
  const email = (buyer.email ?? '').trim().toLowerCase();

  const value = purchase.price?.value ?? 0;
  const currency = purchase.price?.currency_value ?? 'USD';

  // ─── 1. Supabase upsert (CRÍTICO para acceso a PWA) ─────────────
  // `isNewPurchase` arranca en true (best-effort si Supabase no está) y solo
  // pasa a false si detectamos que la transacción ya existía → evita doble
  // conteo en el funnel cuando Hotmart reintenta el mismo evento.
  let supabaseStatus: ApprovedResult['supabase'] = 'skipped';
  let isNewPurchase = true;
  // Atribución recuperada por email (UTMs + fbc/fbp del lead). Se rellena con el
  // puente contra `clientes` y la usan tanto el upsert a `purchases` como el
  // track al funnel store y el enriquecimiento de Meta CAPI.
  let attribution: Record<string, string> = {};
  let bridgedFbc: string | undefined;
  let bridgedFbp: string | undefined;
  if (hasSupabase()) {
    try {
      const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
      const supabase = createPwaServiceClient();

      // Puente de atribución por email (antes del upsert: sus UTMs se guardan).
      const bridge = await bridgeAttributionByEmail(supabase, email);
      attribution = bridge.utms;
      bridgedFbc = bridge.fbc;
      bridgedFbp = bridge.fbp;

      const purchasedAt =
        typeof purchase.approved_date === 'number'
          ? new Date(purchase.approved_date).toISOString()
          : new Date().toISOString();

      const { data: inserted, error } = await supabase
        .from('purchases')
        .upsert(
          {
            email,
            hotmart_transaction: purchase.transaction ?? null,
            product_id: product.id != null ? String(product.id) : null,
            product_name: typeof product.name === 'string' ? product.name : null,
            amount: typeof value === 'number' ? value : null,
            currency,
            status: 'approved',
            purchased_at: purchasedAt,
            utm_source: attribution.utm_source ?? null,
            utm_medium: attribution.utm_medium ?? null,
            utm_campaign: attribution.utm_campaign ?? null,
            utm_content: attribution.utm_content ?? null,
            utm_term: attribution.utm_term ?? null,
          },
          { onConflict: 'hotmart_transaction', ignoreDuplicates: true },
        )
        .select('id');

      if (error) {
        console.error('[hotmart] supabase upsert error:', error.message);
        supabaseStatus = `error:${error.message}`;
      } else {
        supabaseStatus = 'ok';
        // Con ignoreDuplicates, `.select()` devuelve fila SOLO si se insertó.
        // Vacío = la transacción ya existía (reintento) → no volver a contar.
        isNewPurchase = (inserted?.length ?? 0) > 0;
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
  // event_id determinístico (la transacción de Hotmart): si llega el mismo
  // evento dos veces (APPROVED + COMPLETE, o reintentos), Meta deduplica.
  const fbc =
    (typeof buyer.fbc === 'string' && buyer.fbc) ||
    (typeof purchase.tracking?.fbc === 'string' && purchase.tracking.fbc) ||
    bridgedFbc ||
    undefined;
  const fbp =
    (typeof buyer.fbp === 'string' && buyer.fbp) ||
    (typeof purchase.tracking?.fbp === 'string' && purchase.tracking.fbp) ||
    bridgedFbp ||
    undefined;

  const capiRes = await sendCapiEvent({
    event_name: 'Purchase',
    event_id: purchase.transaction ?? undefined,
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
        typeof product.name === 'string' ? product.name : 'Método del Agua de Arroz',
      content_ids: product.id ? [String(product.id)] : undefined,
    },
  });

  // ─── 3. Admin funnel store (atribución de la venta por UTM) ─────────
  // Antes el webhook de Hotmart NUNCA registraba el Purchase en el funnel store,
  // así que las ventas LATAM eran invisibles en /admin/funnel (a diferencia del
  // webhook de Shopify, que sí lo hace). Ahora lo registramos con los UTMs reales
  // recuperados por email. Solo si es compra nueva (idempotencia).
  let funnelStatus: ApprovedResult['funnel'] = 'skipped';
  if (isNewPurchase) {
    try {
      await getStore().track('Purchase', {
        utms: Object.keys(attribution).length > 0 ? attribution : undefined,
        quizVersion: 'latam',
      });
      funnelStatus = `ok:${attribution.utm_source ?? '(directo)'}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[hotmart] funnel store track failed:', msg);
      funnelStatus = `error:${msg}`;
    }
  } else {
    funnelStatus = `skipped:duplicate_or_no_supabase(supabase=${supabaseStatus})`;
  }

  // ─── 3. Systeme tag "comprador" ────────────────────────────────
  const systemeRes = await upsertSystemeContact({
    email,
    nombre: buyer.name,
    tags: ['comprador'],
    fields: purchase.transaction ? { hotmart_transaction: purchase.transaction } : {},
  });

  // ─── 4. Resend: email de bienvenida + acceso a la app ──────────
  // Detectamos el plan según el PRODUCT_ID de Hotmart (no por precio):
  // el funnel LATAM vende en USD (5.90 front / 13.90 upsell), así que los
  // umbrales en ARS ya no sirven. Mapeo por id de producto:
  //   - HOTMART_PRODUCT_ID_UPSELL → '4sem'
  //   - HOTMART_PRODUCT_ID_FRONT  → '1sem'
  //   - default / env sin setear   → '1sem' (fallback defensivo, no crashea)
  const productId = product.id != null ? String(product.id) : '';
  const frontId = process.env.HOTMART_PRODUCT_ID_FRONT;
  const upsellId = process.env.HOTMART_PRODUCT_ID_UPSELL;

  let plan = '1sem';
  if (upsellId && productId === String(upsellId)) plan = '4sem';
  else if (frontId && productId === String(frontId)) plan = '1sem';

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
    funnel: funnelStatus,
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

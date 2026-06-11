/**
 * /api/hotmart-webhook
 *
 * UNIFICADO. Esta es la ÚNICA URL que se configura en Hotmart.
 *
 * Hotmart documentación: https://developers.hotmart.com/docs/en/start/webhooks/
 *
 * Eventos manejados:
 *   - PURCHASE_APPROVED   → upsert purchases + CAPI Purchase + funnel track
 *   - PURCHASE_COMPLETE   → idem (algunos productos lo emiten en lugar de APPROVED)
 *   - PURCHASE_REFUNDED   → update status='refunded'
 *   - PURCHASE_CHARGEBACK → update status='chargeback'
 *   - CHARGEBACK          → alias del anterior
 *   - PURCHASE_CANCELED   → update status='refunded' (lo tratamos como refund a fines de acceso)
 *
 * Efectos por compra aprobada (en orden):
 *   1. Supabase `purchases` upsert (CRÍTICO: sin esto el comprador no entra a la PWA).
 *      Idempotente por `hotmart_transaction` UNIQUE.
 *   2. Meta CAPI Purchase (importante para optimización de ads, no rompe UX).
 *      `event_id = transaction` para deduplicar con el Pixel client-side.
 *   3. Admin funnel store track('Purchase') (lo que ve `/admin/funnel`).
 *      Solo si la compra es NUEVA (no reintento).
 *
 * Atribución de la venta (UTMs + country):
 *   El frontend codifica `xcod=country=CL&utm_source=...&utm_campaign=...`
 *   en el checkout URL (ver lib/cookies.ts → withCheckoutAttribution).
 *   Hotmart preserva `xcod` y lo devuelve en `purchase.origin.xcod` o
 *   `purchase.tracking.source` según la versión de la API. Lo parseamos de
 *   vuelta como query string y extraemos los campos.
 *
 *   Para el COUNTRY usamos múltiples fallbacks:
 *     1. xcod.country               (lo más confiable: lo set la ruta SEO)
 *     2. data.purchase.checkout_country.iso  (Hotmart geo-IP del checkout)
 *     3. data.buyer.address.country (declarado por el comprador)
 *     4. undefined                   (cae como NULL en la DB)
 *
 * Seguridad: si `HOTMART_HOTTOK` está configurado, validamos el header
 * `x-hotmart-hottok`. Si no, aceptamos pero logueamos warning.
 *
 * Idempotencia: la tabla purchases tiene UNIQUE en `hotmart_transaction`.
 * El upsert con `ignoreDuplicates` evita compras duplicadas si Hotmart
 * reintenta el mismo evento. `select('id')` después del upsert nos dice
 * si la compra fue NUEVA (insertada) o ya existía → solo trackeamos al
 * funnel store si es nueva.
 *
 * GET: 200 OK — para que Hotmart valide el endpoint cuando lo configurás.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendCapiEvent } from '@/lib/tracking';
import { getStore } from '@/lib/admin/store';
import { cleanUtmValue, inferUtmSource } from '@/lib/utm';

export const runtime = 'nodejs';

/* ─── Tipos del payload de Hotmart (parcial, solo lo que usamos) ──── */

type HotmartBuyer = {
  email?: string;
  name?: string;
  document?: string;
  ip?: string;
  fbc?: string;
  fbp?: string;
  /** Algunos webhooks entregan address: { country: 'CL', country_iso: 'CL' }. */
  address?: { country?: string; country_iso?: string };
  /** Otros entregan country directo en el buyer. */
  country?: string;
};

type HotmartPurchaseOrigin = {
  /** Código custom que pasamos en el checkout URL (?xcod=...). Ver lib/cookies.ts. */
  xcod?: string;
};

type HotmartPurchaseTracking = {
  fbc?: string;
  fbp?: string;
  /** En la API nueva, `tracking.source` carga el valor de xcod. */
  source?: string;
  source_sck?: string;
};

type HotmartCheckoutCountry = {
  iso?: string;
  name?: string;
};

type HotmartPurchase = {
  transaction?: string;
  status?: string;
  price?: { value?: number; currency_value?: string };
  approved_date?: number;
  tracking?: HotmartPurchaseTracking;
  origin?: HotmartPurchaseOrigin;
  /** País detectado por Hotmart en el checkout (geo-IP de su lado). */
  checkout_country?: HotmartCheckoutCountry;
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

const SUPPORTED_COUNTRIES = new Set(['CL', 'CO', 'MX', 'PE', 'US']);

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.length > 3;
}

function hasSupabase(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Parsea el `xcod` que mandamos al checkout y devuelve UTMs + country.
 * Es robusto: si el xcod viene vacío, malformado o con otro formato (texto
 * libre del cliente), devuelve un objeto vacío sin tirar.
 */
function parseXcod(rawXcod: string | undefined): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  country?: string;
} {
  if (!rawXcod || typeof rawXcod !== 'string') return {};
  try {
    const sp = new URLSearchParams(rawXcod);
    const out: Record<string, string> = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid']) {
      const v = sp.get(k);
      if (v) out[k] = v;
    }
    const country = sp.get('country')?.toUpperCase();
    if (country) out.country = country;
    return out as ReturnType<typeof parseXcod>;
  } catch {
    return {};
  }
}

/**
 * Extrae el country del payload de Hotmart probando múltiples lugares en
 * orden de confiabilidad. Solo devuelve países soportados por el negocio
 * (CL/CO/MX/PE/US); cualquier otro código → undefined (se guarda NULL).
 */
function extractCountry(
  xcodCountry: string | undefined,
  payload: HotmartPayload,
): string | undefined {
  const candidates = [
    xcodCountry,
    payload.data?.purchase?.checkout_country?.iso,
    payload.data?.buyer?.address?.country_iso,
    payload.data?.buyer?.address?.country,
    payload.data?.buyer?.country,
  ];
  for (const raw of candidates) {
    if (typeof raw !== 'string' || raw.length !== 2) continue;
    const upper = raw.toUpperCase();
    if (SUPPORTED_COUNTRIES.has(upper)) return upper;
  }
  return undefined;
}

/**
 * Atribución final de la venta, normalizada (utm_source con fallback a
 * "facebook" si solo hay fbclid; valores limpios para no duplicar campañas
 * por encoding distinto).
 */
function buildAttribution(parsed: ReturnType<typeof parseXcod>): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
} {
  const out: Record<string, string> = {};
  const source = inferUtmSource(parsed);
  if (source) out.utm_source = source;
  const medium = cleanUtmValue(parsed.utm_medium);
  if (medium) out.utm_medium = medium;
  const campaign = cleanUtmValue(parsed.utm_campaign);
  if (campaign) out.utm_campaign = campaign;
  const content = cleanUtmValue(parsed.utm_content);
  if (content) out.utm_content = content;
  const term = cleanUtmValue(parsed.utm_term);
  if (term) out.utm_term = term;
  return out;
}

/* ─── Acciones por tipo de evento ──────────────────────────────────── */

type ApprovedResult = {
  supabase: 'ok' | 'skipped' | string;
  capi: 'ok' | 'skipped' | string;
  funnel: string;
  country: string | null;
  utm_source: string | null;
};

async function handleApproved(payload: HotmartPayload): Promise<ApprovedResult> {
  const buyer = payload.data?.buyer ?? {};
  const purchase = payload.data?.purchase ?? {};
  const product = payload.data?.product ?? {};
  const email = (buyer.email ?? '').trim().toLowerCase();
  const transactionId = purchase.transaction ?? null;

  const value = purchase.price?.value ?? 0;
  const currency = purchase.price?.currency_value ?? 'USD';

  // ─── Atribución (xcod + fallbacks) ──────────────────────────────
  // El xcod puede venir en `purchase.origin.xcod` o en `purchase.tracking.source`
  // (Hotmart usó ambos a lo largo del tiempo). Si están los dos, preferimos
  // `tracking.source` porque es lo que documenta la API actual.
  const rawXcod =
    purchase.tracking?.source ||
    purchase.origin?.xcod ||
    undefined;
  const parsed = parseXcod(rawXcod);
  const attribution = buildAttribution(parsed);
  const country = extractCountry(parsed.country, payload) ?? null;

  console.log('[hotmart] approved transaction=' + (transactionId ?? 'unknown'), {
    email,
    value,
    currency,
    xcod: rawXcod,
    parsed_country: parsed.country,
    final_country: country,
    utm_source: attribution.utm_source ?? null,
    utm_campaign: attribution.utm_campaign ?? null,
  });

  // ─── 1. Supabase upsert (CRÍTICO para acceso a PWA) ─────────────
  let supabaseStatus: ApprovedResult['supabase'] = 'skipped';
  let isNewPurchase = true;
  if (hasSupabase()) {
    try {
      const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
      const supabase = createPwaServiceClient();
      const purchasedAt =
        typeof purchase.approved_date === 'number'
          ? new Date(purchase.approved_date).toISOString()
          : new Date().toISOString();

      // Herencia de atribución para upsells/downsells: si la compra NO trae
      // utm_source pero hay una compra previa atribuida del mismo email
      // (ej: el front), heredamos. Así el upsell queda asignado al canal
      // que originó al comprador.
      let finalAttribution = attribution;
      let finalCountry = country;
      if (!finalAttribution.utm_source || !finalCountry) {
        try {
          const { data: prior } = await supabase
            .from('purchases')
            .select('utm_source, utm_medium, utm_campaign, utm_content, utm_term, country')
            .eq('email', email)
            .order('purchased_at', { ascending: false })
            .limit(1);
          const p = prior?.[0] as Record<string, string | null> | undefined;
          if (p) {
            if (!finalAttribution.utm_source && p.utm_source) {
              finalAttribution = {
                utm_source: p.utm_source,
                ...(p.utm_medium ? { utm_medium: p.utm_medium } : {}),
                ...(p.utm_campaign ? { utm_campaign: p.utm_campaign } : {}),
                ...(p.utm_content ? { utm_content: p.utm_content } : {}),
                ...(p.utm_term ? { utm_term: p.utm_term } : {}),
              };
              console.log('[hotmart] attribution heredada de compra previa', {
                email,
                utm_source: p.utm_source,
              });
            }
            if (!finalCountry && p.country && SUPPORTED_COUNTRIES.has(p.country)) {
              finalCountry = p.country;
            }
          }
        } catch (lookupErr) {
          const msg = lookupErr instanceof Error ? lookupErr.message : String(lookupErr);
          console.warn('[hotmart] attribution lookup failed:', msg);
        }
      }

      const { data: inserted, error } = await supabase
        .from('purchases')
        .upsert(
          {
            email,
            hotmart_transaction: transactionId,
            product_id: product.id != null ? String(product.id) : null,
            product_name: typeof product.name === 'string' ? product.name : null,
            amount: typeof value === 'number' ? value : null,
            currency,
            status: 'approved',
            purchased_at: purchasedAt,
            country: finalCountry,
            utm_source:   finalAttribution.utm_source   ?? null,
            utm_medium:   finalAttribution.utm_medium   ?? null,
            utm_campaign: finalAttribution.utm_campaign ?? null,
            utm_content:  finalAttribution.utm_content  ?? null,
            utm_term:     finalAttribution.utm_term     ?? null,
          },
          { onConflict: 'hotmart_transaction', ignoreDuplicates: true },
        )
        .select('id');

      if (error) {
        console.error('[hotmart] supabase upsert error:', error.message);
        supabaseStatus = `error:${error.message}`;
      } else {
        supabaseStatus = 'ok';
        // Con ignoreDuplicates, .select() trae fila SOLO si insertó.
        // Vacío = ya existía (reintento) → no contar de nuevo en el funnel.
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

  // ─── 2. Meta CAPI Purchase ──────────────────────────────────────
  // event_id = transactionId → dedupe con el Pixel client-side. Si llegan
  // múltiples eventos por la misma compra (raro en Hotmart, pero por las
  // dudas), Meta cuenta UNA sola.
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
    event_id: transactionId ?? undefined,
    action_source: 'website',
    user_data: { email, ipAddress: buyer.ip, fbc, fbp },
    custom_data: {
      value,
      currency,
      content_name:
        typeof product.name === 'string' ? product.name : 'Protocolo Chau Hinchazón',
      content_ids: product.id ? [String(product.id)] : undefined,
    },
  });

  // ─── 3. Admin funnel store (atribución de la venta por UTM/país) ─
  // Solo si la compra es NUEVA (idempotencia: que un reintento del webhook
  // no infle el contador de compras del embudo).
  let funnelStatus = 'skipped';
  if (isNewPurchase) {
    try {
      const utmsForStore: Record<string, string> = {};
      if (attribution.utm_source) utmsForStore.utm_source = attribution.utm_source;
      if (attribution.utm_medium) utmsForStore.utm_medium = attribution.utm_medium;
      if (attribution.utm_campaign) utmsForStore.utm_campaign = attribution.utm_campaign;
      if (attribution.utm_content) utmsForStore.utm_content = attribution.utm_content;
      await getStore().track('Purchase', {
        utms: Object.keys(utmsForStore).length > 0 ? utmsForStore : undefined,
        country: country ?? undefined,
        quizVersion: 'v3',
      });
      funnelStatus = `ok:${attribution.utm_source ?? '(directo)'}/${country ?? '(desconocido)'}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[hotmart] funnel store track failed:', msg);
      funnelStatus = `error:${msg}`;
    }
  } else {
    funnelStatus = `skipped:duplicate_or_no_supabase(supabase=${supabaseStatus})`;
  }

  return {
    supabase: supabaseStatus,
    capi: capiRes.ok ? 'ok' : `skipped:${capiRes.reason ?? capiRes.error}`,
    funnel: funnelStatus,
    country,
    utm_source: attribution.utm_source ?? null,
  };
}

/**
 * Refund / chargeback / canceled → marcar la compra como refunded/chargeback
 * (el comprador pierde acceso a la PWA).
 */
async function handleStatusChange(
  payload: HotmartPayload,
  dbStatus: 'refunded' | 'chargeback',
): Promise<{ supabase: string }> {
  const buyer = payload.data?.buyer ?? {};
  const purchase = payload.data?.purchase ?? {};
  const email = (buyer.email ?? '').trim().toLowerCase();
  const transaction = purchase.transaction;

  if (!hasSupabase()) return { supabase: 'skipped' };

  try {
    const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
    const supabase = createPwaServiceClient();

    // Si tenemos transaction, filtramos por ahí (más preciso). Si no,
    // fallback por email (puede afectar varias filas, pero correcto: el
    // cliente perdió acceso a TODO).
    const query = supabase.from('purchases').update({ status: dbStatus });
    const filtered = transaction
      ? query.eq('hotmart_transaction', transaction)
      : query.eq('email', email);

    const { error } = await filtered;
    if (error) {
      console.error(`[hotmart] supabase ${dbStatus} update error:`, error.message);
      return { supabase: `error:${error.message}` };
    }
    return { supabase: 'ok' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[hotmart] supabase exception:', msg);
    return { supabase: `exception:${msg}` };
  }
}

/* ─── HTTP handlers ────────────────────────────────────────────────── */

export async function GET() {
  return NextResponse.json({ ok: true, service: 'hotmart-webhook' });
}

export async function POST(req: NextRequest) {
  // 1. Validación de seguridad — header `x-hotmart-hottok`.
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

  // 2. Parse body.
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

  // 3. Routing por tipo de evento.
  switch (event) {
    case 'PURCHASE_APPROVED':
    case 'PURCHASE_COMPLETE': {
      const result = await handleApproved(body);
      return NextResponse.json({ ok: true, event, ...result });
    }

    case 'PURCHASE_REFUNDED': {
      const result = await handleStatusChange(body, 'refunded');
      return NextResponse.json({ ok: true, event, ...result });
    }

    case 'PURCHASE_CHARGEBACK':
    case 'CHARGEBACK': {
      const result = await handleStatusChange(body, 'chargeback');
      return NextResponse.json({ ok: true, event, ...result });
    }

    case 'PURCHASE_CANCELED': {
      // Cancelación = pérdida de acceso. La tratamos como refund.
      const result = await handleStatusChange(body, 'refunded');
      return NextResponse.json({ ok: true, event, ...result });
    }

    default: {
      // Eventos no manejados: 200 para que Hotmart no reintente.
      console.log(`[hotmart] evento no manejado: ${event}`);
      return NextResponse.json({ ok: true, ignored: event });
    }
  }
}

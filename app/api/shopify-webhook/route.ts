/**
 * /api/shopify-webhook
 *
 * Webhook de compras de Shopify. Reemplaza a /api/hotmart-webhook como fuente
 * de verdad del acceso a la PWA.
 *
 * Docs Shopify: https://shopify.dev/docs/apps/build/webhooks/subscribe/https
 *
 * Topics manejados (header `x-shopify-topic`):
 *   - orders/paid       → upsert purchases (status='approved') + CAPI Purchase
 *   - orders/create     → idem, SOLO si financial_status === 'paid' (fallback)
 *   - refunds/create    → update status='refunded' (el cliente pierde acceso)
 *   - orders/cancelled  → update status='refunded'
 *
 * Por qué Supabase + CAPI + funnel juntos:
 *   1. Supabase (CRÍTICO): sin esto el comprador no entra a la PWA.
 *   2. CAPI Meta: importante para optimización de ads.
 *   3. Funnel store (/admin/funnel): registra la venta con el UTM real (los
 *      UTMs viajan en el link de checkout → Shopify los guarda en `landing_site`).
 *      Antes lo hacía el cliente en /upsell sin UTMs → caía en "(directo)".
 *   (Systeme.io y Resend se quitaron: no se usan. El link de acceso lo manda
 *    el email de confirmación nativo de Shopify.)
 *
 * Seguridad (HMAC):
 *   Shopify firma cada request con HMAC-SHA256(base64) del RAW body usando el
 *   "API secret"/"webhook signing secret" de la app/tienda. Lo manda en el
 *   header `X-Shopify-Hmac-Sha256`. Validamos ANTES de procesar.
 *
 *   Multi-tienda: `SHOPIFY_WEBHOOK_SECRETS` admite varios secrets separados por
 *   coma (ej: tienda front + tienda upsell). Si CUALQUIERA valida, aceptamos.
 *   Si no hay secrets configurados, aceptamos pero logueamos warning (staging).
 *
 * Idempotencia: la tabla purchases tiene UNIQUE en `hotmart_transaction`.
 *   Reutilizamos esa columna para guardar el order id de Shopify
 *   (`shopify_<order.id>`), así el upsert con ignoreDuplicates evita duplicados
 *   si Shopify reintenta el mismo evento.
 *   Para Meta CAPI usamos ese mismo `shopify_<order.id>` como `event_id`, de
 *   modo que si llegan orders/create y orders/paid de la misma orden, Meta
 *   deduplica y cuenta una sola compra. El Purchase del front se dispara
 *   SOLO desde acá (el client-side de /upsell ya no lo dispara).
 *
 * GET: 200 OK para chequear el endpoint manualmente.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendCapiEvent } from '@/lib/tracking';
import { getStore } from '@/lib/admin/store';
import { cleanUtmValue, inferUtmSource } from '@/lib/utm';

export const runtime = 'nodejs';

/* ─── Tipos del payload de Shopify (parcial, solo lo que usamos) ──── */

type ShopifyCustomer = {
  email?: string;
  first_name?: string;
  last_name?: string;
};

type ShopifyLineItem = {
  product_id?: number | string;
  title?: string;
  name?: string;
  quantity?: number;
};

type ShopifyClientDetails = {
  browser_ip?: string;
  user_agent?: string;
};

/** Pares clave/valor que Shopify adjunta a la orden (cart/note attributes). */
type ShopifyNoteAttribute = {
  name?: string;
  value?: string;
};

type ShopifyAddress = {
  country_code?: string;
};

type ShopifyOrder = {
  id?: number | string;
  email?: string;
  contact_email?: string;
  customer?: ShopifyCustomer;
  financial_status?: string;
  total_price?: string;
  current_total_price?: string;
  currency?: string;
  created_at?: string;
  processed_at?: string;
  line_items?: ShopifyLineItem[];
  client_details?: ShopifyClientDetails;
  /** URL (con query) donde el cliente aterrizó en la tienda → trae los UTMs. */
  landing_site?: string;
  referring_site?: string;
  /** Atributos del carrito/nota (fallback para UTMs si se pasan por ahí). */
  note_attributes?: ShopifyNoteAttribute[];
  billing_address?: ShopifyAddress;
  shipping_address?: ShopifyAddress;
};

/* Payload de refunds/create: trae order_id, no el order completo. */
type ShopifyRefund = {
  id?: number | string;
  order_id?: number | string;
};

/* ─── Helpers ──────────────────────────────────────────────────────── */

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.length > 3;
}

function hasSupabase(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Lista de secrets configurados (multi-tienda). */
function getWebhookSecrets(): string[] {
  const multi = process.env.SHOPIFY_WEBHOOK_SECRETS;
  const single = process.env.SHOPIFY_WEBHOOK_SECRET;
  const raw = multi || single || '';
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Valida la firma HMAC de Shopify contra el raw body.
 * Devuelve:
 *   'valid'      → alguna firma coincidió
 *   'invalid'    → hay secrets configurados pero ninguno coincidió
 *   'unconfigured' → no hay secrets (aceptamos con warning, igual que legacy)
 */
function verifyHmac(rawBody: string, hmacHeader: string | null): 'valid' | 'invalid' | 'unconfigured' {
  const secrets = getWebhookSecrets();
  if (secrets.length === 0) return 'unconfigured';
  if (!hmacHeader) return 'invalid';

  const headerBuf = Buffer.from(hmacHeader, 'utf8');

  for (const secret of secrets) {
    const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64');
    const digestBuf = Buffer.from(digest, 'utf8');
    if (
      headerBuf.length === digestBuf.length &&
      crypto.timingSafeEqual(headerBuf, digestBuf)
    ) {
      return 'valid';
    }
  }
  return 'invalid';
}

function buyerEmail(order: ShopifyOrder): string {
  return (order.email || order.contact_email || order.customer?.email || '')
    .trim()
    .toLowerCase();
}

function buyerName(order: ShopifyOrder): string | undefined {
  const c = order.customer;
  if (!c) return undefined;
  const full = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
  return full || undefined;
}

/* ─── UTMs de la orden (para atribución de la venta en /admin/funnel) ─── */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

function pickUtms(params: URLSearchParams): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) out[k] = v;
  }
  // `fbclid` también viaja en el link de checkout. Lo capturamos para poder
  // inferir source="facebook" cuando el anuncio NO trae utm_source en la URL
  // (caso típico: solo se taggeó utm_campaign → source caía en "(directo)").
  const fbclid = params.get('fbclid');
  if (fbclid) out.fbclid = fbclid;
  return Object.keys(out).length ? out : undefined;
}

/**
 * Extrae los UTMs del `landing_site` de la orden. El checkout se abre con los
 * UTMs en la query (ver SlideSalesPageV3), así que Shopify los guarda acá.
 * `landing_site` suele venir como path relativo: "/cart/123:1?utm_source=...".
 */
function parseUtmsFromLandingSite(landingSite?: string): Record<string, string> | undefined {
  if (!landingSite) return undefined;
  const qIndex = landingSite.indexOf('?');
  if (qIndex === -1) return undefined;
  try {
    return pickUtms(new URLSearchParams(landingSite.slice(qIndex + 1)));
  } catch {
    return undefined;
  }
}

/** Fallback: UTMs pasados como cart/note attributes (name = "utm_*"). */
function parseUtmsFromNoteAttributes(
  attrs?: ShopifyNoteAttribute[],
): Record<string, string> | undefined {
  if (!attrs?.length) return undefined;
  const out: Record<string, string> = {};
  for (const a of attrs) {
    const name = a?.name?.toLowerCase();
    if (!name || typeof a.value !== 'string' || a.value.length === 0) continue;
    // utm_* y fbclid (este último para poder inferir source="facebook").
    if (name.startsWith('utm_') || name === 'fbclid') {
      out[name] = a.value;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

/** UTMs de la orden: note_attributes (más confiable) con fallback a landing_site. */
function orderUtms(order: ShopifyOrder): Record<string, string> | undefined {
  return parseUtmsFromNoteAttributes(order.note_attributes) ?? parseUtmsFromLandingSite(order.landing_site);
}

/**
 * Atribución FINAL de la venta, ya normalizada y lista para guardar/contar:
 *  - `utm_source`: limpio (decodificado, sin espacios de más). Si no vino pero
 *    hay `fbclid`, se infiere "facebook" (el click vino de Meta).
 *  - resto de `utm_*`: limpios para que el mismo valor no se "duplique" por
 *    diferencias de encoding/espacios/casing en /admin.
 * Devuelve solo las claves con valor (objeto vacío si no hay atribución).
 */
function orderAttribution(order: ShopifyOrder): Record<string, string> {
  const raw = orderUtms(order) ?? {};
  const out: Record<string, string> = {};
  const source = inferUtmSource(raw);
  if (source) out.utm_source = source;
  const medium = cleanUtmValue(raw.utm_medium);
  if (medium) out.utm_medium = medium;
  const campaign = cleanUtmValue(raw.utm_campaign);
  if (campaign) out.utm_campaign = campaign;
  const content = cleanUtmValue(raw.utm_content);
  if (content) out.utm_content = content;
  const term = cleanUtmValue(raw.utm_term);
  if (term) out.utm_term = term;
  return out;
}

/* ─── Acciones por topic ───────────────────────────────────────────── */

type ApprovedResult = {
  supabase: 'ok' | 'skipped' | string;
  capi: 'ok' | 'skipped' | string;
  funnel: string;
};

async function handleApproved(order: ShopifyOrder): Promise<ApprovedResult> {
  const email = buyerEmail(order);
  const transactionId = order.id != null ? `shopify_${order.id}` : null;

  const totalStr = order.total_price ?? order.current_total_price ?? '0';
  const value = Number.parseFloat(totalStr) || 0;
  const currency = order.currency ?? 'ARS';

  const lineItems = order.line_items ?? [];
  const productNames = lineItems
    .map((li) => li.title || li.name)
    .filter(Boolean)
    .join(', ');
  const firstProductId = lineItems.find((li) => li.product_id != null)?.product_id;
  const contentIds = lineItems
    .map((li) => (li.product_id != null ? String(li.product_id) : null))
    .filter((v): v is string => v != null);

  // Log inicial — útil para auditar en Vercel logs si falta alguna venta.
  // Buscar por: "[shopify] approved order_id=" para ver TODAS las que llegaron.
  console.log('[shopify] approved order_id=' + (order.id ?? 'unknown'), {
    email,
    transactionId,
    value,
    currency,
    financial_status: order.financial_status,
    landing_site: order.landing_site,
    note_attributes_count: order.note_attributes?.length ?? 0,
  });

  // ─── 1. Supabase upsert (CRÍTICO para acceso a PWA) ─────────────
  // `isNewPurchase` arranca en true (best-effort si Supabase no está) y solo
  // pasa a false si detectamos que la orden ya existía → evita doble conteo en
  // el funnel cuando Shopify reintenta el webhook.
  let supabaseStatus: ApprovedResult['supabase'] = 'skipped';
  let isNewPurchase = true;
  // Parseamos los UTMs UNA vez acá: los usa tanto el upsert a `purchases`
  // como el track al funnel store más abajo. `orderAttribution` ya devuelve
  // los valores normalizados e infiere source="facebook" si hay fbclid.
  // `let` porque puede completarse heredando los UTMs de una compra previa
  // del mismo email (caso upsell/downsell sin UTMs propios).
  let attribution = orderAttribution(order);
  if (hasSupabase()) {
    try {
      const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
      const supabase = createPwaServiceClient();
      const purchasedAt = order.processed_at || order.created_at || new Date().toISOString();

      // Herencia de atribución: si la orden NO trae UTMs (típico en upsell/
      // downsell cuando el comprador vuelve desde el email en otro navegador y
      // se perdió el localStorage), heredamos los de la compra previa del mismo
      // email. Así el upsell queda atribuido al mismo canal que el front.
      if (!attribution.utm_source) {
        try {
          const { data: prior } = await supabase
            .from('purchases')
            .select('utm_source, utm_medium, utm_campaign, utm_content, utm_term')
            .eq('email', email)
            .not('utm_source', 'is', null)
            .order('purchased_at', { ascending: false })
            .limit(1);
          const p = prior?.[0] as Record<string, string | null> | undefined;
          if (p?.utm_source) {
            attribution = {
              utm_source: p.utm_source,
              ...(p.utm_medium ? { utm_medium: p.utm_medium } : {}),
              ...(p.utm_campaign ? { utm_campaign: p.utm_campaign } : {}),
              ...(p.utm_content ? { utm_content: p.utm_content } : {}),
              ...(p.utm_term ? { utm_term: p.utm_term } : {}),
            };
            console.log('[shopify] attribution heredada de compra previa', {
              email,
              utm_source: p.utm_source,
              utm_campaign: p.utm_campaign ?? null,
            });
          }
        } catch (lookupErr) {
          // Best-effort: si falla el lookup, seguimos sin herencia (no rompe la venta).
          const msg = lookupErr instanceof Error ? lookupErr.message : String(lookupErr);
          console.warn('[shopify] attribution lookup failed:', msg);
        }
      }

      const { data: inserted, error } = await supabase
        .from('purchases')
        .upsert(
          {
            email,
            // Reutilizamos la columna UNIQUE `hotmart_transaction` para el order id
            // de Shopify (idempotencia). Es solo un identificador de transacción.
            hotmart_transaction: transactionId,
            product_id: firstProductId != null ? String(firstProductId) : null,
            product_name: productNames || null,
            amount: value || null,
            currency,
            status: 'approved',
            purchased_at: purchasedAt,
            utm_source:   attribution.utm_source   ?? null,
            utm_medium:   attribution.utm_medium   ?? null,
            utm_campaign: attribution.utm_campaign ?? null,
            utm_content:  attribution.utm_content  ?? null,
            utm_term:     attribution.utm_term     ?? null,
          },
          { onConflict: 'hotmart_transaction', ignoreDuplicates: true },
        )
        .select('id');

      if (error) {
        console.error('[shopify] supabase upsert error:', error.message);
        supabaseStatus = `error:${error.message}`;
      } else {
        supabaseStatus = 'ok';
        // Con ignoreDuplicates, `.select()` devuelve fila SOLO si se insertó.
        // Vacío = la orden ya existía (reintento) → no volver a contar.
        isNewPurchase = (inserted?.length ?? 0) > 0;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[shopify] supabase exception:', msg);
      supabaseStatus = `exception:${msg}`;
    }
  } else {
    console.warn('[shopify] Supabase env vars missing, skipping DB write');
  }

  // ─── 2. Meta CAPI (Shopify no manda fbc/fbp; matcheamos por email) ──
  // event_id determinístico (`shopify_<order.id>`): si llegan orders/create y
  // orders/paid para la misma orden, Meta deduplica y cuenta UNA sola compra.
  const capiRes = await sendCapiEvent({
    event_name: 'Purchase',
    event_id: transactionId ?? undefined,
    action_source: 'website',
    user_data: {
      email,
      ipAddress: order.client_details?.browser_ip,
      userAgent: order.client_details?.user_agent,
    },
    custom_data: {
      value,
      currency,
      content_name: productNames || 'Protocolo Chau Hinchazón',
      content_ids: contentIds.length ? contentIds : undefined,
    },
  });

  // ─── 3. Admin funnel store (atribución de la venta por UTM) ─────────
  // Antes el Purchase del funnel lo registraba el cliente en /upsell SIN UTMs
  // (→ siempre "(directo)"). Ahora lo registra el webhook con los UTMs reales
  // que viajan en el checkout. Solo si es compra nueva (idempotencia).
  let funnelStatus = 'skipped';
  if (isNewPurchase) {
    try {
      const utms = attribution;
      const countryCode = order.billing_address?.country_code || order.shipping_address?.country_code;
      await getStore().track('Purchase', {
        utms,
        quizVersion: 'v3',
        country: countryCode ? countryCode.toUpperCase() : undefined,
      });
      funnelStatus = `ok:${utms.utm_source ?? '(directo)'}`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[shopify] funnel store track failed:', msg);
      funnelStatus = `error:${msg}`;
    }
  } else {
    // Útil para diagnóstico: si Shopify reintenta el webhook, vemos por qué
    // no se contó (no es bug, es la dedup intencional).
    funnelStatus = `skipped:duplicate_or_no_supabase(supabase=${supabaseStatus})`;
  }

  console.log('[shopify] approved result order_id=' + (order.id ?? 'unknown'), {
    supabase: supabaseStatus,
    isNewPurchase,
    capi: capiRes.ok ? 'ok' : `skipped:${capiRes.reason ?? capiRes.error}`,
    funnel: funnelStatus,
  });

  return {
    supabase: supabaseStatus,
    capi: capiRes.ok ? 'ok' : `skipped:${capiRes.reason ?? capiRes.error}`,
    funnel: funnelStatus,
  };
}

/**
 * Refund / cancelación → marcar la compra como refunded (pierde acceso).
 * `transactionId` es `shopify_<order_id>`.
 */
async function handleRefund(orderId: string | number | undefined): Promise<{ supabase: string }> {
  if (orderId == null) return { supabase: 'skipped:no_order_id' };
  const transactionId = `shopify_${orderId}`;

  if (!hasSupabase()) return { supabase: 'skipped' };

  try {
    const { createPwaServiceClient } = await import('@/lib/pwa/supabase');
    const supabase = createPwaServiceClient();
    const { error } = await supabase
      .from('purchases')
      .update({ status: 'refunded' })
      .eq('hotmart_transaction', transactionId);

    if (error) {
      console.error('[shopify] supabase refund update error:', error.message);
      return { supabase: `error:${error.message}` };
    }
    return { supabase: 'ok' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[shopify] supabase refund exception:', msg);
    return { supabase: `exception:${msg}` };
  }
}

/* ─── HTTP handlers ────────────────────────────────────────────────── */

export async function GET() {
  return NextResponse.json({ ok: true, service: 'shopify-webhook' });
}

export async function POST(req: NextRequest) {
  // 1. Leer RAW body (necesario para validar HMAC byte a byte).
  const rawBody = await req.text();

  // 2. Validar firma HMAC.
  const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
  const verdict = verifyHmac(rawBody, hmacHeader);
  if (verdict === 'invalid') {
    // Causa típica: la tienda está enviando webhooks pero su secret NO está
    // en SHOPIFY_WEBHOOK_SECRETS. Síntoma: ventas que no aparecen en el
    // funnel. Buscar este warning en Vercel logs para diagnosticarlo.
    const shop = req.headers.get('x-shopify-shop-domain') ?? 'unknown';
    const topic = req.headers.get('x-shopify-topic') ?? 'unknown';
    console.warn('[shopify] HMAC INVÁLIDO — webhook RECHAZADO', {
      shop,
      topic,
      hint: 'Revisar SHOPIFY_WEBHOOK_SECRETS en Vercel (admite varios separados por coma).',
    });
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (verdict === 'unconfigured') {
    console.warn('[shopify] SHOPIFY_WEBHOOK_SECRET(S) no configurado, aceptando sin validar');
  }

  // 3. Parse body.
  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const topic = (req.headers.get('x-shopify-topic') ?? '').toLowerCase();
  const shop = req.headers.get('x-shopify-shop-domain') ?? 'unknown';

  // 4. Routing por topic.
  switch (topic) {
    case 'orders/paid': {
      const order = body as ShopifyOrder;
      const email = buyerEmail(order);
      if (!email || !isValidEmail(email)) {
        console.warn('[shopify] orders/paid IGNORADO (sin email válido)', {
          shop,
          order_id: order.id,
          financial_status: order.financial_status,
        });
        return NextResponse.json({ ok: true, ignored: 'no_email' });
      }
      const result = await handleApproved(order);
      return NextResponse.json({ ok: true, topic, shop, ...result });
    }

    case 'orders/create': {
      // Fallback: solo lo tratamos como compra si ya está pagada.
      const order = body as ShopifyOrder;
      if ((order.financial_status ?? '').toLowerCase() !== 'paid') {
        console.log('[shopify] orders/create ignorado (not_paid)', {
          shop,
          order_id: order.id,
          financial_status: order.financial_status,
        });
        return NextResponse.json({ ok: true, topic, ignored: 'not_paid' });
      }
      const email = buyerEmail(order);
      if (!email || !isValidEmail(email)) {
        console.warn('[shopify] orders/create IGNORADO (sin email válido pese a paid)', {
          shop,
          order_id: order.id,
        });
        return NextResponse.json({ ok: true, ignored: 'no_email' });
      }
      const result = await handleApproved(order);
      return NextResponse.json({ ok: true, topic, shop, ...result });
    }

    case 'refunds/create': {
      const refund = body as ShopifyRefund;
      const result = await handleRefund(refund.order_id);
      return NextResponse.json({ ok: true, topic, shop, ...result });
    }

    case 'orders/cancelled': {
      const order = body as ShopifyOrder;
      const result = await handleRefund(order.id);
      return NextResponse.json({ ok: true, topic, shop, ...result });
    }

    default: {
      // Topics no manejados: 200 para que Shopify no reintente.
      console.log(`[shopify] topic no manejado: ${topic} (shop=${shop})`);
      return NextResponse.json({ ok: true, ignored: topic || 'no_topic' });
    }
  }
}

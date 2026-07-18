/**
 * POST /api/track
 *
 * Endpoint generico para reenviar eventos a Meta Conversions API server-side.
 * Llamado desde el cliente cuando se quieren tener eventos duplicados
 * (pixel + CAPI) para mejor matching y resiliencia a ad-blockers.
 *
 * Llamado actualmente desde:
 *  - components/resultados/ViewContentTracker.tsx (event: 'ViewContent')
 *
 * Body esperado (JSON):
 *  {
 *    event: string,           // Required. Ej: 'ViewContent', 'Lead'
 *    email?: string,          // Plain. Se hashea automaticamente
 *    eventId?: string,        // Para deduplicar con el pixel
 *    value?: number,
 *    currency?: string,       // Default 'USD' si hay value
 *    contentName?: string,
 *    contentCategory?: string,
 *    fbc?: string,            // Cookie _fbc
 *    fbp?: string,            // Cookie _fbp
 *    sourceUrl?: string,
 *    custom?: Record<string, unknown>  // Pasa-thru a custom_data
 *  }
 *
 * Falla gracefully:
 *  - Sin META_PIXEL_ID o META_CAPI_TOKEN: 200 + { ok: false, reason: 'env_missing' }
 *  - Body invalido: 400
 *  - Error de red contra Meta: 200 + { ok: false } (no rompe al cliente)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendCapiEvent, getMetaCookiesFromRequest } from '@/lib/tracking';
import { getStore } from '@/lib/admin/store';
import { isAbEntryEvent } from '@/lib/quiz-v2/abEntry';
import { isFunnelVariantEvent, funnelEventName, type FunnelVariant } from '@/lib/quiz-v2/funnelVariant';
import { normalizeQuizVersion } from './normalizeQuizVersion';

// crypto requiere Node runtime
export const runtime = 'nodejs';

type TrackBody = {
  event?: unknown;
  email?: unknown;
  eventId?: unknown;
  value?: unknown;
  currency?: unknown;
  contentName?: unknown;
  contentCategory?: unknown;
  fbc?: unknown;
  fbp?: unknown;
  sourceUrl?: unknown;
  custom?: unknown;
};

function asString(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function asNumber(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.length > 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  let body: TrackBody;
  try {
    body = (await req.json()) as TrackBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const eventName = asString(body.event);
  if (!eventName) {
    return NextResponse.json({ ok: false, error: 'missing_event' }, { status: 400 });
  }

  // IP y user-agent: leerlos siempre que se pueda para mejor matching en CAPI
  const ipHeader = req.headers.get('x-forwarded-for') ?? '';
  const ip = ipHeader.split(',')[0]?.trim() || req.headers.get('x-real-ip') || undefined;
  const userAgent = req.headers.get('user-agent') ?? undefined;

  const email = asString(body.email);

  // ─── Puente de atribución por email (venta Tienda Nube) ──────────────────
  // El Purchase del front AR llega desde el código de conversión de la página
  // /success/ de Tienda Nube con el EMAIL del comprador, pero SIN los
  // identificadores del funnel (es otro dominio: no hay _fbc/_fbp ni UTMs del
  // click original). Recuperamos esos datos del lead por email (los guardó
  // /api/submit-quiz en `clientes`) para:
  //   1. atribuir la venta a la campaña correcta en /admin/funnel (no "(directo)")
  //   2. enriquecer el match del Purchase en Meta CAPI con los fbc/fbp del funnel
  // Best-effort: si no hay Supabase / lead / match, sigue como antes (email-only).
  let bridgedFbc: string | undefined;
  let bridgedFbp: string | undefined;
  let bridgedUtms: Record<string, string> | undefined;
  let bridgedFunnelVariant: FunnelVariant | undefined;
  if (eventName === 'Purchase' && email) {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const sb = getSupabase();
      if (sb) {
        const { data } = await sb
          .from('clientes')
          .select('fbc, fbp, utm_source, utm_medium, utm_campaign, utm_content, utm_term')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();
        if (data) {
          bridgedFbc = asString(data.fbc);
          bridgedFbp = asString(data.fbp);
          const u: Record<string, string> = {};
          for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const) {
            const v = (data as Record<string, unknown>)[k];
            if (typeof v === 'string' && v.length > 0) u[k] = v;
          }
          if (Object.keys(u).length > 0) bridgedUtms = u;
        }

        // funnel_variant en una query SEPARADA y guardada: así, si la columna
        // todavía no existe (migración 011 sin correr), el error aísla solo a
        // esta lectura y NO rompe el puente fbc/fbp/utms de arriba.
        try {
          const { data: fvData } = await sb
            .from('clientes')
            .select('funnel_variant')
            .eq('email', email.trim().toLowerCase())
            .maybeSingle();
          const fv = asString((fvData as Record<string, unknown> | null)?.funnel_variant);
          if (fv === 'A' || fv === 'B') bridgedFunnelVariant = fv;
        } catch (fvErr) {
          console.warn('[track] funnel_variant bridge lookup skipped:', fvErr instanceof Error ? fvErr.message : String(fvErr));
        }
      }
    } catch (err) {
      console.error('[track] clientes bridge lookup failed:', err);
    }
  }

  // Construir custom_data
  const value = asNumber(body.value);
  const customData: Record<string, unknown> = {};
  if (value !== undefined) {
    customData.value = value;
    customData.currency = asString(body.currency) ?? 'USD';
  }
  if (asString(body.contentName)) customData.content_name = asString(body.contentName);
  if (asString(body.contentCategory))
    customData.content_category = asString(body.contentCategory);
  if (body.custom && typeof body.custom === 'object') {
    Object.assign(customData, body.custom as Record<string, unknown>);
  }

  // A/B experiments removed — no longer tagging events with variants.

  // ─── Admin Funnel Store ──────────────────────────────────────────────────
  // Incrementamos el contador agregado para el dashboard /admin/funnel.
  // Non-blocking: si falla, seguimos con CAPI normalmente.
  try {
    const customSlide = (customData.slide ?? customData.slide_index) as unknown;
    const slideNum =
      typeof customSlide === 'number'
        ? customSlide
        : typeof customSlide === 'string' && customSlide.length > 0
          ? Number(customSlide)
          : undefined;

    const customQid = customData.question_id as unknown;
    const questionId =
      typeof customQid === 'string' && customQid.length > 0 ? customQid : undefined;

    // UTMs: el cliente puede enviarlos en custom.utms (capturados del localStorage).
    // Si no vienen (ej. Purchase de Tienda Nube desde /success/, otro dominio),
    // usamos los UTMs del lead recuperados por email (bridgedUtms).
    const utmsRaw = customData.utms as unknown;
    const customUtms: Record<string, string> | undefined =
      utmsRaw && typeof utmsRaw === 'object' && !Array.isArray(utmsRaw)
        ? Object.fromEntries(
            Object.entries(utmsRaw as Record<string, unknown>).filter(
              ([, v]) => typeof v === 'string' && v.length > 0,
            ),
          ) as Record<string, string>
        : undefined;
    const utms =
      customUtms && Object.keys(customUtms).length > 0 ? customUtms : bridgedUtms;

    // Country: sent by client in custom.country (detected via geo-IP on client side)
    const countryRaw = customData.country as unknown;
    const country = typeof countryRaw === 'string' && countryRaw.length >= 2 ? countryRaw.toUpperCase() : undefined;

    await getStore().track(eventName, {
      slide:
        typeof slideNum === 'number' && Number.isFinite(slideNum) ? slideNum : undefined,
      questionId,
      utms,
      quizVersion: normalizeQuizVersion(customData.quiz_version),
      country,
    });

    // ─── Atribución de la venta del front al test full-funnel (af_<V>_purchase) ─
    // El Purchase del front AR (Tienda Nube) llega por email desde /success/.
    // Si el lead tiene un funnel_variant guardado (puente por email en
    // /api/submit-quiz), registramos af_<V>_purchase para la comparación A vs B.
    // Si no hay variante, la compra ya quedó contada en los totales generales
    // (el Purchase genérico de arriba) y no se atribuye a una variante.
    if (eventName === 'Purchase' && bridgedFunnelVariant) {
      try {
        await getStore().track(funnelEventName(bridgedFunnelVariant, 'purchase'), {
          utms,
          quizVersion: 'ar',
          country,
        });
      } catch (afErr) {
        console.warn('[track] af_<V>_purchase track failed:', afErr instanceof Error ? afErr.message : String(afErr));
      }
    }
  } catch (err) {
    console.error('[track] funnel store write failed:', err);
  }

  // ─── Eventos internos del test A/B de entrada ───────────────────────────
  // Los eventos `ab_entry_*` solo sirven para medir el funnel por variante en
  // el dashboard. NO se mandan a Meta CAPI (no queremos inflar el catálogo de
  // eventos custom de Meta). Ya quedaron registrados en el store.
  if (isAbEntryEvent(eventName)) {
    return NextResponse.json({ ok: true, internal: true });
  }

  // ─── Eventos internos del test FULL-FUNNEL (af_*) ───────────────────────
  // Mismo criterio que ab_entry_*: ya quedaron registrados en el store; NO se
  // reenvían a Meta CAPI (son métricas internas del test A vs B).
  if (isFunnelVariantEvent(eventName)) {
    return NextResponse.json({ ok: true, internal: true });
  }

  const result = await sendCapiEvent({
    event_name: eventName,
    event_id: asString(body.eventId),
    event_source_url: asString(body.sourceUrl),
    user_data: {
      email,
      ipAddress: ip,
      userAgent,
      ...getMetaCookiesFromRequest(req, {
        fbc: bridgedFbc ?? body.fbc,
        fbp: bridgedFbp ?? body.fbp,
      }),
    },
    custom_data: Object.keys(customData).length > 0 ? customData : undefined,
  });

  // Siempre 200 al cliente — no le servimos errores que pueda exponer
  return NextResponse.json(result);
}

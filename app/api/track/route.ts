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
import { getAllVariants } from '@/lib/ab';
import { getStore } from '@/lib/admin/store';

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

  // Auto-tag con variantes A/B asignadas por middleware.
  // Permite filtrar eventos por experimento en Meta Events Manager.
  // Nota: si el caller pasa `custom.experiments`, gana lo del caller para
  // no romper overrides intencionales (ej: tests S2S con userId distinto).
  const experimentsFromCookies = getAllVariants(req.cookies);
  if (!('experiments' in customData)) {
    if (Object.keys(experimentsFromCookies).length > 0) {
      customData.experiments = experimentsFromCookies;
    }
  }

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

    // UTMs: el cliente puede enviarlos en custom.utms (capturados del localStorage)
    const utmsRaw = customData.utms as unknown;
    const utms: Record<string, string> | undefined =
      utmsRaw && typeof utmsRaw === 'object' && !Array.isArray(utmsRaw)
        ? Object.fromEntries(
            Object.entries(utmsRaw as Record<string, unknown>).filter(
              ([, v]) => typeof v === 'string' && v.length > 0,
            ),
          ) as Record<string, string>
        : undefined;

    await getStore().track(eventName, {
      slide:
        typeof slideNum === 'number' && Number.isFinite(slideNum) ? slideNum : undefined,
      questionId,
      utms,
      quizVersion: customData.quiz_version === 'v2' ? 'v2' : customData.quiz_version === 'v3' ? 'v3' : 'v1',
    });
  } catch (err) {
    console.error('[track] funnel store write failed:', err);
  }

  const result = await sendCapiEvent({
    event_name: eventName,
    event_id: asString(body.eventId),
    event_source_url: asString(body.sourceUrl),
    user_data: {
      email: asString(body.email),
      ipAddress: ip,
      userAgent,
      ...getMetaCookiesFromRequest(req, { fbc: body.fbc, fbp: body.fbp }),
    },
    custom_data: Object.keys(customData).length > 0 ? customData : undefined,
  });

  // Siempre 200 al cliente — no le servimos errores que pueda exponer
  return NextResponse.json(result);
}

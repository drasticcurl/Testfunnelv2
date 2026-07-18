/**
 * GET /api/admin/funnel-data
 *
 * Devuelve el embudo agregado del quiz, slide por slide.
 * Auth: cookie admin_token firmada (HMAC). Sin cookie -> 401.
 *
 * Respuesta:
 *   {
 *     ok: true,
 *     data: {
 *       slides: [{ index, id, type, count, pctVsStart, pctVsPrevious, dropFromPrevious }],
 *       totalStarts, totalCompletes, totalSales (number | null),
 *       totalEvents, generatedAt, backend, utmBreakdown
 *     }
 *   }
 *
 * POST /api/admin/funnel-data
 *
 * Acción "backfill_purchase": permite cargar manualmente compras que el
 * webhook de Shopify no logró trackear (p. ej. ventas anteriores al deploy
 * del PR #105 o webhooks que se perdieron). Suma N eventos `Purchase`
 * con los UTMs / país que el admin indique.
 *
 * Body: {
 *   action: 'backfill_purchase',
 *   count?: number,                    // 1..50, default 1
 *   utms?: {
 *     utm_source?, utm_medium?,
 *     utm_campaign?, utm_content?
 *   },
 *   country?: string                   // 'AR' | 'CO' | ... | undefined
 * }
 *
 * DELETE /api/admin/funnel-data
 *
 * Resetea todas las estadísticas del embudo. Requiere auth admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/admin/store';
import type { FunnelFilters } from '@/lib/admin/store';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getArgentinaDay } from '@/lib/admin/day';
import { resolveRangeFromParam } from '@/lib/admin/range';
import { getSupabase } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  // Filtro por día (GMT-3). `?day=YYYY-MM-DD` para un día puntual, `?day=all`
  // para el acumulado. Sin parámetro => hoy (GMT-3) por defecto.
  const url = new URL(req.url);
  const dayParam = url.searchParams.get('day');
  let day: string | 'all';
  if (dayParam === 'all') {
    day = 'all';
  } else if (dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam)) {
    day = dayParam;
  } else {
    day = getArgentinaDay();
  }

  // ── Diagnóstico: `?debug=1` muestra bajo qué día quedan guardados los
  //    eventos en funnel_counts, y el desglose por evento+slide del día.
  if (url.searchParams.get('debug') === '1') {
    const serverToday = getArgentinaDay();
    const resolvedDay = day; // 'all' o 'YYYY-MM-DD' (hoy por defecto)
    const supabase = getSupabase();
    let note = 'backend no-supabase (no hay diagnóstico de filas)';
    let days: Array<{ day: string; events: number; starts: number }> = [];
    let dayBreakdown: Array<{ event_name: string; slide: number; count: number }> = [];
    if (supabase) {
      // Paginamos: Supabase devuelve máx. 1000 filas por request. Si la tabla
      // supera las 1000 filas, un select plano descarta en silencio las más
      // nuevas (los días recientes). Traemos todo en lotes.
      const PAGE = 1000;
      const rows: Array<Record<string, unknown>> = [];
      let error: { message: string } | null = null;
      for (let from = 0; ; from += PAGE) {
        const res = await supabase
          .from('funnel_counts')
          .select('day, event_name, slide, count')
          .order('id', { ascending: true })
          .range(from, from + PAGE - 1);
        if (res.error) {
          error = res.error;
          break;
        }
        const batch = (res.data ?? []) as Array<Record<string, unknown>>;
        rows.push(...batch);
        if (batch.length < PAGE) break;
      }
      if (error) {
        note = `query error: ${error.message}`;
      } else {
        const map = new Map<string, { events: number; starts: number }>();
        const bd = new Map<string, number>();
        for (const r of (rows ?? []) as Array<{ day?: unknown; event_name?: unknown; slide?: unknown; count?: unknown }>) {
          const d = typeof r.day === 'string' && r.day ? r.day.slice(0, 10) : '(sin columna day)';
          const c = Number(r.count) || 0;
          const ev = String(r.event_name ?? '');
          const sl = Number(r.slide ?? -1);
          const cur = map.get(d) ?? { events: 0, starts: 0 };
          cur.events += c;
          if (ev === 'QuizProgress' && sl === 0) cur.starts += c;
          map.set(d, cur);
          // Desglose del día consultado (o todos si day=all).
          if (resolvedDay === 'all' || d === resolvedDay) {
            const key = `${ev}|${sl}`;
            bd.set(key, (bd.get(key) ?? 0) + c);
          }
        }
        days = Array.from(map.entries())
          .map(([d, v]) => ({ day: d, ...v }))
          .sort((a, b) => (a.day < b.day ? 1 : -1));
        dayBreakdown = Array.from(bd.entries())
          .map(([k, count]) => {
            const [event_name, slide] = k.split('|');
            return { event_name, slide: Number(slide), count };
          })
          .sort((a, b) => b.count - a.count);
        note = 'ok';
      }
    }
    return NextResponse.json(
      {
        ok: true,
        debug: {
          serverToday,
          resolvedDay,
          requestedDay: dayParam ?? '(default: hoy)',
          note,
          days,
          dayBreakdown,
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }

  // Filtro por versión del quiz: ?version=ar | latam. Cualquier otro valor o
  // ausencia => undefined (vista Unificada = todas las filas).
  const versionParam = url.searchParams.get('version');
  const version: 'ar' | 'latam' | undefined =
    versionParam === 'ar' || versionParam === 'latam' ? versionParam : undefined;

  // Si vino `?range=` (hoy/ayer/esta_semana/este_mes/…), filtramos por ese
  // rango (GMT-3). Si no, usamos el día puntual (`?day=` o hoy por defecto).
  // El filtro de versión se combina con el de día/rango.
  const rangeParam = url.searchParams.get('range');
  const filters: FunnelFilters = rangeParam
    ? (() => {
        const r = resolveRangeFromParam(rangeParam);
        return { from: r.fromDay, to: r.toDay, version };
      })()
    : { day, version };
  const data = await getStore().getFunnel(filters);

  return NextResponse.json(
    { ok: true, data },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  );
}

type BackfillBody = {
  action?: string;
  count?: unknown;
  utms?: Record<string, unknown>;
  country?: unknown;
};

function pickUtm(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: BackfillBody;
  try {
    body = (await req.json()) as BackfillBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  if (body.action !== 'backfill_purchase') {
    return NextResponse.json({ ok: false, error: 'unknown_action' }, { status: 400 });
  }

  // Sanitización: count entre 1 y 50, evita ataques accidentales por typo.
  const rawCount = Number(body.count);
  const count =
    Number.isFinite(rawCount) && rawCount >= 1
      ? Math.min(50, Math.floor(rawCount))
      : 1;

  const utmsBody = body.utms ?? {};
  const utms: Record<string, string> = {};
  const utmSource = pickUtm(utmsBody.utm_source);
  const utmMedium = pickUtm(utmsBody.utm_medium);
  const utmCampaign = pickUtm(utmsBody.utm_campaign);
  const utmContent = pickUtm(utmsBody.utm_content);
  if (utmSource) utms.utm_source = utmSource;
  if (utmMedium) utms.utm_medium = utmMedium;
  if (utmCampaign) utms.utm_campaign = utmCampaign;
  if (utmContent) utms.utm_content = utmContent;

  const countryRaw = typeof body.country === 'string' ? body.country.trim() : '';
  const country = countryRaw.length > 0 ? countryRaw.toUpperCase() : undefined;

  const store = getStore();
  let added = 0;
  let lastError: string | null = null;
  for (let i = 0; i < count; i++) {
    try {
      await store.track('Purchase', {
        utms: Object.keys(utms).length > 0 ? utms : undefined,
        country,
        quizVersion: 'ar',
      });
      added++;
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'unknown';
      console.error('[admin/funnel-data] backfill track failed:', lastError);
      break;
    }
  }

  console.log('[admin/funnel-data] backfill_purchase', {
    requested: count,
    added,
    utm_source: utms.utm_source ?? '(directo)',
    country: country ?? '(desconocido)',
  });

  return NextResponse.json(
    {
      ok: added > 0,
      added,
      requested: count,
      error: lastError,
    },
    { status: added > 0 ? 200 : 500 },
  );
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    await getStore().reset();
    return NextResponse.json({ ok: true, message: 'Estadísticas reseteadas' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error';
    console.error('[admin/funnel-data] DELETE failed:', msg);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 },
    );
  }
}

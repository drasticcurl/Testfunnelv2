/**
 * SupabaseStore — backend persistente para el funnel del quiz.
 *
 * Usa la tabla `funnel_counts` en Supabase.
 * Soporta quiz_version (v1/v2/v3) para filtrar en el admin.
 *
 * Nota: el `country` que pueda enviar el caller (webhook, /api/track) se
 * ignora a propósito — el negocio vende solo a Argentina, así que no vale
 * la pena complicar el schema con una columna más. El country breakdown
 * de la UI queda como `[]` cuando este es el backend.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { slidesV2 } from '@/lib/quiz-v2/data';
import { cleanUtmValue } from '@/lib/utm';
import { getArgentinaDay, DAY_SENTINEL } from './day';
import type {
  FunnelStore,
  FunnelData,
  FunnelFilters,
  FunnelSlideRow,
  TrackProps,
  UTMBreakdownRow,
} from './store';

// ─── Singleton del client ──────────────────────────────────────────────────

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      '[admin/supabase-store] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return _client;
}

// ─── Implementación ────────────────────────────────────────────────────────

export class SupabaseStore implements FunnelStore {
  async track(event: string, props: TrackProps): Promise<void> {
    if (!event || typeof event !== 'string') return;

    const client = getClient();

    // NOTA (decisión de producto): el funnel se agrupa SOLO por campaña para no
    // inflar `funnel_counts`. El traffic source (ig/fb), medium y content no
    // aportan valor en el embudo (eso se ve en /admin/ventas desde la tabla
    // `purchases`). Por eso forzamos source/medium/content a '(directo)' y solo
    // dejamos variar utm_campaign. Así la cardinalidad por día queda acotada.
    const utm_source = '(directo)';
    const utm_medium = '(directo)';
    const utm_campaign = cleanUtmValue(props.utms?.utm_campaign) || '(directo)';
    const utm_content = '(directo)';
    const quiz_version = props.quizVersion || 'v1';

    // Día calendario en GMT-3 (Argentina). Ver lib/admin/day.ts.
    const day = getArgentinaDay();

    // IMPORTANT: Use -1 as sentinel instead of NULL for events without a slide
    // (ViewContent, Purchase, InitiateCheckout, etc). PostgreSQL treats
    // NULL ≠ NULL in UNIQUE constraints, so rows with slide=NULL never
    // match for upsert/increment → each event creates a NEW row with count=1
    // instead of incrementing the existing counter. Using -1 fixes this.
    const slide =
      typeof props.slide === 'number' && Number.isFinite(props.slide)
        ? props.slide
        : -1;

    // ── 1) RPC diario (atómico, incluye day) — requiere migración 007.
    const { error: dailyError } = await client.rpc('increment_funnel_count_daily', {
      p_event_name: event,
      p_slide: slide,
      p_utm_source: utm_source,
      p_utm_medium: utm_medium,
      p_utm_campaign: utm_campaign,
      p_utm_content: utm_content,
      p_quiz_version: quiz_version,
      p_day: day,
    });
    if (!dailyError) return;

    // ── 2) Fallback: RPC viejo sin day (si la migración 007 no se corrió aún).
    const { error: rpcError } = await client.rpc('increment_funnel_count', {
      p_event_name: event,
      p_slide: slide,
      p_utm_source: utm_source,
      p_utm_medium: utm_medium,
      p_utm_campaign: utm_campaign,
      p_utm_content: utm_content,
      p_quiz_version: quiz_version,
    });
    if (!rpcError) return;

    console.error(
      '[admin/supabase-store] RPCs failed, trying direct upsert:',
      `daily=${dailyError.message} | legacy=${rpcError.message}`,
    );

    // ── 3) Fallback: upsert directo incluyendo day.
    const { error: upsertDayError } = await client
      .from('funnel_counts')
      .upsert(
        {
          event_name: event,
          slide,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_content,
          quiz_version,
          day,
          count: 1,
        },
        {
          onConflict: 'event_name,slide,utm_source,utm_medium,utm_campaign,utm_content,day',
          ignoreDuplicates: false,
        },
      );
    if (!upsertDayError) return;

    // ── 4) Último fallback: upsert SIN day (esquema viejo, pre-migración 007).
    const { error: upsertError } = await client
      .from('funnel_counts')
      .upsert(
        {
          event_name: event,
          slide,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_content,
          quiz_version,
          count: 1,
        },
        {
          onConflict: 'event_name,slide,utm_source,utm_medium,utm_campaign,utm_content',
          ignoreDuplicates: false,
        },
      );

    if (upsertError) {
      // Propagamos el error para que el caller (webhook/track) pueda loguear/
      // reintentar. Si no, una venta podría no quedar registrada en el embudo.
      console.error('[admin/supabase-store] all writes failed:', upsertError.message);
      throw new Error(
        `funnel_counts write failed (daily_rpc=${dailyError.message} | legacy_rpc=${rpcError.message} | upsert_day=${upsertDayError.message} | upsert=${upsertError.message})`,
      );
    }
  }

  async getFunnel(filters: FunnelFilters): Promise<FunnelData> {
    const client = getClient();

    // Intentamos traer la columna `day` (requiere migración 007). Si todavía
    // no existe, reintentamos sin ella (modo degradado: todo cae en un solo
    // bucket histórico).
    const withDayCols =
      'event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count';
    const noDayCols =
      'event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, count';

    let rows: Array<Record<string, unknown>> | null = null;
    let dayAvailable = true;

    {
      let query = client.from('funnel_counts').select(withDayCols);
      if (filters.version) query = query.eq('quiz_version', filters.version);
      const { data, error } = await query;
      if (!error) {
        rows = data ?? [];
      } else {
        console.warn(
          '[admin/supabase-store] select con `day` falló, reintentando sin day:',
          error.message,
        );
        dayAvailable = false;
        let q2 = client.from('funnel_counts').select(noDayCols);
        if (filters.version) q2 = q2.eq('quiz_version', filters.version);
        const { data: data2, error: error2 } = await q2;
        if (error2) {
          console.error('[admin/supabase-store] getFunnel query failed:', error2.message);
          throw new Error(`Supabase query failed: ${error2.message}`);
        }
        rows = data2 ?? [];
      }
    }

    return this.computeFunnel(rows, filters, dayAvailable);
  }

  async reset(): Promise<void> {
    const client = getClient();

    const { error } = await client
      .from('funnel_counts')
      .delete()
      .gt('id', 0);

    if (error) {
      const { error: error2 } = await client
        .from('funnel_counts')
        .delete()
        .neq('event_name', '');

      if (error2) {
        throw new Error(`Reset failed: ${error.message} | Fallback: ${error2.message}`);
      }
    }
  }

  // ─── Cálculo del embudo ──────────────────────────────────────────────────

  private computeFunnel(
    rawRows: Array<Record<string, unknown>>,
    filters: FunnelFilters,
    dayAvailable = true,
  ): FunnelData {
    // Normalizamos las filas (la columna `day` puede no venir en modo degradado).
    const rows = rawRows.map((r) => ({
      event_name: String(r.event_name ?? ''),
      slide: typeof r.slide === 'number' ? (r.slide as number) : Number(r.slide ?? -1),
      utm_campaign: String(r.utm_campaign ?? '(directo)'),
      count: typeof r.count === 'number' ? (r.count as number) : Number(r.count ?? 0),
      day: typeof r.day === 'string' && r.day ? (r.day as string).slice(0, 10) : DAY_SENTINEL,
    }));

    // Si la columna `day` no existe todavía (pre-migración 007), no podemos
    // segmentar por día: devolvemos el acumulado y sin días disponibles.
    const availableDays = dayAvailable
      ? Array.from(new Set(rows.map((r) => r.day))).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
      : [];

    const dayFilter = dayAvailable && filters.day && filters.day !== 'all' ? filters.day : null;
    const filteredRows = dayFilter ? rows.filter((r) => r.day === dayFilter) : rows;

    const perSlide: Record<number, number> = {};
    let landingViews = 0;
    let viewContent = 0;
    let checkoutClicks = 0;
    let purchase = 0;
    let totalEvents = 0;

    // Atribución SOLO por campaña (decisión de producto — ver track()).
    const campMap: Record<string, { starts: number; completes: number; checkoutClicks: number; purchases: number }> = {};

    function campaignKey(raw: string): string {
      return cleanUtmValue(raw) || '(directo)';
    }

    function ensureCamp(key: string) {
      if (!campMap[key]) {
        campMap[key] = { starts: 0, completes: 0, checkoutClicks: 0, purchases: 0 };
      }
    }

    for (const row of filteredRows) {
      totalEvents += row.count;
      const campaign = campaignKey(row.utm_campaign);

      if (row.event_name === 'QuizProgress' && typeof row.slide === 'number' && row.slide >= 0) {
        perSlide[row.slide] = (perSlide[row.slide] ?? 0) + row.count;
        if (row.slide === 0) {
          ensureCamp(campaign);
          campMap[campaign].starts += row.count;
        }
      } else if (row.event_name === 'LandingView') {
        landingViews += row.count;
      } else if (row.event_name === 'ViewContent') {
        viewContent += row.count;
        ensureCamp(campaign);
        campMap[campaign].completes += row.count;
      } else if (row.event_name === 'CheckoutClick' || row.event_name === 'InitiateCheckout') {
        checkoutClicks += row.count;
        ensureCamp(campaign);
        campMap[campaign].checkoutClicks += row.count;
      } else if (row.event_name === 'Purchase') {
        purchase += row.count;
        ensureCamp(campaign);
        campMap[campaign].purchases += row.count;
      }
    }

    const totalStarts = perSlide[0] ?? 0;

    // Use quiz slides (single version now)
    const activeSlides = slidesV2;

    const slidesRows: FunnelSlideRow[] = activeSlides.map((s, i) => {
      const count = perSlide[i] ?? 0;
      const prev = i > 0 ? (perSlide[i - 1] ?? 0) : totalStarts;
      const pctVsStart = totalStarts > 0 ? (count / totalStarts) * 100 : 0;
      const pctVsPrevious = prev > 0 ? (count / prev) * 100 : 0;
      return {
        index: i,
        id: s.id,
        type: s.type,
        count,
        pctVsStart,
        pctVsPrevious,
        dropFromPrevious: prev > 0 ? 100 - pctVsPrevious : 0,
      };
    });

    // utmBreakdown ahora es campaign-centric: source/medium/content quedan en
    // '(todas)' porque el funnel ya no las distingue.
    const utmBreakdown: UTMBreakdownRow[] = Object.entries(campMap)
      .map(([campaign, data]) => ({
        source: '(todas)',
        medium: '(todas)',
        campaign,
        content: '(todas)',
        ...data,
        cvr: data.starts > 0 ? (data.purchases / data.starts) * 100 : 0,
      }))
      .sort((a, b) => b.starts - a.starts);

    return {
      slides: slidesRows,
      totalLandingViews: landingViews,
      totalStarts,
      totalCompletes: viewContent,
      totalCheckoutClicks: checkoutClicks > 0 ? checkoutClicks : null,
      totalSales: purchase > 0 ? purchase : null,
      filters,
      totalEvents,
      generatedAt: Date.now(),
      backend: 'supabase',
      utmBreakdown,
      countryBreakdown: [],
      day: dayFilter,
      availableDays,
      dayTrackingActive: dayAvailable,
    };
  }
}

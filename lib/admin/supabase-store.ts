/**
 * SupabaseStore — backend persistente para el funnel del quiz.
 *
 * Usa la tabla `funnel_counts` de Supabase. El esquema vive en
 * `supabase/setup.sql`: una fila por (event_name, slide, utm_*, quiz_version,
 * country, day), y la RPC atómica `increment_funnel_count_daily(...)` para
 * incrementar el contador.
 *
 * Soporta filtros por:
 *  - quiz_version (v1/v2/v3)
 *  - day (GMT-3) — `'YYYY-MM-DD'` o `'all'` (acumulado).
 *  - country     — ISO alpha-2 o `'all'` (todos).
 *
 * Devuelve `countryBreakdown` poblado leyendo la columna `country` →
 * /admin/funnel ve el desglose por país sin tener que dejar el backend en
 * memory (que solo persiste durante el proceso).
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { slidesV3 } from '@/lib/quiz-v2/data';
import { cleanUtmValue } from '@/lib/utm';
import { getArgentinaDay, DAY_SENTINEL } from './day';
import type {
  FunnelStore,
  FunnelData,
  FunnelFilters,
  FunnelSlideRow,
  TrackProps,
  UTMBreakdownRow,
  CountryBreakdownRow,
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

const SUPPORTED_COUNTRIES = new Set(['CL', 'CO', 'MX', 'PE', 'US']);

/** Normaliza el country recibido del caller. Devuelve `'(desconocido)'` si vacío/inválido. */
function normalizeCountry(raw: string | undefined | null): string {
  if (typeof raw !== 'string') return '(desconocido)';
  const upper = raw.trim().toUpperCase();
  if (upper.length === 2 && SUPPORTED_COUNTRIES.has(upper)) return upper;
  return '(desconocido)';
}

export class SupabaseStore implements FunnelStore {
  async track(event: string, props: TrackProps): Promise<void> {
    if (!event || typeof event !== 'string') return;

    const client = getClient();

    // Atribución SOLO por campaña (decisión de producto, ver setup.sql):
    // source/medium/content quedan fijos en '(directo)' para no inflar la
    // cardinalidad de funnel_counts. La atribución completa se ve en
    // /admin/ventas (tabla `purchases`, no acá).
    const utm_source = '(directo)';
    const utm_medium = '(directo)';
    const utm_campaign = cleanUtmValue(props.utms?.utm_campaign) || '(directo)';
    const utm_content = '(directo)';
    const quiz_version = props.quizVersion || 'v1';
    const country = normalizeCountry(props.country);
    const day = getArgentinaDay();

    // -1 sentinel para eventos sin slide (ViewContent, Purchase,
    // InitiateCheckout, etc.). Evita el problema de NULL ≠ NULL en el unique.
    const slide =
      typeof props.slide === 'number' && Number.isFinite(props.slide)
        ? props.slide
        : -1;

    // 1) RPC atómica day-aware con country (schema actual: setup.sql).
    const { error: rpcError } = await client.rpc('increment_funnel_count_daily', {
      p_event_name: event,
      p_slide: slide,
      p_utm_source: utm_source,
      p_utm_medium: utm_medium,
      p_utm_campaign: utm_campaign,
      p_utm_content: utm_content,
      p_quiz_version: quiz_version,
      p_country: country,
      p_day: day,
    });
    if (!rpcError) return;

    console.error(
      '[admin/supabase-store] RPC failed, trying direct upsert:',
      rpcError.message,
    );

    // 2) Fallback: upsert directo (mismo conflicto que el unique index).
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
          country,
          day,
          count: 1,
        },
        {
          onConflict:
            'event_name,slide,utm_source,utm_medium,utm_campaign,utm_content,country,day',
          ignoreDuplicates: false,
        },
      );

    if (upsertError) {
      console.error(
        '[admin/supabase-store] all writes failed:',
        upsertError.message,
      );
      throw new Error(
        `funnel_counts write failed (rpc=${rpcError.message} | upsert=${upsertError.message})`,
      );
    }
  }

  async getFunnel(filters: FunnelFilters): Promise<FunnelData> {
    const client = getClient();

    // El select trae country + day. Si la DB es vieja (pre-setup.sql),
    // re-intenta sin esas columnas → modo degradado (countryBreakdown []).
    const fullCols =
      'event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, country, day, count';
    const legacyCols =
      'event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, count';

    let rows: Array<Record<string, unknown>> | null = null;
    let dayAvailable = true;
    let countryAvailable = true;

    {
      let query = client.from('funnel_counts').select(fullCols);
      if (filters.version) query = query.eq('quiz_version', filters.version);
      const { data, error } = await query;
      if (!error) {
        rows = data ?? [];
      } else {
        console.warn(
          '[admin/supabase-store] select con country/day falló, reintentando sin esas columnas:',
          error.message,
        );
        dayAvailable = false;
        countryAvailable = false;
        let q2 = client.from('funnel_counts').select(legacyCols);
        if (filters.version) q2 = q2.eq('quiz_version', filters.version);
        const { data: data2, error: error2 } = await q2;
        if (error2) {
          console.error('[admin/supabase-store] getFunnel query failed:', error2.message);
          throw new Error(`Supabase query failed: ${error2.message}`);
        }
        rows = data2 ?? [];
      }
    }

    return this.computeFunnel(rows, filters, dayAvailable, countryAvailable);
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
    countryAvailable = true,
  ): FunnelData {
    // Normalizamos las filas (las columnas country/day pueden no venir en
    // modo degradado).
    const rows = rawRows.map((r) => ({
      event_name: String(r.event_name ?? ''),
      slide: typeof r.slide === 'number' ? (r.slide as number) : Number(r.slide ?? -1),
      utm_campaign: String(r.utm_campaign ?? '(directo)'),
      country: typeof r.country === 'string' && r.country ? r.country : '(desconocido)',
      count: typeof r.count === 'number' ? (r.count as number) : Number(r.count ?? 0),
      day: typeof r.day === 'string' && r.day ? (r.day as string).slice(0, 10) : DAY_SENTINEL,
    }));

    // Si la columna `day` no existe (esquema viejo), no podemos segmentar
    // por día — devolvemos el acumulado y sin días disponibles.
    const availableDays = dayAvailable
      ? Array.from(new Set(rows.map((r) => r.day))).sort((a, b) =>
          a < b ? 1 : a > b ? -1 : 0,
        )
      : [];

    // Filtro por día.
    const dayFilter =
      dayAvailable && filters.day && filters.day !== 'all' ? filters.day : null;
    const dayRows = dayFilter ? rows.filter((r) => r.day === dayFilter) : rows;

    // Filtro por país (solo si la columna existe).
    const countryFilter =
      countryAvailable && filters.country && filters.country !== 'all'
        ? filters.country
        : null;
    const filteredRows = countryFilter
      ? dayRows.filter((r) => r.country === countryFilter)
      : dayRows;

    const perSlide: Record<number, number> = {};
    let landingViews = 0;
    let viewContent = 0;
    let checkoutClicks = 0;
    let purchase = 0;
    let totalEvents = 0;

    // Atribución por campaña.
    const campMap: Record<string, { starts: number; completes: number; checkoutClicks: number; purchases: number }> = {};
    // Atribución por país (mismas métricas).
    const countryMap: Record<string, { starts: number; completes: number; checkoutClicks: number; purchases: number }> = {};

    function campaignKey(raw: string): string {
      return cleanUtmValue(raw) || '(directo)';
    }

    function ensureCamp(key: string) {
      if (!campMap[key]) {
        campMap[key] = { starts: 0, completes: 0, checkoutClicks: 0, purchases: 0 };
      }
    }

    function ensureCountry(key: string) {
      if (!countryMap[key]) {
        countryMap[key] = { starts: 0, completes: 0, checkoutClicks: 0, purchases: 0 };
      }
    }

    for (const row of filteredRows) {
      totalEvents += row.count;
      const campaign = campaignKey(row.utm_campaign);
      const country = row.country || '(desconocido)';

      if (row.event_name === 'QuizProgress' && typeof row.slide === 'number' && row.slide >= 0) {
        perSlide[row.slide] = (perSlide[row.slide] ?? 0) + row.count;
        if (row.slide === 0) {
          ensureCamp(campaign);
          campMap[campaign].starts += row.count;
          ensureCountry(country);
          countryMap[country].starts += row.count;
        }
      } else if (row.event_name === 'LandingView') {
        landingViews += row.count;
      } else if (row.event_name === 'ViewContent') {
        viewContent += row.count;
        ensureCamp(campaign);
        campMap[campaign].completes += row.count;
        ensureCountry(country);
        countryMap[country].completes += row.count;
      } else if (row.event_name === 'CheckoutClick' || row.event_name === 'InitiateCheckout') {
        checkoutClicks += row.count;
        ensureCamp(campaign);
        campMap[campaign].checkoutClicks += row.count;
        ensureCountry(country);
        countryMap[country].checkoutClicks += row.count;
      } else if (row.event_name === 'Purchase') {
        purchase += row.count;
        ensureCamp(campaign);
        campMap[campaign].purchases += row.count;
        ensureCountry(country);
        countryMap[country].purchases += row.count;
      }
    }

    const totalStarts = perSlide[0] ?? 0;
    const activeSlides = slidesV3;

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

    const countryBreakdown: CountryBreakdownRow[] = Object.entries(countryMap)
      .map(([country, data]) => ({
        country,
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
      countryBreakdown,
      day: dayFilter,
      availableDays,
      dayTrackingActive: dayAvailable,
    };
  }
}

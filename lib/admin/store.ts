/**
 * Admin Funnel Store — abstracción del backend de eventos para el dashboard.
 *
 * Backends soportados (selector via env `FUNNEL_STORE`):
 *  - `memory`   (default) : in-memory, persiste solo durante el proceso.
 *                           Se PIERDE al re-deploy / cold start. Apto para
 *                           validar UX y para dev local.
 *  - `supabase` : Usa tabla `funnel_counts` con contadores agregados.
 *                 1 fila por combinación (event, slide, utms). Ultra eficiente.
 *
 * Diseño v2 — CONTADORES AGREGADOS:
 *  - `track(event, props)` incrementa un contador en vez de insertar 1 fila.
 *  - `getFunnel(filters)` lee los contadores y calcula el embudo.
 *  - Sin experiments (eliminados para simplificar). Solo UTMs.
 */

import { slidesV2 } from '@/lib/quiz-v2/data';
import { cleanUtmValue } from '@/lib/utm';
import { getArgentinaDay, DAY_SENTINEL } from './day';

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type FunnelFilters = {
  /** Filter by quiz version: 'v1', 'v2', 'v3', or undefined (all). */
  version?: 'v1' | 'v2' | 'v3';
  /**
   * Día calendario en GMT-3 (`YYYY-MM-DD`) por el que filtrar.
   *  - `undefined` o `'all'` => acumulado de todos los días.
   *  - Un día concreto => solo eventos de ese día.
   */
  day?: string | 'all';
  /**
   * Filtra por país (ISO alpha-2). `undefined` o `'all'` = todos los países.
   * `'(desconocido)'` = solo eventos sin país detectado.
   */
  country?: string | 'all';
};

export type FunnelSlideRow = {
  index: number;
  id: string;
  type: string;
  count: number;
  /** % de usuarios en este slide vs el slide 1 (start). */
  pctVsStart: number;
  /** % de retención vs el slide anterior (100 = nadie se cayó). */
  pctVsPrevious: number;
  /** % de drop vs el slide anterior (= 100 - pctVsPrevious). */
  dropFromPrevious: number;
};

export type UTMBreakdownRow = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  starts: number;
  completes: number;
  checkoutClicks: number;
  purchases: number;
  /** CVR: purchases / starts * 100 */
  cvr: number;
};

export type CountryBreakdownRow = {
  country: string;
  starts: number;
  completes: number;
  checkoutClicks: number;
  purchases: number;
  /** CVR: purchases / starts * 100 */
  cvr: number;
};

export type FunnelData = {
  slides: FunnelSlideRow[];
  totalLandingViews: number;
  totalStarts: number;
  totalCompletes: number;
  totalCheckoutClicks: number | null;
  totalSales: number | null;
  filters: FunnelFilters;
  totalEvents: number;
  generatedAt: number;
  /** Backend efectivo (para que la UI muestre warning si es 'memory'). */
  backend: 'memory' | 'supabase';
  /** Breakdown por UTM — para saber de dónde llegan leads y compradores */
  utmBreakdown: UTMBreakdownRow[];
  /** Breakdown por país — para saber de qué país llegan y compran */
  countryBreakdown: CountryBreakdownRow[];
  /**
   * Día (GMT-3, `YYYY-MM-DD`) que representa esta data, o `null` si es el
   * acumulado de todos los días.
   */
  day: string | null;
  /** Días disponibles con datos (GMT-3, `YYYY-MM-DD`), ordenados desc. */
  availableDays: string[];
  /**
   * `true` si el tracking por día está activo (memory siempre; supabase solo
   * si la columna `day` existe, i.e. la migración 007 ya se corrió).
   * Si es `false`, el filtro por día se ignora y se muestra el acumulado.
   */
  dayTrackingActive: boolean;
};

export type TrackProps = {
  slide?: number;
  questionId?: string;
  utms?: Record<string, string>;
  quizVersion?: 'v1' | 'v2' | 'v3';
  country?: string;
};

export interface FunnelStore {
  track(event: string, props: TrackProps): Promise<void>;
  getFunnel(filters: FunnelFilters): Promise<FunnelData>;
  reset(): Promise<void>;
}

// ─── Memory backend ────────────────────────────────────────────────────────

/**
 * MemoryStore usa la misma lógica de contadores que Supabase pero en un Map.
 * Key = "event|slide|src|med|camp|content", Value = count.
 */

type CounterKey = string;

type GlobalStore = {
  counters: Map<CounterKey, number>;
};

declare global {
  // eslint-disable-next-line no-var
  var __funnelStore: GlobalStore | undefined;
}

function getGlobal(): GlobalStore {
  if (!globalThis.__funnelStore) {
    globalThis.__funnelStore = { counters: new Map() };
  }
  return globalThis.__funnelStore;
}

function makeKey(
  event: string,
  slide: number,
  utms?: Record<string, string>,
  quizVersion?: 'v1' | 'v2' | 'v3',
  country?: string,
  day?: string,
): CounterKey {
  // Atribución SOLO por campaña (igual que SupabaseStore): source/medium/content
  // quedan fijos en '(directo)' para no inflar la cardinalidad de contadores.
  const src = '(directo)';
  const med = '(directo)';
  const camp = cleanUtmValue(utms?.utm_campaign) || '(directo)';
  const content = '(directo)';
  const ver = quizVersion || 'v1';
  const ctry = country || '(desconocido)';
  const d = day || getArgentinaDay();
  return `${event}|${slide}|${src}|${med}|${camp}|${content}|${ver}|${ctry}|${d}`;
}

function parseKey(key: CounterKey): {
  event_name: string;
  slide: number;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  quiz_version: 'v1' | 'v2' | 'v3';
  country: string;
  day: string;
} {
  const [event_name, slideStr, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, country, day] = key.split('|');
  return {
    event_name,
    slide: Number(slideStr),
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    quiz_version: (quiz_version as 'v1' | 'v2' | 'v3') || 'v1',
    country: country || '(desconocido)',
    day: day || DAY_SENTINEL,
  };
}

class MemoryStore implements FunnelStore {
  async track(event: string, props: TrackProps): Promise<void> {
    if (!event || typeof event !== 'string') return;
    const g = getGlobal();

    // Use -1 as sentinel for events without a slide (ViewContent, Purchase, etc.)
    // This mirrors the SupabaseStore fix: avoids NULL comparison issues.
    const slide =
      typeof props.slide === 'number' && Number.isFinite(props.slide)
        ? props.slide
        : -1;

    const key = makeKey(event, slide, props.utms, props.quizVersion, props.country, getArgentinaDay());
    g.counters.set(key, (g.counters.get(key) ?? 0) + 1);
  }

  async getFunnel(filters: FunnelFilters): Promise<FunnelData> {
    const g = getGlobal();
    // Convert counters map to rows array
    const rows = Array.from(g.counters.entries()).map(([key, count]) => ({
      ...parseKey(key),
      count,
    }));
    return computeFunnel(rows, filters, 'memory');
  }

  async reset(): Promise<void> {
    getGlobal().counters = new Map();
  }
}

// ─── Helpers de cálculo ────────────────────────────────────────────────────

type CounterRow = {
  event_name: string;
  slide: number;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  quiz_version: 'v1' | 'v2' | 'v3';
  country: string;
  day: string;
  count: number;
};

function computeFunnel(
  rows: CounterRow[],
  filters: FunnelFilters,
  backend: FunnelData['backend'],
): FunnelData {
  // Días disponibles (de todas las filas, antes de filtrar por día).
  const availableDays = Array.from(
    new Set(rows.map((r) => r.day || DAY_SENTINEL)),
  ).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)); // desc

  // Filter by version if specified
  const versionRows = filters.version
    ? rows.filter((r) => r.quiz_version === filters.version)
    : rows;

  // Filter by day unless 'all'/undefined.
  const dayFilter = filters.day && filters.day !== 'all' ? filters.day : null;
  const dayRows = dayFilter
    ? versionRows.filter((r) => (r.day || DAY_SENTINEL) === dayFilter)
    : versionRows;

  // Filter by country unless 'all'/undefined. Acepta '(desconocido)' como
  // valor explícito para ver solo eventos sin país detectado.
  const countryFilter =
    filters.country && filters.country !== 'all' ? filters.country : null;
  const filteredRows = countryFilter
    ? dayRows.filter((r) => (r.country || '(desconocido)') === countryFilter)
    : dayRows;
  const perSlide: Record<number, number> = {};
  let landingViews = 0;
  let viewContent = 0;
  let checkoutClicks = 0;
  let purchase = 0;
  let totalEvents = 0;

  // UTM breakdown aggregation — SOLO por campaña (ver makeKey).
  const utmMap: Record<string, { starts: number; completes: number; checkoutClicks: number; purchases: number }> = {};
  // Country breakdown aggregation
  const countryMap: Record<string, { starts: number; completes: number; checkoutClicks: number; purchases: number }> = {};

  function getUtmKey(row: CounterRow): string {
    return cleanUtmValue(row.utm_campaign) || '(directo)';
  }

  function ensureUtmRow(key: string) {
    if (!utmMap[key]) {
      utmMap[key] = { starts: 0, completes: 0, checkoutClicks: 0, purchases: 0 };
    }
  }

  function ensureCountryRow(country: string) {
    if (!countryMap[country]) {
      countryMap[country] = { starts: 0, completes: 0, checkoutClicks: 0, purchases: 0 };
    }
  }

  for (const row of filteredRows) {
    totalEvents += row.count;

    if (row.event_name === 'QuizProgress' && typeof row.slide === 'number' && row.slide >= 0) {
      perSlide[row.slide] = (perSlide[row.slide] ?? 0) + row.count;
      if (row.slide === 0) {
        const key = getUtmKey(row);
        ensureUtmRow(key);
        utmMap[key].starts += row.count;
        ensureCountryRow(row.country);
        countryMap[row.country].starts += row.count;
      }
    } else if (row.event_name === 'LandingView') {
      landingViews += row.count;
    } else if (row.event_name === 'ViewContent') {
      viewContent += row.count;
      const key = getUtmKey(row);
      ensureUtmRow(key);
      utmMap[key].completes += row.count;
      ensureCountryRow(row.country);
      countryMap[row.country].completes += row.count;
    } else if (row.event_name === 'CheckoutClick' || row.event_name === 'InitiateCheckout') {
      checkoutClicks += row.count;
      const key = getUtmKey(row);
      ensureUtmRow(key);
      utmMap[key].checkoutClicks += row.count;
      ensureCountryRow(row.country);
      countryMap[row.country].checkoutClicks += row.count;
    } else if (row.event_name === 'Purchase') {
      purchase += row.count;
      const key = getUtmKey(row);
      ensureUtmRow(key);
      utmMap[key].purchases += row.count;
      ensureCountryRow(row.country);
      countryMap[row.country].purchases += row.count;
    }
  }

  const totalStarts = perSlide[0] ?? 0;

  // Use quiz slides (single version now)
  const activeSlides = slidesV2;

  const slidesRows: FunnelSlideRow[] = activeSlides.map((s, i) => {
    // Tracking now sends slide = currentStep (0-indexed). Direct mapping.
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

  // Build UTM breakdown rows sorted by starts desc (campaign-centric).
  const utmBreakdown: UTMBreakdownRow[] = Object.entries(utmMap)
    .map(([campaign, data]) => {
      return {
        source: '(todas)',
        medium: '(todas)',
        campaign,
        content: '(todas)',
        ...data,
        cvr: data.starts > 0 ? (data.purchases / data.starts) * 100 : 0,
      };
    })
    .sort((a, b) => b.starts - a.starts);

  // Build country breakdown rows sorted by starts desc
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
    backend,
    utmBreakdown,
    countryBreakdown,
    day: dayFilter,
    availableDays,
    dayTrackingActive: true,
  };
}

// ─── Selector de backend ───────────────────────────────────────────────────

let _store: FunnelStore | null = null;

export function getStore(): FunnelStore {
  if (_store) return _store;
  const backend = (process.env.FUNNEL_STORE ?? 'memory').toLowerCase();
  switch (backend) {
    case 'memory':
      _store = new MemoryStore();
      break;
    case 'supabase': {
      const { SupabaseStore } = require('./supabase-store') as {
        SupabaseStore: new () => FunnelStore;
      };
      _store = new SupabaseStore();
      break;
    }
    default:
      console.warn(
        `[admin/store] FUNNEL_STORE="${backend}" desconocido — fallback a memory.`,
      );
      _store = new MemoryStore();
  }
  return _store;
}

/** Solo para tests: limpia el singleton. */
export function __resetStoreSingleton(): void {
  _store = null;
}

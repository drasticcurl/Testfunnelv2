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

import { slides } from '@/lib/quiz-data';
import { slidesV2 } from '@/lib/quiz-v2/data';
import { slidesV3 } from '@/lib/quiz-v3/data';

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type FunnelFilters = {
  /** Filter by quiz version: 'v1', 'v2', 'v3', or undefined (all). */
  version?: 'v1' | 'v2' | 'v3';
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
};

export type TrackProps = {
  slide?: number;
  questionId?: string;
  utms?: Record<string, string>;
  quizVersion?: 'v1' | 'v2' | 'v3';
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
  slide: number | null,
  utms?: Record<string, string>,
  quizVersion?: 'v1' | 'v2' | 'v3',
): CounterKey {
  const src = utms?.utm_source || '(directo)';
  const med = utms?.utm_medium || '(directo)';
  const camp = utms?.utm_campaign || '(directo)';
  const content = utms?.utm_content || '(directo)';
  const ver = quizVersion || 'v1';
  return `${event}|${slide ?? 'null'}|${src}|${med}|${camp}|${content}|${ver}`;
}

function parseKey(key: CounterKey): {
  event_name: string;
  slide: number | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  quiz_version: 'v1' | 'v2' | 'v3';
} {
  const [event_name, slideStr, utm_source, utm_medium, utm_campaign, utm_content, quiz_version] = key.split('|');
  return {
    event_name,
    slide: slideStr === 'null' ? null : Number(slideStr),
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    quiz_version: (quiz_version as 'v1' | 'v2' | 'v3') || 'v1',
  };
}

class MemoryStore implements FunnelStore {
  async track(event: string, props: TrackProps): Promise<void> {
    if (!event || typeof event !== 'string') return;
    const g = getGlobal();

    const slide =
      typeof props.slide === 'number' && Number.isFinite(props.slide)
        ? props.slide
        : null;

    const key = makeKey(event, slide, props.utms, props.quizVersion);
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
  slide: number | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  quiz_version: 'v1' | 'v2' | 'v3';
  count: number;
};

function computeFunnel(
  rows: CounterRow[],
  filters: FunnelFilters,
  backend: FunnelData['backend'],
): FunnelData {
  // Filter by version if specified
  const filteredRows = filters.version
    ? rows.filter((r) => r.quiz_version === filters.version)
    : rows;
  const perSlide: Record<number, number> = {};
  let landingViews = 0;
  let viewContent = 0;
  let checkoutClicks = 0;
  let purchase = 0;
  let totalEvents = 0;

  // UTM breakdown aggregation
  const utmMap: Record<string, { starts: number; completes: number; checkoutClicks: number; purchases: number }> = {};

  function getUtmKey(row: CounterRow): string {
    return `${row.utm_source}|${row.utm_medium}|${row.utm_campaign}|${row.utm_content}`;
  }

  function ensureUtmRow(key: string) {
    if (!utmMap[key]) {
      utmMap[key] = { starts: 0, completes: 0, checkoutClicks: 0, purchases: 0 };
    }
  }

  for (const row of filteredRows) {
    totalEvents += row.count;

    if (row.event_name === 'QuizProgress' && typeof row.slide === 'number') {
      perSlide[row.slide] = (perSlide[row.slide] ?? 0) + row.count;
      if (row.slide === 0) {
        const key = getUtmKey(row);
        ensureUtmRow(key);
        utmMap[key].starts += row.count;
      }
    } else if (row.event_name === 'LandingView') {
      landingViews += row.count;
    } else if (row.event_name === 'ViewContent') {
      viewContent += row.count;
      const key = getUtmKey(row);
      ensureUtmRow(key);
      utmMap[key].completes += row.count;
    } else if (row.event_name === 'CheckoutClick' || row.event_name === 'InitiateCheckout') {
      checkoutClicks += row.count;
      const key = getUtmKey(row);
      ensureUtmRow(key);
      utmMap[key].checkoutClicks += row.count;
    } else if (row.event_name === 'Purchase') {
      purchase += row.count;
      const key = getUtmKey(row);
      ensureUtmRow(key);
      utmMap[key].purchases += row.count;
    }
  }

  const totalStarts = perSlide[0] ?? 0;

  // Use appropriate slides array based on version filter
  const activeSlides = filters.version === 'v3' ? slidesV3 : filters.version === 'v2' ? slidesV2 : slides;

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

  // Build UTM breakdown rows sorted by starts desc
  const utmBreakdown: UTMBreakdownRow[] = Object.entries(utmMap)
    .map(([key, data]) => {
      const [source, medium, campaign, content] = key.split('|');
      return {
        source,
        medium,
        campaign,
        content,
        ...data,
        cvr: data.starts > 0 ? (data.purchases / data.starts) * 100 : 0,
      };
    })
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

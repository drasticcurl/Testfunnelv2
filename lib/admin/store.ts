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

import { slidesV3 } from '@/lib/quiz-v2/data';
import { slidesV3Latam } from '@/lib/quiz-v2/data-latam';
import { cleanUtmValue } from '@/lib/utm';
import { parseAbEntryEvent, type EntryVariant } from '@/lib/quiz-v2/abEntry';
import { parseFunnelVariantEvent, type FunnelVariant } from '@/lib/quiz-v2/funnelVariant';
import { getArgentinaDay, DAY_SENTINEL } from './day';

// ─── Tipos públicos ────────────────────────────────────────────────────────

/** Etiqueta de versión que se ESCRIBE de ahora en más. */
export type QuizVersion = 'ar' | 'latam';

/** Etiquetas legacy que pueden existir en filas históricas (solo lectura). */
export type LegacyQuizVersion = 'v1' | 'v2' | 'v3';

/** Unión usada al LEER filas almacenadas. */
export type StoredQuizVersion = QuizVersion | LegacyQuizVersion;

export type FunnelFilters = {
  /** Filtra por versión del quiz. `undefined` = unificado (todas las filas). */
  version?: QuizVersion;
  /**
   * Día calendario en GMT-3 (`YYYY-MM-DD`) por el que filtrar.
   *  - `undefined` o `'all'` => acumulado de todos los días.
   *  - Un día concreto => solo eventos de ese día.
   */
  day?: string | 'all';
  /**
   * Rango por día (GMT-3 `YYYY-MM-DD`), inclusive ambos extremos.
   * Si `from` y `to` están seteados, tienen prioridad sobre `day`.
   */
  from?: string;
  to?: string;
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

/**
 * Fila del test A/B/C de la pantalla de ENTRADA del quiz (slide 0).
 * Se calcula a partir de los eventos `ab_entry_<V>_landing|start|complete|checkout|purchase`.
 */
export type VariantBreakdownRow = {
  /** 'A' (directo) | 'B' (hook actual) | 'C' (hook liviano). */
  variant: EntryVariant;
  /** Vieron la pantalla de entrada (denominador). */
  landings: number;
  /** Llegaron a la 1ª pregunta (iniciaron el quiz). */
  starts: number;
  /** Llegaron a la sales page (completaron el quiz). */
  completes: number;
  /** Clickearon "comprar" en la sales page. */
  checkouts: number;
  /** Compraron (atribuido server-side desde el webhook). */
  purchases: number;
  /** starts / landings * 100. */
  startRate: number;
  /** completes / landings * 100. */
  completionRate: number;
  /** completes / starts * 100 (de los que iniciaron, cuántos completaron). */
  completionVsStart: number;
  /** purchases / landings * 100 — % de venta de cada landing (la métrica clave). */
  salesRate: number;
  /** purchases / completes * 100 — de los que completaron, cuántos compraron. */
  salesVsComplete: number;
};

/**
 * Fila del test FULL-FUNNEL A/B (Argentina): control (A) vs rebrand (B).
 * Se calcula a partir de los eventos `af_<V>_quiz_start|quiz_complete|salespage_view|checkout|purchase`.
 */
export type FunnelVariantBreakdownRow = {
  /** 'A' (control) | 'B' (rebrandeado). */
  variant: FunnelVariant;
  /** Llegaron a la 1ª pregunta real (iniciaron el quiz). Denominador. */
  quizStarts: number;
  /** Llegaron al slide de la sales page (completaron el quiz). */
  quizCompletes: number;
  /** Vieron efectivamente la sales page. */
  salesViews: number;
  /** Clickearon el CTA de compra. */
  checkouts: number;
  /** Compras confirmadas (atribuidas server-side). */
  purchases: number;
  /** quizCompletes / quizStarts * 100. */
  completionRate: number;
  /** salesViews / quizCompletes * 100. */
  salesViewRate: number;
  /** checkouts / salesViews * 100. */
  checkoutRate: number;
  /** purchases / checkouts * 100. */
  purchaseRate: number;
  /** purchases / quizStarts * 100 — CONVERSIÓN TOTAL del funnel (KPI estrella). */
  totalConversionRate: number;
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
  /** Test A/B/C de la pantalla de entrada (slide 0). Vacío si no hay datos. */
  variantBreakdown: VariantBreakdownRow[];
  /** Test FULL-FUNNEL A vs B (Argentina). Vacío si no hay eventos `af_*`. */
  funnelVariantBreakdown: FunnelVariantBreakdownRow[];
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
  /** Escrituras nuevas: 'ar' | 'latam'. Acepta legacy por compat de callers. */
  quizVersion?: QuizVersion | LegacyQuizVersion;
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
  quizVersion?: StoredQuizVersion,
  country?: string,
  day?: string,
): CounterKey {
  // Atribución SOLO por campaña (igual que SupabaseStore): source/medium/content
  // quedan fijos en '(directo)' para no inflar la cardinalidad de contadores.
  const src = '(directo)';
  const med = '(directo)';
  const camp = cleanUtmValue(utms?.utm_campaign) || '(directo)';
  const content = '(directo)';
  const ver = quizVersion || 'ar';
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
  quiz_version: StoredQuizVersion;
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
    quiz_version: (quiz_version as StoredQuizVersion) || 'ar',
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

    // Normalizamos la versión recibida del caller: cualquier valor que no sea
    // 'latam' (incluido el legacy 'v3'/'v1' y undefined) se guarda como 'ar'.
    // Así los callers server-side legacy que mandan 'v3' quedan en Argentina.
    const quizVersion: QuizVersion = props.quizVersion === 'latam' ? 'latam' : 'ar';

    const key = makeKey(event, slide, props.utms, quizVersion, props.country, getArgentinaDay());
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

/**
 * Construye el breakdown del test A/B/C de entrada a partir de filas de
 * contadores (cualquier backend). Solo mira los eventos `ab_entry_*`.
 * Compartido por MemoryStore y SupabaseStore.
 */
export function buildVariantBreakdown(
  rows: Array<{ event_name: string; count: number }>,
): VariantBreakdownRow[] {
  const acc: Record<EntryVariant, { landings: number; starts: number; completes: number; checkouts: number; purchases: number }> = {
    A: { landings: 0, starts: 0, completes: 0, checkouts: 0, purchases: 0 },
    B: { landings: 0, starts: 0, completes: 0, checkouts: 0, purchases: 0 },
    C: { landings: 0, starts: 0, completes: 0, checkouts: 0, purchases: 0 },
  };

  let any = false;
  for (const row of rows) {
    const parsed = parseAbEntryEvent(row.event_name);
    if (!parsed) continue;
    any = true;
    const bucket = acc[parsed.variant];
    if (parsed.step === 'landing') bucket.landings += row.count;
    else if (parsed.step === 'start') bucket.starts += row.count;
    else if (parsed.step === 'complete') bucket.completes += row.count;
    else if (parsed.step === 'checkout') bucket.checkouts += row.count;
    else if (parsed.step === 'purchase') bucket.purchases += row.count;
  }

  if (!any) return [];

  return (['A', 'B', 'C'] as EntryVariant[]).map((variant) => {
    const { landings, starts, completes, checkouts, purchases } = acc[variant];
    return {
      variant,
      landings,
      starts,
      completes,
      checkouts,
      purchases,
      startRate: landings > 0 ? (starts / landings) * 100 : 0,
      completionRate: landings > 0 ? (completes / landings) * 100 : 0,
      completionVsStart: starts > 0 ? (completes / starts) * 100 : 0,
      salesRate: landings > 0 ? (purchases / landings) * 100 : 0,
      salesVsComplete: completes > 0 ? (purchases / completes) * 100 : 0,
    };
  });
}

/**
 * Construye el breakdown del test FULL-FUNNEL A vs B (Argentina) a partir de
 * filas de contadores (cualquier backend). Solo mira eventos `af_*`.
 * Espejo de `buildVariantBreakdown`:
 *  - parsea `af_*` con `parseFunnelVariantEvent`,
 *  - acumula contadores por variante y paso,
 *  - calcula tasas denominator-safe y acotadas a [0,100],
 *  - devuelve `[]` si no hay ningún evento `af_*` (la sección del admin se oculta).
 */
export function buildFunnelVariantBreakdown(
  rows: Array<{ event_name: string; count: number }>,
): FunnelVariantBreakdownRow[] {
  const acc: Record<
    FunnelVariant,
    { quizStarts: number; quizCompletes: number; salesViews: number; checkouts: number; purchases: number }
  > = {
    A: { quizStarts: 0, quizCompletes: 0, salesViews: 0, checkouts: 0, purchases: 0 },
    B: { quizStarts: 0, quizCompletes: 0, salesViews: 0, checkouts: 0, purchases: 0 },
  };

  let any = false;
  for (const row of rows) {
    const parsed = parseFunnelVariantEvent(row.event_name);
    if (!parsed) continue;
    any = true;
    const bucket = acc[parsed.variant];
    if (parsed.step === 'quiz_start') bucket.quizStarts += row.count;
    else if (parsed.step === 'quiz_complete') bucket.quizCompletes += row.count;
    else if (parsed.step === 'salespage_view') bucket.salesViews += row.count;
    else if (parsed.step === 'checkout') bucket.checkouts += row.count;
    else if (parsed.step === 'purchase') bucket.purchases += row.count;
  }

  if (!any) return [];

  // Tasa segura: 0 si el denominador es 0, acotada al rango inclusivo [0,100].
  const safeRate = (num: number, den: number): number => {
    if (den <= 0) return 0;
    const r = (num / den) * 100;
    if (!Number.isFinite(r)) return 0;
    return Math.min(100, Math.max(0, r));
  };

  return (['A', 'B'] as FunnelVariant[]).map((variant) => {
    const { quizStarts, quizCompletes, salesViews, checkouts, purchases } = acc[variant];
    return {
      variant,
      quizStarts,
      quizCompletes,
      salesViews,
      checkouts,
      purchases,
      completionRate: safeRate(quizCompletes, quizStarts),
      salesViewRate: safeRate(salesViews, quizCompletes),
      checkoutRate: safeRate(checkouts, salesViews),
      purchaseRate: safeRate(purchases, checkouts),
      totalConversionRate: safeRate(purchases, quizStarts),
    };
  });
}

type CounterRow = {
  event_name: string;
  slide: number;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  quiz_version: StoredQuizVersion;
  country: string;
  day: string;
  count: number;
};

/**
 * Selecciona la lista de slides del embudo según la versión solicitada.
 *  - 'latam'           → `slidesV3Latam` (quiz de LATAM).
 *  - 'ar' y unificado  → `slidesV3` (quiz de Argentina, scaffold de referencia).
 *
 * Exportada para poder testearla de forma aislada y reutilizarla desde el
 * SupabaseStore.
 */
export function selectSlides(version?: QuizVersion) {
  return version === 'latam' ? slidesV3Latam : slidesV3;
}

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

  // Filter by day/range. Un rango (from+to) tiene prioridad sobre `day`.
  const hasRange = Boolean(filters.from && filters.to);
  const dayFilter = !hasRange && filters.day && filters.day !== 'all' ? filters.day : null;
  const filteredRows = hasRange
    ? versionRows.filter((r) => {
        const d = r.day || DAY_SENTINEL;
        return d >= (filters.from as string) && d <= (filters.to as string);
      })
    : dayFilter
      ? versionRows.filter((r) => (r.day || DAY_SENTINEL) === dayFilter)
      : versionRows;
  // Día efectivo a reportar: un rango de un solo día se trata como ese día.
  const effectiveDay = hasRange
    ? (filters.from === filters.to ? (filters.from as string) : null)
    : dayFilter;
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

  // Slides según la versión solicitada (AR/unificado → slidesV3, LATAM → latam).
  const activeSlides = selectSlides(filters.version);

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

  const variantBreakdown = buildVariantBreakdown(filteredRows);
  const funnelVariantBreakdown = buildFunnelVariantBreakdown(filteredRows);

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
    variantBreakdown,
    funnelVariantBreakdown,
    day: effectiveDay,
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

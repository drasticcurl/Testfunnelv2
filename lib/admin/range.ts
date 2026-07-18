/**
 * Rangos de fecha para el dashboard admin — GMT-3 (America/Argentina/Buenos_Aires).
 *
 * Un único módulo puro (sin React, sin Supabase) usable tanto en el cliente
 * (RangePicker, labels) como en el server (APIs). Traduce un "preset"
 * (hoy / ayer / esta semana / este mes / últimos 7 / etc.) a:
 *   - `fromDay`/`toDay`  → `YYYY-MM-DD` GMT-3, INCLUSIVE. Para filtrar
 *                          `funnel_counts.day` (que es una `date` en GMT-3).
 *   - `fromISO`/`toISO`  → ISO UTC. Intervalo SEMIABIERTO [fromISO, toISO).
 *                          Para filtrar timestamps (`purchases.purchased_at`,
 *                          `clientes.created_at`).
 *
 * Argentina es UTC-3 fija (sin DST), así que el inicio del día `D` en GMT-3 es
 * `D 03:00:00Z`. Por eso `fromISO = ${fromDay}T03:00:00Z` y
 * `toISO = ${toDay+1}T03:00:00Z`.
 */

import { getArgentinaDay } from './day';

export type RangePreset =
  | 'hoy'
  | 'ayer'
  | 'esta_semana'
  | 'semana_pasada'
  | 'este_mes'
  | 'mes_pasado'
  | 'ultimos_7'
  | 'ultimos_30'
  | 'todo';

/** Preset por defecto del dashboard. */
export const DEFAULT_RANGE: RangePreset = 'hoy';

/** Opciones para el selector (en orden de aparición, agrupadas). */
export const RANGE_OPTIONS: ReadonlyArray<{
  value: RangePreset;
  label: string;
  group: 'Día' | 'Semana' | 'Mes' | 'Ventana móvil' | 'Histórico';
}> = [
  { value: 'hoy', label: 'Hoy', group: 'Día' },
  { value: 'ayer', label: 'Ayer', group: 'Día' },
  { value: 'esta_semana', label: 'Esta semana', group: 'Semana' },
  { value: 'semana_pasada', label: 'Semana pasada', group: 'Semana' },
  { value: 'este_mes', label: 'Este mes', group: 'Mes' },
  { value: 'mes_pasado', label: 'Mes pasado', group: 'Mes' },
  { value: 'ultimos_7', label: 'Últimos 7 días', group: 'Ventana móvil' },
  { value: 'ultimos_30', label: 'Últimos 30 días', group: 'Ventana móvil' },
  { value: 'todo', label: 'Todo', group: 'Histórico' },
];

/** Sentinela de "histórico sin fecha" (igual que lib/admin/day.ts). */
const SENTINEL_START = '2000-01-01';

export type ResolvedRange = {
  preset: RangePreset;
  label: string;
  /** `YYYY-MM-DD` GMT-3, inclusive. Para `funnel_counts.day`. */
  fromDay: string;
  /** `YYYY-MM-DD` GMT-3, inclusive. */
  toDay: string;
  /** ISO UTC, inicio inclusive. Para timestamps. */
  fromISO: string;
  /** ISO UTC, fin EXCLUSIVE (día siguiente a `toDay`). */
  toISO: string;
  /** `true` si abarca todo el histórico (preset 'todo'). */
  isAll: boolean;
};

export function isRangePreset(v: unknown): v is RangePreset {
  return typeof v === 'string' && RANGE_OPTIONS.some((o) => o.value === v);
}

export function rangeLabel(preset: RangePreset): string {
  return RANGE_OPTIONS.find((o) => o.value === preset)?.label ?? 'Hoy';
}

// ─── Helpers de calendario sobre `YYYY-MM-DD` (GMT-3) ───────────────────────
// Operamos a mediodía UTC para que sumar/restar días nunca cruce de mes por
// corrimiento de huso.

function dayToUTCNoon(day: string): Date {
  const [y, m, d] = day.split('-').map((n) => Number.parseInt(n, 10));
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

function fmtDay(dt: Date): string {
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const d = String(dt.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(day: string, n: number): string {
  const dt = dayToUTCNoon(day);
  dt.setUTCDate(dt.getUTCDate() + n);
  return fmtDay(dt);
}

/** Lunes=0 … Domingo=6 (semana arranca el lunes). */
function weekdayMon0(day: string): number {
  const dow = dayToUTCNoon(day).getUTCDay(); // 0=Dom … 6=Sáb
  return (dow + 6) % 7;
}

function firstOfMonth(day: string): string {
  const [y, m] = day.split('-').map((n) => Number.parseInt(n, 10));
  return `${y}-${String(m).padStart(2, '0')}-01`;
}

function lastOfMonth(day: string): string {
  const [y, m] = day.split('-').map((n) => Number.parseInt(n, 10));
  // Día 0 del mes siguiente = último día del mes actual.
  return fmtDay(new Date(Date.UTC(y, m, 0, 12, 0, 0)));
}

/** Inicio del día GMT-3 expresado en ISO UTC (00:00 -03:00 == 03:00Z). */
function gmt3DayStartISO(day: string): string {
  return `${day}T03:00:00.000Z`;
}

/** Resuelve un preset a un rango concreto (días GMT-3 + ISO UTC). */
export function resolveRange(
  preset: RangePreset,
  today: string = getArgentinaDay(),
): ResolvedRange {
  let fromDay = today;
  let toDay = today;

  switch (preset) {
    case 'hoy':
      fromDay = toDay = today;
      break;
    case 'ayer':
      fromDay = toDay = addDays(today, -1);
      break;
    case 'esta_semana': {
      const off = weekdayMon0(today);
      fromDay = addDays(today, -off);
      toDay = addDays(fromDay, 6);
      break;
    }
    case 'semana_pasada': {
      const off = weekdayMon0(today);
      const thisMonday = addDays(today, -off);
      fromDay = addDays(thisMonday, -7);
      toDay = addDays(thisMonday, -1);
      break;
    }
    case 'este_mes':
      fromDay = firstOfMonth(today);
      toDay = lastOfMonth(today);
      break;
    case 'mes_pasado': {
      const lastPrev = addDays(firstOfMonth(today), -1);
      fromDay = firstOfMonth(lastPrev);
      toDay = lastPrev;
      break;
    }
    case 'ultimos_7':
      fromDay = addDays(today, -6);
      toDay = today;
      break;
    case 'ultimos_30':
      fromDay = addDays(today, -29);
      toDay = today;
      break;
    case 'todo':
      fromDay = SENTINEL_START;
      toDay = today;
      break;
  }

  return {
    preset,
    label: rangeLabel(preset),
    fromDay,
    toDay,
    fromISO: gmt3DayStartISO(fromDay),
    toISO: gmt3DayStartISO(addDays(toDay, 1)), // fin exclusivo
    isAll: preset === 'todo',
  };
}

/** Resuelve desde un parámetro de URL (string | null), con fallback al default. */
export function resolveRangeFromParam(
  rangeParam: string | null | undefined,
  today: string = getArgentinaDay(),
): ResolvedRange {
  const preset = isRangePreset(rangeParam) ? rangeParam : DEFAULT_RANGE;
  return resolveRange(preset, today);
}

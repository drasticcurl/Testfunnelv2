/**
 * @file planner-state.ts — Núcleo puro del Planner VIP editable.
 *
 * Este módulo es la fuente única de verdad de la estructura de datos del planner
 * semanal de la sección VIP (`/pwa/vip/planner`). Define:
 *  - Los tipos del planner (`PlannerRowKey`, `PlannerDayIndex`, `PlannerData`, `PlannerStored`).
 *  - Las constantes compartidas (`PLANNER_DAYS`, `PLANNER_ROWS`) que consumen tanto
 *    el grid editable como el generador de PDF en blanco y los helpers de storage.
 *
 * Mantener acá una definición única evita divergencias entre la UI, el PDF y la
 * persistencia. Los helpers puros y server-safe (createEmptyPlanner, setCell,
 * loadPlannerFromStorage, savePlannerToStorage, clearPlanner) se agregan en
 * tareas posteriores (6.2 y 6.4); este archivo queda listo para extenderse.
 */

import { STORAGE_KEYS } from '@/lib/constants';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/**
 * Claves estables de fila del planner.
 * NO se traducen: son identificadores internos. El label visible vive en
 * `PLANNER_ROWS` (y, en última instancia, en la UI).
 */
export type PlannerRowKey =
  | 'ritual'
  | 'desayuno'
  | 'almuerzo'
  | 'cena'
  | 'snacks'
  | 'agua'
  | 'movimiento'
  | 'sintomas';

/** Índice de día 0..6 (Lunes..Domingo), alineado con `PLANNER_DAYS`. */
export type PlannerDayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Datos del planner: por cada fila, un arreglo de 7 strings (uno por día).
 * Estructura fija y densa → simple de hidratar, serializar y validar.
 * Invariante: cada `string[]` tiene exactamente `length === 7`.
 */
export type PlannerData = Record<PlannerRowKey, string[]>;

/**
 * Envoltura persistida en localStorage, con versión para migraciones futuras.
 * `updatedAt` es un timestamp ISO 8601.
 */
export type PlannerStored = {
  version: 1;
  data: PlannerData;
  updatedAt: string;
};

// ---------------------------------------------------------------------------
// Constantes compartidas (fuente única)
// ---------------------------------------------------------------------------

/** Los 7 días de la semana, de Lunes a Domingo (índices 0..6). */
export const PLANNER_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

/**
 * Las 8 filas del planner, en orden de render.
 * `key` es la clave estable de datos; `label` es el texto visible (con emoji).
 */
export const PLANNER_ROWS: { key: PlannerRowKey; label: string }[] = [
  { key: 'ritual', label: '🌾 Agua de arroz / ritual' },
  { key: 'desayuno', label: '🥣 Desayuno' },
  { key: 'almuerzo', label: '🍽️ Almuerzo' },
  { key: 'cena', label: '🌙 Cena (temprana)' },
  { key: 'snacks', label: '🥗 Snacks' },
  { key: 'agua', label: '💧 Agua (vasos)' },
  { key: 'movimiento', label: '🚶 Caminata / movimiento' },
  { key: 'sintomas', label: '📊 Hinchazón AM / PM (0-10)' },
];


// ---------------------------------------------------------------------------
// Helpers puros
// ---------------------------------------------------------------------------

/** Cantidad fija de días/columnas por fila. */
const DAYS_COUNT = PLANNER_DAYS.length; // 7

/** Las 8 claves de fila, derivadas de PLANNER_ROWS (fuente única). */
const ROW_KEYS: PlannerRowKey[] = PLANNER_ROWS.map((r) => r.key);

/**
 * Crea un planner vacío.
 *
 * Función pura: sin efectos secundarios, sin lectura de storage. Devuelve un
 * `PlannerData` con todas las `PlannerRowKey` presentes y, por cada fila, un
 * array NUEVO e independiente de 7 strings vacíos (`""`). Cada fila es su
 * propio array (no se comparten referencias entre filas).
 */
export function createEmptyPlanner(): PlannerData {
  const result = {} as PlannerData;
  for (const key of ROW_KEYS) {
    result[key] = Array.from({ length: DAYS_COUNT }, () => '');
  }
  return result;
}

/**
 * Devuelve un NUEVO `PlannerData` con la celda `(row, day)` en `value` y todas
 * las demás celdas intactas. Inmutable: no muta `data` ni sus arrays internos,
 * por lo que es seguro usarlo directo en `setState` de React.
 */
export function setCell(
  data: PlannerData,
  row: PlannerRowKey,
  day: PlannerDayIndex,
  value: string,
): PlannerData {
  const nextRow = data[row].slice();
  nextRow[day] = value;
  return { ...data, [row]: nextRow };
}

// ---------------------------------------------------------------------------
// Helpers de persistencia (server-safe)
// ---------------------------------------------------------------------------

/**
 * Normaliza un valor arbitrario a un `PlannerData` con forma fija:
 *  - toda `PlannerRowKey` presente,
 *  - cada fila con exactamente 7 strings (índices ≥7 descartados; faltantes
 *    rellenados con `""`).
 * Las celdas no-string se reemplazan por `""`. Cualquier shape inválido degrada
 * con gracia a un planner vacío normalizado.
 */
function normalizePlannerData(value: unknown): PlannerData {
  const result = createEmptyPlanner();
  if (value === null || typeof value !== 'object') return result;
  const source = value as Record<string, unknown>;
  for (const key of ROW_KEYS) {
    const rawRow = source[key];
    if (!Array.isArray(rawRow)) continue;
    for (let day = 0; day < DAYS_COUNT; day++) {
      const cell = rawRow[day];
      result[key][day] = typeof cell === 'string' ? cell : '';
    }
  }
  return result;
}

/**
 * Carga el planner desde localStorage.
 *
 * SSR-safe: si `window` es indefinido devuelve `createEmptyPlanner()`. Ante
 * JSON inválido o shape inesperado, devuelve un planner vacío normalizado sin
 * lanzar y sin sobrescribir el storage. Si el valor es válido, devuelve un
 * `PlannerData` normalizado (7 entradas por fila, todas las keys presentes).
 */
export function loadPlannerFromStorage(): PlannerData {
  if (typeof window === 'undefined') return createEmptyPlanner();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.vipPlanner);
    if (!raw) return createEmptyPlanner();
    const parsed = JSON.parse(raw) as Partial<PlannerStored> | null;
    if (!parsed || typeof parsed !== 'object' || typeof parsed.data !== 'object') {
      return createEmptyPlanner();
    }
    return normalizePlannerData(parsed.data);
  } catch {
    return createEmptyPlanner();
  }
}

/**
 * Persiste el planner en localStorage como `PlannerStored` (version 1, data
 * normalizada, `updatedAt` ISO).
 *
 * SSR-safe: no-op si `window` es indefinido. Si `localStorage` lanza (modo
 * privado, cuota excedida), falla en silencio sin propagar la excepción; la
 * edición en memoria sigue intacta.
 */
export function savePlannerToStorage(data: PlannerData): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: PlannerStored = {
      version: 1,
      data: normalizePlannerData(data),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.vipPlanner, JSON.stringify(payload));
  } catch {
    /* noop: si localStorage está bloqueado/lleno, conservamos el estado en
       memoria; no es un error fatal para la sesión de edición */
  }
}

/**
 * Borra el planner persistido. Para QA / debug. Server-safe; no lanza.
 */
export function clearPlanner(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.vipPlanner);
  } catch {
    /* noop */
  }
}

/**
 * A/B Testing — registro de experimentos.
 *
 * Cada experimento define un id (slug), si esta activo, y la lista de
 * variantes con sus pesos (que deben sumar 100). El bucketing se hace en
 * `lib/ab/index.ts` usando SHA256 sobre `${userId}:${expId}`.
 *
 * Para sumar un experimento nuevo:
 *  1. Agregar entry aca con `enabled: true`.
 *  2. La proxima visita lo asigna automaticamente desde `middleware.ts`.
 *  3. Leer la variante con `getVariant(cookies, 'exp_xxx')` (server)
 *     o `useVariant('exp_xxx')` (client).
 *
 * IMPORTANTE: NO renombrar ids ni variant ids una vez en produccion. Si
 * cambia el id, los usuarios re-asignados pueden caer en otra variante.
 */

export type Variant = {
  id: string;
  weight: number;
};

export type Experiment = {
  id: string;
  enabled: boolean;
  variants: Variant[];
};

export const experiments: Experiment[] = [
  {
    id: 'exp_quiz_length',
    enabled: true,
    variants: [
      { id: 'control', weight: 50 }, // 16 slides (full)
      { id: 'slim', weight: 50 }, // 13 slides (recortado)
    ],
  },
  {
    id: 'exp_landing_format',
    enabled: true,
    variants: [
      { id: 'control', weight: 50 }, // landing actual
      { id: 'noticia', weight: 50 }, // landing tipo Mujer Hoy
    ],
  },
];

/** Lookup helper. Retorna undefined si el id no existe. */
export function getExperiment(id: string): Experiment | undefined {
  return experiments.find((e) => e.id === id);
}

// ─── Constantes de cookies ──────────────────────────────────────────────────

/** Cookie con el UUID v4 del usuario, base del hash determinista. */
export const AB_USER_ID_COOKIE = 'ab_uid';

/** Prefijo de cookies de variante. Ej: `ab_exp_quiz_length`. */
export const AB_COOKIE_PREFIX = 'ab_';

/** TTL de cookies de variante. */
export const AB_COOKIE_MAX_AGE_DAYS = 90;

/** TTL de la cookie ab_uid. Mas larga porque es la base de toda re-asignacion. */
export const AB_USER_ID_MAX_AGE_DAYS = 365;

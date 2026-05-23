/**
 * A/B Testing — helpers publicos (server-side).
 *
 * Asignacion DETERMINISTA con SHA256:
 *   bucket = sha256(`${userId}:${expId}`).readUInt32BE(0) % 100
 *
 * Esto significa que dado un mismo `userId` (cookie ab_uid) la asignacion
 * es estable: si limpias `ab_exp_xxx` pero conservas `ab_uid`, vas a caer
 * en la misma variante. Tambien permite re-asignar consistentemente si
 * en el futuro re-balancean pesos manteniendo orden de variantes.
 *
 * IMPORTANTE: este modulo importa `crypto` de Node — no debe usarse en
 * client components. Para client, ver `lib/ab/use-variant.ts`.
 */

import crypto from 'crypto';
import {
  AB_COOKIE_PREFIX,
  AB_USER_ID_COOKIE,
  experiments,
  getExperiment,
  type Experiment,
} from './experiments';

// Re-exports utiles para callers
export {
  AB_COOKIE_PREFIX,
  AB_USER_ID_COOKIE,
  AB_COOKIE_MAX_AGE_DAYS,
  AB_USER_ID_MAX_AGE_DAYS,
  experiments,
  getExperiment,
} from './experiments';
export type { Experiment, Variant } from './experiments';

// ─── Tipos minimos compartidos con cookies de Next ─────────────────────────

/**
 * Shape minima compartida entre `RequestCookies` (de NextRequest), el
 * `cookies()` de `next/headers`, y `req.cookies` de NextApi. Asi este modulo
 * acepta cualquiera sin acoplarse a una version especifica de tipos.
 */
export type CookieReader = {
  get: (name: string) => { value: string } | undefined;
  getAll?: () => { name: string; value: string }[];
};

// ─── Hash determinista ──────────────────────────────────────────────────────

/**
 * Mapea (userId, expId) -> bucket en [0, 100).
 *
 * Toma los primeros 4 bytes del SHA256 como uint32 BE y aplica %100. Esto
 * es lo que usa el middleware para asignar variantes en el primer visit.
 *
 * Exportado tambien para tests y para tracking server-to-server (cuando se
 * necesita reproducir la asignacion fuera de un request HTTP).
 */
export function hashToBucket(userId: string, expId: string): number {
  const digest = crypto
    .createHash('sha256')
    .update(`${userId}:${expId}`)
    .digest();
  return digest.readUInt32BE(0) % 100;
}

/**
 * Devuelve el id de variante para un (userId, experiment) usando los pesos
 * declarados. Si la suma de pesos es 0 o el experimento esta vacio, retorna
 * el id de la primera variante (o null si no hay).
 */
export function assignVariant(userId: string, experiment: Experiment): string | null {
  const variants = experiment.variants;
  if (variants.length === 0) return null;

  const totalWeight = variants.reduce((sum, v) => sum + Math.max(0, v.weight), 0);
  if (totalWeight <= 0) return variants[0]?.id ?? null;

  // Bucket en [0, 100). Lo escalamos al espacio de pesos para soportar
  // pesos != 100. Ej: si los pesos suman 200, bucket=50 -> punto 100/200.
  const bucket = hashToBucket(userId, experiment.id);
  const scaled = (bucket / 100) * totalWeight;

  let acc = 0;
  for (const v of variants) {
    acc += Math.max(0, v.weight);
    if (scaled < acc) return v.id;
  }
  // Fallback (no deberia llegar aca por flotantes)
  return variants[variants.length - 1]?.id ?? null;
}

// ─── Lectura desde cookies (server) ─────────────────────────────────────────

/**
 * Lee la cookie `ab_<expId>` y retorna el id de la variante, o `null`.
 *
 * Acepta tanto `cookies()` de next/headers como `req.cookies` de NextRequest.
 * NO escribe cookies — eso lo hace `middleware.ts`.
 */
export function getVariant(cookies: CookieReader, expId: string): string | null {
  const cookieName = `${AB_COOKIE_PREFIX}${expId}`;
  const c = cookies.get(cookieName);
  if (!c || typeof c.value !== 'string' || c.value.length === 0) return null;

  // Defensa: validar que la variante leida exista en el registry para
  // evitar arrastrar valores viejos si re-renombramos.
  const exp = getExperiment(expId);
  if (!exp) return c.value;
  const known = exp.variants.some((v) => v.id === c.value);
  return known ? c.value : null;
}

/**
 * Retorna un mapa `{ exp_quiz_length: 'slim', ... }` con todas las variantes
 * asignadas que estan en el registry. Las cookies que no matchean ningun
 * experimento conocido se ignoran (excluye `ab_uid`).
 */
export function getAllVariants(cookies: CookieReader): Record<string, string> {
  const out: Record<string, string> = {};
  for (const exp of experiments) {
    const v = getVariant(cookies, exp.id);
    if (v !== null) out[exp.id] = v;
  }
  return out;
}

/**
 * Variante S2S: dado un `userId` arbitrario, computa la asignacion sin
 * necesidad de cookies. Util para eventos disparados desde webhooks o
 * jobs server-to-server donde no hay request HTTP del usuario.
 *
 * Retorna `null` si el experimento no existe o esta deshabilitado.
 */
export function getVariantsFromUserId(userId: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const exp of experiments) {
    if (!exp.enabled) continue;
    const v = assignVariant(userId, exp);
    if (v) out[exp.id] = v;
  }
  return out;
}

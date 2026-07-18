/**
 * vip-access — lógica del candado de la sección VIP de la PWA (`/pwa/vip`).
 *
 * Lib PURA y client-safe: valida un código estático contra configuración
 * (`VIP_CODE_LATAM`) y persiste el estado de desbloqueo SOLO en `localStorage`.
 * No hay red, ni base de datos, ni autenticación: el código es exclusividad
 * percibida, no seguridad fuerte (es compartible — trade-off aceptado).
 *
 * El mismo código (`VIPLATAM` por defecto) desbloquea la sección tanto si la
 * compra vino del upsell 2 (US$27) como del downsell 2 (US$17): es el mismo
 * producto VIP.
 */

import { VIP_CODE_LATAM } from '@/lib/quiz-v2/config-latam';

/** Clave de localStorage del flag de desbloqueo (exportada para tests). */
export const VIP_UNLOCK_STORAGE_KEY = 'pwa_vip_unlocked_latam';

/**
 * Devuelve `true` si y solo si `input` (trim + case-insensitive) coincide con
 * `VIP_CODE_LATAM` (trim + case-insensitive). No realiza ninguna llamada de red
 * ni consulta a base de datos. No muta `input` ni ningún estado global.
 */
export function validateVipCode(input: string): boolean {
  return input.trim().toLowerCase() === VIP_CODE_LATAM.trim().toLowerCase();
}

/**
 * Marca la sección VIP como desbloqueada en este dispositivo.
 *
 * Idempotente: llamarla N veces deja el flag en el mismo estado que una sola
 * llamada (`'true'`). Si `localStorage` no está disponible, falla de forma
 * silenciosa (no lanza).
 */
export function persistVipUnlocked(): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(VIP_UNLOCK_STORAGE_KEY, 'true');
  } catch {
    /* no-op: localStorage puede no estar disponible (modo privado, SSR, etc.) */
  }
}

/**
 * Lee el estado de desbloqueo. Server-safe: si no hay `window`, devuelve
 * `false`. Devuelve `true` si y solo si el flag vale exactamente `'true'`.
 * Si `localStorage` lanza, devuelve `false`.
 */
export function isVipUnlocked(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(VIP_UNLOCK_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

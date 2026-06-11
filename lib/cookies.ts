/**
 * Helpers client-side para leer cookies y UTMs de la URL/localStorage.
 *
 * Este archivo es 100% browser-safe: no importa nada de Node (`crypto`,
 * `fs`, etc.). Cualquier `'use client'` puede importarlo sin contaminar
 * el bundle del cliente con builtins de Node.
 *
 * Responsabilidades:
 *  - getCookie / getMetaCookies: leer cookies del document (incluido _fbc/_fbp del Pixel de Meta)
 *  - captureUTMs / getUTMs: capturar UTMs del primer visit y persistirlos en localStorage
 *
 * Fuente de verdad: docs/15-TRACKING-FIXES.md
 */

// ─── Cookies (browser) ──────────────────────────────────────────────────────

/**
 * Devuelve el valor de una cookie del document, o undefined si:
 *  - estamos corriendo en server (SSR / route handler)
 *  - la cookie no existe
 *  - el match falla
 *
 * Nota: NO usa `document.cookie.split` porque eso rompe si hay valores
 * con `=` adentro (los `_fbc` de Meta pueden tener `=` en el `clickID`).
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'),
  );
  if (!match) return undefined;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Devuelve los identificadores de Meta (_fbc y _fbp) que setea el Pixel
 * client-side. Estos son CRITICOS para que CAPI dedupe bien client+server
 * y para el matching de usuarios contra audiencias.
 *
 * Si el Pixel no esta cargado todavia, ambos pueden ser undefined.
 * En ese caso CAPI sigue funcionando (con peor matching).
 */
export function getMetaCookies(): { fbc: string | undefined; fbp: string | undefined } {
  return {
    fbc: getCookie('_fbc'),
    fbp: getCookie('_fbp'),
  };
}

// ─── UTMs (capturados en la landing, persistidos en localStorage) ──────────

import { STORAGE_KEYS } from '@/lib/constants';

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
] as const;

const UTM_STORAGE_KEY = STORAGE_KEYS.utm;

export type UTMs = Partial<Record<(typeof UTM_KEYS)[number], string>>;

/**
 * Captura UTMs y fbclid de la URL actual y los guarda en localStorage.
 * Pensado para correr en la landing al primer visit.
 *
 * Comportamiento:
 *  - Si hay UTMs en la URL, hace merge con lo guardado (los nuevos pisan).
 *  - Si NO hay UTMs en la URL, devuelve lo que ya estaba guardado (no borra).
 *  - No-op en server.
 */
export function captureUTMs(): UTMs {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const found: UTMs = {};

    for (const key of UTM_KEYS) {
      const v = params.get(key);
      if (v) found[key] = v;
    }

    if (Object.keys(found).length > 0) {
      const prev = getUTMs();
      const merged: UTMs = { ...prev, ...found };
      window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }

    return getUTMs();
  } catch {
    return {};
  }
}

/** Recupera UTMs guardados (o {} si no hay). No-op en server. */
export function getUTMs(): UTMs {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') {
      return parsed as UTMs;
    }
    return {};
  } catch {
    return {};
  }
}


// ─── Atribución para el checkout de Hotmart ────────────────────────────────

/**
 * Lee el país detectado/forzado del localStorage. Lo escribe `useCountryLocale`
 * cuando el usuario entra por una ruta SEO (`/chile`, `/colombia`, etc.) o
 * cuando la geo-IP devuelve un país soportado.
 *
 * Devuelve `undefined` si no hay país guardado (ej: usuario que entró direct
 * a `/upsell` sin pasar por el quiz). En ese caso, el webhook de Hotmart cae
 * al `buyer.address.country` del payload como fallback.
 */
function getStoredCountry(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const v = window.localStorage.getItem(STORAGE_KEYS.country);
    if (typeof v !== 'string' || v.length !== 2) return undefined;
    return v.toUpperCase();
  } catch {
    return undefined;
  }
}

/**
 * Construye la atribución para el `xcod` de Hotmart a partir de los UTMs (+
 * fbclid) guardados en localStorage y el país (también del localStorage).
 *
 * Hotmart preserva el valor de `?xcod=...` en la orden y lo devuelve en el
 * webhook como `purchase.origin.xcod` y `purchase.tracking.source`. Como
 * Hotmart NO conserva query params arbitrarios (solo los suyos: `off`,
 * `src`, `xcod`, `sck`...), TODA la atribución de la venta tiene que entrar
 * por `xcod`. Por eso serializamos los UTMs + country como un querystring
 * dentro de `xcod`:
 *
 *   xcod=country%3DCL%26utm_source%3Dfacebook%26utm_campaign%3DChile1
 *
 * El webhook (`/api/hotmart-webhook`) lo parsea de vuelta con URLSearchParams.
 *
 * Hotmart limita `xcod` a 200 caracteres → si nos pasamos, truncamos al
 * último `&` que entra en 195 chars (preservamos pares clave=valor enteros).
 *
 * Devuelve '' si no hay nada para atribuir (sin separador).
 */
function buildHotmartXcod(): string {
  const utms = getUTMs();
  const country = getStoredCountry();

  const sp = new URLSearchParams();
  if (country) sp.set('country', country);
  for (const [k, v] of Object.entries(utms)) {
    if (typeof v === 'string' && v.length > 0) sp.set(k, v);
  }
  const raw = sp.toString();
  if (raw.length === 0) return '';
  if (raw.length <= 195) return raw;

  // Truncar al último `&` que entra en 195 chars para no romper un par.
  const cut = raw.lastIndexOf('&', 195);
  return cut > 0 ? raw.slice(0, cut) : raw.slice(0, 195);
}

/**
 * Une una URL de checkout de Hotmart con la atribución (UTMs + country
 * codificados en el `xcod`) y, opcionalmente, params extra (ej. `src=quiz_v3`)
 * que viajan como query plana fuera del xcod.
 *
 * Si no hay nada para atribuir y no se pasa `extra`, devuelve la URL tal cual.
 */
export function withCheckoutAttribution(
  url: string,
  extra?: Record<string, string>,
): string {
  const parts: string[] = [];
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }
  const xcod = buildHotmartXcod();
  if (xcod) parts.push(`xcod=${encodeURIComponent(xcod)}`);
  if (parts.length === 0) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${parts.join('&')}`;
}

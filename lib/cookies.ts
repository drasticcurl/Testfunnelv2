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


// ─── Atribución para el checkout de Shopify ────────────────────────────────

/**
 * Construye los parámetros de atribución para el link de checkout de Shopify
 * a partir de los UTMs (+fbclid) guardados en localStorage.
 *
 * Los pasa en DOS formas a propósito:
 *  1. query plano (`utm_source=...`)        → analytics / fallback `landing_site`.
 *  2. cart attribute (`attributes[utm_source]=...`) → Shopify lo persiste en la
 *     ORDEN como `note_attributes`, que es lo que el webhook lee de forma
 *     CONFIABLE. El `landing_site` se pierde según la sesión del cliente en la
 *     tienda → por eso las ventas caían en "(directo)" aunque la landing y el
 *     funnel registraban bien el UTM.
 *
 * Cart permalinks soportan `attributes[...]` (Shopify docs: "Create cart
 * permalinks"). Brackets en literal (Shopify los espera así); solo encodeamos
 * clave y valor.
 *
 * Devuelve '' si no hay UTMs guardados. No incluye separador inicial (? / &).
 */
export function buildCheckoutAttribution(): string {
  const utms = getUTMs();
  const parts: string[] = [];
  for (const [k, v] of Object.entries(utms)) {
    if (!v) continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    parts.push(`attributes[${encodeURIComponent(k)}]=${encodeURIComponent(v)}`);
  }
  return parts.join('&');
}

/**
 * Une una URL de checkout con los parámetros de atribución (UTMs como query +
 * cart attributes) y, opcionalmente, params extra (ej. `{ src: 'quiz_v3' }`).
 * Usa el separador correcto (`?` o `&`) según la URL.
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
  const attribution = buildCheckoutAttribution();
  if (attribution) parts.push(attribution);
  if (parts.length === 0) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${parts.join('&')}`;
}

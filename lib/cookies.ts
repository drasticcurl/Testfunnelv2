/**
 * Helpers client-side para leer cookies y UTMs de la URL/localStorage.
 *
 * Este archivo es 100% browser-safe: no importa nada de Node (`crypto`,
 * `fs`, etc.). Cualquier `'use client'` puede importarlo sin contaminar
 * el bundle del cliente con builtins de Node.
 *
 * Responsabilidades:
 *  - getCookie / getMetaCookies: leer cookies del document (incluido _fbc/_fbp del Pixel de Meta)
 *  - captureUTMs / getUTMs: capturar UTMs del primer visit y persistirlos en una
 *    cookie cross-subdominio (`.hilvanapp.com`) + localStorage como fallback
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
 * Escribe una cookie first-party. No-op en server.
 *
 * Por defecto es host-only (sin atributo `domain`), para no arriesgar rechazos
 * del browser en hosts que no matchean (ej: previews de Vercel `*.vercel.app`).
 *
 * Si se pasa `domain` (ej. `.hilvanapp.com`), la cookie se comparte entre TODOS
 * los subdominios de ese dominio (checkout `tienda.hilvanapp.com`, app
 * `chauhinchazon.hilvanapp.com`, etc.). Esto es clave para los UTMs: el
 * `localStorage` es por-origen y NO viaja entre subdominios; la cookie sí.
 */
function setCookie(name: string, value: string, maxAgeDays: number, domain?: string): void {
  if (typeof document === 'undefined') return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  let cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  if (domain) cookie += `; domain=${domain}`;
  document.cookie = cookie;
}

/** Genera un `_fbp` en el formato estandar de Meta: `fb.1.<creationTime>.<random>`. */
function generateFbp(): string {
  const random = Math.floor(Math.random() * 1e10);
  return `fb.1.${Date.now()}.${random}`;
}

/**
 * Devuelve los identificadores de Meta (_fbc y _fbp) para enriquecer el match
 * de CAPI y el pixel. Estos son CRITICOS para que CAPI dedupe bien client+server
 * y para el matching de usuarios contra audiencias.
 *
 * Cobertura mejorada (los adblockers suelen bloquear el script del Pixel, que
 * es quien normalmente setea _fbc/_fbp → quedaban undefined). Como este modulo
 * es first-party, igual corre y los recupera:
 *
 *  - _fbp: si no existe (Pixel bloqueado/aun no cargado), generamos uno valido
 *    y lo PERSISTIMOS en cookie, de modo que todos los eventos (PageView que el
 *    Pixel pueda disparar despues, InitiateCheckout, Lead, etc.) compartan el
 *    MISMO id. El Pixel, si carga luego, reutiliza la cookie existente.
 *  - _fbc: si no existe, lo reconstruimos desde el `fbclid` guardado en
 *    localStorage (capturado en la landing) con el formato `fb.1.<ts>.<fbclid>`
 *    y lo persistimos. Solo aplica a trafico que vino de un click de anuncio.
 *
 * Sigue siendo seguro si no hay nada: devuelve undefined sin romper.
 */
export function getMetaCookies(): { fbc: string | undefined; fbp: string | undefined } {
  let fbp = getCookie('_fbp');
  let fbc = getCookie('_fbc');

  if (typeof window !== 'undefined') {
    if (!fbp) {
      fbp = generateFbp();
      setCookie('_fbp', fbp, 90);
    }
    if (!fbc) {
      const fbclid = getUTMs().fbclid;
      if (fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
        setCookie('_fbc', fbc, 90);
      }
    }
  }

  return { fbc, fbp };
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

/**
 * Nombre de la cookie de UTMs. Reutilizamos el MISMO string que la clave de
 * localStorage por consistencia (y porque ya es un valor "legacy" conocido).
 */
const UTM_COOKIE_NAME = STORAGE_KEYS.utm;

/**
 * Dominio de la cookie de UTMs. Configurable por env.
 *
 *  - En producción: `.hilvanapp.com` → la cookie se comparte entre el checkout
 *    (`tienda.hilvanapp.com`) y la app (`chauhinchazon.hilvanapp.com`), así los
 *    UTMs sobreviven el recorrido completo sin importar por dónde entre el user
 *    (link del email, redirect del pago, acceso directo, etc.).
 *  - Vacío (default): cookie host-only → seguro en previews de Vercel y local.
 *
 * IMPORTANTE: solo funciona si el host actual es subdominio de ese dominio; si
 * no matchea, el browser rechaza la cookie. Por eso NO se hardcodea.
 */
const UTM_COOKIE_DOMAIN = process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '';

/** Vida de la cookie de UTMs (días). Igual ventana que _fbp/_fbc de Meta. */
const UTM_COOKIE_MAX_AGE_DAYS = 90;

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
      persistUTMs(merged);
      return merged;
    }

    // Sin UTMs nuevos en la URL: NO borramos lo guardado. Ademas re-persistimos
    // lo que ya hubiera, para "promover" a la cookie cross-subdominio los UTMs
    // que quizas solo vivian en localStorage (sesiones previas al cambio).
    const existing = getUTMs();
    if (Object.keys(existing).length > 0) persistUTMs(existing);
    return existing;
  } catch {
    return {};
  }
}

/**
 * Persiste los UTMs en DOS lugares:
 *  1. Cookie `.hilvanapp.com` (cross-subdominio) → fuente principal: sobrevive
 *     el ida y vuelta entre app y checkout, y cualquier orden de navegacion.
 *  2. localStorage (host-only) → fallback/compat para lecturas en el mismo origen.
 * No-op en server.
 */
function persistUTMs(utms: UTMs): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
  } catch {
    /* storage lleno / bloqueado: no romper */
  }
  try {
    const value = encodeURIComponent(JSON.stringify(utms));
    setCookie(UTM_COOKIE_NAME, value, UTM_COOKIE_MAX_AGE_DAYS, UTM_COOKIE_DOMAIN || undefined);
  } catch {
    /* cookies bloqueadas: no romper */
  }
}

/** Lee los UTMs de la cookie (o {} si no hay/parseo falla). */
function readUTMsFromCookie(): UTMs {
  // getCookie ya hace decodeURIComponent del valor guardado.
  const raw = getCookie(UTM_COOKIE_NAME);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object') return parsed as UTMs;
  } catch {
    /* valor corrupto: ignorar */
  }
  return {};
}

/**
 * Recupera UTMs guardados (o {} si no hay). No-op en server.
 *
 * Prioridad: cookie cross-subdominio → localStorage (fallback). La cookie gana
 * porque es la unica que viaja entre subdominios (checkout ↔ app).
 */
export function getUTMs(): UTMs {
  if (typeof window === 'undefined') return {};

  const fromCookie = readUTMsFromCookie();
  if (Object.keys(fromCookie).length > 0) return fromCookie;

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
 * cart attributes) y, opcionalmente:
 *  - `extra`: params planos extra (ej. `{ src: 'quiz_v3' }`).
 *  - `cartAttributes`: pares que se emiten en DOBLE forma (plano +
 *    `attributes[k]=v`) para que Shopify los persista en `note_attributes` de
 *    la orden y el webhook los lea de forma confiable (ej. `{ ab_entry: 'A' }`).
 * Usa el separador correcto (`?` o `&`) según la URL.
 */
export function withCheckoutAttribution(
  url: string,
  extra?: Record<string, string>,
  cartAttributes?: Record<string, string>,
): string {
  const parts: string[] = [];
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }
  if (cartAttributes) {
    for (const [k, v] of Object.entries(cartAttributes)) {
      if (!v) continue;
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      parts.push(`attributes[${encodeURIComponent(k)}]=${encodeURIComponent(v)}`);
    }
  }
  const attribution = buildCheckoutAttribution();
  if (attribution) parts.push(attribution);
  if (parts.length === 0) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${parts.join('&')}`;
}


// ─── Checkout de Hotmart (funnel /latam) ───────────────────────────────────

/**
 * Construye un link de checkout de Hotmart con los parámetros de tracking a
 * partir de los UTMs (+fbclid) guardados en localStorage.
 *
 * Hotmart usa DOS parámetros nativos de tracking que viajan hasta el reporte
 * de ventas y el webhook de compra:
 *  - `src`: fuente "corta" de la venta. Lo mapeamos así:
 *      1. `extra.src` si viene explícito (ej. 'quiz_latam'),
 *      2. si no, el `utm_source` guardado,
 *      3. si tampoco hay, se omite.
 *  - `sck`: cadena compacta de atribución para poder reconstruir la campaña
 *    completa desde Hotmart. Se arma como
 *    `utm_source|utm_medium|utm_campaign|utm_content|fbclid` (segmentos vacíos
 *    cuando falta el dato) y se URL-encodea como UN solo valor. Si no hay
 *    NINGÚN UTM guardado, se omite `sck`.
 *
 * Además, igual que el helper de Shopify, se agregan los UTMs crudos como
 * query plano (`utm_source=...`, etc.) para que queden visibles/logueables.
 * Cualquier otro par de `extra` (excepto `src`, que se maneja arriba) se
 * agrega como query plano.
 *
 * IMPORTANTE: NO se pasa ningún parámetro de email ni PII. El funnel /latam
 * NO captura email (la PWA tiene registro abierto); el comprador ingresa su
 * email directamente en el checkout de Hotmart.
 *
 * Usa el separador correcto (`?` o `&`) según la URL. Si `url` es '', devuelve
 * '' (el caller maneja el caso "config pendiente").
 */
export function withHotmartCheckout(url: string, extra?: Record<string, string>): string {
  if (!url) return '';

  const utms = getUTMs();
  const parts: string[] = [];

  // src: extra.src → utm_source → (omitir)
  const src = extra?.src || utms.utm_source;
  if (src) parts.push(`src=${encodeURIComponent(src)}`);

  // sck: cadena compacta utm_source|utm_medium|utm_campaign|utm_content|fbclid
  const hasUtms = Object.values(utms).some((v) => !!v);
  if (hasUtms) {
    const sck = [
      utms.utm_source ?? '',
      utms.utm_medium ?? '',
      utms.utm_campaign ?? '',
      utms.utm_content ?? '',
      utms.fbclid ?? '',
    ].join('|');
    parts.push(`sck=${encodeURIComponent(sck)}`);
  }

  // UTMs crudos como query plano (visibles/logueables)
  for (const [k, v] of Object.entries(utms)) {
    if (v) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  }

  // Resto de extra como query plano (src ya manejado arriba)
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (k === 'src') continue;
      if (v) parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    }
  }

  if (parts.length === 0) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${parts.join('&')}`;
}

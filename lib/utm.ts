/**
 * Normalización de UTMs — fuente única de verdad para limpiar y agrupar.
 *
 * Problema que resuelve:
 *  - El mismo `utm_campaign` llega a veces URL-encoded ("UGC+AD+3+%2F+TEST"),
 *    a veces decodificado ("UGC AD 3 / TEST"), con espacios de más o distinto
 *    casing. Sin normalizar, cada variante se guarda/agrupa como una fila
 *    distinta → la misma campaña aparece "duplicada" en /admin.
 *  - El `utm_source` muchas veces NO viene en la URL del anuncio (solo viene
 *    campaign) → caía en "(directo)". Si hay `fbclid`, sabemos que el click
 *    vino de Meta, así que inferimos source="facebook".
 *
 * Estrategia:
 *  - `cleanUtmValue`  → valor "lindo" para mostrar (decodificado + sin espacios
 *                       de más, preserva el casing original).
 *  - `utmKey`         → clave canónica para agrupar/matchear (lowercase).
 *  - `inferUtmSource` → source con fallback a "facebook" si hay fbclid.
 */

/** Marcador para tráfico sin atribución (sin utm_source ni fbclid). */
export const DIRECT_LABEL = '(directo)';

/**
 * Limpia un valor de UTM para mostrarlo:
 *  - decodifica `%XX` y `+` (espacios codificados típicos de query strings)
 *  - colapsa espacios múltiples y recorta los extremos
 *  - preserva el casing original (las campañas suelen tener mayúsculas a propósito)
 *
 * Devuelve '' si el valor está vacío/ausente.
 */
export function cleanUtmValue(raw: string | null | undefined): string {
  if (raw == null) return '';
  let v = String(raw);
  // Muchos sistemas codifican el espacio como '+'. decodeURIComponent no lo hace,
  // así que lo reemplazamos antes de decodificar el resto.
  try {
    v = decodeURIComponent(v.replace(/\+/g, ' '));
  } catch {
    // Valor con `%` inválido → seguimos con el raw (solo limpiamos '+').
    v = v.replace(/\+/g, ' ');
  }
  return v.replace(/\s+/g, ' ').trim();
}

/**
 * Clave canónica (lowercase) para agrupar/comparar UTMs de forma robusta.
 * "UGC AD 3 / TEST" y "ugc+ad+3+%2f+test" colapsan a la misma clave.
 */
export function utmKey(raw: string | null | undefined): string {
  return cleanUtmValue(raw).toLowerCase();
}

/**
 * Devuelve el utm_source limpio. Si no hay source pero sí `fbclid`, infiere
 * "facebook" (el click vino de Meta). Devuelve '' si no hay nada.
 */
export function inferUtmSource(utms?: Record<string, string> | null): string {
  const src = cleanUtmValue(utms?.utm_source);
  if (src) return src;
  if (cleanUtmValue(utms?.fbclid)) return 'facebook';
  return '';
}

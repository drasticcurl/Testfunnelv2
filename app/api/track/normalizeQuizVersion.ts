/**
 * Version_Normalizer del Tracking_Endpoint (`POST /api/track`).
 *
 * Vive en un módulo aparte de `route.ts` porque Next.js no permite exports
 * que no sean handlers de ruta (GET/POST/…) en los archivos `route.ts`. Así
 * se puede importar y testear de forma aislada.
 *
 * Normaliza la etiqueta de versión que llega del cliente o de callers
 * server-side a una etiqueta limpia de escritura:
 *  - 'latam' → 'latam'
 *  - 'ar', 'v3' (legacy Argentina), undefined o cualquier otro valor → 'ar'
 *
 * Nunca devuelve 'v1'/'v2'/'v3' para escrituras nuevas: el resultado siempre
 * pertenece al conjunto {'ar','latam'}. Esto arregla el bug por el que LATAM
 * (que manda 'latam') terminaba guardándose como 'v1'.
 */
export function normalizeQuizVersion(raw: unknown): 'ar' | 'latam' {
  return raw === 'latam' ? 'latam' : 'ar';
}

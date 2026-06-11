/**
 * @file constants.ts — Constantes transversales de la app (single source of truth).
 *
 * Acá viven los identificadores internos que se usan en más de un lugar del
 * código (claves de localStorage, nombres de eventos internos, etc). El objetivo
 * es que cambiar uno de estos valores se haga en UN solo lugar y se propague a
 * todo el proyecto, sin tener que buscar strings sueltos por los componentes.
 *
 * IMPORTANTE — valores "legacy":
 * Algunas claves conservan su string histórico (ej: 'anti-hinchazon-utms')
 * a propósito: son claves de localStorage que ya están persistidas en los
 * navegadores de usuarios reales. Si cambiamos el VALOR del string, esos datos
 * quedan huérfanos. Por eso centralizamos el identificador (el NOMBRE de la
 * constante es genérico) pero mantenemos el valor para no romper sesiones
 * existentes. Renombrar el valor es seguro sólo si asumimos perder ese estado.
 *
 * Lo que NO va acá (es externo, no se toca):
 *  - Nombres de eventos / content_name / content_category de Meta (tracking)
 *  - Nombres de columnas / tablas de Supabase
 *  - Campos de webhooks de Hotmart
 *  - Nombres de variables de entorno
 */

/**
 * Claves de localStorage usadas por el funnel y la PWA.
 * Genéricas a nivel de identificador; el valor se mantiene por compatibilidad.
 */
export const STORAGE_KEYS = {
  /** Estado persistido del quiz (Zustand persist). */
  quizState: 'agua-arroz-quiz-v3',
  /** UTMs + fbclid capturados en la landing (primer visit). */
  utm: 'anti-hinchazon-utms',
  /** País detectado o forzado por la ruta SEO (ej: /chile → 'CL'). */
  country: 'chau-hinchazon-country',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

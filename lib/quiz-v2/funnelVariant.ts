/**
 * funnelVariant.ts — Test FULL-FUNNEL A/B SOLO para Argentina.
 *
 * Compara el funnel ACTUAL (Funnel A / control) contra una variante totalmente
 * rebrandeada (Funnel B / "mujer"): mismo quiz (mismas preguntas y lógica), pero
 * branding rosa/femenino + una sales page v2 optimizada a conversión para el
 * público argentino. Mide qué FUNNEL ENTERO convierte mejor, de punta a punta
 * (inicio del quiz → compra).
 *
 * Espejo del patrón `abEntry.ts`: módulo aislado, aditivo, con su PROPIO
 * vocabulario de eventos (`af_<V>_<step>`) que viajan por la misma cañería de
 * contadores agregados del funnel store (sin tocar el schema). El admin parsea
 * estos eventos para armar la comparación A vs B.
 *
 * MEDICIÓN (sin tocar el schema de Supabase): emitimos EVENTOS DEDICADOS por
 * variante y paso. El funnel store ya guarda 1 contador por `event_name` (+ día
 * + campaña), así que estos eventos viajan por la misma cañería:
 *
 *   af_<V>_quiz_start      → llegó a la 1ª pregunta real (denominador del test)
 *   af_<V>_quiz_complete   → llegó al slide de la sales page (completó el quiz)
 *   af_<V>_salespage_view  → la sales page se renderizó/vio
 *   af_<V>_checkout        → clickeó el CTA de compra
 *   af_<V>_purchase        → compra confirmada (atribuida server-side)
 *
 * donde <V> ∈ { A, B }.
 *
 * KILL SWITCH: `NEXT_PUBLIC_AB_FUNNEL_ENABLED`. El experimento está activo SOLO
 * cuando su valor es exactamente `'true'`. Con el flag OFF, TODO el tráfico de
 * Argentina ve Funnel A y el sistema se comporta EXACTAMENTE como hoy (cero
 * cambios de comportamiento). LATAM NUNCA participa.
 *
 * La variante se asigna 1 vez por navegador (≈50% cada una), se persiste en
 * localStorage (`ab_funnel_v1`) para que sea estable durante todo el funnel, y
 * se puede forzar con `?af=A|B` en la URL (QA / previews, solo con el flag ON).
 *
 * QA PREVIEW (flag-independiente): `?af_preview=A|B` permite previsualizar
 * Funnel B (o A) AUNQUE el experimento esté OFF (sin tocar la env var), para
 * verificación manual. Solo aplica a AR (en LATAM se ignora), NO persiste en
 * `ab_funnel_v1` y NO dispara eventos `af_*` (el guard del flag se mantiene).
 * Es un mecanismo SEPARADO del override experimental `?af=`.
 */

import type { EntryVariant } from './abEntry';

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export type FunnelVariant = 'A' | 'B';

export type FunnelStep =
  | 'quiz_start'      // reached the first real question (denominator for the test)
  | 'quiz_complete'   // reached the sales-page slide
  | 'salespage_view'  // sales page actually rendered/viewed
  | 'checkout'        // clicked the buy CTA
  | 'purchase';       // confirmed sale (attributed server-side)

/** Etiquetas legibles para la tabla de comparación del admin. */
export const FUNNEL_VARIANT_LABEL: Record<FunnelVariant, string> = {
  A: 'Control (actual)',
  B: 'Rebrand (mujer)',
};

/**
 * Default de PRODUCCIÓN del test A/B/C de entrada (`ab_entry`). Mientras el
 * experimento full-funnel está ON, la randomización de `ab_entry` se PAUSA y se
 * fija a este valor (ver QuizContainerV2), de modo que la única variable
 * experimental sea Funnel A vs B. 'B' = "Hook actual" (la variante de control
 * activa de `ab_entry`).
 */
export const AB_ENTRY_PINNED_DEFAULT: EntryVariant = 'B';

const STORAGE_KEY = 'ab_funnel_v1';

function isFunnelVariant(v: unknown): v is FunnelVariant {
  return v === 'A' || v === 'B';
}

// ─── Kill switch ──────────────────────────────────────────────────────────────

/** `true` solo cuando NEXT_PUBLIC_AB_FUNNEL_ENABLED === 'true' (kill switch). */
export function isFunnelExperimentEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED === 'true';
}

// ─── Storage inyectable (para testear el core puro) ───────────────────────────

/**
 * Superficie mínima de almacenamiento que necesita el core puro. Permite
 * inyectar un storage en memoria en los tests (y envolver `localStorage` con
 * try/catch en el wrapper SSR-safe).
 */
export interface VariantStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

// ─── Core PURO de asignación (unidad bajo test de las propiedades) ────────────

/**
 * Núcleo PURO de asignación de variante full-funnel. La aleatoriedad (`rand`) y
 * el almacenamiento (`storage`) se INYECTAN, así que esta función es
 * determinista bajo entradas controladas → es la unidad que testean las
 * propiedades P1–P10.
 *
 * Contrato (en orden de precedencia):
 *  1. flag OFF                  → siempre 'A', NO persiste, NO randomiza.
 *  2. version !== 'ar' (LATAM)  → siempre 'A', NO persiste.
 *  3. override ∈ {A,B}          → fuerza + persiste ese valor (QA `?af=`).
 *  4. valor ya asignado         → lo devuelve estable, sin sobrescribir.
 *  5. visitante nuevo           → 50/50 con `rand()`, persiste el resultado.
 *
 * Nunca lanza (el wrapper envuelve el storage real en try/catch).
 */
export function assignFunnelVariant(
  rand: () => number,
  storage: VariantStorage,
  flag: boolean,
  version: 'ar' | 'latam',
  override: FunnelVariant | null,
): FunnelVariant {
  // 1) Kill switch OFF → Funnel A para todos, sin persistir ni randomizar.
  if (!flag) return 'A';

  // 2) LATAM nunca participa.
  if (version !== 'ar') return 'A';

  // 3) Override de QA (?af=A|B) → fuerza + persiste.
  if (isFunnelVariant(override)) {
    storage.set(STORAGE_KEY, override);
    return override;
  }

  // 4) Variante ya asignada → estable, no se sobrescribe.
  const existing = storage.get(STORAGE_KEY);
  if (isFunnelVariant(existing)) return existing;

  // 5) Visitante nuevo: 50/50.
  const assigned: FunnelVariant = rand() < 0.5 ? 'A' : 'B';
  storage.set(STORAGE_KEY, assigned);
  return assigned;
}

// ─── Wrappers SSR-safe (leen window / localStorage / Math.random) ─────────────

/** Lee el override `?af=A|B` de la querystring (o null). SSR-safe. */
function readQuerystringOverride(): FunnelVariant | null {
  try {
    const q = new URLSearchParams(window.location.search).get('af');
    if (!q) return null;
    const up = q.toUpperCase();
    return up === 'A' || up === 'B' ? (up as FunnelVariant) : null;
  } catch {
    return null;
  }
}

/**
 * Lee el override de PREVIEW de QA `?af_preview=A|B` de la querystring (o null),
 * case-insensitive. SSR-safe (guarda `typeof window`).
 *
 * IMPORTANTE: `af_preview` es un mecanismo de QA SEPARADO e INDEPENDIENTE del
 * kill switch y del override experimental `?af=`. Permite previsualizar Funnel
 * B (o A) AUNQUE el experimento esté OFF (sin tocar la env var), para verificar
 * manualmente el funnel de punta a punta. NO persiste en `ab_funnel_v1` (para no
 * contaminar/mistaggear sesiones normales posteriores en el mismo navegador de
 * QA) y NO dispara eventos `af_*` (porque `fireFunnelEvent` sigue gateado por el
 * flag). Solo aplica a AR; en LATAM se IGNORA.
 */
export function readPreviewOverride(): FunnelVariant | null {
  if (typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search).get('af_preview');
    if (!q) return null;
    const up = q.toUpperCase();
    return up === 'A' || up === 'B' ? (up as FunnelVariant) : null;
  } catch {
    return null;
  }
}

/**
 * Storage seguro sobre `localStorage`, con fallback en memoria si el acceso
 * lanza (modo incógnito estricto). En ese caso la variante no persiste entre
 * recargas, pero la asignación del mount actual sigue funcionando (ver P/Error
 * Handling Scenario 1 del diseño).
 */
function makeSafeStorage(): VariantStorage {
  return {
    get(key: string): string | null {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string): void {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* localStorage bloqueado: fallback en memoria (no persiste) */
      }
    },
  };
}

/**
 * Devuelve la variante full-funnel asignada a este navegador, asignándola 50/50
 * si hace falta. SSR-safe: en el server devuelve 'A' y NO persiste. Para evitar
 * mismatch de hidratación, llamala SOLO dentro de un `useEffect` en el cliente.
 *
 * Contrato:
 *  - flag OFF              → siempre 'A' (sin persistir, sin randomizar)
 *  - quizVersion !== 'ar'  → siempre 'A' (LATAM nunca asignado)
 *  - ?af=A|B               → fuerza + persiste esa variante (QA)
 */
export function getFunnelVariant(quizVersion: 'ar' | 'latam'): FunnelVariant {
  // SSR-safe default.
  if (typeof window === 'undefined') return 'A';

  // QA PREVIEW (?af_preview=A|B): mecanismo SEPARADO e INDEPENDIENTE del flag.
  // Solo para AR. Si hay un valor válido, devolvemos esa variante ANTES del
  // chequeo del kill switch, para poder previsualizar Funnel B (o A) con el
  // experimento OFF. NO persiste en `ab_funnel_v1` (evita mistaggear sesiones
  // normales posteriores). En LATAM se IGNORA (la preview no aplica nunca).
  if (quizVersion === 'ar') {
    const preview = readPreviewOverride();
    if (preview) return preview;
  }

  return assignFunnelVariant(
    Math.random,
    makeSafeStorage(),
    isFunnelExperimentEnabled(),
    quizVersion,
    readQuerystringOverride(),
  );
}

/**
 * Lee la variante YA asignada para este navegador, o `null` si todavía no se
 * asignó. A diferencia de `getFunnelVariant`, NO asigna una variante nueva —
 * sirve para los pasos POSTERIORES del funnel (sales page / checkout / helpers
 * del webhook) sin contaminar el reparto con asignaciones tardías. SSR-safe.
 */
export function peekFunnelVariant(): FunnelVariant | null {
  if (typeof window === 'undefined') return null;
  // QA PREVIEW: si hay un `?af_preview=A|B` válido (AR), devolvemos esa variante
  // ANTES de leer localStorage, para que los pasos POSTERIORES del funnel (sales
  // page SlideSalesPageV3B, cart-attribute del checkout y body de submit-quiz)
  // sean consistentes con la variante previsualizada durante toda la sesión.
  // No persiste nada. En el AR single-page flow (QuizContainerV2) la querystring
  // de entrada se mantiene en window.location.search toda la sesión.
  const preview = readPreviewOverride();
  if (preview) return preview;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    return isFunnelVariant(existing) ? existing : null;
  } catch {
    return null;
  }
}

// ─── Nombres de eventos del test ──────────────────────────────────────────────

const PREFIX = 'af_';

const FUNNEL_STEPS: FunnelStep[] = [
  'quiz_start',
  'quiz_complete',
  'salespage_view',
  'checkout',
  'purchase',
];

/** Nombre del evento de funnel para una variante + paso, ej: `af_B_checkout`. */
export function funnelEventName(variant: FunnelVariant, step: FunnelStep): string {
  return `${PREFIX}${variant}_${step}`;
}

/** `true` si el nombre de evento es un evento interno del test full-funnel (af_*). */
export function isFunnelVariantEvent(eventName: string): boolean {
  return typeof eventName === 'string' && eventName.startsWith(PREFIX);
}

/**
 * Parsea `af_<V>_<step>` → { variant, step }, o `null` si no matchea (usado por
 * el funnel store en el server). El prefijo `af_` es deliberadamente distinto
 * de `ab_entry_` y `sp_`, así que estos eventos nunca colisionan en el
 * keyspace de contadores ni en los parsers.
 */
export function parseFunnelVariantEvent(
  eventName: string,
): { variant: FunnelVariant; step: FunnelStep } | null {
  if (!isFunnelVariantEvent(eventName)) return null;
  const rest = eventName.slice(PREFIX.length); // "<V>_<step>"
  const sep = rest.indexOf('_');
  if (sep <= 0) return null;
  const v = rest.slice(0, sep);
  const step = rest.slice(sep + 1);
  if (!isFunnelVariant(v)) return null;
  if (!FUNNEL_STEPS.includes(step as FunnelStep)) return null;
  return { variant: v, step: step as FunnelStep };
}

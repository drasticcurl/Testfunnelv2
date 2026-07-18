/**
 * abEntry.ts — Test A/B/C de la PANTALLA DE ENTRADA del quiz (slide 0).
 *
 * Tres variantes de "cómo arranca" el funnel, para medir cuántos INICIAN el
 * quiz (llegan a la primera pregunta) y cuántos lo COMPLETAN (llegan a la
 * sales page), según la entrada:
 *
 *   A · 'direct' → sin hook: redirige directo a la primera pregunta (edad).
 *   B · 'hook'   → el hook actual completo (SlideLandingHook).
 *   C · 'lite'   → hook adelgazado: headline + 1 subtítulo + CTA único + trust.
 *
 * MEDICIÓN (sin tocar el schema de Supabase):
 * en vez de agregar una dimensión `variant` a `funnel_counts`, emitimos
 * EVENTOS DEDICADOS por variante. El funnel store ya guarda 1 contador por
 * `event_name` (+ día + campaña), así que estos eventos viajan por la misma
 * cañería y se parsean en el dashboard. Eventos:
 *
 *   ab_entry_<V>_landing   → vio la pantalla de entrada      (denominador)
 *   ab_entry_<V>_start     → llegó a la 1ª pregunta (inició) (numerador start)
 *   ab_entry_<V>_complete  → llegó a la sales page (completó)
 *   ab_entry_<V>_checkout  → clickeó "comprar" en la sales page
 *   ab_entry_<V>_purchase  → compró (atribuido server-side desde el webhook)
 *
 * donde <V> ∈ { A, B, C }.
 *
 * La variante se asigna 1 vez por navegador (≈33% cada una), se persiste en
 * localStorage para que sea estable durante todo el funnel, y se puede forzar
 * con `?ab=A|B|C` en la URL (útil para QA / previews).
 */

export type EntryVariant = 'A' | 'B' | 'C';

/** Etiquetas legibles para el dashboard. */
export const ENTRY_VARIANT_LABEL: Record<EntryVariant, string> = {
  A: 'Directo (sin hook)',
  B: 'Hook actual',
  C: 'Hook liviano',
};

const STORAGE_KEY = 'ab_entry_v1';

function isVariant(v: unknown): v is EntryVariant {
  return v === 'A' || v === 'B' || v === 'C';
}

/**
 * Variante A ('Directo / sin hook') DESCARTADA: dio el peor % de venta
 * (vanity metric — 100% de inicio pero peor cierre). El test sigue entre
 * B (hook actual) y C (hook liviano) para juntar más datos.
 *
 * Se mantiene 'A' en el tipo / labels / parseo de eventos para no romper la
 * data HISTÓRICA del dashboard, pero ya no se asigna a tráfico nuevo.
 */
export const ENTRY_DISCARDED_VARIANTS: EntryVariant[] = ['A'];
const ASSIGNABLE: EntryVariant[] = ['B', 'C'];

/**
 * Devuelve la variante asignada a este navegador, asignándola si hace falta.
 * SSR-safe: en el server devuelve 'B' (no persiste). Para evitar mismatch de
 * hidratación, llamala SOLO dentro de un `useEffect` en el cliente.
 */
export function getEntryVariant(): EntryVariant {
  if (typeof window === 'undefined') return 'B';

  // 1) Override por querystring (?ab=A|B|C) — para QA. Persiste el override.
  try {
    const q = new URLSearchParams(window.location.search).get('ab');
    if (q && isVariant(q.toUpperCase())) {
      const forced = q.toUpperCase() as EntryVariant;
      window.localStorage.setItem(STORAGE_KEY, forced);
      return forced;
    }
  } catch {
    /* noop */
  }

  // 2) Variante ya asignada — solo si sigue ACTIVA (B o C). Si quedó guardada
  //    'A' (descartada) de antes, la reasignamos a una variante activa.
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing === 'B' || existing === 'C') return existing;
  } catch {
    /* localStorage bloqueado (modo incógnito estricto): seguimos al random */
  }

  // 3) Asignación nueva ≈ 1/2 entre las variantes activas (B y C).
  const assigned = ASSIGNABLE[Math.floor(Math.random() * ASSIGNABLE.length)] ?? 'B';
  try {
    window.localStorage.setItem(STORAGE_KEY, assigned);
  } catch {
    /* noop */
  }
  return assigned;
}

/**
 * Devuelve la variante YA asignada para este navegador, o `null` si todavía
 * no se asignó. A diferencia de `getEntryVariant`, NO asigna una variante
 * nueva — sirve para leer la variante en pasos POSTERIORES del funnel (ej.
 * la sales page / checkout) sin contaminar el reparto con asignaciones tardías.
 * SSR-safe.
 */
export function peekEntryVariant(): EntryVariant | null {
  if (typeof window === 'undefined') return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    return isVariant(existing) ? existing : null;
  } catch {
    return null;
  }
}

// ─── Nombres de eventos del test ─────────────────────────────────────────────

export type EntryStep = 'landing' | 'start' | 'complete' | 'checkout' | 'purchase';

const PREFIX = 'ab_entry_';

const ENTRY_STEPS: EntryStep[] = ['landing', 'start', 'complete', 'checkout', 'purchase'];

/** Nombre del evento de funnel para una variante + paso. */
export function abEntryEventName(variant: EntryVariant, step: EntryStep): string {
  return `${PREFIX}${variant}_${step}`;
}

/** `true` si el nombre de evento es un evento interno del test A/B/C de entrada. */
export function isAbEntryEvent(eventName: string): boolean {
  return typeof eventName === 'string' && eventName.startsWith(PREFIX);
}

/**
 * Parsea un nombre de evento `ab_entry_<V>_<step>` → { variant, step }.
 * Devuelve `null` si no matchea (usado por el funnel store en el server).
 */
export function parseAbEntryEvent(
  eventName: string,
): { variant: EntryVariant; step: EntryStep } | null {
  if (!isAbEntryEvent(eventName)) return null;
  const rest = eventName.slice(PREFIX.length); // "<V>_<step>"
  const sep = rest.indexOf('_');
  if (sep <= 0) return null;
  const v = rest.slice(0, sep);
  const step = rest.slice(sep + 1);
  if (!isVariant(v)) return null;
  if (!ENTRY_STEPS.includes(step as EntryStep)) return null;
  return { variant: v, step: step as EntryStep };
}

/**
 * Motion helpers: the list-entrance stagger scheduler and the motion-token
 * table.
 *
 * `computeStagger` centralizes the stagger rules so every screen that animates a
 * list (dashboard cards, recetas list, guias list, lista-compras, plan) feeds
 * `framer-motion`'s `transition.delay` from one place instead of hard-coded
 * values:
 *  - the inter-item delay is a single consistent value clamped to [40, 80] ms
 *    (default 60 ms, the `stagger-step` token);
 *  - delays are non-decreasing and the last item's delay never exceeds the
 *    800 ms cap (the `stagger-cap` token) — beyond the cap, delays flatten so
 *    no item starts later than the cap;
 *  - under reduced motion the schedule short-circuits to all-zero delays so
 *    content appears in its final state without staggered transition.
 *
 * The motion-token table mirrors the duration/easing tokens and tags each entry
 * as an entrance/transition animation (bounded at 600 ms) or an essential
 * state-communicating animation (retained under reduced motion, bounded at
 * 200 ms).
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

/** Lower bound of the allowed inter-item stagger delay (ms). */
export const STAGGER_MIN_MS = 40;
/** Upper bound of the allowed inter-item stagger delay (ms). */
export const STAGGER_MAX_MS = 80;
/** Default inter-item stagger delay (`stagger-step` token, ms). */
export const DEFAULT_STAGGER_STEP_MS = 60;
/** Cumulative stagger cap (`stagger-cap` token, ms). */
export const DEFAULT_STAGGER_CAP_MS = 800;

/** Upper bound for any entrance/transition animation (Requirement 10.6). */
export const MAX_ENTRANCE_TRANSITION_MS = 600;
/** Upper bound for an essential animation retained under reduced motion (10.5). */
export const MAX_ESSENTIAL_MS = 200;

/** Clamp a value to the inclusive [min, max] range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Returns an array of entrance delays (ms), one per item.
 *
 * - The inter-item delay equals `baseDelayMs` clamped to [40, 80] ms.
 * - Delays are non-decreasing; each is `min(i * step, capMs)` so once the
 *   cumulative delay reaches the cap, later items all start at the cap and the
 *   last item's delay never exceeds `capMs`.
 * - When `reducedMotion` is true, every delay is 0 (final state, no stagger).
 *
 * @param count items to schedule
 * @param baseDelayMs requested inter-item delay (clamped to [40, 80], default 60)
 * @param capMs cumulative cap for the last item's delay (default 800)
 * @param reducedMotion when true, short-circuit to zero delays
 */
export function computeStagger(
  count: number,
  baseDelayMs: number = DEFAULT_STAGGER_STEP_MS,
  capMs: number = DEFAULT_STAGGER_CAP_MS,
  reducedMotion: boolean = false,
): number[] {
  const n = Math.max(0, Math.floor(count));
  if (n === 0) return [];
  if (reducedMotion) return new Array(n).fill(0);

  const step = clamp(baseDelayMs, STAGGER_MIN_MS, STAGGER_MAX_MS);

  return Array.from({ length: n }, (_, i) => Math.min(i * step, capMs));
}

/** Role of a motion token entry. */
export type MotionRole = 'entrance' | 'transition' | 'essential';

export interface MotionTokenEntry {
  /** Token name. */
  name: string;
  /** Animation duration in milliseconds. */
  durationMs: number;
  /** Whether this is an entrance/transition effect or an essential one. */
  role: MotionRole;
}

/**
 * The motion-token table. Entrance/transition entries complete within 600 ms;
 * essential entries (those retained under reduced motion because they
 * communicate system state) complete within 200 ms.
 */
export const MOTION_TOKENS: MotionTokenEntry[] = [
  // Entrance / transition animations (non-essential; disabled under reduced motion).
  { name: 'fade-entrance', durationMs: 300, role: 'entrance' },
  { name: 'slide-entrance', durationMs: 500, role: 'entrance' },
  { name: 'view-transition', durationMs: 300, role: 'transition' },
  { name: 'expand-collapse', durationMs: 300, role: 'transition' },
  // Essential animations (retained under reduced motion; communicate state).
  { name: 'press-feedback', durationMs: 150, role: 'essential' },
  { name: 'focus-ring', durationMs: 150, role: 'essential' },
  { name: 'status-pulse', durationMs: 200, role: 'essential' },
];

/** Whether a motion role is an entrance/transition (non-essential) effect. */
export function isEntranceOrTransition(role: MotionRole): boolean {
  return role === 'entrance' || role === 'transition';
}

/**
 * Breakpoint classifier.
 *
 * `resolveBreakpoint` maps any viewport width to exactly one named band. The
 * bands are standardized on the Tailwind default thresholds (640 / 768 / 1024
 * px). The mapping is total (defined for every width) and monotonic: a smaller
 * width never maps to a larger band.
 *
 * Requirements: 8.2, 8.4
 */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg';

/** The Tailwind-default min-width thresholds (px) that open each band. */
export const BREAKPOINT_THRESHOLDS = {
  sm: 640,
  md: 768,
  lg: 1024,
} as const;

/** Bands in ascending order, smallest to largest. */
export const BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg'];

/**
 * Map a viewport width (CSS px) to exactly one breakpoint band:
 *  - `xs`  : width < 640  (single-column mobile, Requirement 8.2)
 *  - `sm`  : 640 <= width < 768
 *  - `md`  : 768 <= width < 1024
 *  - `lg`  : width >= 1024
 *
 * Thresholds are inclusive of their lower bound, matching Tailwind's
 * `min-width` media queries.
 */
export function resolveBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINT_THRESHOLDS.lg) return 'lg';
  if (width >= BREAKPOINT_THRESHOLDS.md) return 'md';
  if (width >= BREAKPOINT_THRESHOLDS.sm) return 'sm';
  return 'xs';
}

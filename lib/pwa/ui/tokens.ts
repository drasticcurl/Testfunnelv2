/**
 * Token registry — single TypeScript mirror of the canonical Design_System
 * tokens declared in `app/globals.css` (`:root`) and exposed by
 * `tailwind.config.ts`.
 *
 * This module exists purely so tests and dev-time guards can assert structural
 * facts about the token system:
 *  - every required category is present and non-empty (Requirement 1.1)
 *  - every legacy token name resolves to its canonical terracotta/warm value
 *    so the current palette always wins (Requirements 1.3, 1.6)
 *
 * The values here MUST stay byte-identical to the CSS/Tailwind source. They are
 * not consumed at render time (components use the CSS variables / Tailwind
 * utilities directly); this is a verification surface only.
 *
 * Requirements: 1.1, 1.3, 1.5, 1.6
 */

/** Canonical color tokens (hex), mirroring `globals.css :root` + tailwind config. */
export const colorTokens = {
  terracotta: '#C0553A',
  'terracotta-soft': '#FFF5F0',
  'terracotta-dark': '#8B3A24',
  'terracotta-light': '#D4785C',
  warm: '#FFFAF7',
  'warm-border': '#F0E8E4',
  charcoal: '#1F2433',
  muted: '#5A6072',
  'muted-light': '#9BA3B8',
  success: '#43A047',
  warning: '#F59E0B',
  error: '#E53935',
} as const;

/** Canonical font family stacks. */
export const fontTokens = {
  heading: "'DM Serif Display', 'Georgia', serif",
  body: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
} as const;

/** Canonical spacing steps (rem). */
export const spacingTokens = {
  'space-1': '0.25rem',
  'space-2': '0.5rem',
  'space-3': '0.75rem',
  'space-4': '1rem',
  'space-6': '1.5rem',
  'space-8': '2rem',
  'space-12': '3rem',
  'space-16': '4rem',
  'space-24': '6rem',
} as const;

/** Canonical border-radius tokens. */
export const radiusTokens = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  full: '999px',
} as const;

/** Canonical shadow tokens. */
export const shadowTokens = {
  sm: '0 1px 2px rgba(192, 85, 58, 0.04)',
  md: '0 4px 12px rgba(192, 85, 58, 0.10)',
  lg: '0 8px 24px rgba(192, 85, 58, 0.14)',
  xl: '0 20px 40px rgba(192, 85, 58, 0.18)',
  cta: '0 4px 20px rgba(192, 85, 58, 0.35)',
} as const;

/** Canonical motion tokens — durations, stagger params, and easings. */
export const motionTokens = {
  'duration-fast': '150ms',
  'duration-base': '300ms',
  'duration-slow': '500ms',
  'stagger-step': '60ms',
  'stagger-cap': '800ms',
  'ease-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'ease-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
} as const;

/**
 * The single token registry, grouped by the six required categories
 * (color, font, spacing, radius, shadow, motion).
 */
export const tokenRegistry = {
  color: colorTokens,
  font: fontTokens,
  spacing: spacingTokens,
  radius: radiusTokens,
  shadow: shadowTokens,
  motion: motionTokens,
} as const;

/** The six required token categories. */
export const TOKEN_CATEGORIES = [
  'color',
  'font',
  'spacing',
  'radius',
  'shadow',
  'motion',
] as const;

export type TokenCategory = (typeof TOKEN_CATEGORIES)[number];
export type ColorTokenName = keyof typeof colorTokens;
export type LegacyColorName =
  | 'sage'
  | 'sage-dark'
  | 'sage-soft'
  | 'coral'
  | 'coral-soft'
  | 'cream'
  | 'cream-warm'
  | 'sand';

/**
 * Legacy color token name → canonical color token name. Each legacy name
 * resolves to a current terracotta/warm token so both names produce an
 * identical visual result and the current palette always takes precedence
 * over the legacy sage/cream/coral/sand palette (Requirements 1.3, 1.6).
 */
export const legacyAlias: Record<LegacyColorName, ColorTokenName> = {
  sage: 'terracotta',
  'sage-dark': 'terracotta-dark',
  'sage-soft': 'terracotta-soft',
  coral: 'terracotta-light',
  'coral-soft': 'terracotta-soft',
  cream: 'warm',
  'cream-warm': 'warm-border',
  sand: 'warm-border',
} as const;

/**
 * Resolve a legacy color token name to its canonical hex value.
 * Returns the exact hex of the canonical token the legacy name aliases.
 */
export function resolveLegacyColor(name: LegacyColorName): string {
  return colorTokens[legacyAlias[name]];
}

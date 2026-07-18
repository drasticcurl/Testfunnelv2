/**
 * Contrast math helpers (WCAG 2.1) plus the approved foreground/background
 * token-pair set with their required roles.
 *
 * `contrastRatio` implements the WCAG 2.1 relative-luminance contrast formula
 * and always returns a value in the closed range [1, 21]. `meetsContrast`
 * compares a pair against a role threshold.
 *
 * The approved pairs document which token combinations the PWA is allowed to
 * use as text/interactive surfaces, and the minimum ratio each must satisfy.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.5, 3.6
 */

import { colorTokens, type ColorTokenName } from './tokens';

export type ContrastLevel = 'AA-normal' | 'AA-large' | 'UI';

/** Threshold ratios per role. */
export const CONTRAST_THRESHOLDS: Record<ContrastLevel, number> = {
  'AA-normal': 4.5,
  'AA-large': 3.0,
  UI: 3.0,
};

/** Parse a `#rgb` or `#rrggbb` hex string into [r, g, b] in the 0..255 range. */
function parseHex(hex: string): [number, number, number] {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

/** Convert an 8-bit sRGB channel to its linear-light value. */
function channelToLinear(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG 2.1 relative luminance of an sRGB hex color. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  const rl = channelToLinear(r);
  const gl = channelToLinear(g);
  const bl = channelToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/**
 * WCAG 2.1 contrast ratio between a foreground and a background color.
 * Returns a value in [1, 21]. The ratio is symmetric in its arguments.
 */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Whether a foreground/background pair meets the threshold for `level`. */
export function meetsContrast(fg: string, bg: string, level: ContrastLevel): boolean {
  return contrastRatio(fg, bg) >= CONTRAST_THRESHOLDS[level];
}

export interface ApprovedPair {
  /** Foreground (text/icon/boundary) color token. */
  fg: ColorTokenName;
  /** Background color token. */
  bg: ColorTokenName;
  /** The contrast role this pairing must satisfy. */
  role: ContrastLevel;
  /** Human-readable description of where this pairing is used. */
  usage: string;
}

/**
 * The approved foreground/background token pairings. Every pair satisfies its
 * role threshold under `contrastRatio` (verified by Property 4). Status colors
 * used as text are paired so they meet the large-text 3:1 minimum or are placed
 * on a background where dark text reaches 4.5:1.
 */
export const APPROVED_PAIRS: ApprovedPair[] = [
  { fg: 'charcoal', bg: 'warm', role: 'AA-normal', usage: 'Body text on app background' },
  {
    fg: 'charcoal',
    bg: 'terracotta-soft',
    role: 'AA-normal',
    usage: 'Body text inside soft terracotta surfaces',
  },
  { fg: 'muted', bg: 'warm', role: 'AA-normal', usage: 'Secondary/caption text on app background' },
  {
    fg: 'white' as ColorTokenName,
    bg: 'terracotta',
    role: 'AA-normal',
    usage: 'Primary button label',
  },
  {
    fg: 'white' as ColorTokenName,
    bg: 'terracotta-dark',
    role: 'AA-normal',
    usage: 'Primary button label (pressed/dark)',
  },
  {
    fg: 'terracotta',
    bg: 'warm',
    role: 'UI',
    usage: 'Interactive text / boundary on app background',
  },
  {
    fg: 'terracotta',
    bg: 'terracotta-soft',
    role: 'UI',
    usage: 'Interactive text / boundary on soft terracotta surfaces',
  },
  { fg: 'charcoal', bg: 'warning', role: 'AA-normal', usage: 'Warning badge label' },
  { fg: 'white' as ColorTokenName, bg: 'error', role: 'UI', usage: 'Error badge / banner label' },
  { fg: 'white' as ColorTokenName, bg: 'success', role: 'UI', usage: 'Success badge / banner label' },
  { fg: 'error', bg: 'warm', role: 'AA-large', usage: 'Error status text (large)' },
  { fg: 'success', bg: 'warm', role: 'AA-large', usage: 'Success status text (large)' },
];

/** Resolve a color token name (or literal `white`/`black`) to its hex value. */
export function resolveColor(name: ColorTokenName | 'white' | 'black'): string {
  if (name === 'white') return '#FFFFFF';
  if (name === 'black') return '#000000';
  return colorTokens[name as ColorTokenName];
}

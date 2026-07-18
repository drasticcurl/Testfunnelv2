/**
 * Typographic scale — the four named levels of the Design_System, mirroring the
 * scale documented in `design.md`.
 *
 * Each level specifies a distinct font size / weight / line-height and a font
 * family (`heading` or `body`). Sizes decrease monotonically in scale order
 * (pageTitle → sectionHeading → body → caption), and the body level is at least
 * 16 CSS pixels.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

export type ScaleLevel = 'pageTitle' | 'sectionHeading' | 'body' | 'caption';

export interface ScaleEntry {
  /** Font size in CSS pixels. */
  fontSizePx: number;
  /** Numeric font weight. */
  fontWeight: number;
  /** Unitless line-height multiplier. */
  lineHeight: number;
  /** Which canonical font family this level uses. */
  family: 'heading' | 'body';
}

export const typographyScale: Record<ScaleLevel, ScaleEntry> = {
  pageTitle: { fontSizePx: 30, fontWeight: 600, lineHeight: 1.15, family: 'heading' },
  sectionHeading: { fontSizePx: 20, fontWeight: 600, lineHeight: 1.3, family: 'heading' },
  body: { fontSizePx: 16, fontWeight: 400, lineHeight: 1.6, family: 'body' },
  caption: { fontSizePx: 13, fontWeight: 500, lineHeight: 1.4, family: 'body' },
};

/**
 * The canonical ordering of scale levels, from largest to smallest. Font sizes
 * strictly decrease along this order.
 */
export const SCALE_ORDER: ScaleLevel[] = [
  'pageTitle',
  'sectionHeading',
  'body',
  'caption',
];

/** Minimum body font size required by Requirement 2.2 (CSS pixels). */
export const MIN_BODY_FONT_SIZE_PX = 16;

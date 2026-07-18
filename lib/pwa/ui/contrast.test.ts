import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  contrastRatio,
  meetsContrast,
  CONTRAST_THRESHOLDS,
  APPROVED_PAIRS,
  resolveColor,
} from './contrast';

/**
 * Feature: pwa-visual-improvements — contrast math + approved token pairs.
 */

/** Arbitrary 6-digit hex color string. */
const hexColor = fc
  .integer({ min: 0, max: 0xffffff })
  .map((n) => `#${n.toString(16).padStart(6, '0')}`);

describe('contrastRatio math and approved pairs', () => {
  // Feature: pwa-visual-improvements, Property 4: Approved token color pairs meet their contrast threshold
  // Validates: Requirements 3.1, 3.2, 3.3, 3.6, 5.4, 11.2
  it('Property 4: every approved token pair meets its role threshold', () => {
    fc.assert(
      fc.property(fc.constantFrom(...APPROVED_PAIRS), (pair) => {
        const fg = resolveColor(pair.fg as never);
        const bg = resolveColor(pair.bg as never);
        const ratio = contrastRatio(fg, bg);
        expect(ratio).toBeGreaterThanOrEqual(CONTRAST_THRESHOLDS[pair.role]);
        expect(meetsContrast(fg, bg, pair.role)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // Feature: pwa-visual-improvements, Property 4: Approved token color pairs meet their contrast threshold
  // Validates: Requirements 3.1, 3.2, 3.3, 3.6, 5.4, 11.2
  it('Property 4 (math): contrastRatio is symmetric and bounded within [1, 21]', () => {
    fc.assert(
      fc.property(hexColor, hexColor, (a, b) => {
        const r1 = contrastRatio(a, b);
        const r2 = contrastRatio(b, a);
        // Symmetry: order of fg/bg does not change the ratio.
        expect(r1).toBeCloseTo(r2, 10);
        // Bounds: WCAG ratios are always within [1, 21].
        expect(r1).toBeGreaterThanOrEqual(1);
        expect(r1).toBeLessThanOrEqual(21);
      }),
      { numRuns: 100 },
    );
  });

  it('identical colors yield a ratio of exactly 1', () => {
    fc.assert(
      fc.property(hexColor, (c) => {
        expect(contrastRatio(c, c)).toBeCloseTo(1, 10);
      }),
      { numRuns: 100 },
    );
  });

  it('black on white yields the maximum ratio of 21', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 6);
  });
});

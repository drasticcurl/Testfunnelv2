import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  typographyScale,
  SCALE_ORDER,
  MIN_BODY_FONT_SIZE_PX,
} from './typography';

/**
 * Feature: pwa-visual-improvements — typographic scale pure module.
 */

describe('typographyScale monotonicity and body minimum', () => {
  // Adjacent-pair indices in SCALE_ORDER: [0,1], [1,2], [2,3].
  const adjacentPairs = SCALE_ORDER.slice(0, -1).map((_, i) => i);

  // Feature: pwa-visual-improvements, Property 3: Typographic scale is monotonic and body meets the minimum size
  // Validates: Requirements 2.2, 2.3
  it('Property 3: sizes strictly decrease across adjacent levels and body >= 16px', () => {
    fc.assert(
      fc.property(fc.constantFrom(...adjacentPairs), (i) => {
        const larger = typographyScale[SCALE_ORDER[i]];
        const smaller = typographyScale[SCALE_ORDER[i + 1]];
        // Strictly monotonic decrease in font size along scale order.
        expect(larger.fontSizePx).toBeGreaterThan(smaller.fontSizePx);
        // Body level always meets the 16px minimum.
        expect(typographyScale.body.fontSizePx).toBeGreaterThanOrEqual(
          MIN_BODY_FONT_SIZE_PX,
        );
      }),
      { numRuns: 100 },
    );
  });

  it('defines all four levels with distinct size/weight/line-height triples', () => {
    expect(SCALE_ORDER).toEqual(['pageTitle', 'sectionHeading', 'body', 'caption']);
    const triples = SCALE_ORDER.map((level) => {
      const e = typographyScale[level];
      return `${e.fontSizePx}-${e.fontWeight}-${e.lineHeight}`;
    });
    expect(new Set(triples).size).toBe(SCALE_ORDER.length);
  });
});

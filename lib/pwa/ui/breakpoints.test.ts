import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  resolveBreakpoint,
  BREAKPOINT_ORDER,
  BREAKPOINT_THRESHOLDS,
  type Breakpoint,
} from './breakpoints';

/**
 * Feature: pwa-visual-improvements — breakpoint classifier pure module.
 */

const rank = (b: Breakpoint) => BREAKPOINT_ORDER.indexOf(b);

describe('resolveBreakpoint', () => {
  // Feature: pwa-visual-improvements, Property 7: Breakpoint classification is total and consistent
  // Validates: Requirements 8.4
  it('Property 7: returns exactly one valid band and is monotonic over [320, 1920]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 1920 }),
        fc.integer({ min: 320, max: 1920 }),
        (w1, w2) => {
          const b1 = resolveBreakpoint(w1);
          const b2 = resolveBreakpoint(w2);

          // Totality: always one of the four named bands.
          expect(BREAKPOINT_ORDER).toContain(b1);
          expect(BREAKPOINT_ORDER).toContain(b2);

          // Monotonicity: a smaller (or equal) width never yields a larger band.
          const [small, big] = w1 <= w2 ? [b1, b2] : [b2, b1];
          expect(rank(small)).toBeLessThanOrEqual(rank(big));
        },
      ),
      { numRuns: 100 },
    );
  });

  it('maps the threshold boundaries consistently (inclusive lower bound)', () => {
    expect(resolveBreakpoint(BREAKPOINT_THRESHOLDS.sm - 1)).toBe('xs');
    expect(resolveBreakpoint(BREAKPOINT_THRESHOLDS.sm)).toBe('sm');
    expect(resolveBreakpoint(BREAKPOINT_THRESHOLDS.md - 1)).toBe('sm');
    expect(resolveBreakpoint(BREAKPOINT_THRESHOLDS.md)).toBe('md');
    expect(resolveBreakpoint(BREAKPOINT_THRESHOLDS.lg - 1)).toBe('md');
    expect(resolveBreakpoint(BREAKPOINT_THRESHOLDS.lg)).toBe('lg');
  });

  it('classifies representative device widths', () => {
    expect(resolveBreakpoint(320)).toBe('xs');
    expect(resolveBreakpoint(375)).toBe('xs');
    expect(resolveBreakpoint(700)).toBe('sm');
    expect(resolveBreakpoint(800)).toBe('md');
    expect(resolveBreakpoint(1920)).toBe('lg');
  });
});

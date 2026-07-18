import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  computeStagger,
  MOTION_TOKENS,
  isEntranceOrTransition,
  STAGGER_MIN_MS,
  STAGGER_MAX_MS,
  DEFAULT_STAGGER_CAP_MS,
  MAX_ENTRANCE_TRANSITION_MS,
  MAX_ESSENTIAL_MS,
} from './motion';

/**
 * Feature: pwa-visual-improvements — motion stagger scheduler + token table.
 */

describe('computeStagger', () => {
  // Feature: pwa-visual-improvements, Property 8: List entrance stagger stays within band and within the cap
  // Validates: Requirements 10.2, 10.3
  it('Property 8: non-decreasing, uniform pre-cap step in [40,80], capped at 800', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 200 }),
        fc.integer({ min: 20, max: 120 }),
        (count, base) => {
          const delays = computeStagger(count, base);

          expect(delays).toHaveLength(Math.max(0, count));

          const expectedStep = Math.min(
            STAGGER_MAX_MS,
            Math.max(STAGGER_MIN_MS, base),
          );

          for (let i = 0; i < delays.length; i++) {
            // Cap: no delay ever exceeds 800 ms.
            expect(delays[i]).toBeLessThanOrEqual(DEFAULT_STAGGER_CAP_MS);
            // Non-negative.
            expect(delays[i]).toBeGreaterThanOrEqual(0);
            if (i > 0) {
              const diff = delays[i] - delays[i - 1];
              // Monotonic non-decreasing.
              expect(diff).toBeGreaterThanOrEqual(0);
              // Pre-cap inter-item difference is the single consistent step
              // (in the 40-80 band); at/after the cap the diff flattens to 0.
              if (delays[i] < DEFAULT_STAGGER_CAP_MS) {
                expect(diff).toBe(expectedStep);
                expect(expectedStep).toBeGreaterThanOrEqual(STAGGER_MIN_MS);
                expect(expectedStep).toBeLessThanOrEqual(STAGGER_MAX_MS);
              }
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('first item has zero delay and uses default step of 60ms', () => {
    const delays = computeStagger(3);
    expect(delays).toEqual([0, 60, 120]);
  });

  it('flattens at the cap for large counts so the last delay never exceeds 800', () => {
    const delays = computeStagger(50, 80);
    expect(Math.max(...delays)).toBeLessThanOrEqual(DEFAULT_STAGGER_CAP_MS);
    expect(delays[delays.length - 1]).toBe(DEFAULT_STAGGER_CAP_MS);
  });

  it('short-circuits to all-zero delays under reduced motion', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (count) => {
        const delays = computeStagger(count, 60, 800, true);
        expect(delays).toHaveLength(Math.max(0, count));
        expect(delays.every((d) => d === 0)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

describe('motion token table bounds', () => {
  // Feature: pwa-visual-improvements, Property 9: Motion durations respect their upper bounds
  // Validates: Requirements 10.5, 10.6
  it('Property 9: entrance/transition <= 600ms; essential <= 200ms', () => {
    fc.assert(
      fc.property(fc.constantFrom(...MOTION_TOKENS), (token) => {
        if (isEntranceOrTransition(token.role)) {
          expect(token.durationMs).toBeLessThanOrEqual(MAX_ENTRANCE_TRANSITION_MS);
        } else {
          // Essential animations retained under reduced motion.
          expect(token.durationMs).toBeLessThanOrEqual(MAX_ESSENTIAL_MS);
        }
        expect(token.durationMs).toBeGreaterThan(0);
      }),
      { numRuns: 100 },
    );
  });

  it('contains both entrance/transition and essential entries', () => {
    expect(MOTION_TOKENS.some((t) => isEntranceOrTransition(t.role))).toBe(true);
    expect(MOTION_TOKENS.some((t) => t.role === 'essential')).toBe(true);
  });
});

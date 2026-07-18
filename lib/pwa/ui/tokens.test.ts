import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  tokenRegistry,
  TOKEN_CATEGORIES,
  legacyAlias,
  colorTokens,
  resolveLegacyColor,
  type LegacyColorName,
} from './tokens';

/**
 * Feature: pwa-visual-improvements — token registry pure module.
 *
 * Property-based tests for the single token source of truth. The registry is a
 * TypeScript mirror of the canonical tokens declared in `app/globals.css` and
 * `tailwind.config.ts`.
 */

describe('tokenRegistry completeness', () => {
  // Feature: pwa-visual-improvements, Property 1: Token registry is complete across all six categories
  // Validates: Requirements 1.1
  it('Property 1: every required category exists and has at least one named token', () => {
    fc.assert(
      fc.property(fc.constantFrom(...TOKEN_CATEGORIES), (category) => {
        expect(tokenRegistry).toHaveProperty(category);
        const entries = tokenRegistry[category];
        expect(entries).toBeTypeOf('object');
        expect(Object.keys(entries).length).toBeGreaterThanOrEqual(1);
        // Every token in the category must have a non-empty value.
        for (const value of Object.values(entries)) {
          expect(typeof value).toBe('string');
          expect((value as string).length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });

  it('covers exactly the six required categories', () => {
    expect(new Set(Object.keys(tokenRegistry))).toEqual(new Set(TOKEN_CATEGORIES));
    expect(TOKEN_CATEGORIES).toHaveLength(6);
  });
});

describe('legacyAlias resolution', () => {
  const LEGACY_NAMES = Object.keys(legacyAlias) as LegacyColorName[];

  // Feature: pwa-visual-improvements, Property 2: Every legacy token resolves to the current terracotta/warm value
  // Validates: Requirements 1.3, 1.6
  it('Property 2: every legacy token resolves to the hex of its canonical current token', () => {
    fc.assert(
      fc.property(fc.constantFrom(...LEGACY_NAMES), (legacyName) => {
        const canonicalName = legacyAlias[legacyName];
        const canonicalHex = colorTokens[canonicalName];
        // Resolution yields exactly the canonical token's hex value.
        expect(resolveLegacyColor(legacyName)).toBe(canonicalHex);
        // The canonical target belongs to the current terracotta/warm palette.
        expect(canonicalName).toMatch(/^(terracotta|warm)/);
      }),
      { numRuns: 100 },
    );
  });
});

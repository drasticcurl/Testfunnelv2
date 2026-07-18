import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { normalizeQuizVersion } from './normalizeQuizVersion';

describe('normalizeQuizVersion', () => {
  // ── Task 2.3 — unit tests de tabla ────────────────────────────────────────
  // _Requirements: 1.1, 1.2, 1.3, 1.4_
  describe('tabla de casos', () => {
    const cases: Array<[unknown, 'ar' | 'latam']> = [
      ['latam', 'latam'],
      ['ar', 'ar'],
      ['v3', 'ar'],
      ['v1', 'ar'],
      ['v2', 'ar'],
      [undefined, 'ar'],
      ['xyz', 'ar'],
    ];
    for (const [input, expected] of cases) {
      it(`${JSON.stringify(input)} → '${expected}'`, () => {
        expect(normalizeQuizVersion(input)).toBe(expected);
      });
    }
  });

  // ── Task 2.2 — Property 1: No más fuga a v1 ───────────────────────────────
  // **Validates: Requirements 1.5, 1.6**
  describe('Property 1: No más fuga a v1', () => {
    it('∀ string s: el resultado ∈ {ar, latam} y nunca v1/v2/v3; s===latam ⇔ latam', () => {
      fc.assert(
        fc.property(fc.string(), (s) => {
          const result = normalizeQuizVersion(s);
          // Siempre dentro del conjunto válido.
          expect(['ar', 'latam']).toContain(result);
          // Nunca una etiqueta legacy.
          expect(['v1', 'v2', 'v3']).not.toContain(result as string);
          // Equivalencia: 'latam' ⇔ resultado 'latam'.
          if (s === 'latam') expect(result).toBe('latam');
          else expect(result).toBe('ar');
        }),
      );
    });

    it('vale también para inputs arbitrarios (no-string)', () => {
      fc.assert(
        fc.property(fc.anything(), (v) => {
          const result = normalizeQuizVersion(v);
          expect(['ar', 'latam']).toContain(result);
          expect(['v1', 'v2', 'v3']).not.toContain(result as string);
        }),
      );
    });
  });
});

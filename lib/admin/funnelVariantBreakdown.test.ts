import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildFunnelVariantBreakdown } from './store';
import { funnelEventName, type FunnelVariant, type FunnelStep } from '@/lib/quiz-v2/funnelVariant';

const VARIANTS: FunnelVariant[] = ['A', 'B'];
const STEPS: FunnelStep[] = ['quiz_start', 'quiz_complete', 'salespage_view', 'checkout', 'purchase'];

const STEP_TO_FIELD: Record<FunnelStep, keyof ReturnType<typeof buildFunnelVariantBreakdown>[number]> = {
  quiz_start: 'quizStarts',
  quiz_complete: 'quizCompletes',
  salespage_view: 'salesViews',
  checkout: 'checkouts',
  purchase: 'purchases',
};

describe('buildFunnelVariantBreakdown', () => {
  it('input vacío ⇒ [] (Req 15.4)', () => {
    expect(buildFunnelVariantBreakdown([])).toEqual([]);
  });

  it('sin eventos af_* ⇒ [] (la sección del admin se oculta)', () => {
    const rows = [
      { event_name: 'QuizProgress', count: 5 },
      { event_name: 'ab_entry_B_start', count: 3 },
      { event_name: 'sp_A_checkout', count: 2 },
    ];
    expect(buildFunnelVariantBreakdown(rows)).toEqual([]);
  });

  // ── Task 8.2 — Property 8: seguridad y monotonicidad del breakdown ─────────
  // **Validates: Requirements 15.1, 15.2, 15.3, 15.4**
  it('Property 8: rates ∈ [0,100], sin NaN/Inf, counts = sumas por (variant,step), vacío ⇒ []', () => {
    // Generador de filas af_* (con ruido de eventos ajenos que deben ignorarse).
    const afRow = fc.record({
      variant: fc.constantFrom<FunnelVariant>(...VARIANTS),
      step: fc.constantFrom<FunnelStep>(...STEPS),
      count: fc.nat({ max: 10000 }),
    });
    const noiseRow = fc.record({
      event_name: fc.constantFrom('QuizProgress', 'ViewContent', 'ab_entry_A_landing', 'sp_B_purchase', 'Purchase'),
      count: fc.nat({ max: 10000 }),
    });

    fc.assert(
      fc.property(
        fc.array(afRow, { maxLength: 60 }),
        fc.array(noiseRow, { maxLength: 20 }),
        (afRows, noiseRows) => {
          const rows = [
            ...afRows.map((r) => ({ event_name: funnelEventName(r.variant, r.step), count: r.count })),
            ...noiseRows,
          ];

          // Suma esperada por (variant, step), ignorando el ruido.
          const expected: Record<FunnelVariant, Record<FunnelStep, number>> = {
            A: { quiz_start: 0, quiz_complete: 0, salespage_view: 0, checkout: 0, purchase: 0 },
            B: { quiz_start: 0, quiz_complete: 0, salespage_view: 0, checkout: 0, purchase: 0 },
          };
          for (const r of afRows) expected[r.variant][r.step] += r.count;

          const result = buildFunnelVariantBreakdown(rows);

          const anyAf = afRows.length > 0;
          if (!anyAf) {
            expect(result).toEqual([]);
            return;
          }

          // Una fila por variante (A y B).
          expect(result.map((r) => r.variant).sort()).toEqual(['A', 'B']);

          for (const row of result) {
            // Counts = sumas por (variant, step).
            for (const step of STEPS) {
              expect(row[STEP_TO_FIELD[step]]).toBe(expected[row.variant][step]);
            }
            // Todas las tasas finitas y en [0,100].
            for (const rate of [
              row.completionRate,
              row.salesViewRate,
              row.checkoutRate,
              row.purchaseRate,
              row.totalConversionRate,
            ]) {
              expect(Number.isFinite(rate)).toBe(true);
              expect(rate).toBeGreaterThanOrEqual(0);
              expect(rate).toBeLessThanOrEqual(100);
            }
          }
        },
      ),
      { numRuns: 300 },
    );
  });

  it('denominador 0 ⇒ rate 0 (nunca NaN/Infinity)', () => {
    // Solo compras, sin starts/completes/views/checkouts.
    const rows = [{ event_name: 'af_A_purchase', count: 7 }];
    const [a] = buildFunnelVariantBreakdown(rows);
    expect(a.completionRate).toBe(0);
    expect(a.salesViewRate).toBe(0);
    expect(a.checkoutRate).toBe(0);
    expect(a.purchaseRate).toBe(0); // checkouts = 0
    expect(a.totalConversionRate).toBe(0); // quizStarts = 0
  });
});

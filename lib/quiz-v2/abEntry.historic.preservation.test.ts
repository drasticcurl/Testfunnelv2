import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  parseAbEntryEvent,
  abEntryEventName,
  isAbEntryEvent,
  ENTRY_VARIANT_LABEL,
  type EntryVariant,
  type EntryStep,
} from '@/lib/quiz-v2/abEntry';
import { buildVariantBreakdown } from '@/lib/admin/store';

/**
 * Bugfix ab-test-tracking-fix · Task 6 — PRESERVACIÓN (Property 6).
 *
 * La data histórica `ab_entry_A_*` (y B/C) SIGUE parseándose sin romper aunque
 * el test de entrada quede desactivado y la sección del admin se oculte. Se
 * preservan el tipo EntryVariant, ENTRY_VARIANT_LABEL, parseAbEntryEvent,
 * isAbEntryEvent y buildVariantBreakdown.
 *
 * Metodología observation-first: PASA sobre el código SIN corregir (baseline) y
 * debe seguir pasando tras el fix (Change 4 es una guarda de preservación).
 *
 * _Requirements: 3.6_
 */

const VARIANTS: EntryVariant[] = ['A', 'B', 'C'];
const STEPS: EntryStep[] = ['landing', 'start', 'complete', 'checkout', 'purchase'];

describe('Task 6 · Preservación — parseo histórico de ab_entry_*', () => {
  it('parsea los ejemplos concretos históricos (incluida la variante A descartada)', () => {
    expect(parseAbEntryEvent('ab_entry_A_landing')).toEqual({ variant: 'A', step: 'landing' });
    expect(parseAbEntryEvent('ab_entry_B_start')).toEqual({ variant: 'B', step: 'start' });
    expect(parseAbEntryEvent('ab_entry_C_complete')).toEqual({ variant: 'C', step: 'complete' });
  });

  it('conserva ENTRY_VARIANT_LABEL para A/B/C (incluida A)', () => {
    expect(ENTRY_VARIANT_LABEL.A).toBeTruthy();
    expect(ENTRY_VARIANT_LABEL.B).toBeTruthy();
    expect(ENTRY_VARIANT_LABEL.C).toBeTruthy();
  });

  it('Property 6a (PBT): para cualquier ab_entry_{A,B,C}_{step}, parseAbEntryEvent round-trip', () => {
    fc.assert(
      fc.property(fc.constantFrom(...VARIANTS), fc.constantFrom(...STEPS), (variant, step) => {
        const name = abEntryEventName(variant, step);
        expect(isAbEntryEvent(name)).toBe(true);
        expect(parseAbEntryEvent(name)).toEqual({ variant, step });
      }),
    );
  });

  it('Property 6b (PBT): buildVariantBreakdown no lanza sobre data histórica arbitraria y preserva las filas A/B/C', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            variant: fc.constantFrom(...VARIANTS),
            step: fc.constantFrom(...STEPS),
            count: fc.integer({ min: 0, max: 1000 }),
          }),
          { maxLength: 30 },
        ),
        (entries) => {
          const rows = entries.map((e) => ({
            event_name: abEntryEventName(e.variant, e.step),
            count: e.count,
          }));
          // Mezclamos eventos no relacionados para asegurar robustez del parser.
          rows.push({ event_name: 'ViewContent', count: 5 });
          rows.push({ event_name: 'af_A_salespage_view', count: 3 });

          let result: ReturnType<typeof buildVariantBreakdown> = [];
          expect(() => { result = buildVariantBreakdown(rows); }).not.toThrow();

          if (entries.length > 0) {
            // Si hubo al menos un evento ab_entry_*, se devuelven las filas A, B y C.
            const variantsInResult = result.map((r) => r.variant).sort();
            expect(variantsInResult).toEqual(['A', 'B', 'C']);
          }
        },
      ),
    );
  });
});

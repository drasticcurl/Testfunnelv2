import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { chooseRender } from './chooseFunnelRender';
import type { FunnelVariant } from '@/lib/quiz-v2/funnelVariant';

/**
 * Feature: argentina-funnel-ab-test, Property 5: consistencia de render.
 * Para una variante resuelta `v`, chooseRender(v) produce branding y sales page
 * coherentes: B ⇒ {theme:'b', sales:'B'} ; A ⇒ {theme:'none', sales:'A'}.
 * **Validates: Requirements 9.1, 9.2, 9.3**
 */
describe('chooseRender (Property 5: render consistency)', () => {
  it("v==='B' ⇒ {theme:'b', sales:'B'}", () => {
    expect(chooseRender('B')).toEqual({ theme: 'b', sales: 'B' });
  });

  it("v==='A' ⇒ {theme:'none', sales:'A'}", () => {
    expect(chooseRender('A')).toEqual({ theme: 'none', sales: 'A' });
  });

  it('∀ v ∈ {A,B}: branding y sales son coherentes entre sí', () => {
    fc.assert(
      fc.property(fc.constantFrom<FunnelVariant>('A', 'B'), (v) => {
        const plan = chooseRender(v);
        if (v === 'B') {
          expect(plan.theme).toBe('b');
          expect(plan.sales).toBe('B');
        } else {
          expect(plan.theme).toBe('none');
          expect(plan.sales).toBe('A');
        }
        // Consistencia: el tema 'b' ⇔ sales 'B'.
        expect(plan.theme === 'b').toBe(plan.sales === 'B');
      }),
      { numRuns: 100 },
    );
  });
});

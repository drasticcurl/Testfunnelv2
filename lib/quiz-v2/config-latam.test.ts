import { describe, it, expect } from 'vitest';
import { PRICING_LATAM } from './config-latam';

/**
 * Feature: upsell2-latam-vip
 *
 * Reglas de negocio sobre los precios del VIP, verificadas directamente sobre
 * la config (fuente única de verdad LATAM).
 */
describe('PRICING_LATAM — reglas de precio del VIP', () => {
  // ── Task 9 — Property 13: El downsell 2 cuesta menos que el upsell 2 ──────
  // **Validates: Requirements 3.4, 3.5**
  it('Property 13: downsell2.amount < upsell2.amount', () => {
    expect(PRICING_LATAM.downsell2.amount).toBeLessThan(PRICING_LATAM.upsell2.amount);
  });

  it('upsell2.amount > upsell.amount (el VIP es más caro que el upsell 1)', () => {
    expect(PRICING_LATAM.upsell2.amount).toBeGreaterThan(PRICING_LATAM.upsell.amount);
  });

  it('valores esperados de la decisión cerrada (27 / 17, ancla 97)', () => {
    expect(PRICING_LATAM.upsell2.amount).toBe(27.0);
    expect(PRICING_LATAM.downsell2.amount).toBe(17.0);
    expect(PRICING_LATAM.upsell2.displayOriginal).toBe('US$97');
    expect(PRICING_LATAM.downsell2.displayOriginal).toBe('US$97');
  });
});

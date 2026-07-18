import { describe, it, expect } from 'vitest';

import { slidesV3 } from './data';

/**
 * El flujo de AR ya NO captura email: el front volvió a Shopify (la atribución
 * viaja por cart attributes / note_attributes y el Purchase lo dispara el
 * webhook de Shopify), así que el puente fbc/fbp por email dejó de ser necesario.
 */
describe('slidesV3 (AR) — sin captura de email', () => {
  it('no contiene ningún slide con type === "email_capture"', () => {
    expect(slidesV3.filter((s) => s.type === 'email_capture').length).toBe(0);
  });

  it('no contiene ningún slide con id === "email"', () => {
    expect(slidesV3.some((s) => s.id === 'email')).toBe(false);
  });

  it('slidesV3 tiene exactamente 22 slides (índices 0–21)', () => {
    expect(slidesV3.length).toBe(22);
  });

  it('loading_steps va justo después de diagnosis_result', () => {
    const diagIdx = slidesV3.findIndex((s) => s.type === 'diagnosis_result');
    expect(diagIdx).toBeGreaterThanOrEqual(0);
    expect(slidesV3[diagIdx + 1]?.type).toBe('loading_steps');
    expect(slidesV3[diagIdx + 2]?.type).toBe('sales_page');
  });
});

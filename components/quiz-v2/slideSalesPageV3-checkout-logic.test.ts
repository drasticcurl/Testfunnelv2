import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import {
  buildInitiateCheckoutTrackBody,
  runFrontCheckout,
  type FrontCheckoutDeps,
} from './slideSalesPageV3-checkout-logic';
import { PRICING, PRICING_CURRENCY } from '@/lib/quiz-v2/config';

/**
 * Property tests de la lógica del checkout del front AR (salida Shopify).
 *
 * Property: el botón "Pagar" del front AR abre el checkout Shopify.
 * Property: el tracking (fbq InitiateCheckout + postTrack 'ar') se dispara
 *           SIEMPRE antes de la salida.
 */

function makeDeps(overrides: Partial<FrontCheckoutDeps> = {}): {
  deps: FrontCheckoutDeps;
  order: string[];
} {
  const order: string[] = [];
  const deps: FrontCheckoutDeps = {
    fbq: vi.fn((...args: unknown[]) => {
      order.push(`fbq:${String(args[1])}`);
    }),
    meta: { fbc: 'fb.c', fbp: 'fb.p' },
    utms: {},
    variant: null,
    postTrack: vi.fn(() => {
      order.push('postTrack');
    }),
    openShopify: vi.fn(() => {
      order.push('openShopify');
    }),
    ...overrides,
  };
  return { deps, order };
}

describe('buildInitiateCheckoutTrackBody', () => {
  it('arma el body con quiz_version "ar", value/currency del front y fbc/fbp', () => {
    const body = buildInitiateCheckoutTrackBody({ fbc: 'c', fbp: 'p' }, { utm_source: 'ig' }, 'B');
    expect(body.event).toBe('InitiateCheckout');
    expect(body.value).toBe(PRICING.front.amount);
    expect(body.currency).toBe(PRICING_CURRENCY);
    expect(body.fbc).toBe('c');
    expect(body.fbp).toBe('p');
    expect(body.custom.quiz_version).toBe('ar');
    expect(body.custom.utms).toEqual({ utm_source: 'ig' });
    expect(body.custom.ab_variant).toBe('B');
  });
});

describe('runFrontCheckout', () => {
  it('abre el checkout Shopify, con fbq + postTrack ANTES de la salida', () => {
    fc.assert(
      fc.property(
        fc.dictionary(fc.constantFrom('utm_source', 'utm_campaign'), fc.string({ minLength: 1 })),
        (utms) => {
          const { deps, order } = makeDeps({ utms });
          runFrontCheckout(deps);

          expect(deps.fbq).toHaveBeenCalledWith('track', 'InitiateCheckout');
          expect(deps.postTrack).toHaveBeenCalledTimes(1);
          expect(deps.openShopify).toHaveBeenCalledTimes(1);

          // Orden: fbq y postTrack ambos antes de abrir Shopify.
          const openIdx = order.indexOf('openShopify');
          expect(order.indexOf('fbq:InitiateCheckout')).toBeLessThan(openIdx);
          expect(order.indexOf('postTrack')).toBeLessThan(openIdx);

          // El body de track lleva quiz_version 'ar'.
          const body = (deps.postTrack as ReturnType<typeof vi.fn>).mock.calls[0][0];
          expect(body.custom.quiz_version).toBe('ar');
        },
      ),
    );
  });

  it('sin fbq disponible → no rompe y igual hace postTrack + salida', () => {
    const { deps } = makeDeps({ fbq: undefined });
    expect(() => runFrontCheckout(deps)).not.toThrow();
    expect(deps.postTrack).toHaveBeenCalledTimes(1);
    expect(deps.openShopify).toHaveBeenCalledTimes(1);
  });
});

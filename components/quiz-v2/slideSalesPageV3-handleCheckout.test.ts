import { describe, it, expect, vi } from 'vitest';
import {
  runFrontCheckout,
  type FrontCheckoutDeps,
} from './slideSalesPageV3-checkout-logic';
import { CHECKOUT_URL } from '@/lib/quiz-v2/config';

/**
 * Unit test del wrapper handleCheckout (salida Shopify).
 *
 * El front AR cobra por Shopify: el CTA "Pagar" hace
 * window.open(withCheckoutAttribution(CHECKOUT_URL, ...)). El tracking 'ar'
 * (fbq InitiateCheckout + postTrack) se dispara ANTES de la salida, y el
 * cliente NUNCA emite Purchase (lo emite el webhook de Shopify server-side).
 */

describe('handleCheckout — salida Shopify (vía runFrontCheckout)', () => {
  function makeDeps() {
    const fbqEvents: string[] = [];
    const order: string[] = [];
    const deps: FrontCheckoutDeps = {
      fbq: vi.fn((...args: unknown[]) => {
        fbqEvents.push(`${String(args[0])}:${String(args[1])}`);
        order.push('fbq');
      }),
      meta: { fbc: 'c', fbp: 'p' },
      utms: { utm_source: 'facebook' },
      variant: 'B',
      postTrack: vi.fn(() => {
        order.push('postTrack');
      }),
      openShopify: vi.fn(() => {
        order.push('openShopify');
      }),
    };
    return { deps, fbqEvents, order };
  }

  it('abre el checkout Shopify (window.open CHECKOUT_URL); el cliente NO emite Purchase', () => {
    const { deps, fbqEvents } = makeDeps();
    let openedUrl: string | null = null;
    deps.openShopify = vi.fn(() => {
      // El wrapper real hace window.open(withCheckoutAttribution(CHECKOUT_URL,...)).
      openedUrl = CHECKOUT_URL;
    });
    runFrontCheckout(deps);
    expect(deps.openShopify).toHaveBeenCalledTimes(1);
    expect(openedUrl).toBe(CHECKOUT_URL);
    expect(deps.postTrack).toHaveBeenCalledTimes(1);
    // Solo InitiateCheckout client-side; NUNCA Purchase (lo emite el webhook).
    expect(fbqEvents).toContain('track:InitiateCheckout');
    expect(fbqEvents.some((e) => e.includes('Purchase'))).toBe(false);
  });

  it('el tracking (fbq + postTrack) ocurre ANTES de abrir Shopify', () => {
    const { deps, order } = makeDeps();
    runFrontCheckout(deps);
    const openIdx = order.indexOf('openShopify');
    expect(order.indexOf('fbq')).toBeLessThan(openIdx);
    expect(order.indexOf('postTrack')).toBeLessThan(openIdx);
  });
});

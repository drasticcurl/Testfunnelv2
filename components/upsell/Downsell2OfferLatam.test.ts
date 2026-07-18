import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import {
  runDownsell2Accept,
  runDownsell2Skip,
  type VipTrackBody,
} from './upsell2-latam-logic';
import {
  PRICING_LATAM,
  PWA_BASE_URL_LATAM,
} from '@/lib/quiz-v2/config-latam';
import { normalizeQuizVersion } from '@/app/api/track/normalizeQuizVersion';

/**
 * Feature: upsell2-latam-vip — lógica de los CTAs del downsell 2 (mismo VIP,
 * precio menor).
 */

const cookieArb = fc.record({
  fbc: fc.option(fc.string(), { nil: undefined }),
  fbp: fc.option(fc.string(), { nil: undefined }),
});

describe('Downsell2OfferLatam — runDownsell2Accept', () => {
  // ── Task 6.2 — Property 10: InitiateCheckout en USD con precio downsell2 ──
  // **Validates: Requirements 2.3**
  it('Property 10: dispara EXACTAMENTE un InitiateCheckout con value=downsell2.amount y currency USD', () => {
    fc.assert(
      fc.property(cookieArb, (meta) => {
        const fbq = vi.fn();
        runDownsell2Accept({
          fbq,
          meta,
          postTrack: vi.fn(),
          checkoutBaseUrl: 'https://pay.hotmart.com/vip-ds',
          navigate: vi.fn(),
          onMissingCheckout: vi.fn(),
        });
        const initiateCalls = fbq.mock.calls.filter(
          (c) => c[0] === 'track' && c[1] === 'InitiateCheckout',
        );
        expect(initiateCalls).toHaveLength(1);
        const params = initiateCalls[0][2] as { value: number; currency: string };
        expect(params.value).toBe(PRICING_LATAM.downsell2.amount);
        expect(params.currency).toBe('USD');
      }),
      { numRuns: 200 },
    );
  });

  // ── Task 6.3 — Property 11: el CTA registra el funnel como 'latam' ────────
  // **Validates: Requirements 2.4**
  it("Property 11: el body de /api/track incluye quiz_version 'latam'", () => {
    fc.assert(
      fc.property(cookieArb, (meta) => {
        let captured: VipTrackBody | undefined;
        runDownsell2Accept({
          fbq: vi.fn(),
          meta,
          postTrack: (body) => {
            captured = body;
          },
          checkoutBaseUrl: 'https://pay.hotmart.com/vip-ds',
          navigate: vi.fn(),
          onMissingCheckout: vi.fn(),
        });
        expect(captured?.custom.quiz_version).toBe('latam');
        expect(normalizeQuizVersion(captured?.custom.quiz_version)).toBe('latam');
      }),
      { numRuns: 200 },
    );
  });

  it('NO navega y avisa "config pendiente" cuando LATAM_DOWNSELL2_CHECKOUT_URL está vacía', () => {
    const navigate = vi.fn();
    const onMissingCheckout = vi.fn();
    runDownsell2Accept({
      fbq: vi.fn(),
      meta: {},
      postTrack: vi.fn(),
      checkoutBaseUrl: '',
      navigate,
      onMissingCheckout,
    });
    expect(navigate).not.toHaveBeenCalled();
    expect(onMissingCheckout).toHaveBeenCalledTimes(1);
  });

  it('navega al checkout con src=downsell2_latam cuando la URL es no-vacía', () => {
    const navigate = vi.fn();
    runDownsell2Accept({
      fbq: vi.fn(),
      meta: {},
      postTrack: vi.fn(),
      checkoutBaseUrl: 'https://pay.hotmart.com/vip-ds',
      navigate,
      onMissingCheckout: vi.fn(),
    });
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][0]).toContain('src=downsell2_latam');
  });
});

describe('Downsell2OfferLatam — runDownsell2Skip', () => {
  // ── Task 6.4 — Property 12: "No gracias" → PWA (fin del embudo) ───────────
  // **Validates: Requirements 2.6**
  it('Property 12: "No gracias" redirige a PWA_BASE_URL_LATAM', () => {
    const navigate = vi.fn();
    const fbq = vi.fn();
    runDownsell2Skip({ fbq, navigate });
    expect(navigate).toHaveBeenCalledWith(PWA_BASE_URL_LATAM);
    expect(fbq).toHaveBeenCalledWith('trackCustom', 'Downsell2Skip');
  });
});

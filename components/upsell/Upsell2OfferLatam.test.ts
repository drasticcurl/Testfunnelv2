import { describe, it, expect, vi } from 'vitest';
import fc from 'fast-check';
import {
  runUpsell2Accept,
  runUpsell2Skip,
  type VipTrackBody,
} from './upsell2-latam-logic';
import { PRICING_LATAM, PRICING_CURRENCY_LATAM } from '@/lib/quiz-v2/config-latam';
import { normalizeQuizVersion } from '@/app/api/track/normalizeQuizVersion';

/**
 * Feature: upsell2-latam-vip — lógica de los CTAs del upsell 2 (Acceso VIP).
 *
 * Se testea la lógica pura con dependencias inyectadas (sin React/jsdom).
 */

const cookieArb = fc.record({
  fbc: fc.option(fc.string(), { nil: undefined }),
  fbp: fc.option(fc.string(), { nil: undefined }),
});

describe('Upsell2OfferLatam — runUpsell2Accept', () => {
  // ── Task 4.2 — Property 1: el CTA "SÍ" dispara InitiateCheckout en USD ────
  // **Validates: Requirements 1.4**
  it('Property 1: dispara EXACTAMENTE un InitiateCheckout con value=upsell2.amount y currency USD', () => {
    fc.assert(
      fc.property(cookieArb, (meta) => {
        const fbq = vi.fn();
        const postTrack = vi.fn();
        const navigate = vi.fn();
        runUpsell2Accept({
          fbq,
          meta,
          postTrack,
          checkoutBaseUrl: 'https://pay.hotmart.com/vip',
          navigate,
          onMissingCheckout: vi.fn(),
        });

        const initiateCalls = fbq.mock.calls.filter(
          (c) => c[0] === 'track' && c[1] === 'InitiateCheckout',
        );
        expect(initiateCalls).toHaveLength(1);
        const params = initiateCalls[0][2] as { value: number; currency: string };
        expect(params.value).toBe(PRICING_LATAM.upsell2.amount);
        expect(params.currency).toBe('USD');
        expect(PRICING_CURRENCY_LATAM).toBe('USD');
      }),
      { numRuns: 200 },
    );
  });

  // ── Task 4.3 — Property 2: el CTA registra el funnel como 'latam' ─────────
  // **Validates: Requirements 1.5**
  it("Property 2: el body de /api/track incluye quiz_version 'latam' (mapea a 'latam')", () => {
    fc.assert(
      fc.property(cookieArb, (meta) => {
        let captured: VipTrackBody | undefined;
        runUpsell2Accept({
          fbq: vi.fn(),
          meta,
          postTrack: (body) => {
            captured = body;
          },
          checkoutBaseUrl: 'https://pay.hotmart.com/vip',
          navigate: vi.fn(),
          onMissingCheckout: vi.fn(),
        });
        expect(captured?.custom.quiz_version).toBe('latam');
        expect(normalizeQuizVersion(captured?.custom.quiz_version)).toBe('latam');
      }),
      { numRuns: 200 },
    );
  });

  // ── Task 4.4 — Unit tests (P7): redirección, URL vacía, fallo de tracking ─
  // **Validates: Requirements 1.7, 1.8, 1.9**
  it('navega al checkout de Hotmart cuando la URL es no-vacía', () => {
    const navigate = vi.fn();
    runUpsell2Accept({
      fbq: vi.fn(),
      meta: {},
      postTrack: vi.fn(),
      checkoutBaseUrl: 'https://pay.hotmart.com/vip',
      navigate,
      onMissingCheckout: vi.fn(),
    });
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][0]).toContain('https://pay.hotmart.com/vip');
    expect(navigate.mock.calls[0][0]).toContain('src=upsell2_latam');
  });

  it('NO navega y avisa "config pendiente" cuando la URL de checkout está vacía', () => {
    const navigate = vi.fn();
    const onMissingCheckout = vi.fn();
    runUpsell2Accept({
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

  it('completa el redirect aunque el tracking se ejecute (no lo bloquea)', () => {
    const navigate = vi.fn();
    runUpsell2Accept({
      fbq: vi.fn(),
      meta: {},
      // Simula un track que "se dispara y olvida" (fetch con catch): no afecta al redirect.
      postTrack: vi.fn(),
      checkoutBaseUrl: 'https://pay.hotmart.com/vip',
      navigate,
      onMissingCheckout: vi.fn(),
    });
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('no llama a fbq cuando window.fbq no está disponible (no lanza)', () => {
    const navigate = vi.fn();
    expect(() =>
      runUpsell2Accept({
        fbq: undefined,
        meta: {},
        postTrack: vi.fn(),
        checkoutBaseUrl: 'https://pay.hotmart.com/vip',
        navigate,
        onMissingCheckout: vi.fn(),
      }),
    ).not.toThrow();
    expect(navigate).toHaveBeenCalledTimes(1);
  });
});

describe('Upsell2OfferLatam — runUpsell2Skip', () => {
  // ── Task 4.4 — Property 7: "No gracias" → /downsell2-latam ────────────────
  // **Validates: Requirements 1.7**
  it('Property 7: "No gracias" redirige SIEMPRE a /downsell2-latam (nunca a la PWA)', () => {
    const navigate = vi.fn();
    const fbq = vi.fn();
    runUpsell2Skip({ fbq, navigate });
    expect(navigate).toHaveBeenCalledWith('/downsell2-latam');
    expect(fbq).toHaveBeenCalledWith('trackCustom', 'Upsell2Skip');
  });
});

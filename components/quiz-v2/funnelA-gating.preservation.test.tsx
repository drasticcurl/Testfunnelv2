// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import { SlideSalesPageV3 } from './SlideSalesPageV3';

/**
 * Bugfix ab-test-tracking-fix · Task 5 — PRESERVACIÓN (Property 5).
 *
 * Kill switch OFF / LATAM / totales generales / Meta CAPI se preservan:
 *  - Con el experimento OFF (o sin variante full-funnel asignada),
 *    peekFunnelVariant() es null y SlideSalesPageV3 NO emite ningún evento
 *    af_* (ni antes ni después del fix).
 *  - Los eventos genéricos del embudo (ViewContent al montar, InitiateCheckout
 *    al click) se siguen disparando SIEMPRE (totales generales intactos).
 *
 * Metodología observation-first: PASA sobre el código SIN corregir y debe
 * seguir pasando tras el fix.
 *
 * _Requirements: 3.3, 3.4, 3.5_
 */

type TrackBody = { event?: string };

function trackEvents(fetchMock: ReturnType<typeof vi.fn>): TrackBody[] {
  return fetchMock.mock.calls
    .filter(([url]) => url === '/api/track')
    .map(([, init]) => {
      try {
        return JSON.parse((init as RequestInit).body as string) as TrackBody;
      } catch {
        return {} as TrackBody;
      }
    });
}

describe('Task 5 · Preservación — flag OFF / LATAM / totales generales', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let openMock: ReturnType<typeof vi.fn>;
  const originalFlag = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;

  beforeEach(() => {
    vi.useFakeTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    };
    window.localStorage.clear();
    fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;
    openMock = vi.fn();
    window.open = openMock as unknown as typeof window.open;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    else process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = originalFlag;
    window.localStorage.clear();
  });

  it('flag OFF: al montar NO emite af_* pero SÍ emite el ViewContent genérico', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    window.localStorage.clear(); // sin variante asignada → peekFunnelVariant() null
    render(<SlideSalesPageV3 />);
    const events = trackEvents(fetchMock);
    expect(events.some((e) => e.event === 'ViewContent')).toBe(true);
    expect(events.some((e) => (e.event ?? '').startsWith('af_'))).toBe(false);
  });

  it('flag OFF: al click NO emite af_* pero SÍ emite InitiateCheckout genérico', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    window.localStorage.clear();
    const { getAllByRole } = render(<SlideSalesPageV3 />);
    fetchMock.mockClear();

    const buttons = getAllByRole('button').filter((b) => /QUIERO MI PLAN/i.test(b.textContent ?? ''));
    fireEvent.click(buttons[0]);

    const events = trackEvents(fetchMock);
    expect(events.some((e) => e.event === 'InitiateCheckout')).toBe(true);
    expect(events.some((e) => (e.event ?? '').startsWith('af_'))).toBe(false);

    // La salida a Shopify ocurre igual (totales/flujo intactos).
    act(() => { vi.advanceTimersByTime(200); });
    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it('Property 5 (PBT): sin variante full-funnel asignada, NUNCA se emite af_* al montar', () => {
    fc.assert(
      fc.property(fc.boolean(), (flagOn) => {
        // Sin variante persistida ⇒ peekFunnelVariant() === null en cualquier caso.
        window.localStorage.clear();
        if (flagOn) process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
        else delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;

        const fm = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).fetch = fm;

        render(<SlideSalesPageV3 />);
        try {
          const events = trackEvents(fm);
          expect(events.some((e) => e.event === 'ViewContent')).toBe(true);
          expect(events.some((e) => (e.event ?? '').startsWith('af_'))).toBe(false);
        } finally {
          cleanup();
        }
      }),
      { numRuns: 12 },
    );
  });
});

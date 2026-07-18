// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import { SlideSalesPageV3B } from './SlideSalesPageV3B';

/**
 * Bugfix ab-test-tracking-fix · Task 4 — PRESERVACIÓN (Property 4).
 *
 * El Funnel B (SlideSalesPageV3B) queda INALTERADO por el fix: sigue emitiendo
 * af_B_salespage_view (mount) y af_B_checkout (click), y sigue propagando
 * funnel_variant='B' como cart attribute. Metodología observation-first: estos
 * tests PASAN sobre el código SIN corregir (fijan el baseline a conservar) y
 * deben seguir pasando tras el fix (que NO toca V3B).
 *
 * _Requirements: 3.1, 3.2_
 */

type TrackBody = { event?: string; custom?: Record<string, unknown> };

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

describe('Task 4 · Preservación — Funnel B (SlideSalesPageV3B) intacto', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let openMock: ReturnType<typeof vi.fn>;
  const originalFlag = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
  let ioCallbacks: IntersectionObserverCallback[];

  beforeEach(() => {
    vi.useFakeTimers();
    ioCallbacks = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) { ioCallbacks.push(cb); }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    };
    process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
    window.localStorage.clear();
    window.localStorage.setItem('ab_funnel_v1', 'B');
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

  it('dispara af_B_salespage_view al montar con funnel_variant=B', () => {
    render(<SlideSalesPageV3B />);
    const events = trackEvents(fetchMock);
    const spView = events.find((e) => e.event === 'af_B_salespage_view');
    expect(spView).toBeDefined();
    expect(spView?.custom?.funnel_variant).toBe('B');
  });

  it('al click del CTA dispara af_B_checkout y propaga funnel_variant=B como cart attribute', () => {
    const { getAllByRole } = render(<SlideSalesPageV3B />);
    fetchMock.mockClear();

    const buttons = getAllByRole('button').filter((b) => /EMPEZAR/i.test(b.textContent ?? ''));
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);

    const events = trackEvents(fetchMock);
    const checkout = events.find((e) => e.event === 'af_B_checkout');
    expect(checkout).toBeDefined();
    expect(checkout?.custom?.funnel_variant).toBe('B');

    act(() => { vi.advanceTimersByTime(200); });
    expect(openMock).toHaveBeenCalledTimes(1);
    const openedUrl = String(openMock.mock.calls[0][0]);
    expect(openedUrl).toContain('attributes[funnel_variant]=B');
  });

  it('Property 4 (PBT): cualquier montaje de V3B con variante B emite af_B_salespage_view + af_B_checkout', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 3 }), (clicks) => {
        window.localStorage.clear();
        window.localStorage.setItem('ab_funnel_v1', 'B');
        const fm = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).fetch = fm;

        const { getAllByRole } = render(<SlideSalesPageV3B />);
        try {
          expect(trackEvents(fm).some((e) => e.event === 'af_B_salespage_view')).toBe(true);
          const buttons = getAllByRole('button').filter((b) => /EMPEZAR/i.test(b.textContent ?? ''));
          for (let i = 0; i < clicks && i < buttons.length; i++) fireEvent.click(buttons[i]);
          expect(trackEvents(fm).some((e) => e.event === 'af_B_checkout' && e.custom?.funnel_variant === 'B')).toBe(true);
        } finally {
          cleanup();
        }
      }),
      { numRuns: 12 },
    );
  });
});

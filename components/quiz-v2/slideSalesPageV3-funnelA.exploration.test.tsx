// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, cleanup, fireEvent, act } from '@testing-library/react';
import { SlideSalesPageV3 } from './SlideSalesPageV3';

/**
 * Bugfix ab-test-tracking-fix · Tasks 2 y 3 — EXPLORACIÓN (Property 2 y 3).
 *
 * Funnel A (control) DEBE emitir los pasos de venta del embudo full-funnel,
 * igual que el Funnel B (SlideSalesPageV3B):
 *   - af_A_salespage_view al montar,
 *   - af_A_checkout al click del CTA,
 *   - funnel_variant='A' propagado como cart attribute (para atribuir
 *     af_A_purchase por el puente por email / webhook).
 *
 * CRÍTICO: estos tests DEBEN FALLAR sobre el código SIN corregir — la sales
 * page de control usa hoy el vocabulario `ab_entry` (lee peekEntryVariant()),
 * NO lee peekFunnelVariant() ni emite af_A_* ni adjunta funnel_variant.
 *
 * Tras el fix (Change 2) estos tests PASAN.
 *
 * _Requirements: 1.4, 1.5, 1.6 / 2.4, 2.5, 2.6_
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

describe('Tasks 2/3 · Exploración — Funnel A (SlideSalesPageV3) emite los pasos del embudo', () => {
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
    // Experimento full-funnel ON + variante 'A' asignada (control, AR).
    process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
    window.localStorage.clear();
    window.localStorage.setItem('ab_funnel_v1', 'A');
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

  // ── Property 2 — salespage_view + checkout ──────────────────────────────────
  it('dispara af_A_salespage_view al montar (variante A, flag ON)', () => {
    render(<SlideSalesPageV3 />);
    const events = trackEvents(fetchMock);
    expect(events.some((e) => e.event === 'ViewContent')).toBe(true);
    const spView = events.find((e) => e.event === 'af_A_salespage_view');
    expect(spView).toBeDefined();
    expect(spView?.custom?.funnel_variant).toBe('A');
  });

  it('al click del CTA dispara af_A_checkout con funnel_variant=A', () => {
    const { getAllByRole } = render(<SlideSalesPageV3 />);
    fetchMock.mockClear();

    const buttons = getAllByRole('button').filter((b) => /QUIERO MI PLAN/i.test(b.textContent ?? ''));
    expect(buttons.length).toBeGreaterThan(0);
    fireEvent.click(buttons[0]);

    const events = trackEvents(fetchMock);
    expect(events.some((e) => e.event === 'InitiateCheckout')).toBe(true);
    const checkout = events.find((e) => e.event === 'af_A_checkout');
    expect(checkout).toBeDefined();
    expect(checkout?.custom?.funnel_variant).toBe('A');
  });

  // ── Property 3 — propagación de funnel_variant='A' al checkout (atribución) ──
  it('el checkout propaga funnel_variant=A como cart attribute (puente de compra)', () => {
    const { getAllByRole } = render(<SlideSalesPageV3 />);

    const buttons = getAllByRole('button').filter((b) => /QUIERO MI PLAN/i.test(b.textContent ?? ''));
    fireEvent.click(buttons[0]);

    // La salida (window.open con cart attribute) ocurre tras el setTimeout(150).
    act(() => { vi.advanceTimersByTime(200); });
    expect(openMock).toHaveBeenCalledTimes(1);
    const openedUrl = String(openMock.mock.calls[0][0]);
    // Espejo exacto de SlideSalesPageV3B: funnel_variant viaja como cart attribute.
    expect(openedUrl).toContain('funnel_variant=A');
    expect(openedUrl).toContain('attributes[funnel_variant]=A');
    // Ya NO debe propagar el cart attribute del test de entrada (ab_entry).
    expect(openedUrl).not.toContain('ab_entry=A');
  });

  // ── Property 2 (PBT) — para variante A + flag ON, SIEMPRE se emiten af_A_* ──
  it('Property 2 (PBT): para cualquier orden de montaje/click con variante A, se emiten af_A_salespage_view y af_A_checkout', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 3 }), (extraClicks) => {
        window.localStorage.clear();
        window.localStorage.setItem('ab_funnel_v1', 'A');
        const fm = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).fetch = fm;

        const { getAllByRole } = render(<SlideSalesPageV3 />);
        try {
          const mountEvents = trackEvents(fm);
          expect(mountEvents.some((e) => e.event === 'af_A_salespage_view')).toBe(true);

          const buttons = getAllByRole('button').filter((b) => /QUIERO MI PLAN/i.test(b.textContent ?? ''));
          for (let i = 0; i <= extraClicks && i < buttons.length; i++) {
            fireEvent.click(buttons[Math.min(i, buttons.length - 1)]);
          }
          const evs = trackEvents(fm);
          expect(evs.some((e) => e.event === 'af_A_checkout' && e.custom?.funnel_variant === 'A')).toBe(true);
        } finally {
          cleanup();
        }
      }),
      { numRuns: 15 },
    );
  });
});

// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { render, cleanup, act } from '@testing-library/react';
import { QuizContainerV2 } from './QuizContainerV2';
import { FunnelView } from '@/app/admin/funnel/FunnelView';
import { useQuizStore } from '@/lib/quiz-v2/store';
import type { FunnelData } from '@/lib/admin/store';

/**
 * Bugfix ab-test-tracking-fix · Task 1 — EXPLORACIÓN (Property 1: Bug Condition).
 *
 * Entrada fija e incondicional en el hook normal (variante B / SlideLandingHook).
 *
 * CRÍTICO: este test DEBE FALLAR sobre el código SIN corregir — esa falla
 * confirma el bug (la entrada se asigna/randomiza según la variante ab_entry,
 * o se fija condicionalmente, y emite eventos ab_entry_* para tráfico nuevo; y
 * el admin sigue mostrando la sección "Test A/B/C — pantalla de entrada").
 *
 * Tras el fix (Change 1 + Change 3) este mismo test PASA: la entrada renderiza
 * SIEMPRE SlideLandingHook, no se emite ningún ab_entry_*, y la sección de
 * entrada desaparece del dashboard.
 *
 * _Requirements: 1.1, 1.2, 1.3 / 2.1, 2.2, 2.3_
 */

// next/navigation.useSearchParams para poder montar FunnelView en jsdom.
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}));

// Marcadores de texto ÚNICOS de cada variante de entrada.
const HOOK_MARKER = 'No, prefiero seguir igual';   // solo SlideLandingHook (B)
const LITE_MARKER = 'Empezar mi diagnóstico';       // solo SlideLandingHookLite (C)

function trackEvents(fetchMock: ReturnType<typeof vi.fn>): string[] {
  return fetchMock.mock.calls
    .filter(([url]) => url === '/api/track')
    .map(([, init]) => {
      try {
        return (JSON.parse((init as RequestInit).body as string) as { event?: string }).event ?? '';
      } catch {
        return '';
      }
    });
}

/** FunnelData mínima válida con un breakdown de entrada histórico (incluye A). */
function makeFunnelData(): FunnelData {
  return {
    slides: [
      { id: 'landing_hook', count: 100 },
      { id: 'apertura', count: 80 },
    ] as FunnelData['slides'],
    totalLandingViews: 100,
    totalStarts: 80,
    totalCompletes: 40,
    totalCheckoutClicks: 10,
    totalSales: 5,
    filters: {},
    totalEvents: 300,
    generatedAt: Date.now(),
    backend: 'memory',
    utmBreakdown: [],
    countryBreakdown: [],
    variantBreakdown: [
      {
        variant: 'A',
        landings: 50, starts: 50, completes: 20, checkouts: 4, purchases: 2,
        startRate: 100, completionRate: 40, completionVsStart: 40, salesRate: 4, salesVsComplete: 10,
      },
      {
        variant: 'B',
        landings: 329, starts: 300, completes: 120, checkouts: 20, purchases: 12,
        startRate: 91, completionRate: 36, completionVsStart: 40, salesRate: 3.6, salesVsComplete: 10,
      },
      {
        variant: 'C',
        landings: 1, starts: 1, completes: 0, checkouts: 0, purchases: 0,
        startRate: 100, completionRate: 0, completionVsStart: 0, salesRate: 0, salesVsComplete: 0,
      },
    ],
    funnelVariantBreakdown: [],
    day: null,
    availableDays: [],
    dayTrackingActive: true,
  };
}

describe('Task 1 · Exploración — la entrada del quiz de AR es fija en el hook normal (B)', () => {
  const originalFlag = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq = vi.fn();
    window.open = vi.fn() as unknown as typeof window.open;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    else process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = originalFlag;
    act(() => useQuizStore.getState().reset());
    window.localStorage.clear();
  });

  it('Property 1: para cualquier estado previo de ab_entry y del kill switch, la entrada renderiza SlideLandingHook y NO emite ab_entry_*', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'none' | 'A' | 'B' | 'C'>('none', 'A', 'B', 'C'),
        fc.boolean(),
        (storedEntry, flagOn) => {
          // Setup por iteración.
          window.localStorage.clear();
          if (storedEntry !== 'none') window.localStorage.setItem('ab_entry_v1', storedEntry);
          if (flagOn) process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
          else delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;

          const fetchMock = vi.fn(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (globalThis as any).fetch = fetchMock;
          // Random determinista (por si el código sin corregir randomiza ab_entry).
          const rndSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99);

          const { container } = render(<QuizContainerV2 />);

          try {
            // 1) La entrada SIEMPRE es el hook normal (B): su CTA secundario único.
            expect(container.textContent ?? '').toContain(HOOK_MARKER);
            // Nunca renderiza el hook liviano (C).
            expect(container.textContent ?? '').not.toContain(LITE_MARKER);
            // 2) No se emite NINGÚN evento ab_entry_* para tráfico nuevo.
            const events = trackEvents(fetchMock);
            expect(events.some((e) => e.startsWith('ab_entry_'))).toBe(false);
          } finally {
            cleanup();
            rndSpy.mockRestore();
            act(() => useQuizStore.getState().reset());
          }
        },
      ),
      { numRuns: 40 },
    );
  });

  it('Admin: FunnelView NO renderiza la sección "Test A/B/C — pantalla de entrada" aunque haya data histórica', () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, data: makeFunnelData() }) }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    const { container } = render(<FunnelView initialData={makeFunnelData()} />);
    const text = container.textContent ?? '';

    // La sección de entrada (con su título y la fila "Descartada" de la variante A)
    // NO debe mostrarse.
    expect(text).not.toContain('Test A/B/C');
    expect(text).not.toContain('pantalla de entrada');
    expect(text).not.toContain('Descartada');
    // La sección full-funnel A vs B SÍ se conserva (no se rompe el resto del dashboard).
    // (No la forzamos acá porque funnelVariantBreakdown está vacío en la fixture.)
  });
});

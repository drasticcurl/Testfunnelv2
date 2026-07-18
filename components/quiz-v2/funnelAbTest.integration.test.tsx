// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { QuizContainerV2 } from './QuizContainerV2';
import { useQuizStore } from '@/lib/quiz-v2/store';

/**
 * Feature: argentina-funnel-ab-test, Task 13 — guardrails de integración/regresión.
 * Verifica el cableado real del container AR: flag OFF (Funnel A intacto, sin
 * af_*, ab_entry activo) y flag ON (resuelve variante, dispara af_<V>_quiz_start,
 * ab_entry pausado). _Requirements: 3.3, 3.4, 4.1, 4.2, 5.1, 5.2, 12.1_
 */

function trackEventNames(fetchMock: ReturnType<typeof vi.fn>): string[] {
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

describe('Funnel A/B — integración del QuizContainerV2 (AR)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const originalFlag = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
    window.localStorage.clear();
    fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq = vi.fn();
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // fuerza B en el funnel
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    else process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = originalFlag;
    act(() => useQuizStore.getState().reset());
  });

  // ── Task 13.1 — Flag OFF: Funnel A intacto, sin af_* y test de entrada OFF ──
  // Tras el bugfix ab-test-tracking-fix el test A/B/C de entrada quedó
  // DESACTIVADO por completo: ya no se randomiza/asigna ni se persiste
  // ab_entry_v1, ni se emiten eventos ab_entry_* para tráfico nuevo.
  it('flag OFF: no emite af_* ni ab_entry_*, y no persiste ab_funnel_v1 ni ab_entry_v1', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    render(<QuizContainerV2 />);
    act(() => useQuizStore.getState().goTo(1));

    const events = trackEventNames(fetchMock);
    // Ningún evento del test full-funnel.
    expect(events.some((e) => e.startsWith('af_'))).toBe(false);
    // El test de entrada está desactivado: no se emiten eventos ab_entry_* nuevos
    // y no se persiste ninguna variante de entrada.
    expect(events.some((e) => e.startsWith('ab_entry_'))).toBe(false);
    expect(window.localStorage.getItem('ab_entry_v1')).toBeNull();
    // Con el flag OFF NO se persiste la variante de funnel.
    expect(window.localStorage.getItem('ab_funnel_v1')).toBeNull();
  });

  // ── Task 13.2 — Flag ON: resuelve variante, af_<V>_quiz_start, ab_entry pin ─
  it('flag ON: resuelve B, dispara af_B_quiz_start y NO re-randomiza ab_entry', () => {
    process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
    render(<QuizContainerV2 />);
    // Variante de funnel resuelta y persistida (Math.random=0.9 → B).
    expect(window.localStorage.getItem('ab_funnel_v1')).toBe('B');
    // ab_entry pausado: no se escribió una variante nueva (no hay randomización).
    expect(window.localStorage.getItem('ab_entry_v1')).toBeNull();

    // Al llegar a la 1ª pregunta se dispara af_B_quiz_start.
    act(() => useQuizStore.getState().goTo(1));
    const events = trackEventNames(fetchMock);
    expect(events).toContain('af_B_quiz_start');
  });
});

/**
 * Task 13.3 — Aislamiento de LATAM: el container LATAM nunca asigna variante de
 * funnel ni emite eventos af_*, aun con el flag ON. _Requirements: 6.2, 6.3, 6.4_
 */
describe('Funnel A/B — aislamiento de LATAM', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const originalFlag = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
    window.localStorage.clear();
    fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq = vi.fn();
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    else process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = originalFlag;
    act(() => useQuizStore.getState().reset());
  });

  it('flag ON: el mount LATAM no escribe ab_funnel_v1 ni emite af_*', async () => {
    process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
    // Import dinámico para no acoplar el módulo AR al árbol de este describe.
    const { QuizContainerLatam } = await import('./QuizContainerLatam');
    render(<QuizContainerLatam />);
    act(() => useQuizStore.getState().goTo(1));

    const events = trackEventNames(fetchMock);
    expect(events.some((e) => e.startsWith('af_'))).toBe(false);
    expect(window.localStorage.getItem('ab_funnel_v1')).toBeNull();
  });
});

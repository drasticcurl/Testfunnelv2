// @vitest-environment jsdom

/**
 * Task 6.3 — Tests de progreso dinámico del onboarding PWA.
 *
 * Cubre la propiedad de correctitud P6 del diseño relativa al indicador de
 * progreso (dots) de `app/pwa/onboarding/page.tsx`:
 *
 *  - P6 — Los indicadores de progreso son consistentes con el total dinámico:
 *    para todo paso, la cantidad de dots renderizados === `ONBOARDING_STEPS.length`
 *    (= 5) y el aria-label del contenedor === `Paso ${step+1} de 5`
 *    (Req 1.2, 1.3, 1.4).
 *
 * Estrategia: se ejercita el flujo real a través de `OnboardingPage`. El
 * contenedor de los progress dots expone `aria-label={stepLabel}` con el texto
 * derivado dinámicamente; sus hijos directos son los dots (uno por paso).
 * Reutilizamos el patrón de mocks de `page.test.tsx` / `step-install.test.tsx`
 * (next/navigation, use-pwa-user, framer-motion) SIN modificar esos archivos.
 *
 * _Requirements: 1.2, 1.3, 1.4_
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ── Periferia mockeada (mismo patrón que page.test.tsx) ──────────────────────

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/lib/pwa/use-pwa-user', () => ({
  usePwaUser: () => ({
    authenticated: true,
    email: 'ana@example.com',
    nombre: 'Ana',
    testMode: false,
    loading: false,
  }),
}));

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const FRAMER_PROPS = new Set([
    'initial', 'animate', 'exit', 'variants', 'transition', 'custom',
    'whileHover', 'whileTap', 'whileInView', 'layout', 'viewport',
  ]);
  const cache = new Map<string, unknown>();
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!cache.has(tag)) {
          cache.set(
            tag,
            React.forwardRef(function MotionMock(
              { children, ...props }: Record<string, unknown>,
              ref: unknown,
            ) {
              const clean: Record<string, unknown> = {};
              for (const [k, v] of Object.entries(props)) {
                if (!FRAMER_PROPS.has(k)) clean[k] = v;
              }
              return React.createElement(tag, { ref, ...clean }, children as React.ReactNode);
            }),
          );
        }
        return cache.get(tag);
      },
    },
  );
  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

import OnboardingPage from './page';
// El total de pasos es la fuente de verdad del diseño (config declarativa).
// No está exportado, así que lo derivamos del contrato del spec (5 pasos:
// welcome, disclaimer, dietary, tour, install). Ver ONBOARDING_STEPS en page.tsx.
const EXPECTED_TOTAL = 5;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Contenedor de los progress dots. Es el único elemento cuyo `aria-label`
 * arranca con "Paso ..." (el texto de progreso derivado dinámicamente).
 */
function progressContainer(): HTMLElement {
  const el = document.querySelector('div[aria-label^="Paso"]');
  if (!el) throw new Error('No se encontró el contenedor de progreso');
  return el as HTMLElement;
}

/** Cantidad de dots renderizados (hijos directos del contenedor). */
function dotCount(): number {
  return progressContainer().children.length;
}

/** aria-label actual del indicador de progreso. */
function progressLabel(): string | null {
  return progressContainer().getAttribute('aria-label');
}

/**
 * jsdom no implementa `matchMedia`, que `usePwaInstall()` consulta al montar el
 * paso `install`. Lo stubbeamos (no standalone) para poder navegar hasta el
 * último paso sin romper la detección de plataforma.
 */
function stubMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  localStorage.clear();
  pushMock.mockReset();
  stubMatchMedia();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ── P6: cantidad de dots === total (Req 1.2) ─────────────────────────────────

describe('Task 6.3 — cantidad de dots consistente con el total (P6, Req 1.2)', () => {
  it('renderiza exactamente ONBOARDING_STEPS.length dots (= 5) en el primer paso', () => {
    render(<OnboardingPage />);
    expect(dotCount()).toBe(EXPECTED_TOTAL);
  });

  it('mantiene la misma cantidad de dots a medida que avanza de paso', () => {
    render(<OnboardingPage />);

    // welcome (0)
    expect(dotCount()).toBe(EXPECTED_TOTAL);

    // → disclaimer (1)
    fireEvent.click(screen.getByRole('button', { name: /Empecemos/i }));
    expect(dotCount()).toBe(EXPECTED_TOTAL);

    // → dietary (2)
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    expect(dotCount()).toBe(EXPECTED_TOTAL);

    // → tour (3)
    fireEvent.click(
      screen.getByRole('button', { name: /Sin restricciones, continuar/i }),
    );
    expect(dotCount()).toBe(EXPECTED_TOTAL);

    // → install (4)
    fireEvent.click(
      screen.getByRole('button', { name: /Empezar mi protocolo/i }),
    );
    expect(dotCount()).toBe(EXPECTED_TOTAL);
  });
});

// ── P6: aria-label dinámico "Paso {n} de {total}" (Req 1.3, 1.4) ─────────────

describe('Task 6.3 — aria-label dinámico del progreso (P6, Req 1.3, 1.4)', () => {
  it('arranca en "Paso 1 de 5" en el paso de bienvenida', () => {
    render(<OnboardingPage />);
    expect(progressLabel()).toBe('Paso 1 de 5');
  });

  it('avanza a "Paso 2 de 5" al pasar de welcome a disclaimer', () => {
    render(<OnboardingPage />);
    expect(progressLabel()).toBe('Paso 1 de 5');

    fireEvent.click(screen.getByRole('button', { name: /Empecemos/i }));
    expect(screen.getByRole('heading', { name: /Antes de empezar/i })).toBeInTheDocument();
    expect(progressLabel()).toBe('Paso 2 de 5');
  });

  it('refleja el índice correcto en cada paso hasta "Paso 5 de 5"', () => {
    render(<OnboardingPage />);

    // Paso 1 de 5 — welcome
    expect(progressLabel()).toBe('Paso 1 de 5');

    // Paso 2 de 5 — disclaimer
    fireEvent.click(screen.getByRole('button', { name: /Empecemos/i }));
    expect(progressLabel()).toBe('Paso 2 de 5');

    // Paso 3 de 5 — dietary
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    expect(progressLabel()).toBe('Paso 3 de 5');

    // Paso 4 de 5 — tour
    fireEvent.click(
      screen.getByRole('button', { name: /Sin restricciones, continuar/i }),
    );
    expect(progressLabel()).toBe('Paso 4 de 5');

    // Paso 5 de 5 — install
    fireEvent.click(
      screen.getByRole('button', { name: /Empezar mi protocolo/i }),
    );
    expect(progressLabel()).toBe('Paso 5 de 5');
  });

  it('el aria-label es coherente con el total real de dots renderizados', () => {
    render(<OnboardingPage />);
    // "Paso {n} de {total}" — el total debe coincidir con la cantidad de dots.
    const label = progressLabel() ?? '';
    const match = label.match(/de (\d+)$/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBe(dotCount());
  });
});

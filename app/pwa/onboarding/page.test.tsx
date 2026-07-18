// @vitest-environment jsdom

/**
 * Task 6.1 — Tests del gating del disclaimer médico del onboarding PWA.
 *
 * Cubre las propiedades de correctitud del diseño relativas al paso
 * `disclaimer` (index 1) del flujo de `app/pwa/onboarding/page.tsx`:
 *
 *  - P1 — El disclaimer bloquea el avance hasta aceptar: en todo momento el
 *    botón "Continuar" refleja `aria-disabled === !accepted` (Req 2.3, 2.4,
 *    2.5).
 *  - P2 — No se puede avanzar (ni disparar `onNext`) con el checkbox
 *    desmarcado; el consentimiento no se persiste (Req 2.7).
 *  - P3 — Al salir del paso disclaimer se persiste el consentimiento en
 *    localStorage vía `markMedicalDisclaimerAccepted()` invocado por
 *    `nextStep()` (Req 6.3).
 *
 * Estrategia: como `StepMedicalDisclaimer` no está exportado, testeamos el
 * flujo real a través de `OnboardingPage`, lo que además valida el cableado de
 * persistencia en `nextStep()`. Usamos el núcleo REAL de `onboarding-state`
 * (localStorage de jsdom) y mockeamos únicamente la periferia:
 *   - `next/navigation` (useRouter.push),
 *   - `@/lib/pwa/use-pwa-user` (usuario logueado determinista),
 *   - `framer-motion` (elementos simples, sin animaciones que difieran el
 *     montaje/desmontaje de los pasos).
 *
 * Detalle importante del `Button` del proyecto: NO usa el atributo nativo
 * `disabled`; comunica el estado mediante `aria-disabled` y bloquea el
 * `onClick` internamente. Por eso los asserts de "deshabilitado" verifican
 * `aria-disabled` y la NO invocación de `onNext` (permanencia en el paso).
 *
 * _Requirements: 2.3, 2.4, 2.5, 2.7, 6.3_
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ── Periferia mockeada ───────────────────────────────────────────────────────

// Router: solo nos interesa capturar el push del final (no se usa en estos
// tests del disclaimer, pero evita que el hook real rompa fuera de Next).
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Usuario logueado determinista (sin fetch a /api/pwa/me).
vi.mock('@/lib/pwa/use-pwa-user', () => ({
  usePwaUser: () => ({
    authenticated: true,
    email: 'ana@example.com',
    nombre: 'Ana',
    testMode: false,
    loading: false,
  }),
}));

// framer-motion → elementos simples con tipo de componente ESTABLE por tag
// (evita remontar el subárbol en cada render). AnimatePresence pasa a través
// de sus children, de modo que cambiar de paso monta/desmonta de forma síncrona.
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
import { isMedicalDisclaimerAccepted } from '@/lib/pwa/onboarding-state';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Botón "Continuar →" del paso disclaimer. */
function continuarButton(): HTMLElement {
  return screen.getByRole('button', { name: /Continuar/i });
}

/** El checkbox de aceptación del aviso médico. */
function acceptCheckbox(): HTMLInputElement {
  return screen.getByRole('checkbox') as HTMLInputElement;
}

/** true si el control expone `aria-disabled="true"`. */
function isAriaDisabled(el: HTMLElement): boolean {
  return el.getAttribute('aria-disabled') === 'true';
}

/**
 * Renderiza el onboarding y avanza desde la bienvenida (index 0) al paso
 * disclaimer (index 1), donde arrancan todas las aserciones.
 */
function renderAtDisclaimer() {
  render(<OnboardingPage />);
  fireEvent.click(screen.getByRole('button', { name: /Empecemos/i }));
  // El paso disclaimer se distingue por su encabezado.
  expect(screen.getByRole('heading', { name: /Antes de empezar/i })).toBeInTheDocument();
}

beforeEach(() => {
  localStorage.clear();
  pushMock.mockReset();
});

afterEach(cleanup);

// ── P1: gating del botón (Req 2.3, 2.4, 2.5) ─────────────────────────────────

describe('Task 6.1 — gating del disclaimer (P1)', () => {
  it('arranca con el checkbox desmarcado y el botón "Continuar" deshabilitado (Req 2.2, 2.3)', () => {
    renderAtDisclaimer();

    expect(acceptCheckbox().checked).toBe(false);
    expect(isAriaDisabled(continuarButton())).toBe(true);
  });

  it('marcar el checkbox habilita el botón "Continuar" (Req 2.4)', () => {
    renderAtDisclaimer();

    fireEvent.click(acceptCheckbox());

    expect(acceptCheckbox().checked).toBe(true);
    expect(isAriaDisabled(continuarButton())).toBe(false);
  });

  it('desmarcar tras haber marcado vuelve a deshabilitar el botón (Req 2.5)', () => {
    renderAtDisclaimer();
    const checkbox = acceptCheckbox();

    fireEvent.click(checkbox); // marcar → habilitado
    expect(isAriaDisabled(continuarButton())).toBe(false);

    fireEvent.click(checkbox); // desmarcar → deshabilitado de nuevo
    expect(checkbox.checked).toBe(false);
    expect(isAriaDisabled(continuarButton())).toBe(true);
  });

  it('el checkbox refleja su estado en aria-checked (Req 3.1)', () => {
    renderAtDisclaimer();
    const checkbox = acceptCheckbox();

    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(checkbox);
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
  });
});

// ── P2: no se avanza sin aceptar (Req 2.7) ───────────────────────────────────

describe('Task 6.1 — no se puede avanzar sin aceptar (P2)', () => {
  it('con el checkbox desmarcado, clickear "Continuar" no avanza ni persiste el consentimiento (Req 2.7)', () => {
    renderAtDisclaimer();

    // El <Button> bloquea el onClick cuando está deshabilitado: `onNext` no
    // se dispara, así que seguimos en el paso disclaimer.
    fireEvent.click(continuarButton());

    // Sigue en el disclaimer (no avanzó a preferencias dietéticas).
    expect(screen.getByRole('heading', { name: /Antes de empezar/i })).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /restricci[oó]n alimentaria/i }),
    ).toBeNull();

    // Y el consentimiento NO se persistió.
    expect(isMedicalDisclaimerAccepted()).toBe(false);
  });
});

// ── P3: persistencia del consentimiento al salir (Req 6.3) ───────────────────

describe('Task 6.1 — persistencia del consentimiento al salir del disclaimer (P3)', () => {
  it('el consentimiento no está persistido antes de aceptar y continuar', () => {
    renderAtDisclaimer();
    expect(isMedicalDisclaimerAccepted()).toBe(false);
  });

  it('aceptar y clickear "Continuar" persiste el consentimiento y avanza al siguiente paso (Req 6.3)', () => {
    renderAtDisclaimer();

    fireEvent.click(acceptCheckbox());
    fireEvent.click(continuarButton());

    // P3: al salir del paso disclaimer el consentimiento quedó persistido.
    expect(isMedicalDisclaimerAccepted()).toBe(true);

    // Avanzó al paso de preferencias dietéticas (ya no está el disclaimer).
    expect(screen.queryByRole('heading', { name: /Antes de empezar/i })).toBeNull();
    expect(
      screen.getByRole('heading', { name: /restricci[oó]n alimentaria/i }),
    ).toBeInTheDocument();
  });
});

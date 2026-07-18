// @vitest-environment jsdom

/**
 * Task 6.2 (parte componente) — Tests del paso "Instalar App" del onboarding.
 *
 * Cubre la propiedad de correctitud P4 del diseño relativa al paso `install`
 * (index 4, no bloqueante) de `app/pwa/onboarding/page.tsx`:
 *
 *  - P4 — El paso de instalación NUNCA bloquea el avance: para toda plataforma
 *    ∈ { android, ios, standalone, unsupported } existe un control visible y
 *    habilitado que invoca `onNext()` (avanzar/saltar) y, al ser el último
 *    paso, dispara `markOnboardingCompleted()` + navegación a `/pwa/dashboard`
 *    (Req 5.4, 5.5, 5.6).
 *  - Complemento 5.1/5.2 — En Android con soporte nativo, "Instalar ahora"
 *    dispara el prompt y, si resuelve 'accepted', avanza automáticamente.
 *
 * Estrategia: como `StepInstallApp` no está exportado, se ejercita el flujo
 * real navegando por `OnboardingPage` hasta el último paso, con el entorno del
 * navegador simulado por plataforma (matchMedia, userAgent, evento
 * `beforeinstallprompt`). Se reutiliza el patrón de mocks de `page.test.tsx`
 * (next/navigation, use-pwa-user, framer-motion) sin modificar ese archivo.
 *
 * Detalle del `Button` del proyecto: comunica "deshabilitado" con
 * `aria-disabled` (no el atributo nativo `disabled`). Un control habilitado
 * NO expone `aria-disabled="true"`.
 *
 * _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { BeforeInstallPromptEvent } from '@/lib/pwa/use-pwa-install';

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

// ── userAgents por plataforma ────────────────────────────────────────────────

const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// ── Helpers de entorno ───────────────────────────────────────────────────────

function stubMatchMedia(isStandalone: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('standalone') ? isStandalone : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
}

function makeBipEvent(
  outcome: 'accepted' | 'dismissed',
): BeforeInstallPromptEvent {
  const e = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
  (e as unknown as { prompt: () => Promise<void> }).prompt = vi
    .fn()
    .mockResolvedValue(undefined);
  (e as unknown as { userChoice: Promise<{ outcome: string }> }).userChoice =
    Promise.resolve({ outcome });
  return e;
}

/** true si el control expone `aria-disabled="true"`. */
function isAriaDisabled(el: HTMLElement): boolean {
  return el.getAttribute('aria-disabled') === 'true';
}

/**
 * Renderiza el onboarding y avanza welcome → disclaimer → dietary → tour →
 * install, dejando visible el último paso (StepInstallApp).
 */
function navigateToInstall() {
  render(<OnboardingPage />);
  // 0: bienvenida
  fireEvent.click(screen.getByRole('button', { name: /Empecemos/i }));
  // 1: disclaimer (bloqueante) → aceptar y continuar
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
  // 2: preferencias dietéticas (sin restricciones)
  fireEvent.click(
    screen.getByRole('button', { name: /Sin restricciones, continuar/i }),
  );
  // 3: tour
  fireEvent.click(
    screen.getByRole('button', { name: /Empezar mi protocolo/i }),
  );
  // 4: install
  expect(
    screen.getByRole('heading', { name: /Instalá la app/i }),
  ).toBeInTheDocument();
}

beforeEach(() => {
  pushMock.mockReset();
  stubMatchMedia(false);
  setUserAgent(DESKTOP_UA);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ── P4 — control de avance habilitado en cada plataforma (Req 5.4/5.5/5.6) ───

describe('Task 6.2 — el paso de instalación nunca bloquea (P4)', () => {
  it('standalone: ofrece continuar habilitado y avanza al dashboard (Req 5.4)', async () => {
    stubMatchMedia(true);
    setUserAgent(ANDROID_UA);

    navigateToInstall();

    const advance = await screen.findByRole('button', {
      name: /Ya está instalada, continuar/i,
    });
    expect(isAriaDisabled(advance)).toBe(false);

    fireEvent.click(advance);
    expect(pushMock).toHaveBeenCalledWith('/pwa/dashboard');
  });

  it('ios: ofrece "Saltar por ahora" habilitado y avanza al dashboard (Req 5.3/5.6)', async () => {
    stubMatchMedia(false);
    setUserAgent(IOS_UA);

    navigateToInstall();

    // iOS muestra el botón de instrucciones manuales…
    expect(
      await screen.findByRole('button', { name: /Ver instrucciones/i }),
    ).toBeInTheDocument();

    // …y SIEMPRE un control de salto habilitado (no bloquea).
    const skip = screen.getByRole('button', { name: /Saltar por ahora/i });
    expect(isAriaDisabled(skip)).toBe(false);

    fireEvent.click(skip);
    expect(pushMock).toHaveBeenCalledWith('/pwa/dashboard');
  });

  it('android: ofrece "Instalar ahora" y un salto habilitado que avanza (Req 5.1/5.6)', async () => {
    stubMatchMedia(false);
    setUserAgent(ANDROID_UA);

    navigateToInstall();

    // Simulamos el soporte nativo (beforeinstallprompt) ya en el paso install.
    act(() => {
      window.dispatchEvent(makeBipEvent('dismissed'));
    });

    const install = await screen.findByRole('button', {
      name: /Instalar ahora/i,
    });
    expect(isAriaDisabled(install)).toBe(false);

    const skip = screen.getByRole('button', { name: /Saltar por ahora/i });
    expect(isAriaDisabled(skip)).toBe(false);

    fireEvent.click(skip);
    expect(pushMock).toHaveBeenCalledWith('/pwa/dashboard');
  });

  it('unsupported: ofrece "Saltar por ahora" habilitado y avanza (Req 5.5)', async () => {
    stubMatchMedia(false);
    setUserAgent(DESKTOP_UA);

    navigateToInstall();

    const skip = await screen.findByRole('button', {
      name: /Saltar por ahora/i,
    });
    expect(isAriaDisabled(skip)).toBe(false);

    fireEvent.click(skip);
    expect(pushMock).toHaveBeenCalledWith('/pwa/dashboard');
  });
});

// ── Complemento 5.1/5.2 — instalación aceptada avanza automáticamente ────────

describe('Task 6.2 — Android: instalar y aceptar avanza (Req 5.1/5.2)', () => {
  it('al aceptar el prompt nativo se navega al dashboard', async () => {
    stubMatchMedia(false);
    setUserAgent(ANDROID_UA);

    navigateToInstall();

    act(() => {
      window.dispatchEvent(makeBipEvent('accepted'));
    });

    const install = await screen.findByRole('button', {
      name: /Instalar ahora/i,
    });

    await act(async () => {
      fireEvent.click(install);
    });

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/pwa/dashboard'));
  });
});

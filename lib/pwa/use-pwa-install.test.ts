// @vitest-environment jsdom

/**
 * Task 6.2 (parte hook) — Tests de `usePwaInstall`.
 *
 * Cubre las propiedades de correctitud del diseño relativas al hook de
 * instalación (`lib/pwa/use-pwa-install.ts`):
 *
 *  - Detección de plataforma (base de P4): standalone / ios / android /
 *    unsupported según `matchMedia('(display-mode: standalone)')`, el
 *    userAgent iOS y la captura de `beforeinstallprompt` (Req 4.2).
 *  - P5 — `promptInstall()` es TOTAL: siempre resuelve un valor del conjunto
 *    { 'accepted' | 'dismissed' | 'unavailable' } sin lanzar, y tras un intento
 *    real consume el deferredPrompt de modo que `canPrompt` pase a false
 *    (Req 4.5, 4.6).
 *
 * Estrategia: renderizamos el hook REAL con `renderHook` y simulamos el entorno
 * del navegador (matchMedia, navigator.userAgent) y el evento no estándar
 * `beforeinstallprompt`. No se mockea el hook: se ejercita su lógica real.
 * Para P5 se usan property tests (fast-check) que barren los posibles
 * `outcome` y estados del prompt (presente/ausente, con/ sin excepción).
 *
 * _Requirements: 4.2, 4.5, 4.6, 5.1, 5.2, 5.5, 5.6_
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import fc from 'fast-check';
import {
  usePwaInstall,
  type BeforeInstallPromptEvent,
} from './use-pwa-install';

// ── userAgents representativos por plataforma ────────────────────────────────

const ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36';
const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const DESKTOP_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// ── Helpers de entorno ───────────────────────────────────────────────────────

/** Stub de `window.matchMedia`: solo nos importa la query de display-mode. */
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

/** Sobrescribe el userAgent de forma reversible. */
function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: ua,
    configurable: true,
  });
}

/**
 * Construye un evento `beforeinstallprompt` simulado con el `outcome` deseado.
 * `promptThrows` permite ejercitar el camino en que `prompt()` rechaza.
 */
function makeBipEvent(
  outcome: 'accepted' | 'dismissed',
  opts: { promptThrows?: boolean } = {},
): BeforeInstallPromptEvent {
  const e = new Event('beforeinstallprompt') as BeforeInstallPromptEvent;
  (e as unknown as { prompt: () => Promise<void> }).prompt = opts.promptThrows
    ? vi.fn().mockRejectedValue(new Error('prompt failed'))
    : vi.fn().mockResolvedValue(undefined);
  (e as unknown as { userChoice: Promise<{ outcome: string }> }).userChoice =
    Promise.resolve({ outcome });
  return e;
}

/** Dispara el evento y espera a que el hook capture el deferredPrompt. */
async function fireBeforeInstallPrompt(
  result: { current: { canPrompt: boolean } },
  evt: BeforeInstallPromptEvent,
) {
  act(() => {
    window.dispatchEvent(evt);
  });
  await waitFor(() => expect(result.current.canPrompt).toBe(true));
}

const OUTCOME_SET = ['accepted', 'dismissed', 'unavailable'] as const;

beforeEach(() => {
  stubMatchMedia(false);
  setUserAgent(DESKTOP_UA);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Detección de plataforma (base de P4, Req 4.2) ────────────────────────────

describe('usePwaInstall — detección de plataforma (Req 4.2)', () => {
  it('detecta standalone cuando matchMedia(display-mode: standalone) matchea', async () => {
    stubMatchMedia(true);
    setUserAgent(ANDROID_UA);

    const { result } = renderHook(() => usePwaInstall());

    await waitFor(() => expect(result.current.platform).toBe('standalone'));
    expect(result.current.isStandalone).toBe(true);
    expect(result.current.canPrompt).toBe(false);
  });

  it('detecta iOS por userAgent cuando no es standalone', async () => {
    stubMatchMedia(false);
    setUserAgent(IOS_UA);

    const { result } = renderHook(() => usePwaInstall());

    await waitFor(() => expect(result.current.platform).toBe('ios'));
    expect(result.current.isStandalone).toBe(false);
    expect(result.current.canPrompt).toBe(false);
  });

  it('detecta android al capturar beforeinstallprompt', async () => {
    stubMatchMedia(false);
    setUserAgent(ANDROID_UA);

    const { result } = renderHook(() => usePwaInstall());
    // Antes del evento, aún no hay soporte nativo detectado.
    expect(result.current.platform).toBe('unsupported');

    await fireBeforeInstallPrompt(result, makeBipEvent('accepted'));

    expect(result.current.platform).toBe('android');
    expect(result.current.canPrompt).toBe(true);
  });

  it('queda unsupported en desktop sin beforeinstallprompt', async () => {
    stubMatchMedia(false);
    setUserAgent(DESKTOP_UA);

    const { result } = renderHook(() => usePwaInstall());

    // El efecto corre en el montaje; sin evento el estado permanece unsupported.
    await waitFor(() => expect(result.current.platform).toBe('unsupported'));
    expect(result.current.canPrompt).toBe(false);
  });

  it('remueve el listener beforeinstallprompt en el cleanup (Req 4.3)', () => {
    stubMatchMedia(false);
    setUserAgent(ANDROID_UA);
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => usePwaInstall());
    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      'beforeinstallprompt',
      expect.any(Function),
    );
  });
});

// ── P5 — promptInstall total + consumo del deferredPrompt (Req 4.5, 4.6) ─────

describe('usePwaInstall — promptInstall (P5, Req 4.5/4.6)', () => {
  it('resuelve "unavailable" sin lanzar cuando no hay deferredPrompt (Req 4.5)', async () => {
    stubMatchMedia(false);
    setUserAgent(DESKTOP_UA);

    const { result } = renderHook(() => usePwaInstall());

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe('unavailable');
    expect(OUTCOME_SET).toContain(outcome as (typeof OUTCOME_SET)[number]);
    expect(result.current.canPrompt).toBe(false);
  });

  it('tras un intento real consume el deferredPrompt: canPrompt pasa a false (Req 4.6)', async () => {
    stubMatchMedia(false);
    setUserAgent(ANDROID_UA);

    const { result } = renderHook(() => usePwaInstall());
    await fireBeforeInstallPrompt(result, makeBipEvent('accepted'));

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe('accepted');
    await waitFor(() => expect(result.current.canPrompt).toBe(false));

    // Un segundo intento ya no tiene prompt disponible → 'unavailable'.
    let second: string | undefined;
    await act(async () => {
      second = await result.current.promptInstall();
    });
    expect(second).toBe('unavailable');
  });

  it('P5 — promptInstall devuelve el outcome nativo y consume el prompt (property)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('accepted' as const, 'dismissed' as const),
        async (outcome) => {
          stubMatchMedia(false);
          setUserAgent(ANDROID_UA);

          const { result, unmount } = renderHook(() => usePwaInstall());
          await fireBeforeInstallPrompt(result, makeBipEvent(outcome));

          let r: string | undefined;
          await act(async () => {
            r = await result.current.promptInstall();
          });

          // Devuelve exactamente el outcome nativo y pertenece al conjunto.
          expect(r).toBe(outcome);
          expect(OUTCOME_SET).toContain(r as (typeof OUTCOME_SET)[number]);

          // Consumido: canPrompt=false y un reintento resuelve 'unavailable'.
          await waitFor(() => expect(result.current.canPrompt).toBe(false));
          let r2: string | undefined;
          await act(async () => {
            r2 = await result.current.promptInstall();
          });
          expect(r2).toBe('unavailable');

          unmount();
        },
      ),
      { numRuns: 12 },
    );
  });

  it('P5 — promptInstall es total: nunca lanza y siempre retorna un valor del conjunto (property)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          hasPrompt: fc.boolean(),
          promptThrows: fc.boolean(),
          outcome: fc.constantFrom('accepted' as const, 'dismissed' as const),
        }),
        async ({ hasPrompt, promptThrows, outcome }) => {
          stubMatchMedia(false);
          setUserAgent(ANDROID_UA);

          const { result, unmount } = renderHook(() => usePwaInstall());

          if (hasPrompt) {
            await fireBeforeInstallPrompt(
              result,
              makeBipEvent(outcome, { promptThrows }),
            );
          }

          let r: string | undefined;
          let threw = false;
          await act(async () => {
            try {
              r = await result.current.promptInstall();
            } catch {
              threw = true;
            }
          });

          // Totalidad: no propaga excepciones y el resultado es del conjunto.
          expect(threw).toBe(false);
          expect(OUTCOME_SET).toContain(r as (typeof OUTCOME_SET)[number]);

          if (!hasPrompt) {
            expect(r).toBe('unavailable');
          } else if (promptThrows) {
            // Si prompt() rechaza, se degrada a 'unavailable' sin lanzar.
            expect(r).toBe('unavailable');
          } else {
            expect(r).toBe(outcome);
          }

          unmount();
        },
      ),
      { numRuns: 25 },
    );
  });
});

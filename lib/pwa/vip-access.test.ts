import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import {
  validateVipCode,
  persistVipUnlocked,
  isVipUnlocked,
  VIP_UNLOCK_STORAGE_KEY,
} from './vip-access';
import { VIP_CODE_LATAM } from '@/lib/quiz-v2/config-latam';

/**
 * Feature: upsell2-latam-vip — candado de la sección VIP (lib pura).
 *
 * El entorno de vitest es `node` (sin DOM), así que mockeamos `localStorage`
 * sobre un `window` global cuando el test lo necesita.
 */

type Store = Record<string, string>;

function installLocalStorage(initial: Store = {}): Store {
  const store: Store = { ...initial };
  const localStorage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
  (globalThis as unknown as { window?: unknown }).window = { localStorage };
  return store;
}

function uninstallWindow() {
  delete (globalThis as unknown as { window?: unknown }).window;
}

/** Genera variantes de casing + espacios alrededor de un código base. */
function codeVariantArb(base: string) {
  return fc
    .tuple(
      fc.array(fc.boolean(), { minLength: base.length, maxLength: base.length }),
      fc.stringMatching(/^[ \t\n]*$/),
      fc.stringMatching(/^[ \t\n]*$/),
    )
    .map(([cases, lead, trail]) => {
      const mixed = base
        .split('')
        .map((ch, i) => (cases[i] ? ch.toUpperCase() : ch.toLowerCase()))
        .join('');
      return `${lead}${mixed}${trail}`;
    });
}

afterEach(() => {
  uninstallWindow();
  vi.restoreAllMocks();
});

describe('vip-access', () => {
  // ── Task 2.2 — Property 3: el código incorrecto nunca desbloquea ─────────
  // **Validates: Requirements 4.4**
  it('Property 3: ∀ string distinto (trim+lowercase) de VIP_CODE_LATAM → validateVipCode === false', () => {
    const target = VIP_CODE_LATAM.trim().toLowerCase();
    fc.assert(
      fc.property(
        fc.string().filter((s) => s.trim().toLowerCase() !== target),
        (s) => {
          expect(validateVipCode(s)).toBe(false);
        },
      ),
      { numRuns: 200 },
    );
  });

  // ── Task 2.3 — Property 4: el código correcto desbloquea y persiste ──────
  // **Validates: Requirements 4.3**
  it('Property 4: variantes válidas → validateVipCode true; tras persist, isVipUnlocked true', () => {
    fc.assert(
      fc.property(codeVariantArb(VIP_CODE_LATAM), (variant) => {
        installLocalStorage();
        expect(validateVipCode(variant)).toBe(true);
        persistVipUnlocked();
        expect(isVipUnlocked()).toBe(true);
        uninstallWindow();
      }),
      { numRuns: 200 },
    );
  });

  // ── Task 2.4 — Property 5: la validación no toca red ni SQL ───────────────
  // **Validates: Requirements 4.5, 4.9**
  it('Property 5: validateVipCode no invoca fetch (ni red) para entradas arbitrarias', () => {
    const fetchSpy = vi.fn();
    (globalThis as unknown as { fetch?: unknown }).fetch = fetchSpy;
    fc.assert(
      fc.property(fc.string(), (s) => {
        validateVipCode(s);
      }),
      { numRuns: 200 },
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  // ── Task 2.5 — Property 6: isVipUnlocked refleja exactamente el flag ──────
  // **Validates: Requirements 4.6, 4.1**
  it('Property 6: isVipUnlocked() === (flag === "true") para valores arbitrarios del flag', () => {
    fc.assert(
      fc.property(fc.string(), (flagValue) => {
        installLocalStorage({ [VIP_UNLOCK_STORAGE_KEY]: flagValue });
        expect(isVipUnlocked()).toBe(flagValue === 'true');
        uninstallWindow();
      }),
      { numRuns: 200 },
    );
  });

  // ── Task 2.6 — Property 9: idempotencia del desbloqueo ────────────────────
  // **Validates: Requirements 4.7**
  it('Property 9: N llamadas a persistVipUnlocked dejan el mismo estado que una sola', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 25 }), (n) => {
        const store = installLocalStorage();
        for (let i = 0; i < n; i++) persistVipUnlocked();
        expect(store[VIP_UNLOCK_STORAGE_KEY]).toBe('true');
        expect(isVipUnlocked()).toBe(true);
        uninstallWindow();
      }),
      { numRuns: 100 },
    );
  });

  // ── Edge cases unitarios ──────────────────────────────────────────────────
  it('isVipUnlocked() === false cuando no hay window (server-safe)', () => {
    uninstallWindow();
    expect(isVipUnlocked()).toBe(false);
  });

  it('persistVipUnlocked() no lanza cuando localStorage falla', () => {
    (globalThis as unknown as { window?: unknown }).window = {
      localStorage: {
        setItem: () => {
          throw new Error('QuotaExceeded');
        },
        getItem: () => null,
      },
    };
    expect(() => persistVipUnlocked()).not.toThrow();
  });
});

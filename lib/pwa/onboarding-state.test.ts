import { describe, it, expect, afterEach } from 'vitest';
import {
  isOnboardingCompleted,
  markOnboardingCompleted,
  markMedicalDisclaimerAccepted,
  isMedicalDisclaimerAccepted,
  resetOnboarding,
} from './onboarding-state';

/**
 * Feature: pwa-onboarding-disclaimer-install — estado de onboarding
 * (`onboarding-state.ts`).
 *
 * El entorno de vitest es `node` (sin DOM). El módulo accede a `window` y
 * `localStorage` globales tras chequear `typeof window`, así que mockeamos
 * ambos sobre el global cuando hace falta.
 *
 * Cubre Task 1: key `pwa_medical_disclaimer_accepted`, mark/is del disclaimer
 * y limpieza en resetOnboarding (Requirements 2.6, 6.3, 6.4).
 */

const DISCLAIMER_KEY = 'pwa_medical_disclaimer_accepted';
const ONBOARDING_KEY = 'pwa_onboarding_completed';

type Store = Record<string, string>;

type FakeStorage = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
  removeItem: (k: string) => void;
  clear: () => void;
};

function makeStorage(initial: Store = {}): { store: Store; storage: FakeStorage } {
  const store: Store = { ...initial };
  const storage: FakeStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => {
      store[k] = String(v);
    },
    removeItem: (k) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
  return { store, storage };
}

function installStorage(initial: Store = {}): Store {
  const { store, storage } = makeStorage(initial);
  const g = globalThis as unknown as { window?: unknown; localStorage?: unknown };
  g.window = { localStorage: storage };
  g.localStorage = storage;
  return store;
}

/** Instala un localStorage que lanza en toda operación (bloqueado). */
function installThrowingStorage() {
  const throwing: FakeStorage = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
    removeItem: () => {
      throw new Error('blocked');
    },
    clear: () => {
      throw new Error('blocked');
    },
  };
  const g = globalThis as unknown as { window?: unknown; localStorage?: unknown };
  g.window = { localStorage: throwing };
  g.localStorage = throwing;
}

function uninstallStorage() {
  const g = globalThis as unknown as { window?: unknown; localStorage?: unknown };
  delete g.window;
  delete g.localStorage;
}

afterEach(() => {
  uninstallStorage();
});

describe('medical disclaimer consent', () => {
  it('markMedicalDisclaimerAccepted persiste "true" bajo la key dedicada', () => {
    const store = installStorage();
    markMedicalDisclaimerAccepted();
    expect(store[DISCLAIMER_KEY]).toBe('true');
  });

  it('isMedicalDisclaimerAccepted refleja el consentimiento persistido', () => {
    installStorage();
    expect(isMedicalDisclaimerAccepted()).toBe(false);
    markMedicalDisclaimerAccepted();
    expect(isMedicalDisclaimerAccepted()).toBe(true);
  });

  it('isMedicalDisclaimerAccepted es false cuando el valor no es exactamente "true"', () => {
    installStorage({ [DISCLAIMER_KEY]: 'yes' });
    expect(isMedicalDisclaimerAccepted()).toBe(false);
  });
});

describe('resetOnboarding', () => {
  it('elimina tanto el flag de onboarding como el consentimiento del disclaimer', () => {
    const store = installStorage();
    markOnboardingCompleted();
    markMedicalDisclaimerAccepted();
    expect(isOnboardingCompleted()).toBe(true);
    expect(isMedicalDisclaimerAccepted()).toBe(true);

    resetOnboarding();

    expect(store[ONBOARDING_KEY]).toBeUndefined();
    expect(store[DISCLAIMER_KEY]).toBeUndefined();
    expect(isOnboardingCompleted()).toBe(false);
    expect(isMedicalDisclaimerAccepted()).toBe(false);
  });
});

describe('comportamiento defensivo (SSR / storage bloqueado)', () => {
  it('sin window (SSR) no lanza y devuelve valores seguros', () => {
    // afterEach ya deja el global sin window/localStorage
    expect(() => markMedicalDisclaimerAccepted()).not.toThrow();
    expect(isMedicalDisclaimerAccepted()).toBe(false);
    expect(() => resetOnboarding()).not.toThrow();
  });

  it('con localStorage bloqueado no propaga la excepción', () => {
    installThrowingStorage();
    expect(() => markMedicalDisclaimerAccepted()).not.toThrow();
    expect(isMedicalDisclaimerAccepted()).toBe(false);
    expect(() => resetOnboarding()).not.toThrow();
  });
});

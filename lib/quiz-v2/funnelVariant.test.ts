import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';

import {
  assignFunnelVariant,
  getFunnelVariant,
  peekFunnelVariant,
  readPreviewOverride,
  isFunnelExperimentEnabled,
  funnelEventName,
  isFunnelVariantEvent,
  parseFunnelVariantEvent,
  FUNNEL_VARIANT_LABEL,
  AB_ENTRY_PINNED_DEFAULT,
  type FunnelVariant,
  type FunnelStep,
  type VariantStorage,
} from './funnelVariant';
import { isAbEntryEvent, abEntryEventName } from './abEntry';

const STORAGE_KEY = 'ab_funnel_v1';
const STEPS: FunnelStep[] = [
  'quiz_start',
  'quiz_complete',
  'salespage_view',
  'checkout',
  'purchase',
];

/** Storage en memoria que registra las escrituras (para verificar persistencia). */
function makeMemStorage(initial?: Record<string, string>) {
  const map = new Map<string, string>(Object.entries(initial ?? {}));
  const sets: Array<[string, string]> = [];
  const storage: VariantStorage = {
    get: (k) => (map.has(k) ? (map.get(k) as string) : null),
    set: (k, v) => {
      sets.push([k, v]);
      map.set(k, v);
    },
  };
  return { storage, map, sets };
}

// ════════════════════════════════════════════════════════════════════════════
// Task 2.1 — Unit tests: flag / guard / override / persistence / peek
// _Requirements: 1.5, 3.1, 3.2, 6.1, 6.2, 10.3, 10.4, 16.1_
// ════════════════════════════════════════════════════════════════════════════

describe('isFunnelExperimentEnabled (kill switch)', () => {
  const original = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    else process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = original;
  });

  it("true SOLO cuando el valor es exactamente 'true'", () => {
    process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
    expect(isFunnelExperimentEnabled()).toBe(true);
  });
  it("'false' → false", () => {
    process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'false';
    expect(isFunnelExperimentEnabled()).toBe(false);
  });
  it("'TRUE' (otro casing) → false", () => {
    process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'TRUE';
    expect(isFunnelExperimentEnabled()).toBe(false);
  });
  it('unset → false', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    expect(isFunnelExperimentEnabled()).toBe(false);
  });
});

describe('assignFunnelVariant — guards y persistencia (core puro)', () => {
  it('flag OFF → siempre A, no persiste (Req 3.1, 3.2)', () => {
    const { storage, sets } = makeMemStorage();
    expect(assignFunnelVariant(() => 0.9, storage, false, 'ar', null)).toBe('A');
    expect(sets).toHaveLength(0);
  });

  it("LATAM → siempre A, no persiste (Req 6.1, 6.2)", () => {
    const { storage, sets } = makeMemStorage();
    expect(assignFunnelVariant(() => 0.1, storage, true, 'latam', null)).toBe('A');
    expect(sets).toHaveLength(0);
  });

  it('override A|B con flag ON / ar → fuerza + persiste (Req 10.1, 10.2)', () => {
    const { storage, map } = makeMemStorage();
    expect(assignFunnelVariant(() => 0.99, storage, true, 'ar', 'B')).toBe('B');
    expect(map.get(STORAGE_KEY)).toBe('B');
  });

  it('override ignorado con flag OFF → A, no persiste (Req 10.3)', () => {
    const { storage, sets } = makeMemStorage();
    expect(assignFunnelVariant(() => 0.1, storage, false, 'ar', 'B')).toBe('A');
    expect(sets).toHaveLength(0);
  });

  it('override ignorado en LATAM → A, no persiste (Req 10.4)', () => {
    const { storage, sets } = makeMemStorage();
    expect(assignFunnelVariant(() => 0.1, storage, true, 'latam', 'B')).toBe('A');
    expect(sets).toHaveLength(0);
  });

  it('rand < 0.5 → A ; rand >= 0.5 → B (asignación nueva)', () => {
    const a = makeMemStorage();
    const b = makeMemStorage();
    expect(assignFunnelVariant(() => 0.49, a.storage, true, 'ar', null)).toBe('A');
    expect(assignFunnelVariant(() => 0.5, b.storage, true, 'ar', null)).toBe('B');
    expect(a.map.get(STORAGE_KEY)).toBe('A');
    expect(b.map.get(STORAGE_KEY)).toBe('B');
  });

  it('valor ya asignado → estable, no se sobrescribe (Req 2.1, 2.2)', () => {
    const { storage, sets } = makeMemStorage({ [STORAGE_KEY]: 'B' });
    // rand devolvería A, pero el valor guardado gana.
    expect(assignFunnelVariant(() => 0.0, storage, true, 'ar', null)).toBe('B');
    expect(sets).toHaveLength(0);
  });
});

describe('getFunnelVariant / peekFunnelVariant — SSR-safe (sin window)', () => {
  it("en el server (sin window) getFunnelVariant devuelve 'A' (Req 1.5)", () => {
    expect(typeof window).toBe('undefined');
    expect(getFunnelVariant('ar')).toBe('A');
    expect(getFunnelVariant('latam')).toBe('A');
  });
  it('en el server peekFunnelVariant devuelve null', () => {
    expect(peekFunnelVariant()).toBeNull();
  });
});

describe('getFunnelVariant — resiliencia ante localStorage que lanza (Req 16.1)', () => {
  const original = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
  afterEach(() => {
    // limpiar el window falso
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
    if (original === undefined) delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    else process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = original;
  });

  it('no lanza y devuelve A|B cuando localStorage falla', () => {
    process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = {
      location: { search: '' },
      localStorage: {
        getItem: () => {
          throw new Error('blocked');
        },
        setItem: () => {
          throw new Error('blocked');
        },
      },
    };
    let result: FunnelVariant | undefined;
    expect(() => {
      result = getFunnelVariant('ar');
    }).not.toThrow();
    expect(['A', 'B']).toContain(result);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// QA PREVIEW override (?af_preview=A|B) — flag-independiente, AR-only, no-persist
// _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
// ════════════════════════════════════════════════════════════════════════════

describe('QA preview override (?af_preview)', () => {
  const original = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;

  /** Instala un window falso con la querystring dada y un localStorage que registra escrituras. */
  function installWindow(search: string, initial?: Record<string, string>) {
    const map = new Map<string, string>(Object.entries(initial ?? {}));
    const sets: Array<[string, string]> = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = {
      location: { search },
      localStorage: {
        getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
        setItem: (k: string, v: string) => {
          sets.push([k, v]);
          map.set(k, v);
        },
      },
    };
    return { map, sets };
  }

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).window;
    if (original === undefined) delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    else process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = original;
  });

  it('AR + af_preview=B con flag OFF ⇒ B y NO escribe ab_funnel_v1 (Req 17.1, 17.2)', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED; // flag OFF
    const { sets } = installWindow('?af_preview=B');
    expect(getFunnelVariant('ar')).toBe('B');
    expect(sets).toHaveLength(0);
  });

  it('AR + af_preview=A con flag OFF ⇒ A y NO escribe ab_funnel_v1 (Req 17.1)', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    const { sets } = installWindow('?af_preview=A');
    expect(getFunnelVariant('ar')).toBe('A');
    expect(sets).toHaveLength(0);
  });

  it('af_preview es case-insensitive (b ⇒ B)', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    installWindow('?af_preview=b');
    expect(getFunnelVariant('ar')).toBe('B');
    expect(readPreviewOverride()).toBe('B');
  });

  it('valor inválido ⇒ cae a la lógica normal (flag OFF ⇒ A) (Req 17.5)', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    const { sets } = installWindow('?af_preview=X');
    expect(readPreviewOverride()).toBeNull();
    expect(getFunnelVariant('ar')).toBe('A');
    expect(sets).toHaveLength(0);
  });

  it('LATAM + af_preview=B ⇒ A (preview ignorado) y no persiste (Req 17.3)', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    const { sets } = installWindow('?af_preview=B');
    expect(getFunnelVariant('latam')).toBe('A');
    expect(sets).toHaveLength(0);
  });

  it('peekFunnelVariant devuelve la preview cuando el param está presente (Req 17.4)', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    // localStorage tiene 'A' guardado, pero la preview=B debe ganar para
    // mantener consistente la sesión (sales page / checkout / submit-quiz).
    installWindow('?af_preview=B', { [STORAGE_KEY]: 'A' });
    expect(peekFunnelVariant()).toBe('B');
  });

  it('sin af_preview, peekFunnelVariant lee localStorage normalmente', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    installWindow('', { [STORAGE_KEY]: 'B' });
    expect(peekFunnelVariant()).toBe('B');
  });

  it('af_preview NO activa eventos: el flag sigue OFF aunque haya preview', () => {
    delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
    installWindow('?af_preview=B');
    // El guard de fireFunnelEvent depende SOLO del flag, no de la preview.
    expect(isFunnelExperimentEnabled()).toBe(false);
  });
});

describe('metadata', () => {
  it('FUNNEL_VARIANT_LABEL cubre A y B', () => {
    expect(FUNNEL_VARIANT_LABEL.A).toBeTruthy();
    expect(FUNNEL_VARIANT_LABEL.B).toBeTruthy();
  });
  it("AB_ENTRY_PINNED_DEFAULT es 'B' (control activo de ab_entry)", () => {
    expect(AB_ENTRY_PINNED_DEFAULT).toBe('B');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Property-based tests (fast-check) — P1–P10
// ════════════════════════════════════════════════════════════════════════════

describe('Feature: argentina-funnel-ab-test — property tests', () => {
  // ── Task 2.2 — Property 1: distribución 50/50 ──────────────────────────────
  // **Validates: Requirements 1.2, 1.3**
  it('Property 1: ∀ rand → result ∈ {A,B}; sobre muchas asignaciones B ≈ 50%', () => {
    // (a) Membership: cualquier valor de rand produce exactamente 'A' o 'B'.
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), (r) => {
        const { storage } = makeMemStorage();
        const v = assignFunnelVariant(() => r, storage, true, 'ar', null);
        return v === 'A' || v === 'B';
      }),
      { numRuns: 200 },
    );

    // (b) Convergencia: con n grande, proporción de B dentro de ±5pp de 0.5.
    const n = 20000;
    let bCount = 0;
    for (let i = 0; i < n; i++) {
      const { storage } = makeMemStorage();
      if (assignFunnelVariant(Math.random, storage, true, 'ar', null) === 'B') bCount++;
    }
    const pB = bCount / n;
    expect(Math.abs(pB - 0.5)).toBeLessThan(0.05);
  });

  // ── Task 2.3 — Property 2: estabilidad de la variante ──────────────────────
  // **Validates: Requirements 2.1, 2.2, 2.3**
  it('Property 2: con ab_funnel_v1=X, lecturas repetidas devuelven X y no lo sobrescriben', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<FunnelVariant>('A', 'B'),
        fc.array(fc.double({ min: 0, max: 1, noNaN: true }), { minLength: 1, maxLength: 20 }),
        (x, rands) => {
          const { storage, sets } = makeMemStorage({ [STORAGE_KEY]: x });
          for (const r of rands) {
            const v = assignFunnelVariant(() => r, storage, true, 'ar', null);
            expect(v).toBe(x);
          }
          // Nunca se sobrescribió el valor ya asignado.
          expect(sets).toHaveLength(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  // ── Task 2.4 — Property 3: OFF flag (sin af_preview) ⇒ siempre A ───────────
  // **Validates: Requirements 3.1, 3.2, 3.5**
  // Nota: el core puro `assignFunnelVariant` no conoce `af_preview` (la preview
  // se resuelve en el wrapper `getFunnelVariant` ANTES de llamar al core). Por
  // eso esta propiedad modela el tráfico NORMAL — flag OFF y SIN `af_preview` ⇒
  // 'A' y nada persistido. La preview de QA se cubre aparte en P11.
  it('Property 3: flag OFF y sin af_preview ⇒ A para cualquier storage/seed/version, sin persistir', () => {
    fc.assert(
      fc.property(
        fc.option(fc.constantFrom('A', 'B', 'garbage'), { nil: undefined }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.constantFrom<'ar' | 'latam'>('ar', 'latam'),
        fc.option(fc.constantFrom<FunnelVariant>('A', 'B'), { nil: null }),
        (stored, r, version, override) => {
          const init = stored !== undefined ? { [STORAGE_KEY]: stored } : undefined;
          const { storage, sets } = makeMemStorage(init);
          const v = assignFunnelVariant(() => r, storage, false, version, override);
          expect(v).toBe('A');
          expect(sets).toHaveLength(0);
        },
      ),
      { numRuns: 300 },
    );
  });

  // ── Task 2.5 — Property 4: LATAM nunca asignado ────────────────────────────
  // **Validates: Requirements 6.1, 6.2**
  it('Property 4: version=latam ⇒ A y ab_funnel_v1 nunca se escribe', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.option(fc.constantFrom<FunnelVariant>('A', 'B'), { nil: null }),
        (flag, r, override) => {
          const { storage, sets } = makeMemStorage();
          const v = assignFunnelVariant(() => r, storage, flag, 'latam', override);
          expect(v).toBe('A');
          expect(sets).toHaveLength(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  // ── Task 2.6 — Property 6: round-trip de nombres + rechazo de ajenos ───────
  // **Validates: Requirements 11.1, 11.2, 11.3**
  it('Property 6: parse(name(v,s)) === {v,s}; y strings no-af_ → null/false', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<FunnelVariant>('A', 'B'),
        fc.constantFrom<FunnelStep>(...STEPS),
        (v, s) => {
          const name = funnelEventName(v, s);
          expect(isFunnelVariantEvent(name)).toBe(true);
          expect(parseFunnelVariantEvent(name)).toEqual({ variant: v, step: s });
        },
      ),
      { numRuns: 200 },
    );

    fc.assert(
      fc.property(fc.string(), (s) => {
        fc.pre(!s.startsWith('af_'));
        expect(isFunnelVariantEvent(s)).toBe(false);
        expect(parseFunnelVariantEvent(s)).toBeNull();
      }),
      { numRuns: 300 },
    );
  });

  // ── Task 2.7 — Property 7: aislamiento de namespaces ───────────────────────
  // **Validates: Requirements 11.4**
  it('Property 7: af_* y ab_entry_* son mutuamente excluyentes', () => {
    // Eventos af_ propios.
    fc.assert(
      fc.property(
        fc.constantFrom<FunnelVariant>('A', 'B'),
        fc.constantFrom<FunnelStep>(...STEPS),
        (v, s) => {
          const name = funnelEventName(v, s);
          expect(isFunnelVariantEvent(name)).toBe(true);
          expect(isAbEntryEvent(name)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );

    // Eventos ab_entry_ (deben ser rechazados por isFunnelVariantEvent).
    fc.assert(
      fc.property(
        fc.constantFrom<'A' | 'B' | 'C'>('A', 'B', 'C'),
        fc.constantFrom('landing', 'start', 'complete', 'checkout', 'purchase'),
        (v, step) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const name = abEntryEventName(v as any, step as any);
          expect(isAbEntryEvent(name)).toBe(true);
          expect(isFunnelVariantEvent(name)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );

    // Eventos sp_* (otro test) — nunca clasificados como af_*.
    fc.assert(
      fc.property(fc.constantFrom('sp_A_checkout', 'sp_B_purchase', 'sp_A_view'), (name) => {
        expect(isFunnelVariantEvent(name)).toBe(false);
      }),
      { numRuns: 20 },
    );
  });

  // ── Task 2.8 — Property 9: override fuerza + persiste con ON/ar ─────────────
  // **Validates: Requirements 10.1, 10.2**
  it('Property 9: override∈{A,B} con flag ON y ar ⇒ result=override y se persiste', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<FunnelVariant>('A', 'B'),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (override, r) => {
          const { storage, map } = makeMemStorage();
          const v = assignFunnelVariant(() => r, storage, true, 'ar', override);
          expect(v).toBe(override);
          expect(map.get(STORAGE_KEY)).toBe(override);
        },
      ),
      { numRuns: 200 },
    );
  });

  // ── Task 2.9 — Property 10: override ignorado con OFF/LATAM ─────────────────
  // **Validates: Requirements 10.3, 10.4**
  it('Property 10: flag OFF o version latam ⇒ override no cambia A ni persiste', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<FunnelVariant>('A', 'B'),
        fc.double({ min: 0, max: 1, noNaN: true }),
        // Combinación que desactiva el experimento: flag OFF, o LATAM (o ambos).
        fc.constantFrom<[boolean, 'ar' | 'latam']>(
          [false, 'ar'],
          [false, 'latam'],
          [true, 'latam'],
        ),
        (override, r, [flag, version]) => {
          const { storage, sets } = makeMemStorage();
          const v = assignFunnelVariant(() => r, storage, flag, version, override);
          expect(v).toBe('A');
          expect(sets).toHaveLength(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  // ── Property 11: af_preview (QA) flag-independiente, AR-only, no-persist ────
  // **Validates: Requirements 17.1, 17.2, 17.3, 17.5**
  it('Property 11: AR + af_preview∈{A,B} ⇒ esa variante para cualquier flag/storage, sin escribir ab_funnel_v1; LATAM ⇒ ignorado (A)', () => {
    const originalFlag = process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;

    /** Instala un window falso con la querystring dada y un localStorage que registra escrituras. */
    function installWindow(search: string, initial?: Record<string, string>) {
      const map = new Map<string, string>(Object.entries(initial ?? {}));
      const sets: Array<[string, string]> = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).window = {
        location: { search },
        localStorage: {
          getItem: (k: string) => (map.has(k) ? (map.get(k) as string) : null),
          setItem: (k: string, v: string) => {
            sets.push([k, v]);
            map.set(k, v);
          },
        },
      };
      return { sets };
    }

    try {
      // (a) AR: para cualquier flag y cualquier storage previo, af_preview gana
      //     y NUNCA escribe ab_funnel_v1.
      fc.assert(
        fc.property(
          fc.constantFrom<FunnelVariant>('A', 'B'),
          fc.boolean(),
          fc.option(fc.constantFrom('A', 'B', 'garbage'), { nil: undefined }),
          (preview, flagOn, stored) => {
            if (flagOn) process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
            else delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
            const init = stored !== undefined ? { [STORAGE_KEY]: stored } : undefined;
            const { sets } = installWindow(`?af_preview=${preview}`, init);
            expect(getFunnelVariant('ar')).toBe(preview);
            expect(peekFunnelVariant()).toBe(preview);
            // Nunca persiste la preview en la clave de asignación normal.
            expect(sets.some(([k]) => k === STORAGE_KEY)).toBe(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (globalThis as any).window;
          },
        ),
        { numRuns: 200 },
      );

      // (b) LATAM: af_preview se IGNORA → 'A' y no escribe ab_funnel_v1.
      fc.assert(
        fc.property(
          fc.constantFrom<FunnelVariant>('A', 'B'),
          fc.boolean(),
          (preview, flagOn) => {
            if (flagOn) process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = 'true';
            else delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
            const { sets } = installWindow(`?af_preview=${preview}`);
            expect(getFunnelVariant('latam')).toBe('A');
            expect(sets.some(([k]) => k === STORAGE_KEY)).toBe(false);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (globalThis as any).window;
          },
        ),
        { numRuns: 200 },
      );
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).window;
      if (originalFlag === undefined) delete process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED;
      else process.env.NEXT_PUBLIC_AB_FUNNEL_ENABLED = originalFlag;
    }
  });
});

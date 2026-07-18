import { describe, it, expect, afterEach } from 'vitest';
import fc from 'fast-check';
import {
  createEmptyPlanner,
  setCell,
  loadPlannerFromStorage,
  savePlannerToStorage,
  PLANNER_ROWS,
  PLANNER_DAYS,
  type PlannerData,
  type PlannerRowKey,
  type PlannerDayIndex,
} from './planner-state';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Feature: guias-vip-planner — núcleo puro del planner VIP (`planner-state.ts`).
 *
 * El entorno de vitest es `node` (sin DOM). `planner-state.ts` accede al global
 * `localStorage` directamente (tras chequear `typeof window`), así que mockeamos
 * tanto `window` como `localStorage` sobre el global cuando hace falta.
 *
 * Propiedades de correctitud cubiertas (design.md §B.8):
 *  - Task 6.3 → B2 (inmutabilidad de setCell) y B3 (forma fija)
 *  - Task 6.5 → B1 (round-trip), B4 (fail-safe), B5 (SSR-safe), B7 (no-op silencioso)
 */

// ── Claves de fila derivadas de la fuente única (PLANNER_ROWS) ──────────────
const ROW_KEYS: PlannerRowKey[] = PLANNER_ROWS.map((r) => r.key);
const DAYS_COUNT = PLANNER_DAYS.length; // 7

// ── Mock de localStorage sobre el global ────────────────────────────────────
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

function uninstallStorage() {
  const g = globalThis as unknown as { window?: unknown; localStorage?: unknown };
  delete g.window;
  delete g.localStorage;
}

afterEach(() => {
  uninstallStorage();
});

// ── Generadores fast-check ───────────────────────────────────────────────────

/** Una fila válida: exactamente 7 strings arbitrarios. */
const rowArb = fc.array(fc.string(), { minLength: DAYS_COUNT, maxLength: DAYS_COUNT });

/** Un PlannerData arbitrario y bien formado (todas las keys, 7 strings por fila). */
const plannerArb: fc.Arbitrary<PlannerData> = fc
  .tuple(...ROW_KEYS.map(() => rowArb))
  .map((rows) => {
    const data = {} as PlannerData;
    ROW_KEYS.forEach((key, i) => {
      data[key] = rows[i];
    });
    return data;
  });

const rowKeyArb = fc.constantFrom(...ROW_KEYS);
const dayArb = fc.integer({ min: 0, max: DAYS_COUNT - 1 }) as fc.Arbitrary<PlannerDayIndex>;

/** Asserta forma fija: todas las keys presentes y cada fila con 7 strings. */
function expectValidShape(data: PlannerData) {
  expect(Object.keys(data).sort()).toEqual([...ROW_KEYS].sort());
  for (const key of ROW_KEYS) {
    expect(Array.isArray(data[key])).toBe(true);
    expect(data[key]).toHaveLength(DAYS_COUNT);
    for (const cell of data[key]) {
      expect(typeof cell).toBe('string');
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Task 6.3 — createEmptyPlanner y setCell
// ─────────────────────────────────────────────────────────────────────────────
describe('planner-state — createEmptyPlanner & setCell (Task 6.3)', () => {
  // ── Propiedad B2 — Inmutabilidad de setCell ──────────────────────────────
  // **Validates: Requirements 6.4**
  it('B2: setCell no muta data (ni sus arrays internos) y solo cambia la celda objetivo', () => {
    fc.assert(
      fc.property(plannerArb, rowKeyArb, dayArb, fc.string(), (data, row, day, value) => {
        // Snapshot profundo del input para detectar cualquier mutación.
        const snapshot = JSON.parse(JSON.stringify(data)) as PlannerData;
        const rowRefsBefore = ROW_KEYS.map((k) => data[k]);

        const result = setCell(data, row, day, value);

        // 1) El input no fue mutado en absoluto.
        expect(data).toEqual(snapshot);
        // 1b) Las referencias de array internas del input siguen siendo las mismas
        //     (no se reemplazaron) y conservan su contenido original.
        ROW_KEYS.forEach((k, i) => {
          expect(data[k]).toBe(rowRefsBefore[i]);
          expect(data[k]).toEqual(snapshot[k]);
        });

        // 2) El resultado difiere SOLO en la celda objetivo.
        expect(result[row][day]).toBe(value);
        for (const k of ROW_KEYS) {
          for (let d = 0; d < DAYS_COUNT; d++) {
            if (k === row && d === day) continue;
            expect(result[k][d]).toBe(snapshot[k][d]);
          }
        }
      }),
      { numRuns: 200 },
    );
  });

  // ── Propiedad B3 — Forma fija (resultado de setCell) ─────────────────────
  // **Validates: Requirements 6.7, 10.2**
  it('B3: el resultado de setCell mantiene 7 entradas por fila con todas las keys', () => {
    fc.assert(
      fc.property(plannerArb, rowKeyArb, dayArb, fc.string(), (data, row, day, value) => {
        const result = setCell(data, row, day, value);
        expectValidShape(result);
      }),
      { numRuns: 200 },
    );
  });

  // ── Propiedad B3 — createEmptyPlanner: 8 filas × 7 vacíos ────────────────
  // **Validates: Requirements 10.2**
  it('B3: createEmptyPlanner produce 8 filas × 7 strings vacíos', () => {
    const empty = createEmptyPlanner();
    expect(ROW_KEYS).toHaveLength(8);
    expectValidShape(empty);
    for (const key of ROW_KEYS) {
      expect(empty[key]).toEqual(['', '', '', '', '', '', '']);
    }
  });

  // ── createEmptyPlanner: arrays independientes entre filas y entre llamadas ─
  // **Validates: Requirements 10.2**
  it('B3: createEmptyPlanner usa arrays independientes (mutar uno no afecta a otro)', () => {
    const planner = createEmptyPlanner();

    // Ninguna fila comparte referencia con otra.
    for (let i = 0; i < ROW_KEYS.length; i++) {
      for (let j = i + 1; j < ROW_KEYS.length; j++) {
        expect(planner[ROW_KEYS[i]]).not.toBe(planner[ROW_KEYS[j]]);
      }
    }

    // Mutar una fila no afecta a las demás.
    planner[ROW_KEYS[0]][0] = 'mutado';
    for (let j = 1; j < ROW_KEYS.length; j++) {
      expect(planner[ROW_KEYS[j]]).toEqual(['', '', '', '', '', '', '']);
    }

    // Dos llamadas devuelven estructuras independientes.
    const a = createEmptyPlanner();
    const b = createEmptyPlanner();
    a[ROW_KEYS[0]][0] = 'x';
    expect(b[ROW_KEYS[0]][0]).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Task 6.5 — loadPlannerFromStorage / savePlannerToStorage
// ─────────────────────────────────────────────────────────────────────────────
describe('planner-state — load/save robustez (Task 6.5)', () => {
  // ── Propiedad B1 — Round-trip de persistencia ────────────────────────────
  // **Validates: Requirements 8.3**
  it('B1: load(save(x)) devuelve las mismas celdas que x', () => {
    fc.assert(
      fc.property(plannerArb, (data) => {
        installStorage();
        savePlannerToStorage(data);
        const loaded = loadPlannerFromStorage();
        expect(loaded).toEqual(data);
        uninstallStorage();
      }),
      { numRuns: 200 },
    );
  });

  // ── Propiedad B4 — Fail-safe ante corrupción ─────────────────────────────
  // **Validates: Requirements 10.3**
  it('B4: ante strings arbitrarios en storage, load nunca lanza y devuelve forma válida', () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        installStorage({ [STORAGE_KEYS.vipPlanner]: raw });
        let result: PlannerData | undefined;
        expect(() => {
          result = loadPlannerFromStorage();
        }).not.toThrow();
        expectValidShape(result as PlannerData);
        uninstallStorage();
      }),
      { numRuns: 300 },
    );
  });

  // ── Propiedad B4 — Fail-safe ante JSON con shape arbitrario ──────────────
  // **Validates: Requirements 10.3**
  it('B4: ante JSON con shape arbitrario, load devuelve forma válida sin lanzar', () => {
    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        installStorage({ [STORAGE_KEYS.vipPlanner]: JSON.stringify(value) });
        let result: PlannerData | undefined;
        expect(() => {
          result = loadPlannerFromStorage();
        }).not.toThrow();
        expectValidShape(result as PlannerData);
        uninstallStorage();
      }),
      { numRuns: 300 },
    );
  });

  // ── Propiedad B5 — SSR-safe ───────────────────────────────────────────────
  // **Validates: Requirements 10.1**
  it('B5: sin window (SSR), load devuelve planner vacío y save es no-op, sin lanzar', () => {
    fc.assert(
      fc.property(plannerArb, (data) => {
        uninstallStorage(); // garantiza window/localStorage ausentes
        let loaded: PlannerData | undefined;
        expect(() => {
          loaded = loadPlannerFromStorage();
        }).not.toThrow();
        expect(loaded).toEqual(createEmptyPlanner());
        // save no debe lanzar ni intentar tocar storage.
        expect(() => savePlannerToStorage(data)).not.toThrow();
      }),
      { numRuns: 100 },
    );
  });

  // ── Propiedad B7 — No-op silencioso si localStorage.setItem lanza ─────────
  // **Validates: Requirements 10.4**
  it('B7: si localStorage.setItem lanza (cuota), save no propaga la excepción', () => {
    fc.assert(
      fc.property(plannerArb, (data) => {
        const throwingStorage = {
          getItem: () => null,
          setItem: () => {
            throw new Error('QuotaExceededError');
          },
          removeItem: () => {},
          clear: () => {},
        };
        const g = globalThis as unknown as { window?: unknown; localStorage?: unknown };
        g.window = { localStorage: throwingStorage };
        g.localStorage = throwingStorage;

        expect(() => savePlannerToStorage(data)).not.toThrow();

        uninstallStorage();
      }),
      { numRuns: 100 },
    );
  });
});

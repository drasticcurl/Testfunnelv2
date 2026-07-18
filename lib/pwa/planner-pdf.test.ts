import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';

/**
 * Feature: guias-vip-planner
 * Task 7.3 — Test de PDF independiente del estado.
 *
 * Property B6 — PDF independiente del estado:
 *   La salida de `generateBlankPlannerPdf()` NO depende de `PlannerData` ni de
 *   `localStorage`. Para cualquier estado del usuario, las llamadas de
 *   construcción del PDF (orientación, head, body) y el nombre de archivo son
 *   IDÉNTICAS: siempre la misma plantilla en blanco.
 *
 * **Validates: Requirements 9.2, 9.3, 9.4**
 *
 * Estrategia: mockear `jspdf` y `jspdf-autotable` (que `generateBlankPlannerPdf`
 * importa de forma DINÁMICA con `await import(...)`) para capturar:
 *   - los argumentos del constructor `new jsPDF({ orientation: 'landscape' })`,
 *   - la llamada `autoTable(doc, { head, body, ... })`,
 *   - la llamada `doc.save('planner-semanal-chau-hinchazon.pdf')`.
 * Luego, con un `localStorage` espiado y para cualquier `PlannerData` arbitrario,
 * verificamos que esas llamadas son constantes y que NUNCA se lee el estado.
 */

// ── Mocks hoisted (compartidos con los vi.mock, que se elevan al top) ────────
const {
  jsPDFConstructorCalls,
  autoTableCalls,
  saveCalls,
  textCalls,
  JsPDFMock,
  autoTableMock,
} = vi.hoisted(() => {
  const jsPDFConstructorCalls: unknown[] = [];
  const autoTableCalls: Array<{ doc: unknown; options: Record<string, unknown> }> = [];
  const saveCalls: string[] = [];
  const textCalls: unknown[] = [];

  class JsPDFMock {
    constructor(opts?: unknown) {
      jsPDFConstructorCalls.push(opts);
    }
    setFontSize(_size: number): void {}
    text(...args: unknown[]): void {
      textCalls.push(args);
    }
    save(filename: string): void {
      saveCalls.push(filename);
    }
  }

  const autoTableMock = (doc: unknown, options: Record<string, unknown>): void => {
    autoTableCalls.push({ doc, options });
  };

  return { jsPDFConstructorCalls, autoTableCalls, saveCalls, textCalls, JsPDFMock, autoTableMock };
});

// `generateBlankPlannerPdf` usa `const { jsPDF } = await import('jspdf')`.
vi.mock('jspdf', () => ({ jsPDF: JsPDFMock, default: JsPDFMock }));
// y `const { default: autoTable } = await import('jspdf-autotable')`.
vi.mock('jspdf-autotable', () => ({ default: autoTableMock }));

import { generateBlankPlannerPdf } from './planner-pdf';
import { PLANNER_DAYS, PLANNER_ROWS, type PlannerData, type PlannerRowKey } from './planner-state';

const EXPECTED_FILENAME = 'planner-semanal-chau-hinchazon.pdf';
const EXPECTED_HEAD = [['', ...PLANNER_DAYS]];
const EXPECTED_BODY = PLANNER_ROWS.map((row) => [row.label, '', '', '', '', '', '', '']);

const ROW_KEYS: PlannerRowKey[] = PLANNER_ROWS.map((r) => r.key);

/** Arbitrario de `PlannerData`: 8 filas, 7 celdas de string por fila. */
const plannerDataArb: fc.Arbitrary<PlannerData> = fc
  .tuple(...ROW_KEYS.map(() => fc.array(fc.string(), { minLength: 7, maxLength: 7 })))
  .map((rows) => {
    const data = {} as PlannerData;
    ROW_KEYS.forEach((key, i) => {
      data[key] = rows[i];
    });
    return data;
  });

function resetCaptures(): void {
  jsPDFConstructorCalls.length = 0;
  autoTableCalls.length = 0;
  saveCalls.length = 0;
  textCalls.length = 0;
}

/**
 * Instala un `localStorage` global espiado que devuelve `rawValue` en getItem.
 * Devuelve los spies para asertar que NUNCA se leyó/escribió.
 */
function installSpyStorage(rawValue: string | null) {
  const getItem = vi.fn(() => rawValue);
  const setItem = vi.fn();
  const removeItem = vi.fn();
  // @ts-expect-error — inyectamos un localStorage de prueba en el entorno node.
  globalThis.localStorage = { getItem, setItem, removeItem, clear: vi.fn(), key: vi.fn(), length: 0 };
  return { getItem, setItem, removeItem };
}

describe('generateBlankPlannerPdf — Property B6: PDF independiente del estado', () => {
  beforeEach(() => {
    resetCaptures();
    // @ts-expect-error — limpiar entre tests.
    delete globalThis.localStorage;
  });

  // ── Caso base / unit test ────────────────────────────────────────────────
  it('construye siempre la misma plantilla en blanco (landscape, head, body, filename)', async () => {
    await generateBlankPlannerPdf();

    // Constructor con orientación landscape, exactamente una vez.
    expect(jsPDFConstructorCalls).toEqual([{ orientation: 'landscape' }]);

    // Una sola tabla, con head = ['', ...días] y body = filas con celdas vacías.
    expect(autoTableCalls).toHaveLength(1);
    expect(autoTableCalls[0].options.head).toEqual(EXPECTED_HEAD);
    expect(autoTableCalls[0].options.body).toEqual(EXPECTED_BODY);

    // Nombre de archivo constante.
    expect(saveCalls).toEqual([EXPECTED_FILENAME]);

    // El body NO contiene ningún dato de usuario: todas las celdas de datos vacías.
    for (const row of autoTableCalls[0].options.body as string[][]) {
      expect(row.slice(1)).toEqual(['', '', '', '', '', '', '']);
    }
  });

  // ── Property: salida idéntica e independiente de PlannerData / localStorage ─
  it('∀ PlannerData y ∀ estado de localStorage: las llamadas de PDF son idénticas y no leen el estado', async () => {
    await fc.assert(
      fc.asyncProperty(plannerDataArb, fc.string(), async (plannerData, rawStorage) => {
        resetCaptures();
        const { getItem, setItem } = installSpyStorage(rawStorage);

        // La función no recibe `plannerData`: lo generamos para demostrar que,
        // exista lo que exista en estado/almacenamiento, la salida no cambia.
        void plannerData;

        await generateBlankPlannerPdf();

        // Independencia del estado: NUNCA se lee ni escribe localStorage.
        expect(getItem).not.toHaveBeenCalled();
        expect(setItem).not.toHaveBeenCalled();

        // Orientación landscape constante.
        expect(jsPDFConstructorCalls).toEqual([{ orientation: 'landscape' }]);

        // head/body idénticos a la plantilla en blanco esperada.
        expect(autoTableCalls).toHaveLength(1);
        expect(autoTableCalls[0].options.head).toEqual(EXPECTED_HEAD);
        expect(autoTableCalls[0].options.body).toEqual(EXPECTED_BODY);

        // Nombre de archivo constante.
        expect(saveCalls).toEqual([EXPECTED_FILENAME]);
      }),
      { numRuns: 100 },
    );
  });

  // ── Property: dos ejecuciones cualesquiera producen llamadas byte-idénticas ─
  it('dos estados distintos producen exactamente las mismas llamadas de construcción', async () => {
    await fc.assert(
      fc.asyncProperty(plannerDataArb, plannerDataArb, async (dataA, dataB) => {
        void dataA;
        void dataB;

        resetCaptures();
        installSpyStorage(JSON.stringify({ version: 1, data: dataA }));
        await generateBlankPlannerPdf();
        const snapshotA = {
          ctor: structuredClone(jsPDFConstructorCalls),
          head: structuredClone(autoTableCalls[0].options.head),
          body: structuredClone(autoTableCalls[0].options.body),
          save: structuredClone(saveCalls),
        };

        resetCaptures();
        installSpyStorage(JSON.stringify({ version: 1, data: dataB }));
        await generateBlankPlannerPdf();
        const snapshotB = {
          ctor: structuredClone(jsPDFConstructorCalls),
          head: structuredClone(autoTableCalls[0].options.head),
          body: structuredClone(autoTableCalls[0].options.body),
          save: structuredClone(saveCalls),
        };

        expect(snapshotA).toEqual(snapshotB);
      }),
      { numRuns: 50 },
    );
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import fc from 'fast-check';

// Forzamos el backend en memoria antes de importar el store.
process.env.FUNNEL_STORE = 'memory';

import { getStore, __resetStoreSingleton, selectSlides } from './store';
import type { StoredQuizVersion } from './store';
import { slidesV3 } from '@/lib/quiz-v2/data';
import { slidesV3Latam } from '@/lib/quiz-v2/data-latam';

/**
 * Acceso directo al Map de contadores del MemoryStore para sembrar filas
 * "históricas" (incluido el bucket 'v1', que la API track() ya no produce).
 * El formato de key replica el de makeKey() en store.ts:
 *   event|slide|src|med|camp|content|version|country|day
 */
function counters(): Map<string, number> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (globalThis as any).__funnelStore.counters as Map<string, number>;
}

function seedStarts(version: StoredQuizVersion, n: number, day = '2024-01-01') {
  const key = `QuizProgress|0|(directo)|(directo)|(directo)|(directo)|${version}|(desconocido)|${day}`;
  counters().set(key, (counters().get(key) ?? 0) + n);
}

async function resetStore() {
  __resetStoreSingleton();
  await getStore().reset();
}

beforeEach(async () => {
  await resetStore();
});

describe('selectSlides (Task 4.3 — Property 5: Slides por vista)', () => {
  // **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  it("'latam' → slidesV3Latam", () => {
    expect(selectSlides('latam')).toBe(slidesV3Latam);
  });
  it("'ar' → slidesV3", () => {
    expect(selectSlides('ar')).toBe(slidesV3);
  });
  it('undefined (unificado) → slidesV3', () => {
    expect(selectSlides(undefined)).toBe(slidesV3);
  });
  it('nunca confunde las listas por vista (AR ≠ LATAM)', () => {
    // Lo importante es que NUNCA se elija slidesV3Latam para 'ar'/unificado ni
    // slidesV3 para 'latam'.
    expect(selectSlides('latam')).not.toBe(slidesV3);
    expect(selectSlides('ar')).not.toBe(slidesV3Latam);
  });
});

describe('MemoryStore compat (Task 3.3 — Property 6: Compat preservada)', () => {
  // **Validates: Requirements 3.1, 3.2**
  it("track(evt, { quizVersion: 'v3' }) se contabiliza como 'ar'", async () => {
    const store = getStore();
    await store.track('QuizProgress', { slide: 0, quizVersion: 'v3' });

    const ar = await store.getFunnel({ version: 'ar' });
    const latam = await store.getFunnel({ version: 'latam' });

    expect(ar.totalStarts).toBe(1);
    expect(latam.totalStarts).toBe(0);
  });

  it("track(evt, { quizVersion: 'latam' }) se contabiliza como 'latam'", async () => {
    const store = getStore();
    await store.track('QuizProgress', { slide: 0, quizVersion: 'latam' });

    const ar = await store.getFunnel({ version: 'ar' });
    const latam = await store.getFunnel({ version: 'latam' });

    expect(latam.totalStarts).toBe(1);
    expect(ar.totalStarts).toBe(0);
  });

  it("track sin quizVersion (undefined) se contabiliza como 'ar'", async () => {
    const store = getStore();
    await store.track('QuizProgress', { slide: 0 });
    const ar = await store.getFunnel({ version: 'ar' });
    expect(ar.totalStarts).toBe(1);
  });
});

describe('computeFunnel filtrado por versión (Task 4.4 — Property 3: Filtro correcto)', () => {
  // **Validates: Requirements 5.1, 5.2**
  it('getFunnel({version:v}) no incluye filas con quiz_version ≠ v', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.nat({ max: 50 }),
        fc.nat({ max: 50 }),
        fc.nat({ max: 50 }),
        async (arStarts, latamStarts, v1Starts) => {
          await resetStore();
          if (arStarts > 0) seedStarts('ar', arStarts);
          if (latamStarts > 0) seedStarts('latam', latamStarts);
          if (v1Starts > 0) seedStarts('v1', v1Starts);

          const store = getStore();
          const ar = await store.getFunnel({ version: 'ar' });
          const latam = await store.getFunnel({ version: 'latam' });

          // El filtro 'ar' solo cuenta AR; 'latam' solo cuenta LATAM.
          expect(ar.totalStarts).toBe(arStarts);
          expect(latam.totalStarts).toBe(latamStarts);
        },
      ),
    );
  });
});

describe('computeFunnel unificado (Task 4.5 — Property 4: Unificado = suma)', () => {
  // **Validates: Requirements 5.3, 5.6**
  it('totalStarts(unificado) = ar + latam + v1', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.nat({ max: 50 }),
        fc.nat({ max: 50 }),
        fc.nat({ max: 50 }),
        async (arStarts, latamStarts, v1Starts) => {
          await resetStore();
          if (arStarts > 0) seedStarts('ar', arStarts);
          if (latamStarts > 0) seedStarts('latam', latamStarts);
          if (v1Starts > 0) seedStarts('v1', v1Starts);

          const store = getStore();
          const unified = await store.getFunnel({});

          expect(unified.totalStarts).toBe(arStarts + latamStarts + v1Starts);
        },
      ),
    );
  });
});


describe('FunnelData shape — Property 8: compat preservada salvo salesVariantBreakdown', () => {
  // **Validates: Requirements 6.2, 6.3**
  it('getFunnel NO expone salesVariantBreakdown y SÍ expone variantBreakdown', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.nat({ max: 50 }),
        fc.nat({ max: 50 }),
        async (arStarts, latamStarts) => {
          await resetStore();
          if (arStarts > 0) seedStarts('ar', arStarts);
          if (latamStarts > 0) seedStarts('latam', latamStarts);

          const store = getStore();
          for (const filters of [{}, { version: 'ar' as const }, { version: 'latam' as const }]) {
            const data = await store.getFunnel(filters);
            // El campo del test de sales ya no existe en el modelo.
            expect('salesVariantBreakdown' in data).toBe(false);
            // El test de entrada (variantBreakdown) sigue presente.
            expect('variantBreakdown' in data).toBe(true);
            expect(Array.isArray(data.variantBreakdown)).toBe(true);
          }
        },
      ),
    );
  });
});

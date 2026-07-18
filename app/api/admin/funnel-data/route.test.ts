import { describe, it, expect, beforeEach } from 'vitest';

// Forzamos el backend en memoria antes de importar el store.
process.env.FUNNEL_STORE = 'memory';

import { getStore, __resetStoreSingleton } from '@/lib/admin/store';
import type { StoredQuizVersion } from '@/lib/admin/store';

/**
 * Resuelve el query param `?version` igual que el GET de funnel-data:
 * solo 'ar'|'latam' son válidos; cualquier otro valor (o ausencia) => undefined
 * (vista Unificada).
 */
function resolveVersionParam(raw: string | null): 'ar' | 'latam' | undefined {
  return raw === 'ar' || raw === 'latam' ? raw : undefined;
}

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

describe('funnel-data — aislamiento y suma por versión (Properties 2 y 3)', () => {
  // **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
  it('AR / LATAM / Unificado devuelven datos aislados y el unificado suma', async () => {
    seedStarts('ar', 7);
    seedStarts('latam', 3);
    seedStarts('v1', 5); // histórico, solo visible en unificado

    const store = getStore();
    const ar = await store.getFunnel({ version: 'ar' });
    const latam = await store.getFunnel({ version: 'latam' });
    const unified = await store.getFunnel({});

    expect(ar.totalStarts).toBe(7);
    expect(latam.totalStarts).toBe(3);
    expect(unified.totalStarts).toBe(7 + 3 + 5);
  });

  it('version inválido se trata como unificado (todas las filas)', async () => {
    seedStarts('ar', 4);
    seedStarts('latam', 6);

    // Param parsing: cualquier valor inválido => undefined.
    expect(resolveVersionParam('xyz')).toBeUndefined();
    expect(resolveVersionParam(null)).toBeUndefined();
    expect(resolveVersionParam('v3')).toBeUndefined();
    expect(resolveVersionParam('ar')).toBe('ar');
    expect(resolveVersionParam('latam')).toBe('latam');

    const store = getStore();
    const unified = await store.getFunnel({ version: resolveVersionParam('xyz') });
    expect(unified.totalStarts).toBe(10);
  });

  it('el filtro de versión se combina con el filtro por día', async () => {
    seedStarts('ar', 2, '2024-01-01');
    seedStarts('ar', 9, '2024-01-02');
    seedStarts('latam', 4, '2024-01-01');

    const store = getStore();
    const arDay1 = await store.getFunnel({ version: 'ar', day: '2024-01-01' });
    const arDay2 = await store.getFunnel({ version: 'ar', day: '2024-01-02' });
    const latamDay1 = await store.getFunnel({ version: 'latam', day: '2024-01-01' });

    expect(arDay1.totalStarts).toBe(2);
    expect(arDay2.totalStarts).toBe(9);
    expect(latamDay1.totalStarts).toBe(4);
  });

  it('el filtro de versión se combina con el filtro por rango', async () => {
    seedStarts('ar', 2, '2024-01-01');
    seedStarts('ar', 9, '2024-01-05');
    seedStarts('ar', 1, '2024-01-20');

    const store = getStore();
    const arRange = await store.getFunnel({ version: 'ar', from: '2024-01-01', to: '2024-01-10' });
    expect(arRange.totalStarts).toBe(2 + 9);
  });
});

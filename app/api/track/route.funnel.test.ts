import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Backend en memoria antes de importar el store/route.
process.env.FUNNEL_STORE = 'memory';

// Mock de Meta CAPI: spy para verificar que af_* NO se reenvía a CAPI.
const sendCapiEventMock = vi.fn((..._args: unknown[]) => Promise.resolve({ ok: false, reason: 'env_missing' }));
vi.mock('@/lib/tracking', () => ({
  sendCapiEvent: (...args: unknown[]) => sendCapiEventMock(...args),
  getMetaCookiesFromRequest: () => ({ fbc: undefined, fbp: undefined }),
}));

// Mock de Supabase: el lead tiene funnel_variant 'B' (puente por email).
const getSupabaseMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  getSupabase: () => getSupabaseMock(),
}));

import { POST } from './route';
import { getStore, __resetStoreSingleton } from '@/lib/admin/store';

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Cliente Supabase falso que devuelve funnel_variant='B' para la query de bridge. */
function fakeSupabaseWithVariant(variant: string | null) {
  return {
    from() {
      const chain = {
        _cols: '',
        select(cols: string) {
          this._cols = cols;
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle() {
          if (this._cols.includes('funnel_variant')) {
            return Promise.resolve({ data: { funnel_variant: variant } });
          }
          return Promise.resolve({ data: { fbc: null, fbp: null } });
        },
      };
      return chain;
    },
  };
}

beforeEach(async () => {
  __resetStoreSingleton();
  await getStore().reset();
  sendCapiEventMock.mockClear();
  getSupabaseMock.mockReset();
  getSupabaseMock.mockReturnValue(null);
});

describe('POST /api/track — eventos del test full-funnel (af_*)', () => {
  it('registra af_<V>_* en el store y corta antes de CAPI (Req 12.5, 12.6)', async () => {
    const res = await POST(makeReq({ event: 'af_B_quiz_start', custom: { quiz_version: 'ar' } }));
    const json = await res.json();
    expect(json).toEqual({ ok: true, internal: true });
    // NO se reenvió a Meta CAPI.
    expect(sendCapiEventMock).not.toHaveBeenCalled();
    // Quedó registrado en el store (breakdown B.quizStarts === 1).
    const data = await getStore().getFunnel({ version: 'ar' });
    const rowB = data.funnelVariantBreakdown.find((r) => r.variant === 'B');
    expect(rowB?.quizStarts).toBe(1);
  });

  it('un evento normal (no af_) SÍ se reenvía a CAPI', async () => {
    await POST(makeReq({ event: 'ViewContent', custom: { quiz_version: 'ar' } }));
    expect(sendCapiEventMock).toHaveBeenCalledTimes(1);
  });

  it('Purchase con lead que tiene funnel_variant=B ⇒ registra af_B_purchase (Req 13.3)', async () => {
    getSupabaseMock.mockReturnValue(fakeSupabaseWithVariant('B'));
    await POST(makeReq({ event: 'Purchase', email: 'comprador@example.com', value: 8000, custom: { quiz_version: 'ar' } }));
    const data = await getStore().getFunnel({ version: 'ar' });
    const rowB = data.funnelVariantBreakdown.find((r) => r.variant === 'B');
    expect(rowB?.purchases).toBe(1);
  });

  it('Purchase sin funnel_variant ⇒ no se atribuye a ninguna variante (solo totales)', async () => {
    getSupabaseMock.mockReturnValue(fakeSupabaseWithVariant(null));
    await POST(makeReq({ event: 'Purchase', email: 'comprador@example.com', value: 8000, custom: { quiz_version: 'ar' } }));
    const data = await getStore().getFunnel({ version: 'ar' });
    // Sin eventos af_* ⇒ breakdown vacío; pero el Purchase genérico sí se contó.
    expect(data.funnelVariantBreakdown).toEqual([]);
    expect(data.totalSales).toBe(1);
  });
});

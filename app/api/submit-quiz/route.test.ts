import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mocks de integraciones externas (no queremos red ni Supabase real).
vi.mock('@/lib/tracking', () => ({
  sendCapiEvent: vi.fn(async () => ({ ok: true })),
  upsertSystemeContact: vi.fn(async () => ({ ok: true })),
  getMetaCookiesFromRequest: () => ({ fbc: undefined, fbp: undefined }),
}));
vi.mock('@/lib/email/resend', () => ({
  sendDiagnosticoEmail: vi.fn(async () => ({ ok: false })),
}));

const getSupabaseMock = vi.fn();
vi.mock('@/lib/supabase', () => ({
  getSupabase: () => getSupabaseMock(),
}));

import { POST } from './route';

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/submit-quiz', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Cliente Supabase falso: `upsert` delega en `impl` (captura row + opts). */
function makeClient(impl: (row: Record<string, unknown>, opts: unknown) => Promise<{ error: unknown }>) {
  return {
    from: () => ({
      upsert: (row: Record<string, unknown>, opts: unknown) => impl(row, opts),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
    }),
  };
}

const LEAD = {
  email: 'lead@example.com',
  nombre: 'Ana',
  funnel_variant: 'B',
  sintomas: ['hinchazon'],
};

beforeEach(() => {
  getSupabaseMock.mockReset();
});

describe('POST /api/submit-quiz — persistencia de funnel_variant', () => {
  it('persiste funnel_variant cuando viene en el body (Req 13.1)', async () => {
    const upsert = vi.fn((_row: Record<string, unknown>, _opts: unknown) => Promise.resolve({ error: null as unknown }));
    getSupabaseMock.mockReturnValue(makeClient(upsert));

    const res = await POST(makeReq(LEAD));
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.integrations.supabase).toBe('sent');

    expect(upsert).toHaveBeenCalledTimes(1);
    const row = upsert.mock.calls[0][0] as Record<string, unknown>;
    expect(row.funnel_variant).toBe('B');
    expect(row.email).toBe('lead@example.com');
  });

  it('si la columna funnel_variant no existe, NO falla: reintenta sin ella (Req 16.3)', async () => {
    const upsert = vi
      .fn<(row: Record<string, unknown>, opts: unknown) => Promise<{ error: unknown }>>()
      // 1er intento (con funnel_variant): error de columna ausente.
      .mockResolvedValueOnce({ error: { message: 'column clientes.funnel_variant does not exist' } })
      // reintento (sin funnel_variant): ok.
      .mockResolvedValueOnce({ error: null });
    getSupabaseMock.mockReturnValue(makeClient(upsert));

    const res = await POST(makeReq(LEAD));
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.integrations.supabase).toBe('sent');

    expect(upsert).toHaveBeenCalledTimes(2);
    // El reintento NO incluye funnel_variant (para que el lead se guarde igual).
    const retryRow = upsert.mock.calls[1][0] as Record<string, unknown>;
    expect('funnel_variant' in retryRow).toBe(false);
    expect(retryRow.email).toBe('lead@example.com');
  });

  it('sin funnel_variant en el body, el upsert no incluye la columna', async () => {
    const upsert = vi.fn((_row: Record<string, unknown>, _opts: unknown) => Promise.resolve({ error: null as unknown }));
    getSupabaseMock.mockReturnValue(makeClient(upsert));

    const { funnel_variant, ...noVariant } = LEAD;
    void funnel_variant;
    await POST(makeReq(noVariant));

    const row = upsert.mock.calls[0][0] as Record<string, unknown>;
    expect('funnel_variant' in row).toBe(false);
  });
});

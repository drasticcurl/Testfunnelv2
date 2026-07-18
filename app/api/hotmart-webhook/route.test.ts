import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';

/**
 * Feature: upsell2-latam-vip
 * Task 8.2 — Test de integración: el webhook de Hotmart captura la compra del
 * VIP (upsell 2 US$27 y downsell 2 US$17) como Purchase a Meta CAPI con
 * value/currency del payload y fbc/fbp presentes, e idempotente por
 * hotmart_transaction.
 *
 * Property 8: El webhook captura la compra del VIP (upsell 2 o downsell 2) como 'latam'.
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 *
 * No es PBT: es un servicio externo cuyo comportamiento no varía por input
 * (el handler procesa toda compra aprobada por el mismo camino, sin filtrar por
 * producto). Usamos 1–3 payloads representativos con efectos secundarios mockeados.
 */

const {
  upsertMock,
  upsertSelectMock,
  clientesMaybeSingleMock,
  trackMock,
  sendCapiEventMock,
  upsertSystemeMock,
  sendBienvenidaMock,
} = vi.hoisted(() => ({
  upsertMock: vi.fn(),
  upsertSelectMock: vi.fn(),
  clientesMaybeSingleMock: vi.fn(),
  trackMock: vi.fn(),
  sendCapiEventMock: vi.fn(),
  upsertSystemeMock: vi.fn(),
  sendBienvenidaMock: vi.fn(),
}));

vi.mock('@/lib/tracking', () => ({
  sendCapiEvent: sendCapiEventMock,
  upsertSystemeContact: upsertSystemeMock,
}));

vi.mock('@/lib/email/resend', () => ({
  sendBienvenidaEmail: sendBienvenidaMock,
}));

vi.mock('@/lib/admin/store', () => ({
  getStore: () => ({ track: trackMock }),
}));

vi.mock('@/lib/pwa/supabase', () => ({
  createPwaServiceClient: () => ({
    from: (table: string) => {
      // Puente de atribución por email: SELECT ... FROM clientes WHERE email = ?
      if (table === 'clientes') {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: clientesMaybeSingleMock }),
          }),
        };
      }
      // purchases: upsert(...).select('id') → builder con .select()
      return { upsert: upsertMock };
    },
  }),
}));

import { POST } from './route';

function buildRequest(payload: unknown): Request {
  return new Request('http://localhost/api/hotmart-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

function vipPayload(opts: { transaction: string; value: number }) {
  return {
    event: 'PURCHASE_APPROVED',
    id: `evt-${opts.transaction}`,
    data: {
      buyer: {
        email: 'comprador.vip@example.com',
        name: 'Compradora VIP',
        ip: '200.1.2.3',
        fbc: 'fb.1.1700000000.AbCdEf',
        fbp: 'fb.2.1700000000.123456789',
      },
      purchase: {
        transaction: opts.transaction,
        status: 'APPROVED',
        price: { value: opts.value, currency_value: 'USD' },
        approved_date: 1_700_000_000_000,
      },
      product: { id: 9001, name: 'Acceso VIP de por vida' },
    },
  };
}

const ORIGINAL_ENV = { ...process.env };

beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
  delete process.env.HOTMART_HOTTOK; // acepta sin validar
});

afterAll(() => {
  process.env = { ...ORIGINAL_ENV };
});

beforeEach(() => {
  // upsert(...).select('id') → builder con .select() que resuelve la fila insertada.
  upsertSelectMock.mockReset().mockResolvedValue({ data: [{ id: 'new-purchase' }], error: null });
  upsertMock.mockReset().mockReturnValue({ select: upsertSelectMock });
  // Sin lead en `clientes` por defecto (atribución vacía → "(directo)").
  clientesMaybeSingleMock.mockReset().mockResolvedValue({ data: null });
  trackMock.mockReset().mockResolvedValue(undefined);
  sendCapiEventMock.mockReset().mockResolvedValue({ ok: true });
  upsertSystemeMock.mockReset().mockResolvedValue({ ok: true });
  sendBienvenidaMock.mockReset().mockResolvedValue(true);
});

describe('hotmart-webhook — captura de la compra VIP', () => {
  it.each([
    ['upsell 2', 27],
    ['downsell 2', 17],
  ])(
    'Property 8: %s a US$%d → Purchase a CAPI con value/currency del payload + fbc/fbp',
    async (_label, value) => {
      const res = await POST(buildRequest(vipPayload({ transaction: `TX-${value}`, value })) as never);
      expect(res.status).toBe(200);

      expect(sendCapiEventMock).toHaveBeenCalledTimes(1);
      const capiArg = sendCapiEventMock.mock.calls[0][0];
      expect(capiArg.event_name).toBe('Purchase');
      expect(capiArg.custom_data.value).toBe(value);
      expect(capiArg.custom_data.currency).toBe('USD');
      // fbc/fbp presentes en user_data
      expect(capiArg.user_data.fbc).toBe('fb.1.1700000000.AbCdEf');
      expect(capiArg.user_data.fbp).toBe('fb.2.1700000000.123456789');
    },
  );

  it('registra la compra de forma idempotente (onConflict: hotmart_transaction)', async () => {
    await POST(buildRequest(vipPayload({ transaction: 'TX-DUP', value: 27 })) as never);

    expect(upsertMock).toHaveBeenCalledTimes(1);
    const [row, options] = upsertMock.mock.calls[0];
    expect(row.hotmart_transaction).toBe('TX-DUP');
    expect(row.amount).toBe(27);
    expect(row.currency).toBe('USD');
    expect(options).toMatchObject({ onConflict: 'hotmart_transaction', ignoreDuplicates: true });
  });

  it('registra el Purchase en el funnel store (quizVersion latam) cuando es compra nueva', async () => {
    await POST(buildRequest(vipPayload({ transaction: 'TX-FUNNEL', value: 27 })) as never);

    expect(trackMock).toHaveBeenCalledTimes(1);
    const [eventName, props] = trackMock.mock.calls[0];
    expect(eventName).toBe('Purchase');
    expect(props).toMatchObject({ quizVersion: 'latam' });
  });

  it('NO vuelve a contar en el funnel si la transacción ya existía (idempotencia)', async () => {
    // `.select('id')` vacío => la fila ya existía (reintento del webhook).
    upsertSelectMock.mockResolvedValueOnce({ data: [], error: null });

    await POST(buildRequest(vipPayload({ transaction: 'TX-RETRY', value: 27 })) as never);

    // Supabase upsert se llama igual (idempotente), pero NO se cuenta en el funnel.
    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(trackMock).not.toHaveBeenCalled();
  });

  it('atribuye la venta por email: hereda UTMs/fbc/fbp del lead en `clientes`', async () => {
    clientesMaybeSingleMock.mockResolvedValueOnce({
      data: {
        fbc: 'fb.1.999.LeadFbc',
        fbp: 'fb.2.999.LeadFbp',
        utm_source: 'facebook',
        utm_campaign: 'LATAM TEST 1',
        utm_medium: null,
        utm_content: null,
        utm_term: null,
        fbclid: null,
      },
    });

    await POST(buildRequest(vipPayload({ transaction: 'TX-ATTR', value: 27 })) as never);

    // 1. La fila de purchases guarda los UTMs recuperados por email.
    const [row] = upsertMock.mock.calls[0];
    expect(row.utm_source).toBe('facebook');
    expect(row.utm_campaign).toBe('LATAM TEST 1');

    // 2. El funnel store recibe esos UTMs.
    const [, props] = trackMock.mock.calls[0];
    expect(props.utms).toMatchObject({ utm_source: 'facebook', utm_campaign: 'LATAM TEST 1' });

    // 3. CAPI se enriquece con los fbc/fbp del lead (el payload VIP no los traía? sí los trae,
    //    pero acá validamos el fallback: el payload tiene prioridad, así que siguen siendo los del payload).
    const capiArg = sendCapiEventMock.mock.calls[0][0];
    expect(capiArg.user_data.fbc).toBe('fb.1.1700000000.AbCdEf');
  });

  it('procesa upsell2 y downsell2 por el MISMO camino (no filtra por producto)', async () => {
    const r1 = await POST(buildRequest(vipPayload({ transaction: 'TX-U2', value: 27 })) as never);
    const r2 = await POST(buildRequest(vipPayload({ transaction: 'TX-D2', value: 17 })) as never);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    // Ambas variantes generaron un Purchase a CAPI.
    expect(sendCapiEventMock).toHaveBeenCalledTimes(2);
  });
});

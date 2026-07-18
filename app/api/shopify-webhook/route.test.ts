import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Backend en memoria + sin Supabase (skip DB, isNewPurchase=true → cuenta funnel).
process.env.FUNNEL_STORE = 'memory';
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SHOPIFY_WEBHOOK_SECRETS;
delete process.env.SHOPIFY_WEBHOOK_SECRET;

vi.mock('@/lib/tracking', () => ({
  sendCapiEvent: vi.fn(async () => ({ ok: true })),
}));

import { POST } from './route';
import { getStore, __resetStoreSingleton } from '@/lib/admin/store';

function makeOrderReq(order: unknown, topic = 'orders/paid'): NextRequest {
  return new NextRequest('http://localhost/api/shopify-webhook', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-shopify-topic': topic,
      'x-shopify-shop-domain': 'test.myshopify.com',
    },
    body: JSON.stringify(order),
  });
}

async function purchasesFor(variant: 'A' | 'B'): Promise<number> {
  const data = await getStore().getFunnel({ version: 'ar' });
  return data.funnelVariantBreakdown.find((r) => r.variant === variant)?.purchases ?? 0;
}

beforeEach(async () => {
  __resetStoreSingleton();
  await getStore().reset();
});

describe('shopify-webhook — atribución de compra al test full-funnel', () => {
  it('parsea funnel_variant de note_attributes y registra af_B_purchase (Req 13.5)', async () => {
    const order = {
      id: 1001,
      email: 'buyer@example.com',
      financial_status: 'paid',
      total_price: '14900',
      currency: 'ARS',
      note_attributes: [{ name: 'funnel_variant', value: 'B' }],
    };
    const res = await POST(makeOrderReq(order));
    expect(res.status).toBe(200);
    expect(await purchasesFor('B')).toBe(1);
    expect(await purchasesFor('A')).toBe(0);
  });

  it('parsea funnel_variant del landing_site (fallback) y registra af_A_purchase', async () => {
    const order = {
      id: 1002,
      email: 'buyer2@example.com',
      financial_status: 'paid',
      total_price: '9900',
      currency: 'ARS',
      landing_site: '/cart/123:1?utm_source=facebook&funnel_variant=A',
    };
    await POST(makeOrderReq(order));
    expect(await purchasesFor('A')).toBe(1);
  });

  it('orden sin funnel_variant ⇒ no atribuye a ninguna variante', async () => {
    const order = {
      id: 1003,
      email: 'buyer3@example.com',
      financial_status: 'paid',
      total_price: '8000',
      currency: 'ARS',
      note_attributes: [{ name: 'ab_entry', value: 'B' }],
    };
    await POST(makeOrderReq(order));
    const data = await getStore().getFunnel({ version: 'ar' });
    expect(data.funnelVariantBreakdown).toEqual([]);
  });
});

/**
 * GET /api/admin/leads-stats
 *
 * KPIs de leads para la sección "Leads" de /admin/funnel.
 * Auth: cookie admin_token firmada (HMAC). Sin cookie -> 401.
 *
 * Respuesta:
 *   {
 *     ok: true,
 *     data: {
 *       totalLeads: number,
 *       nonBuyers: number,
 *       buyers: number,
 *       last24h: number,
 *       last7d: number,
 *       last30d: number,
 *       lastLeadAt: string | null,
 *     }
 *   }
 *
 * Implementación: counts a Supabase con `head: true` (no trae rows, solo el
 * count) — barato. La intersección "leads que compraron" se calcula traendo
 * solo emails de purchases approved + clientes y haciendo un set en memoria
 * (suficiente hasta ~50k contactos; si crece, se puede mover a una vista SQL).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin/auth';
import { getSupabase } from '@/lib/supabase';
import { resolveRangeFromParam } from '@/lib/admin/range';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isoMinusDays(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      {
        ok: true,
        data: {
          totalLeads: 0,
          nonBuyers: 0,
          buyers: 0,
          last24h: 0,
          last7d: 0,
          last30d: 0,
          lastLeadAt: null,
          configured: false,
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }

  const sb = supabase;
  const url = new URL(req.url);
  const range = resolveRangeFromParam(url.searchParams.get('range'));

  // Emails de `clientes` creados dentro del rango (paginado: Supabase corta a 1000/req).
  async function fetchLeadEmailsInRange(): Promise<string[]> {
    const PAGE = 1000;
    const out: string[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const { data, error } = await sb
        .from('clientes')
        .select('email')
        .gte('created_at', range.fromISO)
        .lt('created_at', range.toISO)
        .range(offset, offset + PAGE - 1);
      if (error) {
        console.error('[admin/leads-stats] leadEmails error:', error.message);
        break;
      }
      const batch = (data ?? []) as Array<{ email: string | null }>;
      for (const r of batch) if (r.email) out.push(r.email.trim().toLowerCase());
      if (batch.length < PAGE) break;
    }
    return out;
  }

  // Emails de compradores aprobados (todos, para la intersección — paginado).
  async function fetchBuyerEmails(): Promise<string[]> {
    const PAGE = 1000;
    const out: string[] = [];
    for (let offset = 0; ; offset += PAGE) {
      const { data, error } = await sb
        .from('purchases')
        .select('email')
        .eq('status', 'approved')
        .range(offset, offset + PAGE - 1);
      if (error) {
        console.error('[admin/leads-stats] buyerEmails error:', error.message);
        break;
      }
      const batch = (data ?? []) as Array<{ email: string | null }>;
      for (const r of batch) if (r.email) out.push(r.email.trim().toLowerCase());
      if (batch.length < PAGE) break;
    }
    return out;
  }

  // ── Counts + emails en paralelo ────────────────────────────────────────────
  const [
    totalRes,
    rangeRes,
    last24Res,
    last7Res,
    last30Res,
    lastLeadRes,
    rangeLeadEmails,
    buyerEmailsArr,
  ] = await Promise.all([
    sb.from('clientes').select('*', { count: 'exact', head: true }),
    sb
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', range.fromISO)
      .lt('created_at', range.toISO),
    sb
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', isoMinusDays(1)),
    sb
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', isoMinusDays(7)),
    sb
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', isoMinusDays(30)),
    sb
      .from('clientes')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    fetchLeadEmailsInRange(),
    fetchBuyerEmails(),
  ]);

  // Si alguno falla, lo logueamos pero seguimos con lo que haya (degradado).
  if (totalRes.error) console.error('[admin/leads-stats] total error:', totalRes.error.message);
  if (rangeRes.error) console.error('[admin/leads-stats] range error:', rangeRes.error.message);
  if (last24Res.error) console.error('[admin/leads-stats] last24 error:', last24Res.error.message);
  if (last7Res.error)  console.error('[admin/leads-stats] last7 error:', last7Res.error.message);
  if (last30Res.error) console.error('[admin/leads-stats] last30 error:', last30Res.error.message);
  if (lastLeadRes.error) console.error('[admin/leads-stats] lastLead error:', lastLeadRes.error.message);

  // Intersección leads(en rango) ∩ buyers (case-insensitive).
  const buyerEmails = new Set(buyerEmailsArr);
  const buyersInRange = rangeLeadEmails.filter((e) => buyerEmails.has(e)).length;
  const rangeTotal = rangeRes.count ?? rangeLeadEmails.length;
  const nonBuyersInRange = Math.max(0, rangeTotal - buyersInRange);

  return NextResponse.json(
    {
      ok: true,
      data: {
        // totalLeads refleja el RANGO seleccionado (hoy/semana/mes/…).
        totalLeads: rangeTotal,
        // total histórico de leads (referencia, no depende del rango).
        totalAllTime: totalRes.count ?? 0,
        nonBuyers: nonBuyersInRange,
        buyers: buyersInRange,
        last24h: last24Res.count ?? 0,
        last7d: last7Res.count ?? 0,
        last30d: last30Res.count ?? 0,
        lastLeadAt: lastLeadRes.data?.created_at ?? null,
        configured: true,
        range: {
          preset: range.preset,
          label: range.label,
          fromDay: range.fromDay,
          toDay: range.toDay,
        },
      },
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}

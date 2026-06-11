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

  // ── Counts en paralelo ───────────────────────────────────────────────────
  const [
    totalRes,
    last24Res,
    last7Res,
    last30Res,
    lastLeadRes,
    leadEmailsRes,
    buyerEmailsRes,
  ] = await Promise.all([
    supabase.from('clientes').select('*', { count: 'exact', head: true }),
    supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', isoMinusDays(1)),
    supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', isoMinusDays(7)),
    supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', isoMinusDays(30)),
    supabase
      .from('clientes')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('clientes').select('email'),
    supabase.from('purchases').select('email').eq('status', 'approved'),
  ]);

  // Si alguno falla, lo logueamos pero seguimos con lo que haya (degradado).
  if (totalRes.error) console.error('[admin/leads-stats] total error:', totalRes.error.message);
  if (last24Res.error) console.error('[admin/leads-stats] last24 error:', last24Res.error.message);
  if (last7Res.error)  console.error('[admin/leads-stats] last7 error:', last7Res.error.message);
  if (last30Res.error) console.error('[admin/leads-stats] last30 error:', last30Res.error.message);
  if (lastLeadRes.error) console.error('[admin/leads-stats] lastLead error:', lastLeadRes.error.message);
  if (leadEmailsRes.error) console.error('[admin/leads-stats] leadEmails error:', leadEmailsRes.error.message);
  if (buyerEmailsRes.error) console.error('[admin/leads-stats] buyerEmails error:', buyerEmailsRes.error.message);

  // Calcular intersección leads ∩ buyers (case-insensitive)
  const leadEmails = (leadEmailsRes.data ?? []).map(
    (r: { email: string }) => r.email.trim().toLowerCase(),
  );
  const buyerEmails = new Set(
    (buyerEmailsRes.data ?? []).map(
      (r: { email: string }) => r.email.trim().toLowerCase(),
    ),
  );

  const buyersInLeadList = leadEmails.filter((e) => buyerEmails.has(e)).length;
  const totalLeads = totalRes.count ?? leadEmails.length;
  const nonBuyers = Math.max(0, totalLeads - buyersInLeadList);

  return NextResponse.json(
    {
      ok: true,
      data: {
        totalLeads,
        nonBuyers,
        buyers: buyersInLeadList,
        last24h: last24Res.count ?? 0,
        last7d: last7Res.count ?? 0,
        last30d: last30Res.count ?? 0,
        lastLeadAt: lastLeadRes.data?.created_at ?? null,
        configured: true,
      },
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}

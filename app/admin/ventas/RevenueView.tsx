'use client';

/**
 * RevenueView — KPIs de ventas (revenue real) con filtro por campaña (y fuente).
 *
 * Endpoint: GET /api/admin/revenue-stats?utm_sources=fb,ig&utm_campaigns=...
 * Auth: 401 desde el endpoint → redirige a /admin (login).
 */

import { useCallback, useEffect, useState } from 'react';
import { ArrowClockwise, CurrencyDollar, ShoppingBag, Receipt, ArrowUUpLeft } from '@phosphor-icons/react';
import {
  SectionCard,
  StatCard,
  Banner,
  Button,
  Spinner,
  formatMoney,
  formatRelativeDate,
  formatPct,
  cn,
} from '@/components/admin/ui';

type PeriodAgg = { revenue: number; count: number };

type RevenueStats = {
  totalRevenue: number;
  totalRefunded: number;
  approvedCount: number;
  refundedCount: number;
  avgTicket: number;
  currency: string;
  last24h: PeriodAgg;
  last7d: PeriodAgg;
  last30d: PeriodAgg;
  byProduct: Array<{ name: string; count: number; revenue: number }>;
  bySource: Array<{ source: string; count: number; revenue: number }>;
  byCampaign: Array<{ campaign: string; count: number; revenue: number }>;
  lastSaleAt: string | null;
  configured?: boolean;
  filtered: { sources: string[] | null; campaigns: string[] | null; count: number; revenue: number };
};

export function RevenueView() {
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [selectedCampaigns, setSelectedCampaigns] = useState<Set<string>>(new Set());

  const fetchRevenueStats = useCallback(async () => {
    setRevenueLoading(true);
    setRevenueError(null);
    try {
      const params = new URLSearchParams();
      if (selectedSources.size > 0) params.set('utm_sources', Array.from(selectedSources).join(','));
      if (selectedCampaigns.size > 0) params.set('utm_campaigns', Array.from(selectedCampaigns).join(','));
      const url = `/api/admin/revenue-stats${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; data: RevenueStats };
      if (!json.ok || !json.data) throw new Error('respuesta inválida');
      setRevenueStats(json.data);
    } catch (err) {
      setRevenueError(err instanceof Error ? err.message : 'error');
    } finally {
      setRevenueLoading(false);
    }
  }, [selectedSources, selectedCampaigns]);

  useEffect(() => { fetchRevenueStats(); }, [fetchRevenueStats]);

  const toggleSource = useCallback((source: string) => {
    setSelectedSources((prev) => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source); else next.add(source);
      return next;
    });
  }, []);
  const clearSources = useCallback(() => setSelectedSources(new Set()), []);

  const toggleCampaign = useCallback((campaign: string) => {
    setSelectedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(campaign)) next.delete(campaign); else next.add(campaign);
      return next;
    });
  }, []);
  const clearCampaigns = useCallback(() => setSelectedCampaigns(new Set()), []);

  const hasAnyFilter = selectedSources.size > 0 || selectedCampaigns.size > 0;
  const currency = revenueStats?.currency ?? 'ARS';

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Ventas</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Revenue real desde Shopify (webhook → Supabase). Solo cuenta compras aprobadas.
          </p>
        </div>
        <Button onClick={fetchRevenueStats} disabled={revenueLoading} variant="secondary">
          {revenueLoading ? <Spinner /> : <ArrowClockwise size={15} weight="bold" />}
          Actualizar
        </Button>
      </header>

      {revenueError && <Banner tone="error">Error: {revenueError}</Banner>}
      {revenueStats?.configured === false && (
        <Banner tone="warning">
          ⚠️ Supabase no está configurado. Falta <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="rounded bg-black/30 px-1">SUPABASE_SERVICE_ROLE_KEY</code>.
        </Banner>
      )}

      {/* Filtro por campaña (principal) */}
      {revenueStats && revenueStats.byCampaign.length > 0 && (
        <SectionCard
          title="Filtrar por campaña"
          actions={selectedCampaigns.size > 0 ? (
            <button onClick={clearCampaigns} className="text-[11px] font-medium text-neutral-400 underline hover:text-neutral-100">
              Limpiar ({selectedCampaigns.size})
            </button>
          ) : undefined}
        >
          <div className="flex flex-wrap gap-1.5">
            {revenueStats.byCampaign.map((c) => (
              <Chip key={c.campaign} label={c.campaign} count={c.count} active={selectedCampaigns.has(c.campaign)} onClick={() => toggleCampaign(c.campaign)} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* Filtro por fuente (secundario / opcional) */}
      {revenueStats && revenueStats.bySource.length > 0 && (
        <SectionCard
          title="Filtrar por fuente"
          subtitle="Opcional — para el embudo solo importa la campaña."
          actions={selectedSources.size > 0 ? (
            <button onClick={clearSources} className="text-[11px] font-medium text-neutral-400 underline hover:text-neutral-100">
              Limpiar ({selectedSources.size})
            </button>
          ) : undefined}
        >
          <div className="flex flex-wrap gap-1.5">
            {revenueStats.bySource.map((s) => (
              <Chip key={s.source} label={s.source} count={s.count} active={selectedSources.has(s.source)} onClick={() => toggleSource(s.source)} />
            ))}
          </div>
        </SectionCard>
      )}

      {/* KPIs principales */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={hasAnyFilter ? `Revenue filtrado (${currency})` : `Revenue total (${currency})`}
          value={revenueStats ? formatMoney(revenueStats.totalRevenue, currency) : '—'}
          subtitle={revenueStats?.lastSaleAt ? `última: ${formatRelativeDate(revenueStats.lastSaleAt)}` : undefined}
          accent="emerald"
          icon={<CurrencyDollar size={18} weight="bold" />}
        />
        <StatCard
          label="Ventas aprobadas"
          value={revenueStats?.approvedCount ?? '—'}
          subtitle={revenueStats && revenueStats.refundedCount > 0 ? `${revenueStats.refundedCount} refunds` : undefined}
          accent="violet"
          icon={<ShoppingBag size={18} weight="bold" />}
        />
        <StatCard
          label="Ticket promedio"
          value={revenueStats ? formatMoney(revenueStats.avgTicket, currency) : '—'}
          accent="sky"
          icon={<Receipt size={18} weight="bold" />}
        />
        <StatCard
          label="Refunds"
          value={revenueStats ? formatMoney(revenueStats.totalRefunded, currency) : '—'}
          subtitle={revenueStats && revenueStats.totalRevenue > 0 && !hasAnyFilter
            ? `${formatPct((revenueStats.totalRefunded / revenueStats.totalRevenue) * 100)} del revenue`
            : (revenueStats && hasAnyFilter ? 'sin filtro' : undefined)}
          accent="rose"
          icon={<ArrowUUpLeft size={18} weight="bold" />}
        />
      </section>

      {/* KPIs por período */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Últimas 24 h" value={revenueStats ? formatMoney(revenueStats.last24h.revenue, currency) : '—'} subtitle={revenueStats ? `${revenueStats.last24h.count} ventas` : undefined} accent="emerald" />
        <StatCard label="Últimos 7 días" value={revenueStats ? formatMoney(revenueStats.last7d.revenue, currency) : '—'} subtitle={revenueStats ? `${revenueStats.last7d.count} ventas` : undefined} accent="emerald" />
        <StatCard label="Últimos 30 días" value={revenueStats ? formatMoney(revenueStats.last30d.revenue, currency) : '—'} subtitle={revenueStats ? `${revenueStats.last30d.count} ventas` : undefined} accent="emerald" />
      </section>

      {/* Por producto */}
      {revenueStats && revenueStats.byProduct.length > 0 && (
        <SectionCard title="Por producto" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-2.5">Producto</th>
                  <th className="px-5 py-2.5 text-right">Unidades</th>
                  <th className="px-5 py-2.5 text-right">Revenue</th>
                  <th className="px-5 py-2.5 text-right">% del total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {revenueStats.byProduct.map((p, i) => {
                  const pct = revenueStats.totalRevenue > 0 ? (p.revenue / revenueStats.totalRevenue) * 100 : 0;
                  return (
                    <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-2.5 text-neutral-200">{p.name}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-300">{p.count.toLocaleString('es-AR')}</td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-emerald-400">{formatMoney(p.revenue, currency)}</td>
                      <td className="px-5 py-2.5 text-right text-neutral-500">{formatPct(pct)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function Chip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'bg-emerald-500 text-emerald-950 ring-1 ring-emerald-400/40'
          : 'bg-white/[0.04] text-neutral-300 ring-1 ring-white/10 hover:bg-white/[0.08]',
      )}
    >
      <span className="max-w-[180px] truncate">{label}</span>
      <span className={cn('tabular-nums', active ? 'text-emerald-800' : 'text-neutral-500')}>· {count}</span>
    </button>
  );
}

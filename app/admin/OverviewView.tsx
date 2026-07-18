'use client';

/**
 * OverviewView — Resumen general del negocio en /admin.
 *
 * Combina las 3 fuentes del panel en un solo dashboard:
 *   - Embudo del quiz (GET /api/admin/funnel-data?day=hoy)
 *   - Ventas / revenue (GET /api/admin/revenue-stats)
 *   - Leads (GET /api/admin/leads-stats)
 *
 * Todo en GMT-3. El embudo del resumen muestra el día de HOY.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  CurrencyDollar,
  ShoppingBag,
  Receipt,
  UsersThree,
  Funnel as FunnelIcon,
  ArrowRight,
  ArrowClockwise,
  TrendUp,
} from '@phosphor-icons/react';
import type { FunnelData } from '@/lib/admin/store';
import {
  Card,
  SectionCard,
  StatCard,
  Banner,
  Button,
  Badge,
  Spinner,
  formatMoney,
  formatNumber,
  formatPct,
  formatRelativeDate,
  cn,
} from '@/components/admin/ui';
import { FunnelShape, type FunnelStep } from '@/components/admin/FunnelShape';
import { getArgentinaTime } from '@/lib/admin/day';
import { resolveRangeFromParam } from '@/lib/admin/range';

type RevenueStats = {
  totalRevenue: number;
  totalRefunded: number;
  approvedCount: number;
  refundedCount: number;
  avgTicket: number;
  currency: string;
  last24h: { revenue: number; count: number };
  last7d: { revenue: number; count: number };
  last30d: { revenue: number; count: number };
  byCampaign: Array<{ campaign: string; count: number; revenue: number }>;
  lastSaleAt: string | null;
  configured?: boolean;
};

type LeadsStats = {
  totalLeads: number;
  nonBuyers: number;
  buyers: number;
  last24h: number;
  last7d: number;
  last30d: number;
  lastLeadAt: string | null;
  configured?: boolean;
};

export function OverviewView() {
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [leads, setLeads] = useState<LeadsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const searchParams = useSearchParams();
  const range = resolveRangeFromParam(searchParams.get('range'));

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = `range=${range.preset}`;
      const [fRes, rRes, lRes] = await Promise.all([
        fetch(`/api/admin/funnel-data?${qs}`, { cache: 'no-store', credentials: 'same-origin' }),
        fetch(`/api/admin/revenue-stats?${qs}`, { cache: 'no-store', credentials: 'same-origin' }),
        fetch(`/api/admin/leads-stats?${qs}`, { cache: 'no-store', credentials: 'same-origin' }),
      ]);
      if (fRes.status === 401 || rRes.status === 401 || lRes.status === 401) {
        window.location.href = '/admin';
        return;
      }
      const [fJson, rJson, lJson] = await Promise.all([fRes.json(), rRes.json(), lRes.json()]);
      if (fJson?.ok) setFunnel(fJson.data as FunnelData);
      if (rJson?.ok) setRevenue(rJson.data as RevenueStats);
      if (lJson?.ok) setLeads(lJson.data as LeadsStats);
      setUpdatedAt(getArgentinaTime());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
    } finally {
      setLoading(false);
    }
  }, [range.preset]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Embudo del día (3 etapas clave) ───────────────────────────────────────
  const funnelSteps: FunnelStep[] = useMemo(() => {
    if (!funnel) return [];
    const ref = funnel.totalStarts || 1;
    const steps: FunnelStep[] = [
      { name: 'Empezaron', pct: 100, count: funnel.totalStarts },
      {
        name: 'Llegaron a venta',
        pct: (funnel.totalCompletes / ref) * 100,
        count: funnel.totalCompletes,
      },
    ];
    if (funnel.totalSales !== null) {
      steps.push({
        name: 'Compraron',
        pct: (funnel.totalSales / ref) * 100,
        count: funnel.totalSales,
      });
    }
    return steps;
  }, [funnel]);

  const quizToSale = funnel && funnel.totalStarts > 0
    ? (funnel.totalCompletes / funnel.totalStarts) * 100
    : 0;
  const quizToBuy = funnel && funnel.totalStarts > 0 && funnel.totalSales
    ? (funnel.totalSales / funnel.totalStarts) * 100
    : 0;
  const saleToBuy = funnel && funnel.totalCompletes > 0 && funnel.totalSales
    ? (funnel.totalSales / funnel.totalCompletes) * 100
    : 0;

  const currency = revenue?.currency ?? 'ARS';

  const revenuePeriods = useMemo(
    () => [
      { label: '24 h', revenue: revenue?.last24h.revenue ?? 0, count: revenue?.last24h.count ?? 0 },
      { label: '7 d', revenue: revenue?.last7d.revenue ?? 0, count: revenue?.last7d.count ?? 0 },
      { label: '30 d', revenue: revenue?.last30d.revenue ?? 0, count: revenue?.last30d.count ?? 0 },
    ],
    [revenue],
  );

  const leadPeriods = useMemo(
    () => [
      { label: '24 h', value: leads?.last24h ?? 0 },
      { label: '7 d', value: leads?.last7d ?? 0 },
      { label: '30 d', value: leads?.last30d ?? 0 },
    ],
    [leads],
  );

  const topCampaigns = useMemo(() => {
    if (!funnel?.utmBreakdown) return [];
    return funnel.utmBreakdown
      .filter((r) => r.starts > 0)
      .slice(0, 6);
  }, [funnel]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Resumen general</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Vista rápida del negocio · período: <span className="font-medium text-neutral-200">{range.label}</span> (GMT-3).
          </p>
        </div>
        <div className="flex items-center gap-3">
          {updatedAt && (
            <span className="text-xs text-neutral-500">Actualizado {updatedAt} hs</span>
          )}
          <Button onClick={fetchAll} disabled={loading} variant="secondary">
            {loading ? <Spinner /> : <ArrowClockwise size={15} weight="bold" />}
            Actualizar
          </Button>
        </div>
      </header>

      {error && <Banner tone="error">Error al cargar: {error}</Banner>}
      {revenue?.configured === false && (
        <Banner tone="warning">
          ⚠️ Supabase no está configurado — el revenue y los leads pueden aparecer en cero.
        </Banner>
      )}
      {funnel && !funnel.dayTrackingActive && (
        <Banner tone="info">
          ℹ️ El embudo todavía cuenta en <strong>acumulado</strong> (no por día). Corré la migración{' '}
          <code className="rounded bg-black/30 px-1">007_add_day_to_funnel_counts.sql</code> en Supabase para activar el tracking diario (GMT-3).
        </Banner>
      )}

      {/* Hero KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Revenue total"
          value={revenue ? formatMoney(revenue.totalRevenue, currency) : '—'}
          subtitle={revenue?.lastSaleAt ? `última venta ${formatRelativeDate(revenue.lastSaleAt)}` : 'sin ventas aún'}
          accent="emerald"
          icon={<CurrencyDollar size={18} weight="bold" />}
        />
        <StatCard
          label="Ventas aprobadas"
          value={formatNumber(revenue?.approvedCount)}
          subtitle={revenue && revenue.refundedCount > 0 ? `${revenue.refundedCount} refunds` : 'compras pagadas'}
          accent="violet"
          icon={<ShoppingBag size={18} weight="bold" />}
        />
        <StatCard
          label="Ticket promedio"
          value={revenue ? formatMoney(revenue.avgTicket, currency) : '—'}
          subtitle="por venta aprobada"
          accent="sky"
          icon={<Receipt size={18} weight="bold" />}
        />
        <StatCard
          label="Leads totales"
          value={formatNumber(leads?.totalLeads)}
          subtitle={leads ? `${formatNumber(leads.nonBuyers)} no compradores` : 'emails capturados'}
          accent="amber"
          icon={<UsersThree size={18} weight="bold" />}
        />
      </section>

      {/* Embudo de hoy + conversión */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          icon={<FunnelIcon size={18} weight="fill" />}
          title={funnel && !funnel.dayTrackingActive ? 'Embudo (acumulado)' : `Embudo · ${range.label}`}
          subtitle={funnel && !funnel.dayTrackingActive ? 'todos los días juntos' : `${range.label} · GMT-3`}
          actions={
            <Link href="/admin/funnel">
              <Button variant="ghost">
                Ver completo <ArrowRight size={15} weight="bold" />
              </Button>
            </Link>
          }
        >
          {funnel && funnel.totalStarts > 0 ? (
            <FunnelShape steps={funnelSteps} height={230} minWidth={520} />
          ) : (
            <div className="flex h-44 flex-col items-center justify-center gap-1 text-center">
              <p className="text-sm text-neutral-400">Todavía no hay datos del embudo para hoy.</p>
              <p className="text-xs text-neutral-600">Los eventos aparecen acá apenas alguien arranca el quiz.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard icon={<TrendUp size={18} weight="bold" />} title={`Conversión · ${range.label}`}>
          <div className="space-y-4">
            <ConversionBar label="Quiz → Llegaron a venta" pct={quizToSale} accent="violet" />
            <ConversionBar label="Venta → Compraron" pct={saleToBuy} accent="emerald" />
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-xs text-neutral-400">CVR del quiz (empezó → compró)</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums text-emerald-400">
                  {formatPct(quizToBuy)}
                </span>
                {funnel?.totalSales != null && (
                  <span className="text-xs text-neutral-500">
                    {formatNumber(funnel.totalSales)} de {formatNumber(funnel?.totalStarts)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      {/* Charts: revenue + leads por período */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <SectionCard
          icon={<CurrencyDollar size={18} weight="bold" />}
          title="Revenue por período"
          subtitle="ventanas móviles (acumulado)"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenuePeriods} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v) => compactMoney(Number(v), currency)}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<RevenueTooltip currency={currency} />}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill="url(#rev-grad)" maxBarSize={64} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          icon={<UsersThree size={18} weight="bold" />}
          title="Leads por período"
          subtitle="emails capturados (acumulado)"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadPeriods} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="lead-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<LeadsTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#lead-grad)" maxBarSize={64}>
                  {leadPeriods.map((_, i) => (
                    <Cell key={i} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </section>

      {/* Top campañas (atribución del embudo, hoy) */}
      <SectionCard
        icon={<TrendUp size={18} weight="bold" />}
        title={`Top campañas · ${range.label}`}
        subtitle="atribución del embudo por campaña"
        bodyClassName="p-0"
        actions={
          <Link href="/admin/funnel">
            <Button variant="ghost">
              Detalle <ArrowRight size={15} weight="bold" />
            </Button>
          </Link>
        }
      >
        {topCampaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-2.5">Campaña</th>
                  <th className="px-5 py-2.5 text-right">Empezaron</th>
                  <th className="px-5 py-2.5 text-right">Llegaron</th>
                  <th className="px-5 py-2.5 text-right">Compraron</th>
                  <th className="px-5 py-2.5 text-right">CVR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {topCampaigns.map((row, i) => (
                  <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                    <td className="max-w-[220px] truncate px-5 py-2.5 font-medium text-neutral-200" title={row.campaign}>
                      {row.campaign}
                    </td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-neutral-300">{formatNumber(row.starts)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatNumber(row.completes)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-emerald-400">{formatNumber(row.purchases)}</td>
                    <td className="px-5 py-2.5 text-right">
                      <Badge accent={row.cvr >= 5 ? 'emerald' : row.cvr >= 2 ? 'amber' : 'neutral'}>
                        {formatPct(row.cvr)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-10 text-center text-sm text-neutral-500">
            Sin campañas con datos hoy.
          </div>
        )}
      </SectionCard>

      {/* Quick links */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickLink href="/admin/funnel" title="Embudo del quiz" desc="Drop-off slide por slide, por día." icon={<FunnelIcon size={20} weight="fill" />} accent="violet" />
        <QuickLink href="/admin/leads" title="Leads del quiz" desc="KPIs y export CSV para Shopify." icon={<UsersThree size={20} weight="fill" />} accent="amber" />
        <QuickLink href="/admin/ventas" title="Ventas" desc="Revenue real, filtro por campaña." icon={<CurrencyDollar size={20} weight="fill" />} accent="emerald" />
      </section>
    </div>
  );
}

// ─── Sub-componentes ─────────────────────────────────────────────────────────

function ConversionBar({
  label,
  pct,
  accent,
}: {
  label: string;
  pct: number;
  accent: 'violet' | 'emerald';
}) {
  const w = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-neutral-400">{label}</span>
        <span className="font-semibold tabular-nums text-neutral-200">{formatPct(pct)}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            accent === 'violet' ? 'bg-gradient-to-r from-violet-500 to-violet-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400',
          )}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
  icon,
  accent,
}: {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: 'violet' | 'amber' | 'emerald';
}) {
  return (
    <Link href={href} className="group">
      <Card hover className="flex items-center gap-4 p-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1',
            accent === 'violet' && 'bg-violet-500/15 text-violet-300 ring-violet-500/20',
            accent === 'amber' && 'bg-amber-500/15 text-amber-300 ring-amber-500/20',
            accent === 'emerald' && 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/20',
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-sm font-semibold text-neutral-100">
            {title}
            <ArrowRight size={14} weight="bold" className="text-neutral-500 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-300" />
          </div>
          <div className="truncate text-xs text-neutral-500">{desc}</div>
        </div>
      </Card>
    </Link>
  );
}

function RevenueTooltip({ active, payload, currency }: { active?: boolean; payload?: Array<{ payload: { label: string; revenue: number; count: number } }>; currency?: string }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-neutral-200">Últimos {d.label}</div>
      <div className="mt-0.5 text-emerald-400">{formatMoney(d.revenue, currency ?? 'ARS')}</div>
      <div className="text-neutral-500">{d.count} ventas</div>
    </div>
  );
}

function LeadsTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { label: string; value: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0a0f] px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-neutral-200">Últimos {d.label}</div>
      <div className="mt-0.5 text-amber-400">{d.value.toLocaleString('es-AR')} leads</div>
    </div>
  );
}

function compactMoney(v: number, currency: string): string {
  const sym = currency.toUpperCase() === 'ARS' ? '$' : '';
  if (Math.abs(v) >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${sym}${Math.round(v / 1_000)}k`;
  return `${sym}${v}`;
}

'use client';

/**
 * LeadsView — KPIs y export CSV de leads del quiz.
 *
 * Endpoints:
 *  - GET /api/admin/leads-stats  → KPIs.
 *  - GET /api/admin/leads-export → descarga CSV (formato Shopify Customer Import).
 *
 * Auth: 401 desde el endpoint → redirige a /admin (login).
 */

import { useCallback, useEffect, useState } from 'react';
import { ArrowClockwise, UsersThree, UserMinus, CalendarBlank, DownloadSimple } from '@phosphor-icons/react';
import {
  Card,
  SectionCard,
  StatCard,
  Banner,
  Button,
  Spinner,
  formatNumber,
  formatRelativeDate,
  formatPct,
} from '@/components/admin/ui';

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

export function LeadsView() {
  const [leadsStats, setLeadsStats] = useState<LeadsStats | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState<string | null>(null);
  const [sinceDate, setSinceDate] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const fetchLeadsStats = useCallback(async () => {
    setLeadsLoading(true);
    setLeadsError(null);
    try {
      const res = await fetch('/api/admin/leads-stats', { cache: 'no-store', credentials: 'same-origin' });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; data: LeadsStats };
      if (!json.ok || !json.data) throw new Error('respuesta inválida');
      setLeadsStats(json.data);
    } catch (err) {
      setLeadsError(err instanceof Error ? err.message : 'error');
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeadsStats(); }, [fetchLeadsStats]);

  const downloadCsv = useCallback(async (onlyNonBuyers: boolean) => {
    setDownloading(true);
    try {
      const params = new URLSearchParams();
      if (sinceDate) params.set('since', sinceDate);
      params.set('onlyNonBuyers', onlyNonBuyers ? 'true' : 'false');
      const res = await fetch(`/api/admin/leads-export?${params.toString()}`, { cache: 'no-store', credentials: 'same-origin' });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        alert(`Error al exportar: ${body.error || res.statusText}`);
        return;
      }
      const blob = await res.blob();
      const count = res.headers.get('X-Lead-Count') ?? '0';
      const cd = res.headers.get('Content-Disposition') ?? '';
      const m = cd.match(/filename="?([^";]+)"?/i);
      const filename = m?.[1] ?? `shopify-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      alert(`✅ ${count} leads exportados.`);
    } catch (err) {
      alert(`Error de red: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setDownloading(false);
    }
  }, [sinceDate]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Leads del quiz</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Exportá los emails capturados para subir a <strong className="text-neutral-200">Shopify → Clientes → Importar</strong>.
          </p>
        </div>
        <Button onClick={fetchLeadsStats} disabled={leadsLoading} variant="secondary">
          {leadsLoading ? <Spinner /> : <ArrowClockwise size={15} weight="bold" />}
          Actualizar
        </Button>
      </header>

      {leadsError && <Banner tone="error">Error: {leadsError}</Banner>}
      {leadsStats?.configured === false && (
        <Banner tone="warning">
          ⚠️ Supabase no está configurado. Falta <code className="rounded bg-black/30 px-1">SUPABASE_URL</code> y <code className="rounded bg-black/30 px-1">SUPABASE_SERVICE_ROLE_KEY</code>.
        </Banner>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total leads"
          value={formatNumber(leadsStats?.totalLeads)}
          subtitle={leadsStats?.lastLeadAt ? `último: ${formatRelativeDate(leadsStats.lastLeadAt)}` : undefined}
          accent="amber"
          icon={<UsersThree size={18} weight="bold" />}
        />
        <StatCard
          label="No compradores"
          value={formatNumber(leadsStats?.nonBuyers)}
          subtitle="exportables a Shopify"
          accent="sky"
          icon={<UserMinus size={18} weight="bold" />}
        />
        <StatCard
          label="Últimas 24 h"
          value={formatNumber(leadsStats?.last24h)}
          subtitle={leadsStats ? `${formatNumber(leadsStats.last7d)} en 7 días` : undefined}
          accent="violet"
        />
        <StatCard
          label="Últimos 30 días"
          value={formatNumber(leadsStats?.last30d)}
          subtitle={leadsStats && leadsStats.totalLeads > 0 ? `${formatPct((leadsStats.buyers / leadsStats.totalLeads) * 100)} compraron` : undefined}
          accent="emerald"
        />
      </section>

      {/* Filtro fecha + acciones */}
      <SectionCard title="Exportar CSV" subtitle="Para subir a Shopify → Clientes → Importar.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <CalendarBlank size={14} weight="bold" /> Desde fecha (opcional)
            </span>
            <input
              type="date"
              value={sinceDate}
              onChange={(e) => setSinceDate(e.target.value)}
              className="mt-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-neutral-100 [color-scheme:dark] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
            <span className="mt-1 block text-[11px] text-neutral-600">Vacío = todos los leads históricos.</span>
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button onClick={() => downloadCsv(true)} disabled={downloading} variant="primary">
              {downloading ? <Spinner /> : <DownloadSimple size={15} weight="bold" />}
              CSV no compradores
            </Button>
            <Button onClick={() => downloadCsv(false)} disabled={downloading} variant="secondary">
              {downloading ? <Spinner /> : <DownloadSimple size={15} weight="bold" />}
              CSV todos (backup)
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Mini guía */}
      <Card className="p-5">
        <details className="text-xs text-neutral-400">
          <summary className="cursor-pointer font-medium text-neutral-300 hover:text-neutral-100">
            ¿Cómo subir el CSV a Shopify?
          </summary>
          <ol className="mt-3 list-decimal space-y-1 pl-5">
            <li>Descargá el CSV de no compradores con el botón de arriba.</li>
            <li>En Shopify Admin: <strong className="text-neutral-200">Clientes → Importar clientes</strong>.</li>
            <li>Subí el archivo y confirmá. Los contactos quedan con <code className="rounded bg-black/30 px-1">Accepts Email Marketing = yes</code>.</li>
            <li>En <strong className="text-neutral-200">Shopify Email</strong>, creá una campaña con audiencia <em>tag = quiz-lead, no-comprador</em>.</li>
            <li>Sumá un descuento (ej. <code className="rounded bg-black/30 px-1">ARRANCA15</code>) y mandá.</li>
          </ol>
        </details>
      </Card>
    </div>
  );
}

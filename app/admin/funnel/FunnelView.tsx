'use client';

/**
 * FunnelView — detalle del embudo del quiz, por DÍA (GMT-3).
 *
 * - Embudo horizontal con forma de embudo real (FunnelShape).
 * - Selector de día: Hoy / Ayer / fechas con datos / Acumulado.
 * - KPIs, tabla de detalle slide por slide, atribución por campaña, país,
 *   y backfill manual de compras.
 *
 * 100% = personas que empezaron el quiz (totalStarts) del día seleccionado.
 */

import { useCallback, useMemo, useState } from 'react';
import {
  ArrowClockwise,
  CalendarBlank,
  Plus,
  Trash,
  Warning,
  FlagBanner,
  TrendDown,
} from '@phosphor-icons/react';
import type { FunnelData, CountryBreakdownRow } from '@/lib/admin/store';
import {
  Card,
  SectionCard,
  StatCard,
  Badge,
  Banner,
  Button,
  Spinner,
  formatNumber,
  formatPct,
  cn,
} from '@/components/admin/ui';
import { FunnelShape, type FunnelStep } from '@/components/admin/FunnelShape';
import { getArgentinaDay, formatDayLabel } from '@/lib/admin/day';

type Props = {
  initialData: FunnelData;
};

const SLIDE_LABELS: Record<string, string> = {
  apertura: 'Apertura',
  momento_del_dia: 'Momento',
  tiempo_con_problema: 'Tiempo',
  info_1: 'Info 1 (73%/27%)',
  sintomas: 'Síntomas',
  ya_probo: 'Qué probó',
  info_2_dato: 'Info 2 (intestino)',
  impacto_emocional: 'Emocional',
  info_3: 'Info 3 (3 causas)',
  nombre: 'Nombre',
  objetivo: 'Objetivo',
  compromiso: 'Compromiso',
  info_pre_email: 'Testimonio pre-email',
  email: 'Email',
  loading: 'Loading',
  edad: 'Edad',
  social_1: 'Social Proof 1',
  situacion_actual: 'Situación actual',
  momento_hinchazon: 'Momento hinchazón',
  frecuencia: 'Frecuencia',
  social_2: 'Social Proof 2',
  que_empeora: 'Qué empeora',
  social_3: 'Social Proof 3',
  impacto_social: 'Impacto social',
  info_causas: 'Info: Causas',
  conocimiento_microbiota: 'Microbiota',
  dieta_actual: 'Dieta actual',
  habitos_agua: 'Agua',
  estres: 'Estrés',
  sueno: 'Sueño',
  ejercicio: 'Ejercicio',
  estrategias_interes: 'Estrategias',
  social_4: 'Social Proof 4',
  motivacion: 'Motivación',
  foco: 'Foco',
  perfil: 'Perfil generado',
  evento_importante: 'Evento',
  cuando_evento: 'Cuándo evento',
  tiempo_diario: 'Tiempo diario',
  plan_semanal: 'Plan semanal',
  loading_inteligente: 'Loading inteligente',
  email_optin: 'Opt-in emails',
  ventas: 'Página de ventas',
};

const COUNTRY_FLAGS: Record<string, string> = {
  CL: '🇨🇱', CO: '🇨🇴', MX: '🇲🇽', PE: '🇵🇪', US: '🇺🇸', '(desconocido)': '🌎',
};

const COUNTRY_FILTER_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'all', label: '🌎 Todos los países' },
  { value: 'CL', label: '🇨🇱 Chile' },
  { value: 'CO', label: '🇨🇴 Colombia' },
  { value: 'MX', label: '🇲🇽 México' },
  { value: 'PE', label: '🇵🇪 Perú' },
  { value: 'US', label: '🇺🇸 EE.UU.' },
  { value: '(desconocido)', label: '❓ Sin país detectado' },
];

export function FunnelView({ initialData }: Props) {
  const [data, setData] = useState<FunnelData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(initialData.day ?? getArgentinaDay());
  // Filtro por país: 'all' = todos, o ISO alpha-2 ('CL', 'CO', ...). Default
  // = lo que vino del SSR (no toca el filtro del SSR).
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialData.filters?.country ?? 'all',
  );

  // Backfill manual de compras (webhooks perdidos / ventas viejas).
  const [backfillOpen, setBackfillOpen] = useState(false);
  const [backfillCount, setBackfillCount] = useState('1');
  const [backfillCampaign, setBackfillCampaign] = useState('');
  const [backfillCountry, setBackfillCountry] = useState('');
  const [backfillBusy, setBackfillBusy] = useState(false);

  const refetch = useCallback(async (day: string, country: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ day });
      if (country && country !== 'all') params.set('country', country);
      const res = await fetch(`/api/admin/funnel-data?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'same-origin',
      });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; data: FunnelData };
      if (!json.ok || !json.data) throw new Error('respuesta inválida');
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const onChangeDay = useCallback((day: string) => {
    setSelectedDay(day);
    refetch(day, selectedCountry);
  }, [refetch, selectedCountry]);

  const onChangeCountry = useCallback((country: string) => {
    setSelectedCountry(country);
    refetch(selectedDay, country);
  }, [refetch, selectedDay]);

  const onReset = useCallback(async () => {
    const code = prompt('Para resetear TODAS las estadísticas (todos los días), escribí "123":');
    if (code !== '123') return;
    try {
      const res = await fetch('/api/admin/funnel-data', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        alert(`Error al resetear: ${body.error || res.statusText}`);
        return;
      }
      alert('✅ Estadísticas reseteadas correctamente');
      refetch(selectedDay, selectedCountry);
    } catch (err) {
      alert(`Error de red al resetear: ${err instanceof Error ? err.message : 'desconocido'}`);
    }
  }, [refetch, selectedDay, selectedCountry]);

  const onBackfillSubmit = useCallback(async () => {
    const n = Number.parseInt(backfillCount, 10);
    if (!Number.isFinite(n) || n < 1 || n > 50) {
      alert('La cantidad tiene que ser un número entre 1 y 50.');
      return;
    }
    setBackfillBusy(true);
    try {
      const res = await fetch('/api/admin/funnel-data', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'backfill_purchase',
          count: n,
          utms: { utm_campaign: backfillCampaign.trim() || undefined },
          country: backfillCountry.trim() || undefined,
        }),
      });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      const json = (await res.json().catch(() => null)) as
        | { ok: boolean; added: number; error?: string | null }
        | null;
      if (!res.ok || !json?.ok) {
        alert(`No se pudo cargar la venta: ${json?.error || `HTTP ${res.status}`}`);
        return;
      }
      alert(`✅ Se agregaron ${json.added} compra(s) al embudo (día de hoy).`);
      setBackfillCount('1');
      setBackfillCampaign('');
      setBackfillCountry('');
      setBackfillOpen(false);
      // El backfill se registra con el día de hoy → vamos a hoy.
      const todayStr = getArgentinaDay();
      setSelectedDay(todayStr);
      refetch(todayStr, selectedCountry);
    } catch (err) {
      alert(`Error de red: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setBackfillBusy(false);
    }
  }, [backfillCount, backfillCampaign, backfillCountry, refetch, selectedCountry]);

  // Opciones del selector de día: hoy + ayer + días con datos + acumulado.
  const dayOptions = useMemo(() => {
    const today = getArgentinaDay();
    const yesterday = getArgentinaDay(new Date(Date.now() - 86_400_000));
    const set = new Set<string>([today, yesterday, ...(data.availableDays ?? [])]);
    const days = Array.from(set).sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
    return days;
  }, [data.availableDays]);

  // Pasos del embudo (slides + llegaron a venta + compraron).
  const funnelSteps = useMemo(() => {
    const totalRef = data.totalStarts || 1;
    const steps: Array<{ name: string; pct: number; count: number; index: number }> = [];
    data.slides.forEach((s, i) => {
      steps.push({
        name: SLIDE_LABELS[s.id] || s.id,
        pct: (s.count / totalRef) * 100,
        count: s.count,
        index: i,
      });
    });
    steps.push({ name: 'Llegaron a la venta', pct: (data.totalCompletes / totalRef) * 100, count: data.totalCompletes, index: 98 });
    if (data.totalSales !== null) {
      steps.push({ name: 'Compraron', pct: (data.totalSales / totalRef) * 100, count: data.totalSales, index: 99 });
    }
    return steps;
  }, [data]);

  const maxDropIdx = useMemo(() => {
    let max = 0, idx = -1;
    funnelSteps.forEach((s, i) => {
      if (i > 0) {
        const d = (funnelSteps[i - 1]?.pct ?? 0) - s.pct;
        if (d > max) { max = d; idx = i; }
      }
    });
    return idx;
  }, [funnelSteps]);

  const shapeSteps: FunnelStep[] = useMemo(
    () => funnelSteps.map((s, i) => ({ name: s.name, pct: s.pct, count: s.count, worst: i === maxDropIdx })),
    [funnelSteps, maxDropIdx],
  );

  const isAccumulated = data.day === null;

  return (
    <div className="space-y-5">
      {/* Header + selector de día */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Embudo del quiz</h1>
          <p className="mt-1 text-sm text-neutral-400">
            % de personas que llegan a cada paso vs las que empezaron el quiz.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de día */}
          <div className="relative inline-flex items-center">
            <CalendarBlank size={16} weight="bold" className="pointer-events-none absolute left-3 text-neutral-400" />
            <select
              value={isAccumulated ? 'all' : selectedDay}
              onChange={(e) => onChangeDay(e.target.value)}
              disabled={loading}
              className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-1.5 pl-9 pr-8 text-sm font-medium text-neutral-200 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
            >
              {dayOptions.map((d) => (
                <option key={d} value={d} className="bg-[#13131a] text-neutral-200">
                  {formatDayLabel(d)}
                </option>
              ))}
              <option value="all" className="bg-[#13131a] text-neutral-200">Acumulado (todos)</option>
            </select>
            <span className="pointer-events-none absolute right-3 text-neutral-500">▾</span>
          </div>
          {/* Selector de país */}
          <div className="relative inline-flex items-center">
            <select
              value={selectedCountry}
              onChange={(e) => onChangeCountry(e.target.value)}
              disabled={loading}
              className="appearance-none rounded-lg border border-white/10 bg-white/[0.04] py-1.5 pl-3 pr-8 text-sm font-medium text-neutral-200 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 disabled:opacity-50"
              title="Filtrar por país"
            >
              {COUNTRY_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#13131a] text-neutral-200">
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 text-neutral-500">▾</span>
          </div>
          <Button onClick={() => refetch(selectedDay, selectedCountry)} disabled={loading} variant="secondary">
            {loading ? <Spinner /> : <ArrowClockwise size={15} weight="bold" />}
            Actualizar
          </Button>
          <Button onClick={onReset} variant="danger" title="Borrar todas las estadísticas">
            <Trash size={15} weight="bold" />
            Reset
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <Badge accent={isAccumulated ? 'sky' : 'violet'}>
          {isAccumulated ? 'Acumulado' : formatDayLabel(data.day ?? selectedDay)}
        </Badge>
        <span>{formatNumber(data.totalEvents)} eventos · backend: <span className="font-medium text-neutral-400">{data.backend}</span></span>
      </div>

      {data.backend === 'memory' && (
        <Banner tone="warning">
          ⚠️ Backend en memoria: los datos se pierden al re-deploy. Configurá <code className="rounded bg-black/30 px-1">FUNNEL_STORE=supabase</code>.
        </Banner>
      )}
      {!data.dayTrackingActive && (
        <Banner tone="info">
          ℹ️ El tracking <strong>por día</strong> todavía no está activo. Corré la migración <code className="rounded bg-black/30 px-1">007_add_day_to_funnel_counts.sql</code> en Supabase. Mientras tanto, ves el <strong>acumulado</strong> (todo se cuenta junto, no por día).
        </Banner>
      )}
      {error && <Banner tone="error">Error: {error}</Banner>}

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Empezaron el quiz" value={formatNumber(data.totalStarts)} subtitle="100% — referencia" accent="violet" />
        <StatCard
          label="Llegaron a la venta"
          value={formatNumber(data.totalCompletes)}
          subtitle={data.totalStarts > 0 ? `${formatPct((data.totalCompletes / data.totalStarts) * 100)} del quiz` : '—'}
          accent="sky"
        />
        <StatCard
          label="Compraron"
          value={data.totalSales ?? '—'}
          subtitle={data.totalStarts > 0 && data.totalSales ? `${formatPct((data.totalSales / data.totalStarts) * 100)} del quiz` : '—'}
          accent="emerald"
        />
        <StatCard
          label="Mayor abandono"
          value={maxDropIdx >= 0 ? (funnelSteps[maxDropIdx]?.name ?? '—') : '—'}
          subtitle={maxDropIdx >= 0 ? `${formatPct((funnelSteps[maxDropIdx - 1]?.pct ?? 0) - (funnelSteps[maxDropIdx]?.pct ?? 0))} se pierde` : '—'}
          accent="rose"
          icon={<TrendDown size={18} weight="bold" />}
        />
      </section>

      {/* Embudo */}
      <SectionCard
        icon={<FlagBanner size={18} weight="fill" />}
        title="Embudo — % que llega a cada paso"
        subtitle="De izquierda a derecha. El alto de cada sección = % que llega. Hover para detalle."
      >
        {data.totalStarts > 0 ? (
          <FunnelShape steps={shapeSteps} height={280} minWidth={760} />
        ) : (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-center">
            {data.totalEvents > 0 ? (
              <>
                <p className="text-sm text-neutral-300">
                  {isAccumulated ? 'En el acumulado' : formatDayLabel(selectedDay)} hubo{' '}
                  <strong>{formatNumber(data.totalEvents)}</strong> eventos, pero todavía{' '}
                  <strong>nadie empezó el quiz</strong> (slide 0 = 0).
                </p>
                <p className="text-xs text-neutral-500">
                  {formatNumber(data.totalLandingViews)} vistas de landing ·{' '}
                  {formatNumber(data.totalCompletes)} llegaron a la venta ·{' '}
                  {formatNumber(data.totalSales ?? 0)} compraron. El embudo usa
                  &quot;empezaron&quot; como 100%, por eso aún no se dibuja.
                </p>
              </>
            ) : (
              <p className="text-sm text-neutral-500">
                Sin datos para {isAccumulated ? 'el acumulado' : formatDayLabel(selectedDay)}.
              </p>
            )}
          </div>
        )}

        {maxDropIdx >= 0 && data.totalStarts > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.08] px-4 py-2.5 text-sm text-rose-200">
            <Warning size={16} weight="fill" className="mt-0.5 shrink-0" />
            <span>
              <strong>Mayor caída:</strong> entre {funnelSteps[maxDropIdx - 1]?.name} y {funnelSteps[maxDropIdx]?.name} se pierde el{' '}
              {formatPct((funnelSteps[maxDropIdx - 1]?.pct ?? 0) - (funnelSteps[maxDropIdx]?.pct ?? 0))}{' '}
              ({formatNumber((funnelSteps[maxDropIdx - 1]?.count ?? 0) - (funnelSteps[maxDropIdx]?.count ?? 0))} personas).
            </span>
          </div>
        )}
      </SectionCard>

      {/* Backfill */}
      <SectionCard
        title="¿No te cuadra el número de compras?"
        subtitle="Si Shopify muestra más ventas que el embudo, cargá las que faltan a mano (se suman al día de hoy)."
        actions={
          <Button onClick={() => setBackfillOpen((v) => !v)} variant={backfillOpen ? 'ghost' : 'secondary'}>
            {backfillOpen ? 'Cancelar' : <><Plus size={15} weight="bold" /> Cargar venta</>}
          </Button>
        }
      >
        {backfillOpen ? (
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Cantidad" value={backfillCount} onChange={setBackfillCount} type="number" placeholder="1" hint="Cuántas compras (1-50)" />
              <Field label="Campaña (utm_campaign)" value={backfillCampaign} onChange={setBackfillCampaign} placeholder="(directo)" hint="Nombre de la campaña" />
              <Field label="País" value={backfillCountry} onChange={setBackfillCountry} placeholder="AR / CO / MX…" hint="ISO 2 letras (opcional)" />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button onClick={() => setBackfillOpen(false)} disabled={backfillBusy} variant="ghost">Cerrar</Button>
              <Button onClick={onBackfillSubmit} disabled={backfillBusy} variant="primary">
                {backfillBusy ? <Spinner /> : <Plus size={15} weight="bold" />}
                Agregar al embudo
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-neutral-500">
            El funnel agrupa la atribución <strong className="text-neutral-400">solo por campaña</strong> (el origen ig/fb se ve en Ventas).
          </p>
        )}
      </SectionCard>

      {/* Tabla detalle */}
      <SectionCard title="Detalle paso por paso" bodyClassName="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500">
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-2.5">#</th>
                <th className="px-5 py-2.5">Paso</th>
                <th className="px-5 py-2.5 text-right">% que llega</th>
                <th className="px-5 py-2.5 text-right">Personas</th>
                <th className="px-5 py-2.5 text-right">% perdido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {funnelSteps.map((step, i) => {
                const lost = 100 - step.pct;
                const isWorst = i === maxDropIdx;
                return (
                  <tr key={step.index} className={cn('transition-colors hover:bg-white/[0.02]', isWorst && 'bg-rose-500/[0.06]')}>
                    <td className="px-5 py-2.5 text-neutral-600">{step.index >= 98 ? '✓' : step.index}</td>
                    <td className="px-5 py-2.5 font-medium text-neutral-200">
                      {step.name}
                      {isWorst && <Badge accent="rose" className="ml-2">PEOR</Badge>}
                    </td>
                    <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-neutral-100">{formatPct(step.pct)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatNumber(step.count)}</td>
                    <td className={cn('px-5 py-2.5 text-right font-medium tabular-nums', lost >= 50 ? 'text-rose-400' : lost >= 25 ? 'text-amber-400' : 'text-neutral-500')}>
                      {i === 0 ? '—' : formatPct(lost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Atribución por campaña */}
      {data.utmBreakdown && data.utmBreakdown.length > 0 && (
        <SectionCard title="Atribución por campaña" subtitle="De qué campaña llegan tus leads y compradores." bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-2.5">Campaña</th>
                  <th className="px-5 py-2.5 text-right">Empezaron</th>
                  <th className="px-5 py-2.5 text-right">Llegaron</th>
                  <th className="px-5 py-2.5 text-right">% Llega</th>
                  <th className="px-5 py-2.5 text-right">Compraron</th>
                  <th className="px-5 py-2.5 text-right">CVR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.utmBreakdown.map((row, i) => {
                  const completePct = row.starts > 0 ? (row.completes / row.starts) * 100 : 0;
                  return (
                    <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                      <td className="max-w-[220px] truncate px-5 py-2.5 font-medium text-neutral-200" title={row.campaign}>{row.campaign}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-300">{formatNumber(row.starts)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatNumber(row.completes)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-500">{formatPct(completePct)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-emerald-400">{formatNumber(row.purchases)}</td>
                      <td className="px-5 py-2.5 text-right">
                        <Badge accent={row.cvr >= 5 ? 'emerald' : row.cvr >= 2 ? 'amber' : 'neutral'}>{formatPct(row.cvr)}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* País (solo backend memory) */}
      {data.countryBreakdown && data.countryBreakdown.length > 0 && (
        <SectionCard title="Desglose por país" subtitle="Rendimiento del quiz por país detectado (geo-IP)." bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-2.5">País</th>
                  <th className="px-5 py-2.5 text-right">Empezaron</th>
                  <th className="px-5 py-2.5 text-right">Resultados</th>
                  <th className="px-5 py-2.5 text-right">Compras</th>
                  <th className="px-5 py-2.5 text-right">CVR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.countryBreakdown.map((row: CountryBreakdownRow, i: number) => (
                  <tr key={i} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-2.5 font-medium text-neutral-200">{COUNTRY_FLAGS[row.country] || ''} {row.country}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-neutral-300">{formatNumber(row.starts)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatNumber(row.completes)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-emerald-400">{formatNumber(row.purchases)}</td>
                    <td className="px-5 py-2.5 text-right">
                      <Badge accent={row.cvr >= 5 ? 'emerald' : row.cvr >= 2 ? 'amber' : 'neutral'}>{formatPct(row.cvr)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, hint, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: 'text' | 'number';
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-neutral-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 block w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
      />
      {hint && <span className="mt-1 block text-[11px] text-neutral-600">{hint}</span>}
    </label>
  );
}

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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowClockwise,
  CalendarBlank,
  Plus,
  Trash,
  Warning,
  FlagBanner,
  TrendDown,
  Flask,
} from '@phosphor-icons/react';
import type { FunnelData, CountryBreakdownRow, FunnelVariantBreakdownRow } from '@/lib/admin/store';
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
import { resolveRangeFromParam } from '@/lib/admin/range';
import { FUNNEL_VARIANT_LABEL } from '@/lib/quiz-v2/funnelVariant';

type Props = {
  initialData: FunnelData;
};

const SLIDE_LABELS: Record<string, string> = {
  landing_hook: 'Landing (entrada)',
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
  AR: '🇦🇷', CO: '🇨🇴', PE: '🇵🇪', MX: '🇲🇽', CL: '🇨🇱', '(desconocido)': '🌎',
};

export function FunnelView({ initialData }: Props) {
  const searchParams = useSearchParams();
  const range = resolveRangeFromParam(searchParams.get('range'));

  const [data, setData] = useState<FunnelData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle de 3 vistas: Argentina / LATAM / Unificado (default).
  // 'unified' no manda `version` => la API suma todas las filas.
  const [versionView, setVersionView] = useState<'ar' | 'latam' | 'unified'>('unified');

  // Backfill manual de compras (webhooks perdidos / ventas viejas).
  const [backfillOpen, setBackfillOpen] = useState(false);
  const [backfillCount, setBackfillCount] = useState('1');
  const [backfillCampaign, setBackfillCampaign] = useState('');
  const [backfillCountry, setBackfillCountry] = useState('');
  const [backfillBusy, setBackfillBusy] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const versionQS = versionView === 'unified' ? '' : `&version=${versionView}`;
      const res = await fetch(`/api/admin/funnel-data?range=${range.preset}${versionQS}`, {
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
  }, [range.preset, versionView]);

  // Re-fetch cuando cambia el período global o la vista de versión.
  useEffect(() => { refetch(); }, [refetch]);

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
      refetch();
    } catch (err) {
      alert(`Error de red al resetear: ${err instanceof Error ? err.message : 'desconocido'}`);
    }
  }, [refetch]);

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
      refetch();
    } catch (err) {
      alert(`Error de red: ${err instanceof Error ? err.message : 'desconocido'}`);
    } finally {
      setBackfillBusy(false);
    }
  }, [backfillCount, backfillCampaign, backfillCountry, refetch]);

  // Base de medición (100% del embudo):
  //   - 'landing' = slide 0 (todos los que entraron / vieron la pantalla de entrada)
  //   - 'start'   = slide 1 (los que llegaron a la 1ª pregunta = iniciaron el quiz)
  // Permite medir el embudo DESDE la landing o desde el inicio real del quiz.
  const [baseMode, setBaseMode] = useState<'landing' | 'start'>('landing');
  const baseIndex = baseMode === 'landing' ? 0 : 1;

  const landingCount = data.slides[0]?.count ?? data.totalStarts;
  const startedCount = data.slides[1]?.count ?? 0;
  const baseRef = (data.slides[baseIndex]?.count ?? data.totalStarts) || 1;
  /** % de los que entraron a la landing que llegaron a la 1ª pregunta. */
  const landingToStartPct = landingCount > 0 ? (startedCount / landingCount) * 100 : 0;

  // Pasos del embudo (slides desde la base + llegaron a venta + compraron).
  const funnelSteps = useMemo(() => {
    const steps: Array<{ name: string; pct: number; count: number; index: number }> = [];
    data.slides.forEach((s, i) => {
      if (i < baseIndex) return; // los slides por encima de la base no se muestran
      steps.push({
        name: SLIDE_LABELS[s.id] || s.id,
        pct: (s.count / baseRef) * 100,
        count: s.count,
        index: i,
      });
    });
    steps.push({ name: 'Llegaron a la venta', pct: (data.totalCompletes / baseRef) * 100, count: data.totalCompletes, index: 98 });
    if (data.totalCheckoutClicks !== null) {
      steps.push({ name: 'Clickearon comprar', pct: (data.totalCheckoutClicks / baseRef) * 100, count: data.totalCheckoutClicks, index: 99 });
    }
    if (data.totalSales !== null) {
      steps.push({ name: 'Compraron', pct: (data.totalSales / baseRef) * 100, count: data.totalSales, index: 100 });
    }
    return steps;
  }, [data, baseRef, baseIndex]);

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

  // Mejor CVR total del test FULL-FUNNEL (para resaltar la variante ganadora).
  const bestTotalConversion = useMemo(() => {
    const rows = (data.funnelVariantBreakdown ?? []).filter((r) => r.quizStarts > 0);
    return rows.reduce((m, r) => Math.max(m, r.totalConversionRate), 0);
  }, [data.funnelVariantBreakdown]);

  return (
    <div className="space-y-5">
      {/* Header + selector de día */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Embudo del quiz</h1>
          <p className="mt-1 text-sm text-neutral-400">
            % de personas que llegan a cada paso, medido desde{' '}
            <strong className="text-neutral-200">{baseMode === 'landing' ? 'la landing (entrada)' : 'el inicio del quiz (1ª pregunta)'}</strong>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* El período se controla con el selector GLOBAL de la barra superior. */}
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm font-medium text-neutral-300">
            <CalendarBlank size={16} weight="bold" className="text-emerald-400" />
            {range.label}
          </span>
          <Button onClick={() => refetch()} disabled={loading} variant="secondary">
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
        <Badge accent={range.preset === 'todo' ? 'sky' : 'violet'}>{range.label}</Badge>
        <span>{formatNumber(data.totalEvents)} eventos · backend: <span className="font-medium text-neutral-400">{data.backend}</span></span>
      </div>

      {/* Toggle de 3 vistas: Argentina / LATAM / Unificado */}
      <VersionToggle value={versionView} onChange={setVersionView} />

      {versionView === 'unified' && (
        <Banner tone="info">
          ℹ️ <strong>Vista unificada:</strong> el embudo paso a paso usa los pasos de{' '}
          <strong>Argentina</strong> como referencia; LATAM se alinea por posición y puede no
          coincidir 1:1. Los totales (inicios, ventas, etc.) sí suman correctamente — incluye además
          el histórico que quedó sin versión asignada.
        </Banner>
      )}

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
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Vieron la landing"
          value={formatNumber(landingCount)}
          subtitle={baseMode === 'landing' ? '100% — referencia' : 'Entraron al funnel'}
          accent="violet"
        />
        <StatCard
          label="Iniciaron el quiz"
          value={formatNumber(startedCount)}
          subtitle={landingCount > 0 ? `${formatPct(landingToStartPct)} de la landing` : '—'}
          accent={baseMode === 'start' ? 'violet' : 'sky'}
          icon={landingToStartPct < 50 && landingCount > 0 ? <TrendDown size={18} weight="bold" /> : undefined}
        />
        <StatCard
          label="Llegaron a la venta"
          value={formatNumber(data.totalCompletes)}
          subtitle={baseRef > 0 ? `${formatPct((data.totalCompletes / baseRef) * 100)} ${baseMode === 'landing' ? 'de la landing' : 'del inicio'}` : '—'}
          accent="sky"
        />
        <StatCard
          label="Clickearon comprar"
          value={data.totalCheckoutClicks ?? '—'}
          subtitle={baseRef > 0 && data.totalCheckoutClicks ? `${formatPct((data.totalCheckoutClicks / baseRef) * 100)} ${baseMode === 'landing' ? 'de la landing' : 'del inicio'}` : '—'}
          accent="amber"
        />
        <StatCard
          label="Compraron"
          value={data.totalSales ?? '—'}
          subtitle={baseRef > 0 && data.totalSales ? `${formatPct((data.totalSales / baseRef) * 100)} ${baseMode === 'landing' ? 'de la landing' : 'del inicio'}` : '—'}
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
        actions={<BaseToggle value={baseMode} onChange={setBaseMode} landingToStartPct={landingToStartPct} />}
      >
        {data.totalStarts > 0 ? (
          <FunnelShape steps={shapeSteps} height={280} minWidth={760} />
        ) : (
          <div className="flex h-44 flex-col items-center justify-center gap-2 text-center">
            {data.totalEvents > 0 ? (
              <>
                <p className="text-sm text-neutral-300">
                  Para {range.label} hubo{' '}
                  <strong>{formatNumber(data.totalEvents)}</strong> eventos, pero todavía{' '}
                  <strong>nadie entró a la landing</strong> (slide 0 = 0).
                </p>
                <p className="text-xs text-neutral-500">
                  {formatNumber(data.totalCompletes)} llegaron a la venta ·{' '}
                  {formatNumber(data.totalSales ?? 0)} compraron. El embudo usa la{' '}
                  base seleccionada como 100%, por eso aún no se dibuja.
                </p>
              </>
            ) : (
              <p className="text-sm text-neutral-500">
                Sin datos para {range.label}.
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

      {/* Test FULL-FUNNEL — Argentina (A vs B) */}
      {data.funnelVariantBreakdown && data.funnelVariantBreakdown.length > 0 && (
        <SectionCard
          icon={<Flask size={18} weight="fill" />}
          title="Test full-funnel — Argentina (A vs B)"
          subtitle="Compara el funnel ENTERO: A (control) vs B (rebrand mujer). Inicios = llegaron a la 1ª pregunta · % completó / vio venta / click / compró son tasas paso a paso · CVR total = compras sobre inicios (el KPI estrella)."
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[11px] font-medium uppercase tracking-wide text-neutral-500">
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-2.5">Variante</th>
                  <th className="px-5 py-2.5 text-right">Inicios</th>
                  <th className="px-5 py-2.5 text-right">% completó</th>
                  <th className="px-5 py-2.5 text-right">% vio venta</th>
                  <th className="px-5 py-2.5 text-right">% click</th>
                  <th className="px-5 py-2.5 text-right">% compró</th>
                  <th className="px-5 py-2.5 text-right">CVR total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.funnelVariantBreakdown.map((row: FunnelVariantBreakdownRow) => {
                  const isBestTotal =
                    row.quizStarts > 0 && row.totalConversionRate === bestTotalConversion && bestTotalConversion > 0;
                  return (
                    <tr key={row.variant} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-2.5 font-medium text-neutral-200">
                        <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-neutral-300">{row.variant}</span>
                        {FUNNEL_VARIANT_LABEL[row.variant]}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-300">{formatNumber(row.quizStarts)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatPct(row.completionRate)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatPct(row.salesViewRate)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatPct(row.checkoutRate)}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatPct(row.purchaseRate)}</td>
                      <td className="px-5 py-2.5 text-right">
                        <Badge accent={isBestTotal ? 'emerald' : 'neutral'}>{formatPct(row.totalConversionRate)}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-3 text-[11px] text-neutral-600">
            Solo tráfico de Argentina. La variante se asigna 50/50 por navegador y es estable durante todo el funnel (incluida la compra, atribuida server-side). Kill switch: <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_AB_FUNNEL_ENABLED</code>. Para forzar una variante en QA agregá <code className="rounded bg-black/30 px-1">?af=A</code> (o B) a la URL del quiz.
          </p>
        </SectionCard>
      )}

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
                  <th className="px-5 py-2.5 text-right">Click</th>
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
                      <td className="px-5 py-2.5 text-right tabular-nums text-neutral-400">{formatNumber(row.checkoutClicks)}</td>
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

function BaseToggle({
  value,
  onChange,
  landingToStartPct,
}: {
  value: 'landing' | 'start';
  onChange: (v: 'landing' | 'start') => void;
  landingToStartPct: number;
}) {
  const opts: Array<{ key: 'landing' | 'start'; label: string }> = [
    { key: 'landing', label: 'Landing' },
    { key: 'start', label: 'Inicio del quiz' },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-neutral-500 sm:inline">Medir desde:</span>
      <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              value === o.key
                ? 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/30'
                : 'text-neutral-400 hover:text-neutral-200',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {value === 'landing' && (
        <Badge accent={landingToStartPct < 50 ? 'rose' : landingToStartPct < 70 ? 'amber' : 'emerald'}>
          {formatPct(landingToStartPct)} inician
        </Badge>
      )}
    </div>
  );
}

function VersionToggle({
  value,
  onChange,
}: {
  value: 'ar' | 'latam' | 'unified';
  onChange: (v: 'ar' | 'latam' | 'unified') => void;
}) {
  const opts: Array<{ key: 'ar' | 'latam' | 'unified'; label: string }> = [
    { key: 'ar', label: '🇦🇷 Argentina' },
    { key: 'latam', label: '🌎 LATAM' },
    { key: 'unified', label: 'Unificado' },
  ];
  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-xs text-neutral-500 sm:inline">Versión:</span>
      <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              'rounded-md px-3 py-1 text-xs font-medium transition-colors',
              value === o.key
                ? 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/30'
                : 'text-neutral-400 hover:text-neutral-200',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
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

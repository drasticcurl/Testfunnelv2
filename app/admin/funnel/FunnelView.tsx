'use client';

/**
 * FunnelView — embudo HORIZONTAL de izquierda a derecha, forma de embudo real.
 *
 * SVG con trapecio simétrico que se angosta de izquierda a derecha.
 * Cada segmento tiene altura proporcional al % que llega.
 * 100% = personas que empezaron el quiz (totalStarts).
 */

import { useCallback, useMemo, useState } from 'react';
import type { FunnelData, UTMBreakdownRow } from '@/lib/admin/store';

type Props = {
  initialData: FunnelData;
};

// Labels de slides para el embudo del admin.
const SLIDE_LABELS: Record<string, string> = {
  // V1 slides
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
  // V2 slides
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
  // V3 uses same IDs as V2 subset (momento_hinchazon, tiempo_con_problema, etc.)
  // Labels already defined above
};

const COLORS = [
  '#2563eb', '#3b82f6', '#4f46e5', '#6366f1', '#7c3aed',
  '#8b5cf6', '#a855f7', '#c026d3', '#db2777', '#e11d48',
  '#ef4444', '#f97316', '#eab308', '#84cc16', '#10b981',
  '#06b6d4',
];

export function FunnelView({ initialData }: Props) {
  const [data, setData] = useState<FunnelData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [version, setVersion] = useState<'all' | 'v1' | 'v2' | 'v3'>('all');

  const refetch = useCallback(async (ver?: 'all' | 'v1' | 'v2' | 'v3') => {
    const v = ver ?? version;
    setLoading(true); setError(null);
    try {
      const params = v !== 'all' ? `?version=${v}` : '';
      const res = await fetch(`/api/admin/funnel-data${params}`, { cache: 'no-store', credentials: 'same-origin' });
      if (res.status === 401) { window.location.href = '/admin'; return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { ok: boolean; data: FunnelData };
      if (!json.ok || !json.data) throw new Error('respuesta invalida');
      setData(json.data);
    } catch (err) { setError(err instanceof Error ? err.message : 'error'); }
    finally { setLoading(false); }
  }, [version]);

  const handleVersionChange = useCallback((v: 'all' | 'v1' | 'v2' | 'v3') => {
    setVersion(v);
    refetch(v);
  }, [refetch]);

  const onReset = useCallback(async () => {
    const code = prompt('Para resetear todas las estadísticas, escribí "123" y dale Aceptar:');
    if (code !== '123') return;
    try {
      const res = await fetch('/api/admin/funnel-data', {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.status === 401) {
        alert('Sesión expirada. Vas a ser redirigido al login.');
        window.location.href = '/admin';
        return;
      }
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

  // 100% = totalStarts (personas que empezaron el quiz, slide 1).
  const funnelSteps = useMemo(() => {
    const totalRef = data.totalStarts || 1;
    const steps: Array<{ name: string; pct: number; count: number; color: string; index: number }> = [];

    // Pasos del quiz (slides index >= 0 — all slides now have correct data)
    data.slides
      .forEach((s, i) => {
        steps.push({
          name: SLIDE_LABELS[s.id] || s.id,
          pct: (s.count / totalRef) * 100,
          count: s.count,
          color: COLORS[i % COLORS.length],
          index: s.index,
        });
      });

    steps.push({
      name: 'Resultados',
      pct: (data.totalCompletes / totalRef) * 100,
      count: data.totalCompletes,
      color: '#10b981',
      index: 98,
    });
    if (data.totalCheckoutClicks !== null) {
      steps.push({
        name: 'Click comprar',
        pct: (data.totalCheckoutClicks / totalRef) * 100,
        count: data.totalCheckoutClicks,
        color: '#f59e0b',
        index: 99,
      });
    }
    return steps;
  }, [data]);

  const maxDropIdx = useMemo(() => {
    let max = 0, idx = -1;
    funnelSteps.forEach((s, i) => {
      if (i > 0) { const d = (funnelSteps[i-1]?.pct ?? 0) - s.pct; if (d > max) { max = d; idx = i; } }
    });
    return idx;
  }, [funnelSteps]);

  // SVG dimensions
  const W = 1000, H = 280, PAD = 30;
  const usableW = W - PAD * 2;
  const segW = usableW / funnelSteps.length;
  const maxH = 200;
  const centerY = H / 2;

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Embudo del Quiz</h1>
            <p className="mt-0.5 text-sm text-neutral-600">% de personas que llegan a cada paso vs las que empezaron el quiz.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500">
              {data.totalEvents.toLocaleString('es-AR')} eventos · backend: <span className="font-medium">{data.backend}</span>
            </span>
            <button type="button" onClick={() => refetch()} disabled={loading} className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">
              {loading ? 'Cargando...' : '↻ Actualizar'}
            </button>
            <button type="button" onClick={onReset} disabled={loading} className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50" title="Borrar todas las estadísticas">Reset</button>
          </div>
        </div>

        {/* Version tabs */}
        <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
          {(['all', 'v1', 'v2', 'v3'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleVersionChange(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                version === v
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {v === 'all' ? 'Todos' : v === 'v1' ? 'Quiz V1' : v === 'v2' ? 'Quiz V2' : 'Quiz V3 (Google)'}
            </button>
          ))}
        </div>
      </header>

      {data.backend === 'memory' && (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          ⚠️ Backend en memoria: los datos se pierden al re-deploy. Configurá <code>FUNNEL_STORE=supabase</code>.
        </div>
      )}

      {error && <p className="text-xs text-red-600">Error: {error}</p>}

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Empezaron el quiz" value={data.totalStarts} subtitle="100% — referencia" />
        <Kpi label="Llegaron a resultados" value={data.totalCompletes} subtitle={`${data.totalStarts > 0 ? ((data.totalCompletes / data.totalStarts) * 100).toFixed(1) : '—'}%`} />
        <Kpi label="Click comprar" value={data.totalCheckoutClicks ?? '—'} subtitle={`${data.totalStarts > 0 && data.totalCheckoutClicks ? ((data.totalCheckoutClicks / data.totalStarts) * 100).toFixed(1) + '%' : '—'}`} />
        <Kpi label="Mayor abandono" value={version !== 'all' && maxDropIdx >= 0 ? funnelSteps[maxDropIdx]?.name ?? '—' : '—'} subtitle={version !== 'all' && maxDropIdx >= 0 ? `${((funnelSteps[maxDropIdx-1]?.pct??0)-(funnelSteps[maxDropIdx]?.pct??0)).toFixed(1)}% se pierde` : 'seleccioná una versión'} />
      </section>

      {/* EMBUDO HORIZONTAL SVG — forma de embudo real (solo para versiones específicas) */}
      {version !== 'all' && (
      <section className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900 mb-1">Embudo — % que llega a cada paso</h2>
        <p className="text-xs text-neutral-500 mb-3">De izquierda a derecha. El alto de cada sección = % que llega. Hover para detalle.</p>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-w-[750px]" preserveAspectRatio="xMidYMid meet">
            {funnelSteps.map((step, i) => {
              const x = PAD + i * segW;
              const thisH = Math.max((step.pct / 100) * maxH, 6);
              const nextH = i < funnelSteps.length - 1
                ? Math.max((funnelSteps[i+1].pct / 100) * maxH, 6)
                : thisH * 0.85;

              const topL = centerY - thisH / 2;
              const botL = centerY + thisH / 2;
              const topR = centerY - nextH / 2;
              const botR = centerY + nextH / 2;

              const isWorst = i === maxDropIdx;
              const isHov = hovered === i;

              return (
                <g key={step.index} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="cursor-pointer">
                  <polygon
                    points={`${x},${topL} ${x+segW},${topR} ${x+segW},${botR} ${x},${botL}`}
                    fill={isWorst ? '#dc2626' : step.color}
                    opacity={isHov ? 1 : 0.88}
                    stroke={isWorst ? '#991b1b' : 'rgba(255,255,255,0.6)'}
                    strokeWidth={isWorst ? 2.5 : 0.5}
                  />
                  {/* % centrado */}
                  {thisH > 20 && (
                    <text x={x + segW/2} y={centerY + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={12} fontWeight="bold">
                      {step.pct.toFixed(0)}%
                    </text>
                  )}
                  {/* Nombre abajo */}
                  <text x={x + segW/2} y={H - 10} textAnchor="middle" fill={isWorst ? '#dc2626' : '#525252'} fontSize={9} fontWeight={isWorst ? 'bold' : 'normal'}>
                    {step.name}
                  </text>
                  {/* Tooltip */}
                  {isHov && (
                    <g>
                      <rect x={x + segW/2 - 60} y={topL - 40} width={120} height={34} rx={5} fill="#1f2937" opacity={0.95} />
                      <text x={x + segW/2} y={topL - 26} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="bold">
                        {step.name}: {step.pct.toFixed(1)}%
                      </text>
                      <text x={x + segW/2} y={topL - 13} textAnchor="middle" fill="#d1d5db" fontSize={9}>
                        {step.count.toLocaleString('es-AR')} personas
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {maxDropIdx >= 0 && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            <strong>Mayor caída:</strong> entre {funnelSteps[maxDropIdx-1]?.name} y {funnelSteps[maxDropIdx]?.name} se pierde el {((funnelSteps[maxDropIdx-1]?.pct??0)-(funnelSteps[maxDropIdx]?.pct??0)).toFixed(1)}% ({((funnelSteps[maxDropIdx-1]?.count??0)-(funnelSteps[maxDropIdx]?.count??0)).toLocaleString('es-AR')} personas).
          </div>
        )}
      </section>
      )}

      {/* Tabla (solo para versiones específicas) */}
      {version !== 'all' && (
      <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold text-neutral-900">Detalle</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Paso</th>
                <th className="px-3 py-2 text-right">% que llega</th>
                <th className="px-3 py-2 text-right">Personas</th>
                <th className="px-3 py-2 text-right">% perdido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {funnelSteps.map((step, i) => {
                const lost = 100 - step.pct;
                const isWorst = i === maxDropIdx;
                return (
                  <tr key={step.index} className={isWorst ? 'bg-red-50' : ''}>
                    <td className="px-3 py-2 text-neutral-400">{step.index === 99 ? '✓' : step.index}</td>
                    <td className="px-3 py-2 font-medium">{step.name}{isWorst && <span className="ml-2 text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">PEOR</span>}</td>
                    <td className="px-3 py-2 text-right font-semibold">{step.pct.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right text-neutral-600">{step.count.toLocaleString('es-AR')}</td>
                    <td className={'px-3 py-2 text-right font-medium ' + (lost >= 50 ? 'text-red-600' : lost >= 25 ? 'text-amber-600' : 'text-neutral-500')}>{i === 0 ? '—' : `${lost.toFixed(1)}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {/* UTM Breakdown */}
      {data.utmBreakdown && data.utmBreakdown.length > 0 && (
        <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="p-4 border-b border-neutral-100">
            <h2 className="text-sm font-semibold text-neutral-900">Atribución por UTM</h2>
            <p className="mt-0.5 text-xs text-neutral-500">De dónde llegan tus leads y compradores.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Medium</th>
                  <th className="px-3 py-2">Campaign</th>
                  <th className="px-3 py-2">Content</th>
                  <th className="px-3 py-2 text-right">Starts</th>
                  <th className="px-3 py-2 text-right">Completes</th>
                  <th className="px-3 py-2 text-right">Clicks</th>
                  <th className="px-3 py-2 text-right">Compras</th>
                  <th className="px-3 py-2 text-right">CVR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {data.utmBreakdown.map((row: UTMBreakdownRow, i: number) => (
                  <tr key={i} className={row.purchases > 0 ? 'bg-green-50' : ''}>
                    <td className="px-3 py-2 font-medium text-neutral-900 max-w-[120px] truncate" title={row.source}>{row.source}</td>
                    <td className="px-3 py-2 text-neutral-600 max-w-[100px] truncate" title={row.medium}>{row.medium}</td>
                    <td className="px-3 py-2 text-neutral-600 max-w-[140px] truncate" title={row.campaign}>{row.campaign}</td>
                    <td className="px-3 py-2 text-neutral-500 max-w-[140px] truncate" title={row.content}>{row.content}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.starts.toLocaleString('es-AR')}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.completes.toLocaleString('es-AR')}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{row.checkoutClicks.toLocaleString('es-AR')}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-semibold">{row.purchases.toLocaleString('es-AR')}</td>
                    <td className={'px-3 py-2 text-right font-semibold ' + (row.cvr >= 5 ? 'text-green-600' : row.cvr >= 2 ? 'text-amber-600' : 'text-neutral-500')}>{row.cvr.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Kpi({ label, value, subtitle }: { label: string; value: number | string; subtitle?: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="text-xs font-medium text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">{typeof value === 'number' ? value.toLocaleString('es-AR') : value}</div>
      {subtitle && <div className="mt-0.5 text-xs text-neutral-500">{subtitle}</div>}
    </div>
  );
}

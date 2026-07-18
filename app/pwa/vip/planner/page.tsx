'use client';

/**
 * /pwa/vip/planner — Planner semanal premium EDITABLE.
 *
 * Planilla rellenable de 8 filas (`PLANNER_ROWS`) × 7 días (`PLANNER_DAYS`):
 *  - Cada celda es un input controlado (autoguardado en localStorage con debounce).
 *  - Hidratación SSR-safe: estado inicial determinista (`createEmptyPlanner`) y
 *    carga real de `localStorage` en un efecto posterior al montaje, para evitar
 *    desajustes de hidratación.
 *  - Botón que descarga un PDF en blanco (plantilla vacía, sin los datos del
 *    usuario) mediante una librería client-side cargada dinámicamente.
 *
 * Mantiene el design system (badge dorado premium —acento de marca VIP—, tokens
 * terracotta/warm/charcoal, animaciones framer-motion) y conserva el bloque
 * `@media print` útil para imprimir limpio.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PLANNER_DAYS,
  PLANNER_ROWS,
  createEmptyPlanner,
  loadPlannerFromStorage,
  savePlannerToStorage,
  setCell,
  type PlannerData,
  type PlannerDayIndex,
  type PlannerRowKey,
} from '@/lib/pwa/planner-state';
import { generateBlankPlannerPdf } from '@/lib/pwa/planner-pdf';
import { Icon } from '@/components/pwa/ui/Icon';

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/** Retardo de autoguardado tras la última pulsación de tecla (Req 7.1). */
const DEBOUNCE_MS = 400;

/** Filas cuyo contenido es numérico → mejor teclado en mobile (opcional). */
const NUMERIC_ROWS: ReadonlySet<PlannerRowKey> = new Set<PlannerRowKey>(['agua', 'sintomas']);

type SaveStatus = 'idle' | 'saved' | 'error';

/**
 * Compara dos planners celda a celda. Se usa para confirmar que el autoguardado
 * persistió realmente lo que hay en memoria (si `localStorage` falla en
 * silencio, la lectura posterior no coincidirá y mostramos el aviso sutil).
 */
function plannersMatch(a: PlannerData, b: PlannerData): boolean {
  for (const { key } of PLANNER_ROWS) {
    const rowA = a[key];
    const rowB = b[key];
    for (let day = 0; day < PLANNER_DAYS.length; day++) {
      if (rowA[day] !== rowB[day]) return false;
    }
  }
  return true;
}

export default function VipPlannerPage() {
  // 1) Estado inicial determinista → SSR y primer render del cliente coinciden.
  const [planner, setPlanner] = useState<PlannerData>(() => createEmptyPlanner());
  const [hydrated, setHydrated] = useState(false);

  // Estado de autoguardado e indicador sutil (Req 7.6).
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Estado del botón de PDF (Req 9.6) y mensaje de error legible (Req 9.7 / 10.5).
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // 2) Hidratar desde localStorage SOLO en cliente, tras el montaje (Req 8.1, 11.3).
  //    Una única actualización de estado; si falla, conservamos el vacío (Req 11.5).
  useEffect(() => {
    try {
      setPlanner(loadPlannerFromStorage());
    } catch {
      // loadPlannerFromStorage ya es fail-safe; este catch es defensa extra.
    }
    setHydrated(true);
  }, []);

  // 3) Autoguardado con debounce: solo después de hidratar (Req 7.1, 7.2, 7.4).
  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(() => {
      savePlannerToStorage(planner);
      // savePlannerToStorage no propaga errores: verificamos leyendo de vuelta
      // para poder mostrar un aviso sutil si el guardado no se completó (Req 7.6).
      try {
        const persisted = loadPlannerFromStorage();
        setSaveStatus(plannersMatch(persisted, planner) ? 'saved' : 'error');
      } catch {
        setSaveStatus('error');
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [planner, hydrated]);

  // 4) Handler de edición de celda (inmutable, solo ante escritura del usuario).
  const handleCellChange = useCallback(
    (row: PlannerRowKey, day: PlannerDayIndex, value: string) => {
      setPlanner((prev) => setCell(prev, row, day, value));
    },
    [],
  );

  // 5) Descarga de PDF en blanco (Req 9.1, 9.6, 9.7, 10.5).
  //    Guardamos contra dobles clicks con un ref además del estado deshabilitado.
  const generatingRef = useRef(false);
  const handleDownloadPdf = useCallback(async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setPdfError(null);
    setIsGeneratingPdf(true);
    try {
      await generateBlankPlannerPdf();
    } catch {
      // Sin recargar ni navegar: la edición y el guardado siguen operativos.
      setPdfError('No se pudo generar el PDF. Volvé a intentarlo en unos segundos.');
    } finally {
      setIsGeneratingPdf(false);
      generatingRef.current = false;
    }
  }, []);

  return (
    <motion.div className="space-y-4 pb-4" initial="hidden" animate="show">
      {/* Print styles: ocultar chrome de la app al imprimir */}
      <style>{`
        @media print {
          header, nav, .no-print { display: none !important; }
          main { padding: 0 !important; }
          .planner-print { box-shadow: none !important; border: none !important; }
          @page { size: landscape; margin: 12mm; }
        }
      `}</style>

      {/* Back link + acciones (no se imprimen) */}
      <motion.div variants={item} className="no-print flex items-center justify-between gap-3">
        <Link href="/pwa/vip" className="text-terracotta text-sm font-body font-medium hover:underline">
          ← VIP
        </Link>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          aria-busy={isGeneratingPdf}
          className="rounded-full bg-gradient-to-r from-terracotta to-terracotta-dark text-warm font-body font-semibold text-sm px-5 py-2.5 shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isGeneratingPdf ? (
            '⏳ Generando…'
          ) : (
            <span className="inline-flex items-center gap-1">
              <Icon name="download" size="sm" decorative /> Descargar PDF en blanco
            </span>
          )}
        </button>
      </motion.div>

      {/* Header (no-print) */}
      <motion.div variants={item} className="no-print">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-warm px-2.5 py-1 rounded-full mb-2"
          style={{ background: 'linear-gradient(135deg, #C9A227, #E8B923)' }}
        >
          👑 Planner premium
        </span>
        <h1 className="font-heading text-2xl font-semibold text-charcoal">
          Planner semanal
        </h1>
        <p className="font-body text-charcoal/60 text-sm mt-1 leading-relaxed">
          Completá tu semana directamente acá: se guarda solo a medida que escribís. ¿Lo querés en
          papel? Descargá la plantilla en blanco en PDF y llenala a mano.
        </p>
      </motion.div>

      {/* Mensaje de error de PDF (no-print) — no rompe edición ni guardado */}
      {pdfError && (
        <motion.div
          variants={item}
          role="alert"
          className="no-print rounded-xl border border-error/40 bg-error/10 px-4 py-3 font-body text-sm text-charcoal"
        >
          ⚠️ {pdfError}
        </motion.div>
      )}

      {/* Indicador sutil de autoguardado (no-print) */}
      <motion.div variants={item} className="no-print min-h-[18px]" aria-live="polite">
        {saveStatus === 'saved' && (
          <span className="font-body text-xs text-terracotta font-medium">Guardado ✓</span>
        )}
        {saveStatus === 'error' && (
          <span className="font-body text-xs text-error font-medium">
            No se pudo autoguardar — tu trabajo sigue acá mientras tengas la página abierta.
          </span>
        )}
      </motion.div>

      {/* Planilla editable */}
      <motion.div
        variants={item}
        className="planner-print bg-warm rounded-2xl p-4 shadow-sm border border-warm-border overflow-x-auto"
      >
        <div className="hidden print:block mb-3">
          <h2 className="font-heading text-xl font-semibold text-charcoal">
            Mi semana · Chau Hinchazón
          </h2>
          <p className="font-body text-xs text-charcoal/60">Semana del ____ / ____ al ____ / ____</p>
        </div>

        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr>
              <th className="border border-warm-border bg-terracotta-soft/60 p-2 text-left font-semibold text-charcoal w-40">
                &nbsp;
              </th>
              {PLANNER_DAYS.map((d) => (
                <th
                  key={d}
                  className="border border-warm-border bg-terracotta-soft/60 p-2 text-center font-semibold text-charcoal"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLANNER_ROWS.map((row) => {
              const numeric = NUMERIC_ROWS.has(row.key);
              return (
                <tr key={row.key}>
                  <td className="border border-warm-border p-2 font-medium text-charcoal/80 align-top">
                    {row.label}
                  </td>
                  {PLANNER_DAYS.map((d, dayIdx) => (
                    <td key={d} className="border border-warm-border p-1 align-top">
                      <textarea
                        value={planner[row.key][dayIdx]}
                        onChange={(e) =>
                          handleCellChange(row.key, dayIdx as PlannerDayIndex, e.target.value)
                        }
                        maxLength={500}
                        rows={2}
                        inputMode={numeric ? 'numeric' : undefined}
                        aria-label={`${row.label} — ${d}`}
                        placeholder=""
                        className="w-full min-h-[2.75rem] resize-y rounded-md border border-warm-border bg-warm/30 px-1.5 py-1 text-[11px] text-charcoal leading-snug outline-none transition-colors focus:border-terracotta focus:bg-warm focus:ring-2 focus:ring-terracotta/40"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="font-body text-[11px] text-charcoal/50 mt-3 leading-relaxed">
          💡 Tip: completá el ritual del agua de arroz primero cada mañana y cerrá el día anotando
          tu hinchazón AM/PM. Al final de la semana vas a ver el patrón.
        </p>
      </motion.div>
    </motion.div>
  );
}

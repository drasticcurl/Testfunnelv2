'use client';

/**
 * SlideWeeklyPlanV3 — gráfico de progreso compacto.
 * 4 barras de semanas sin personalización por nombre (V3 no pide nombre).
 */

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface Props {
  onNext: () => void;
}

const WEEKS = [
  { week: 1, label: 'Semana 1 — Limpieza', percent: 25, color: '#E07856' },
  { week: 2, label: 'Semana 2 — Reincorporación', percent: 50, color: '#D9A441' },
  { week: 3, label: 'Semana 3 — Estabilización', percent: 75, color: '#7A9B7E' },
  { week: 4, label: 'Semana 4 — Mantenimiento', percent: 100, color: '#5B8A60' },
];

export function SlideWeeklyPlanV3({ onNext }: Props) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 28);
  const targetLabel = targetDate.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold leading-tight">
        Tu Plan Anti-Hinchazón de 4 semanas
      </h2>

      <p className="mt-3 font-sans text-sm text-[#5C5852]">
        Objetivo: deshincharte para <strong className="text-charcoal">{targetLabel}</strong>
      </p>

      <div className="mt-6 space-y-3">
        {WEEKS.map((w, i) => (
          <div key={w.week} className="text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-sm text-charcoal font-medium">{w.label}</span>
              <span className="font-sans text-xs font-bold" style={{ color: w.color }}>
                {w.percent}%
              </span>
            </div>
            <div className="h-3 bg-[#EFECE7] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: w.color }}
                initial={{ width: 0 }}
                animate={{ width: `${w.percent}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 + i * 0.15 }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 font-sans text-[10px] text-[#9B9890] italic">
        Gráfico ilustrativo. Los resultados pueden variar.
      </p>

      <div className="mt-6">
        <Button variant="primary" size="lg" onClick={onNext}>
          VER PRECIOS →
        </Button>
      </div>
    </div>
  );
}

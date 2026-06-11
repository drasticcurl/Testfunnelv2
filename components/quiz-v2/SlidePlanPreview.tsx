'use client';

/**
 * SlidePlanPreview — shows a partially-visible/blurred plan to create
 * the "IKEA effect" — the user feels the plan already exists and just
 * needs to be unlocked.
 *
 * Shows:
 * - Personalized header based on tipo
 * - Day 1-2 visible, Day 3-7 blurred
 * - Summary of what's included (already configured)
 * - CTA to continue (not checkout — next slide is name capture)
 */

import { motion } from 'framer-motion';
import { useQuizStoreV2 } from '@/lib/quiz-v2/store';
import { calcularTipoV2 } from '@/lib/quiz-v2/helpers';
import { QUIZ_RESULT_TYPE_NAMES } from '@/lib/quiz-v2/config';
import Button from '@/components/ui/Button';

interface Props {
  onNext: () => void;
}

const PLAN_DAYS_BY_TIPO: Record<number, { day: number; text: string }[]> = {
  1: [
    { day: 1, text: 'Eliminar lácteos y azúcar procesada' },
    { day: 2, text: 'Introducir desayuno antiinflamatorio matutino' },
  ],
  2: [
    { day: 1, text: 'Eliminar harinas refinadas en almuerzo y cena' },
    { day: 2, text: 'Introducir protocolo digestivo pre-comida' },
  ],
  3: [
    { day: 1, text: 'Eliminar alimentos fermentables de la cena' },
    { day: 2, text: 'Introducir rutina antiinflamatoria vespertina' },
  ],
  4: [
    { day: 1, text: 'Reset intestinal completo — eliminar 7 triggers' },
    { day: 2, text: 'Introducir batido reparador de mucosa' },
  ],
};

export function SlidePlanPreview({ onNext }: Props) {
  const answers = useQuizStoreV2((s) => s.answers);
  const tipo = calcularTipoV2(answers);
  const visibleDays = PLAN_DAYS_BY_TIPO[tipo] || PLAN_DAYS_BY_TIPO[3];

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-sage/10 mb-3"
        >
          <span className="text-3xl">🎉</span>
        </motion.div>
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-bold leading-tight">
          Tu plan está listo
        </h2>
        <p className="mt-2 font-sans text-sm text-[#5C5852]">
          Personalizado para <strong className="text-coral">{QUIZ_RESULT_TYPE_NAMES[tipo]}</strong>
        </p>
      </div>

      {/* Plan preview card */}
      <div className="bg-white rounded-2xl border border-[#EFECE7] shadow-sm overflow-hidden">
        {/* Visible days */}
        <div className="p-4 space-y-3">
          <p className="font-sans text-xs text-[#9B9890] uppercase tracking-wider font-semibold">
            Semana 1: Eliminación
          </p>
          {visibleDays.map((d) => (
            <div key={d.day} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-sage text-white flex items-center justify-center font-sans text-xs font-bold flex-shrink-0">
                {d.day}
              </div>
              <p className="font-sans text-sm text-charcoal pt-0.5">{d.text}</p>
            </div>
          ))}
        </div>

        {/* Blurred/locked days */}
        <div className="relative px-4 pb-4">
          <div className="space-y-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
            {[3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#EFECE7] flex items-center justify-center font-sans text-xs font-bold text-[#9B9890] flex-shrink-0">
                  {day}
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-[#EFECE7] rounded w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 shadow-md border border-sage/20 text-center">
              <span className="text-lg">🔒</span>
              <p className="font-sans text-xs font-semibold text-charcoal mt-1">
                5 días más personalizados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What's configured */}
      <div className="mt-5 space-y-2">
        {[
          { icon: '🍽️', text: '28 recetas seleccionadas para vos' },
          { icon: '🛒', text: 'Lista de compras configurada' },
          { icon: '⚡', text: 'Kit de emergencia activado' },
          { icon: '📊', text: 'Diario de progreso listo' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2.5"
          >
            <span className="text-base">{item.icon}</span>
            <span className="font-sans text-sm text-charcoal">{item.text}</span>
            <span className="ml-auto text-sage text-sm">✓</span>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Button variant="primary" size="lg" onClick={onNext}>
          VER MI PLAN COMPLETO →
        </Button>
        <p className="mt-2 font-sans text-xs text-[#9B9890]">
          Solo falta un paso más
        </p>
      </div>
    </div>
  );
}

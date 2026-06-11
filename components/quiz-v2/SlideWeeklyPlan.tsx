'use client';

/**
 * SlideWeeklyPlan — gráfico de progreso semanal al estilo MusesAcademy.
 *
 * Muestra 4 barras horizontales (semana 1-4) con porcentajes crecientes.
 * Si hay nombre en el store, personaliza el mensaje.
 */

import { motion } from 'framer-motion';
import { useQuizStoreV2 } from '@/lib/quiz-v2/store';
import { generateWeeklyPlan } from '@/lib/quiz-v2/helpers';
import Button from '@/components/ui/Button';

interface Props {
  onNext: () => void;
}

export function SlideWeeklyPlan({ onNext }: Props) {
  const nombre = useQuizStoreV2((s) =>
    typeof s.answers.nombre === 'string' ? s.answers.nombre : undefined,
  );
  const weeks = generateWeeklyPlan();

  // Target date: 4 weeks from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 28);
  const targetLabel = targetDate.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold leading-tight">
        {nombre
          ? `${nombre}, tu Plan Anti-Hinchazón de 4 semanas`
          : 'Tu Plan Anti-Hinchazón de 4 semanas'}
      </h2>

      <p className="mt-3 font-sans text-sm text-[#5C5852]">
        Basado en tus respuestas, esperamos que logres deshincharte para{' '}
        <strong className="text-charcoal">{targetLabel}</strong>
      </p>

      {/* Weekly bars */}
      <div className="mt-8 space-y-4">
        {weeks.map((w, i) => (
          <div key={w.week} className="text-left">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans text-sm text-charcoal font-medium">
                {w.label}
              </span>
              <span
                className="font-sans text-xs font-bold"
                style={{ color: w.color }}
              >
                {w.percent}%
              </span>
            </div>
            <div className="h-4 bg-[#EFECE7] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: w.color }}
                initial={{ width: 0 }}
                animate={{ width: `${w.percent}%` }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                  delay: 0.2 + i * 0.2,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="mt-4 font-sans text-[10px] text-[#9B9890] italic">
        Este gráfico es ilustrativo. Los resultados pueden variar según la persona.
      </p>

      {/* Continue */}
      <div className="mt-8">
        <Button variant="primary" size="lg" onClick={onNext}>
          CONTINUAR →
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNombre } from '@/lib/quiz-v2/helpers';
import { useQuizStore } from '@/lib/quiz-v2/store';

const STEPS = [
  'Analizando tus respuestas...',
  'Calculando tu perfil metabólico...',
  'Personalizando el protocolo de agua de arroz...',
  'Preparando tus resultados...',
  '¡Tu plan está listo!',
];

const STEP_DURATION = 800; // ms por paso

interface Props {
  onComplete: () => void;
}

export function SlideLoadingSteps({ onComplete }: Props) {
  const answers   = useQuizStore((s) => s.answers);
  const nombre    = getNombre(answers);
  const [step, setStep]           = useState(0);
  const [progress, setProgress]   = useState(0);
  const [done, setDone]           = useState(false);

  useEffect(() => {
    if (step >= STEPS.length) {
      setDone(true);
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setStep((s) => s + 1);
      setProgress(Math.round(((step + 1) / STEPS.length) * 100));
    }, STEP_DURATION);
    return () => clearTimeout(t);
  }, [step, onComplete]);

  const circumference = 2 * Math.PI * 40; // r=40

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: 'var(--warm)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-8">

        {/* Círculo de progreso */}
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
            {/* Track */}
            <circle cx="48" cy="48" r="40" fill="none" strokeWidth="6" stroke="var(--warm-border)" />
            {/* Progress */}
            <circle
              cx="48" cy="48" r="40"
              fill="none"
              strokeWidth="6"
              stroke="var(--terracotta)"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (circumference * progress) / 100}
              style={{ transition: `stroke-dashoffset ${STEP_DURATION * 0.9}ms ease-out` }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-lg font-bold"
              style={{ color: 'var(--terracotta)', fontFamily: 'var(--font-sans)' }}
            >
              {progress}%
            </span>
          </div>
        </div>

        {/* Título */}
        <div className="text-center">
          <h2
            className="text-2xl leading-tight"
            style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
          >
            {nombre ? `${nombre}, estamos` : 'Estamos'} preparando tu plan
          </h2>
        </div>

        {/* Lista de pasos */}
        <div className="w-full flex flex-col gap-3">
          {STEPS.map((s, i) => {
            const isCompleted = i < step;
            const isCurrent   = i === step;
            return (
              <AnimatePresence key={s}>
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: isCompleted || isCurrent ? 1 : 0.3, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  {/* Indicador */}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      backgroundColor: isCompleted ? 'var(--success)' : isCurrent ? 'var(--terracotta-soft)' : 'var(--warm-border)',
                      borderWidth: isCurrent ? 2 : 0,
                      borderStyle: 'solid',
                      borderColor: 'var(--terracotta)',
                    }}
                  >
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : isCurrent ? (
                      <div className="w-2 h-2 rounded-full animate-pulse-soft" style={{ backgroundColor: 'var(--terracotta)' }} />
                    ) : null}
                  </div>

                  {/* Texto */}
                  <span
                    className="text-sm font-medium transition-all duration-300"
                    style={{
                      color: isCompleted ? 'var(--success)' : isCurrent ? 'var(--charcoal)' : 'var(--muted-light)',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {s}
                  </span>
                </motion.div>
              </AnimatePresence>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
}

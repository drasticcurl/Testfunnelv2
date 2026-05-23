'use client';

/**
 * SlideLoadingWithQuestions — loading inteligente al estilo MusesAcademy.
 *
 * Muestra barras de progreso secuenciales. Cuando cada barra llega al 50%,
 * pausa y muestra una micro-pregunta (Sí/No). Al responder, continúa.
 * Al terminar todas las barras, llama onComplete.
 *
 * También muestra testimonios rotando y prueba social arriba.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuizStoreV2 } from '@/lib/quiz-v2/store';
import { getMetaCookies, getUTMs } from '@/lib/cookies';
import { calcularTipoV2 } from '@/lib/quiz-v2/helpers';
import type { SlideV2 } from '@/lib/quiz-v2/types';

type LoadingSlide = Extract<SlideV2, { type: 'loading_with_questions' }>;

interface Props {
  slide: LoadingSlide;
  onComplete: () => void;
}

const TESTIMONIOS = [
  { quote: 'Al día 3 ya me sentía más liviana, increíble.', author: 'Anabela, 41 · Bs As' },
  { quote: 'Pensé que era grasa pero era inflamación. Ahora lo sé.', author: 'Lucía, 38 · Córdoba' },
  { quote: 'Bajé 3 cm de panza sin hacer dieta.', author: 'Verónica, 51 · Mendoza' },
];

export function SlideLoadingWithQuestions({ slide, onComplete }: Props) {
  const setAnswer = useQuizStoreV2((s) => s.setAnswer);
  const [currentBarIdx, setCurrentBarIdx] = useState(0);
  const [barProgress, setBarProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [testimonioIdx, setTestimonioIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = slide.steps.length;
  const currentStep = slide.steps[currentBarIdx];

  // Advance bar progress
  useEffect(() => {
    if (allDone || paused) return;

    intervalRef.current = setInterval(() => {
      setBarProgress((prev) => {
        const next = prev + 2;
        // Pause at 50% if there's a question AND it hasn't been answered yet
        if (next >= 50 && currentStep?.question && !questionAnswered) {
          setPaused(true);
          return 50;
        }
        // Complete bar at 100%
        if (next >= 100) {
          clearInterval(intervalRef.current!);
          // Move to next bar or finish
          if (currentBarIdx < totalSteps - 1) {
            setTimeout(() => {
              setCurrentBarIdx((i) => i + 1);
              setBarProgress(0);
              setQuestionAnswered(false); // reset for next bar's question
              setTestimonioIdx((i) => (i + 1) % TESTIMONIOS.length);
            }, 300);
          } else {
            setAllDone(true);
            setTimeout(onComplete, 800);
          }
          return 100;
        }
        return next;
      });
    }, 60);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentBarIdx, paused, allDone, currentStep, totalSteps, onComplete, questionAnswered]);

  const handleAnswer = useCallback((answer: string) => {
    if (currentStep?.questionId) {
      setAnswer(currentStep.questionId, answer);
    }

    // Fire ViewContent when last loading question is answered — user is committed to seeing results
    if (currentBarIdx === totalSteps - 1) {
      const answers = useQuizStoreV2.getState().answers;
      const tipo = calcularTipoV2(answers);

      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.fbq) {
          w.fbq('track', 'ViewContent', {
            content_name: `Resultados Tipo ${tipo}`,
            content_category: 'Quiz Anti-Hinchazón V2',
          });
        }
      }

      const meta = getMetaCookies();
      const utms = getUTMs();
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ViewContent',
          fbc: meta.fbc,
          fbp: meta.fbp,
          contentName: `Resultados Tipo ${tipo}`,
          contentCategory: 'Quiz Anti-Hinchazón V2',
          custom: { quiz_version: 'v2', tipo, utms },
        }),
      }).catch(() => {});
    }

    setQuestionAnswered(true);
    setPaused(false);
  }, [currentStep, setAnswer, currentBarIdx, totalSteps]);

  const testimonio = TESTIMONIOS[testimonioIdx];

  return (
    <div className="max-w-md mx-auto text-center">
      {/* Social proof header */}
      <div className="mb-6">
        <p className="font-sans text-sm font-semibold text-sage">
          12,847+ mujeres
        </p>
        <p className="font-sans text-xs text-[#5C5852]">
          ya eligieron Chau Hinchazón
        </p>
        <p className="font-sans text-xs text-[#9B9890] mt-1">
          Creando tu plan personalizado...
        </p>
      </div>

      {/* Progress bars */}
      <div className="space-y-4 mb-6">
        {slide.steps.map((step, i) => {
          const isActive = i === currentBarIdx;
          const isDone = i < currentBarIdx;
          const progress = isDone ? 100 : isActive ? barProgress : 0;

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-sans text-xs text-[#5C5852] font-medium">
                  {step.label}
                </span>
                {isDone && (
                  <span className="text-sage text-sm">✓</span>
                )}
              </div>
              <div className="h-2 bg-[#EFECE7] rounded-full overflow-hidden">
                <div
                  className="h-full bg-sage rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Micro-question overlay */}
      <AnimatePresence>
        {paused && currentStep?.question && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl p-5 border border-[#EFECE7] shadow-md mb-6"
          >
            <p className="font-sans text-xs text-[#9B9890] uppercase tracking-wider mb-2">
              Para continuar, especificá
            </p>
            <p className="font-sans text-base text-charcoal font-medium mb-4">
              {currentStep.question}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => handleAnswer('no')}
                className="px-6 py-2.5 rounded-full border-2 border-[#EFECE7] font-sans text-sm font-medium text-[#5C5852] hover:border-sage hover:bg-sage-soft transition-all"
              >
                No
              </button>
              <button
                type="button"
                onClick={() => handleAnswer('si')}
                className="px-6 py-2.5 rounded-full bg-sage text-white font-sans text-sm font-medium hover:bg-sage-dark transition-all"
              >
                Sí
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rotating testimonial */}
      <motion.div
        key={testimonioIdx}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-sage-soft rounded-xl p-4"
      >
        <p className="font-sans text-sm text-charcoal italic">
          &ldquo;{testimonio.quote}&rdquo;
        </p>
        <p className="mt-1 font-sans text-xs text-[#5C5852] font-medium">
          — {testimonio.author}
        </p>
      </motion.div>
    </div>
  );
}

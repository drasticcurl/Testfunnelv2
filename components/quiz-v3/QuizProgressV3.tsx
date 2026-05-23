'use client';

/**
 * QuizProgressV3 — barra de progreso minimalista.
 * Solo muestra "Pregunta X de 6" y la barra. Sin secciones.
 * Para Google Ads: rápido, limpio, sin distracciones.
 */

import { slidesV3 } from '@/lib/quiz-v3/data';

interface Props {
  currentSlide: number;
}

export function QuizProgressV3({ currentSlide }: Props) {
  const totalSlides = slidesV3.length;
  const percent = Math.min(((currentSlide + 1) / totalSlides) * 100, 100);

  // Count only question slides for the label
  const questionsTotal = slidesV3.filter((s) => s.type === 'question').length;
  const questionsPassed = slidesV3
    .slice(0, currentSlide + 1)
    .filter((s) => s.type === 'question').length;

  return (
    <div className="px-5 pt-5 pb-2">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-xs text-[#5C5852]">
            Pregunta {Math.min(questionsPassed, questionsTotal)} de {questionsTotal}
          </span>
          <span className="font-sans text-xs text-[#9B9890]">
            {Math.round(percent)}%
          </span>
        </div>
        <div
          className="h-1.5 bg-[#EFECE7] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full bg-gradient-to-r from-sage to-coral transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

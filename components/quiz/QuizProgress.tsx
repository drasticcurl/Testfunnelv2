'use client';

/**
 * QuizProgress - barra "Pregunta X de N" sobre las preguntas reales.
 * Cuenta los slides type='question' (10 totales: 7 normales + 3 si-streets).
 * No cuenta info cards, intro, email_capture ni loading.
 */

import { slides } from '@/lib/quiz-data';

interface Props {
  currentSlide: number;
}

export function QuizProgress({ currentSlide }: Props) {
  const questionsTotal = slides.filter((s) => s.type === 'question').length;
  const questionsPassed = slides
    .slice(0, currentSlide + 1)
    .filter((s) => s.type === 'question').length;

  const safePassed = Math.min(questionsPassed, questionsTotal);
  const percent = (safePassed / questionsTotal) * 100;

  return (
    <div className="px-6 pt-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-sm font-sans text-[#5C5852] mb-2">
          <span>
            Pregunta {safePassed} de {questionsTotal}
          </span>
          <span>{Math.round(percent)}%</span>
        </div>
        <div
          className="h-1.5 bg-[#EFECE7] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={safePassed}
          aria-valuemin={0}
          aria-valuemax={questionsTotal}
          aria-label={`Pregunta ${safePassed} de ${questionsTotal}`}
        >
          <div
            className="h-full bg-gradient-to-r from-sage to-coral transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

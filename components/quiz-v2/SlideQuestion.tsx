'use client';

import { useState } from 'react';
import { useQuizStore } from '@/lib/quiz-v2/store';
import { getNombre, getQuestionText, getQuestionSubtitle, getAcknowledgment } from '@/lib/quiz-v2/helpers';
import type { SlideV3, QuizOption } from '@/lib/quiz-v2/types';

type QuestionSlide = Extract<SlideV3, { type: 'question' }>;

// Slides donde el nombre se inyecta en el headline
const SLIDES_WITH_NOMBRE = new Set(['como_afecta', 'conforme_panza', 'no_es_tu_culpa', 'que_queres_lograr']);

interface Props {
  slide: QuestionSlide;
  currentValue?: string | string[];
  onAnswer: (value: string | string[]) => void;
  onNext: () => void;
}

export function SlideQuestion({ slide, currentValue, onAnswer, onNext }: Props) {
  const answers = useQuizStore((s) => s.answers);
  const nombre  = getNombre(answers);

  const [selected, setSelected] = useState<string[]>(() => {
    if (Array.isArray(currentValue)) return currentValue;
    if (typeof currentValue === 'string') return [currentValue];
    return [];
  });

  const handleSingle = (value: string) => {
    setSelected([value]);
    onAnswer(value);
    setTimeout(onNext, 200);
  };

  const handleMultiToggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setSelected(next);
    onAnswer(next);
  };

  const isSelected = (value: string) => selected.includes(value);

  // Texto de pregunta/subtítulo personalizado según respuestas previas
  const questionText = getQuestionText(slide.id as string, slide.question, answers);
  const subtitle     = getQuestionSubtitle(slide.id as string, slide.subtitle, answers);

  // Chip de microcopy reactivo (refleja una respuesta previa)
  const acknowledgment = getAcknowledgment(slide.id as string, answers);

  // Inyectar nombre en headlines de slides emocionales
  const headline = (() => {
    if (nombre && SLIDES_WITH_NOMBRE.has(slide.id as string)) {
      return `${nombre}, ${questionText.charAt(0).toLowerCase()}${questionText.slice(1)}`;
    }
    return questionText;
  })();

  return (
    <div className="w-full max-w-sm mx-auto">
      {acknowledgment && (
        <div
          className="flex items-start gap-2 rounded-2xl px-3.5 py-2.5 mb-4 border"
          style={{ backgroundColor: 'var(--terracotta-soft)', borderColor: 'var(--warm-border)' }}
        >
          <span className="text-base leading-none mt-0.5" aria-hidden="true">{acknowledgment.icon}</span>
          <p
            className="text-xs leading-relaxed text-left"
            style={{ color: 'var(--terracotta-dark)', fontFamily: 'var(--font-sans)' }}
          >
            {acknowledgment.text}
          </p>
        </div>
      )}
      <h2
        className="text-2xl md:text-3xl text-center leading-tight mb-2"
        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
      >
        {headline}
      </h2>
      {subtitle && (
        <p
          className="text-sm text-center mb-6"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
        >
          {subtitle}
        </p>
      )}
      {!subtitle && <div className="mb-6" />}

      <div className="flex flex-col gap-2.5">
        {slide.options.map((opt: QuizOption) => {
          const sel = isSelected(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => slide.multiple ? handleMultiToggle(opt.value) : handleSingle(opt.value)}
              className="option-card"
              style={{
                borderColor: sel ? 'var(--terracotta)' : 'var(--warm-border)',
                backgroundColor: sel ? 'var(--terracotta-soft)' : '#fff',
              }}
            >
              {/* Indicador radio/checkbox */}
              <div
                className={`flex-shrink-0 flex items-center justify-center transition-all ${slide.multiple ? 'option-card__checkbox' : 'option-card__radio'}`}
                style={{
                  borderColor: sel ? 'var(--terracotta)' : 'var(--warm-border)',
                  backgroundColor: sel ? 'var(--terracotta)' : 'transparent',
                }}
              >
                {sel && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Emoji opcional */}
              {opt.emoji && (
                <span className="flex-shrink-0 text-xl" aria-hidden="true">
                  {opt.emoji}
                </span>
              )}

              {/* Label */}
              <span
                className="flex-1 text-left text-sm font-medium"
                style={{ color: sel ? 'var(--terracotta-dark)' : 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Botón continuar solo en multi */}
      {slide.multiple && (
        <div className="mt-8">
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={onNext}
            className="btn-primary"
          >
            CONTINUAR →
          </button>
        </div>
      )}
    </div>
  );
}

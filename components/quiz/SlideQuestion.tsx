'use client';

/**
 * SlideQuestion - generico para preguntas single y multi-choice.
 *
 * Comportamiento:
 *   - single (multiple: false):
 *       click en una opcion -> setAnswer + auto-avanzar 250ms despues
 *   - multi (multiple: true):
 *       toggle en cada opcion -> setAnswer en cada cambio
 *       muestra boton "CONTINUAR" deshabilitado hasta tener >=1 seleccion
 */

import { useState } from 'react';
import { Slide } from '@/lib/quiz-types';
import { useQuizStore } from '@/lib/quiz-store';
import { OptionCard } from './OptionCard';
import Button from '@/components/ui/Button';

type QuestionSlide = Extract<Slide, { type: 'question' }>;

interface Props {
  slide: QuestionSlide;
  onNext: () => void;
}

export function SlideQuestion({ slide, onNext }: Props) {
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const currentValue = useQuizStore((s) => s.answers[slide.id]);

  const [selected, setSelected] = useState<string[]>(() => {
    if (Array.isArray(currentValue)) return currentValue;
    if (typeof currentValue === 'string') return [currentValue];
    return [];
  });

  const handleSingleClick = (value: string) => {
    setSelected([value]);
    setAnswer(slide.id, value);
    setTimeout(() => onNext(), 250);
  };

  const handleMultiToggle = (value: string) => {
    const nextSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setSelected(nextSelected);
    setAnswer(slide.id, nextSelected);
  };

  const handleContinue = () => {
    if (selected.length > 0) onNext();
  };

  return (
    <div>
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center leading-tight font-semibold">
        {slide.question}
      </h2>

      {slide.subtitle && (
        <p className="mt-3 font-sans text-[#5C5852] text-center">
          {slide.subtitle}
        </p>
      )}

      <div
        className="mt-10 grid gap-3"
        role={slide.multiple ? 'group' : 'radiogroup'}
        aria-label={slide.question}
      >
        {slide.options.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            emoji={opt.emoji}
            selected={selected.includes(opt.value)}
            multi={slide.multiple}
            onClick={() =>
              slide.multiple
                ? handleMultiToggle(opt.value)
                : handleSingleClick(opt.value)
            }
          />
        ))}
      </div>

      {slide.multiple && (
        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="lg"
            disabled={selected.length === 0}
            onClick={handleContinue}
          >
            CONTINUAR →
          </Button>
        </div>
      )}
    </div>
  );
}

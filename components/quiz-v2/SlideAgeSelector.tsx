'use client';

/**
 * SlideAgeSelector — primera pantalla del quiz V2.
 * Grilla 2x2 con rangos de edad. Al clickear se auto-avanza.
 * Card-style layout con imágenes Pixar más grandes y visibles.
 */

import { useQuizStoreV2 } from '@/lib/quiz-v2/store';
import type { SlideV2 } from '@/lib/quiz-v2/types';

type AgeSlide = Extract<SlideV2, { type: 'age_selector' }>;

interface Props {
  slide: AgeSlide;
  onNext: () => void;
}

// Age range images from /public/img/
const AGE_IMAGES: Record<string, string> = {
  '25_34': '/img/edad-25-34.png',
  '35_44': '/img/edad-35-44.png',
  '45_54': '/img/edad-45-54.png',
  '55_mas': '/img/edad-55-mas.png',
};

// Soft background colors for each card
const AGE_BG: Record<string, string> = {
  '25_34': 'bg-[#FFF5F0]',
  '35_44': 'bg-[#F0F7FF]',
  '45_54': 'bg-[#FFF8F0]',
  '55_mas': 'bg-[#F5F0FF]',
};

export function SlideAgeSelector({ slide, onNext }: Props) {
  const setAnswer = useQuizStoreV2((s) => s.setAnswer);

  const handleSelect = (value: string) => {
    setAnswer('edad', value);
    setTimeout(() => onNext(), 200);
  };

  return (
    <div className="text-center">
      <h1 className="font-serif text-2xl md:text-3xl text-charcoal leading-tight font-semibold max-w-lg mx-auto">
        {slide.headline}
      </h1>

      {slide.subtitle && (
        <p className="mt-3 font-sans text-sm text-[#5C5852]">
          {slide.subtitle}
        </p>
      )}

      {/* 2x2 Grid — card style for Pixar images */}
      <div className="mt-8 grid grid-cols-2 gap-3 max-w-md mx-auto">
        {slide.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className="group relative flex flex-col items-center gap-0 bg-white border-2 border-[#EFECE7] rounded-2xl hover:border-sage hover:shadow-md transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sage overflow-hidden"
          >
            {/* Image container — large rounded rect, no circle crop */}
            <div className={`w-full aspect-[4/3] ${AGE_BG[opt.value] || 'bg-cream-warm'} flex items-end justify-center overflow-hidden`}>
              {AGE_IMAGES[opt.value] ? (
                <img
                  src={AGE_IMAGES[opt.value]}
                  alt={opt.ageRange}
                  className="w-[85%] h-auto object-contain drop-shadow-sm"
                />
              ) : (
                <span className="text-5xl mb-3">👩</span>
              )}
            </div>

            {/* Label below image */}
            <div className="w-full py-3 px-2 border-t border-[#EFECE7] group-hover:bg-sage-soft transition-colors">
              <span className="font-sans text-sm font-bold text-charcoal">
                {opt.ageRange}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Trust badges */}
      <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs font-sans text-[#9B9890]">
        <span>⏱️ 2 minutos</span>
        <span>🔒 100% anónimo</span>
        <span>✅ Plan personalizado gratis</span>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { SlideV3 } from '@/lib/quiz-v2/types';

type BodyTypeSlide = Extract<SlideV3, { type: 'body_type' }>;

interface Props {
  slide: BodyTypeSlide;
  onNext: (value: string) => void;
}

export function SlideBodyType({ slide, onNext }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (value: string) => {
    setSelected(value);
    setTimeout(() => onNext(value), 200);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2
        className="text-2xl md:text-3xl text-center leading-tight mb-8"
        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
      >
        {slide.headline}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {slide.options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="flex flex-col items-center justify-center rounded-2xl border-2 p-4 transition-all"
              style={{
                backgroundColor: isSelected ? 'var(--terracotta-soft)' : '#fff',
                borderColor: isSelected ? 'var(--terracotta)' : 'var(--warm-border)',
                boxShadow: isSelected ? '0 0 0 2px rgba(192,85,58,0.15)' : 'var(--shadow-sm)',
              }}
            >
              {/* Imagen de silueta */}
              <div className="w-20 h-24 flex items-center justify-center mb-2">
                <img
                  src={`/img/${opt.imgKey}.png`}
                  alt={opt.label}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = 'none';
                    if (el.nextSibling) (el.nextSibling as HTMLElement).style.display = 'flex';
                  }}
                />
                <span
                  className="hidden items-center justify-center text-4xl"
                  aria-hidden="true"
                >
                  {opt.emojiFallback}
                </span>
              </div>
              <span
                className="text-sm font-semibold text-center"
                style={{
                  color: isSelected ? 'var(--terracotta)' : 'var(--charcoal)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

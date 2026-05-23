'use client';

/**
 * SlideSocialProof — pantalla intermedia de prueba social.
 * Muestra un número grande, texto, y opcionalmente testimonios.
 * Auto-avanza después de 3 segundos o al clickear el botón.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import type { SlideV2 } from '@/lib/quiz-v2/types';

type SocialSlide = Extract<SlideV2, { type: 'social_proof' }>;

interface Props {
  slide: SocialSlide;
  onNext: () => void;
}

export function SlideSocialProof({ slide, onNext }: Props) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-advance after 4s if no testimonials, 6s if testimonials
    const delay = slide.testimonials ? 6000 : 4000;
    timerRef.current = setTimeout(onNext, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onNext, slide.testimonials]);

  return (
    <div className="text-center max-w-lg mx-auto">
      {/* Big number / headline */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="font-serif text-4xl md:text-5xl font-bold text-sage">
          {slide.number}
        </p>
      </motion.div>

      {/* Main text */}
      <p className="mt-4 font-sans text-lg md:text-xl text-charcoal leading-relaxed">
        {slide.text}
      </p>

      {/* Subtext */}
      {slide.subtext && (
        <p className="mt-3 font-sans text-sm text-[#5C5852]">
          {slide.subtext}
        </p>
      )}

      {/* Testimonials */}
      {slide.testimonials && slide.testimonials.length > 0 && (
        <div className="mt-6 space-y-3">
          {slide.testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.3 }}
              className="bg-sage-soft rounded-xl p-4 text-left"
            >
              <p className="font-sans text-sm text-charcoal italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-1 font-sans text-xs text-[#5C5852] font-medium">
                — {t.author}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA button */}
      <div className="mt-8">
        <Button variant="secondary" size="lg" onClick={onNext}>
          CONTINUAR →
        </Button>
      </div>
    </div>
  );
}

'use client';

/**
 * SlideAuthorityVideo — slide de autoridad con la nutricionista.
 * Muestra foto/video + nombre + título + quote.
 * Auto-avanza después de 8s si no hay video. Si hay video, espera al botón.
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import type { SlideV2 } from '@/lib/quiz-v2/types';

type AuthSlide = Extract<SlideV2, { type: 'authority_video' }>;

interface Props {
  slide: AuthSlide;
  onNext: () => void;
}

export function SlideAuthorityVideo({ slide, onNext }: Props) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-advance after 8s if no video, don't auto-advance if video
    if (!slide.videoUrl) {
      timerRef.current = setTimeout(onNext, 8000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onNext, slide.videoUrl]);

  return (
    <div className="text-center max-w-md mx-auto">
      {/* Foto circular */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-24 h-24 mx-auto rounded-full overflow-hidden border-[3px] border-sage shadow-lg bg-cream-warm"
      >
        <img
          src={slide.imageUrl}
          alt={slide.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si la imagen no existe todavía
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML =
              '<div class="flex items-center justify-center w-full h-full bg-sage-soft"><span class="text-3xl">👩‍⚕️</span></div>';
          }}
        />
      </motion.div>

      {/* Nombre y título */}
      <h3 className="mt-4 font-serif text-xl text-charcoal font-semibold">
        {slide.name}
      </h3>
      <p className="font-sans text-xs text-sage font-medium uppercase tracking-wider">
        {slide.title}
      </p>

      {/* Video o quote */}
      {slide.videoUrl ? (
        <div className="mt-5 rounded-xl overflow-hidden shadow-md aspect-video bg-charcoal">
          <video
            src={slide.videoUrl}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-5 bg-sage-soft rounded-xl p-5 text-left"
        >
          <p className="font-sans text-sm text-charcoal italic leading-relaxed">
            &ldquo;{slide.quote}&rdquo;
          </p>
        </motion.div>
      )}

      {/* Credibility line */}
      <p className="mt-4 font-sans text-xs text-[#9B9890]">
        Protocolo basado en investigaciones sobre microbiota intestinal
      </p>

      {/* CTA */}
      <div className="mt-6">
        <Button variant="secondary" size="lg" onClick={onNext}>
          CONTINUAR →
        </Button>
      </div>
    </div>
  );
}

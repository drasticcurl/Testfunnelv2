'use client';

/**
 * @file SlideLandingCover.tsx — Slide 0 del quiz V2 (landing/portada).
 *
 * PARA REUTILIZAR:
 * Este es el primer slide que ve el usuario. Contiene:
 *  - Banner estacional (viene de config.ts → SEASON_BANNER)
 *  - Headline con el problema principal
 *  - Nombre del producto
 *  - Imagen hero
 *  - CTA para empezar
 *
 * PARA CAMBIAR EL COPY: edita los textos directamente en este archivo.
 * Para cambiar solo el banner estacional, edita config.ts → SEASON_BANNER.
 * Para cambiar la imagen, reemplaza /public/img/landing-cover.png.
 */

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useCountry } from '@/lib/quiz-v2/CountryContext';
import { SEASON_BANNER, PRODUCT_NAME } from '@/lib/quiz-v2/config';

interface Props {
  onNext: () => void;
}

export function SlideLandingCover({ onNext }: Props) {
  const { country } = useCountry();
  // SEASON_BANNER tiene una entrada por cada CountryCode soportado (CL/CO/MX/PE/US),
  // así que el lookup nunca devuelve undefined. Fallback defensivo a CL por las dudas.
  const seasonText = SEASON_BANNER[country] || SEASON_BANNER.CL;

  return (
    <motion.div
      className="text-center max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Banner estacional */}
      <div className="bg-coral/10 text-coral font-sans text-xs font-medium px-4 py-2 rounded-full inline-block mb-6">
        {seasonText}
      </div>

      {/* Titular */}
      <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold leading-tight">
        ¿Hinchazón, cansancio, mala digestión, retención de líquidos?
      </h1>
      <p className="mt-2 font-serif text-2xl md:text-3xl text-sage font-semibold">
        Descubri el {PRODUCT_NAME}
      </p>

      {/* Subtítulo */}
      <p className="mt-4 font-sans text-sm text-[#5C5852]">
        Vamos a crear tu protocolo personalizado para desinflamar tu cuerpo en 7
        días — solo 20 minutos por día
      </p>

      {/* Imagen placeholder — reemplazar con la generada por IA */}
      <div className="mt-6 max-w-[280px] mx-auto rounded-xl overflow-hidden shadow-md border border-[#EFECE7] bg-cream-warm aspect-square flex items-center justify-center">
        <img
          src="/img/landing-cover.png"
          alt={PRODUCT_NAME}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback si la imagen no existe todavía
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.innerHTML =
              '<div class="flex items-center justify-center w-full h-full"><span class="text-6xl">🌿</span></div>';
          }}
        />
      </div>

      {/* Personalización */}
      <p className="mt-5 font-sans text-xs text-[#9B9890]">
        ✓ Adaptado a tu edad, tus limitaciones y tu estilo de vida
      </p>

      {/* Contador de vacantes */}
      <p className="mt-2 font-sans text-xs text-coral font-medium">
        Solo 47 planes personalizados disponibles hoy
      </p>

      {/* CTA */}
      <div className="mt-6">
        <Button variant="primary" size="lg" onClick={onNext}>
          VER SI TODAVÍA HAY VACANTES →
        </Button>
      </div>

      {/* Avisos */}
      <div className="mt-5 space-y-1 font-sans text-xs text-[#9B9890]">
        <p>✅ No necesitás dejar de comer nada ni forzar tu cuerpo</p>
        <p>⚠️ Apenas 1 test gratuito por persona</p>
      </div>
    </motion.div>
  );
}

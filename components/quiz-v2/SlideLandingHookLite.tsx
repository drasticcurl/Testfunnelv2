'use client';

/**
 * SlideLandingHookLite — Variante C del test A/B/C de entrada.
 *
 * Hook adelgazado al mínimo de fricción: 1 headline + 1 subtítulo + CTA único
 * + 1 línea de trust. Sin imagen hero, sin tarjeta de autoridad, sin CTA
 * secundario. El objetivo es bajar la carga cognitiva antes del primer
 * micro-compromiso (la primera pregunta).
 */

import { motion } from 'framer-motion';

interface Props {
  onNext: () => void;
}

export function SlideLandingHookLite({ onNext }: Props) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: 'var(--warm)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center gap-6">

        {/* Headline */}
        <h1
          className="text-2xl leading-tight"
          style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
        >
          Descubrí el método del agua de arroz que está{' '}
          <span style={{ color: 'var(--terracotta)' }}>deshinchando y bajando de peso</span>{' '}
          a miles de argentinas
        </h1>

        {/* Subtítulo único */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
        >
          Respondé un diagnóstico rápido y descubrí tu plan personalizado según tu cuerpo.
        </p>

        {/* CTA único */}
        <button type="button" onClick={onNext} className="btn-primary w-full animate-bounce-cta">
          ✅ Empezar mi diagnóstico
        </button>

        {/* Trust — una sola línea */}
        <div
          className="flex items-center justify-center gap-4 text-xs"
          style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}
        >
          <span>⏱️ 2 minutos</span>
          <span>·</span>
          <span>🔒 100% privado</span>
          <span>·</span>
          <span>✅ Sin costo</span>
        </div>

      </div>
    </motion.div>
  );
}

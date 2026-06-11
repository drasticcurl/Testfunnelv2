'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MORNING_RITUAL, RITUAL_INTRO, RITUAL_SCIENCE, RITUAL_WEIGHT_LOSS } from '@/lib/pwa/morning-ritual';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function RitualPage() {
  return (
    <motion.div
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Back link */}
      <motion.div variants={item}>
        <Link
          href="/pwa/guias"
          className="text-sage text-sm font-medium hover:underline"
        >
          ← Guías
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={item}>
        <h1 className="font-serif text-2xl font-semibold" style={{ color: 'var(--charcoal)' }}>
          Ritual del Agua de Arroz — 5 minutos
        </h1>
        <div className="mt-3 space-y-2">
          {RITUAL_INTRO.split('\n\n').map((para, i) => (
            <p key={i} className="text-charcoal/60 text-sm leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Timeline steps */}
      <motion.div variants={item} className="relative">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-sage/20 rounded-full" />

        <div className="space-y-4">
          {MORNING_RITUAL.map((step) => (
            <motion.div
              key={step.order}
              variants={item}
              className="relative flex gap-4"
            >
              {/* Step number circle */}
              <div className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-light))' }}>
                <span className="text-white font-bold text-sm">{step.order}</span>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-sand/20">
                {/* Title row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{step.emoji}</span>
                    <h3 className="font-semibold text-charcoal text-[14px]">{step.title}</h3>
                  </div>
                  <span className="text-[11px] font-medium text-sage bg-sage-soft px-2 py-0.5 rounded-full">
                    {step.duration}
                  </span>
                </div>

                {/* Instructions */}
                <p className="text-[13px] text-charcoal/70 leading-relaxed">
                  {step.description}
                </p>

                {/* Benefit box */}
                <div className="mt-3 bg-cream-warm rounded-xl p-3">
                  <p className="text-[12px] text-charcoal/60 leading-relaxed">
                    <span className="font-semibold text-sage">Por qué funciona:</span>{' '}
                    {step.benefit}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Science section */}
      <motion.div
        variants={item}
        className="rounded-2xl p-4 border"
        style={{ backgroundColor: 'var(--terracotta-soft)', borderColor: 'rgba(192,85,58,0.15)' }}
      >
        <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--charcoal)' }}>🧠 La ciencia detrás del Agua de Arroz</h3>
        <div className="space-y-2">
          {RITUAL_SCIENCE.split('\n\n').map((para, i) => (
            <p key={i} className="text-[12px] text-charcoal/60 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Weight loss section — honest, evidence-based */}
      <motion.div
        variants={item}
        className="rounded-2xl p-4 border"
        style={{ backgroundColor: 'var(--sage-soft)', borderColor: 'rgba(122,139,116,0.2)' }}
      >
        <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--charcoal)' }}>⚖️ Adelgazá sin dieta restrictiva</h3>
        <div className="space-y-2">
          {RITUAL_WEIGHT_LOSS.split('\n\n').map((para, i) => (
            <p key={i} className="text-[12px] text-charcoal/65 leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Motivational card */}
      <motion.div
        variants={item}
        className="rounded-2xl p-5 border text-center"
        style={{ background: 'linear-gradient(135deg, var(--terracotta-soft), #FFF5F0)', borderColor: 'rgba(192,85,58,0.15)' }}
      >
        <span className="text-3xl">🌾</span>
        <p className="font-serif text-lg font-semibold mt-2" style={{ color: 'var(--charcoal)' }}>
          5 minutos que le cambian el día a tu intestino
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
          El agua de arroz en ayunas. Todos los días. En 3 días vas a sentir la diferencia.
        </p>
      </motion.div>
    </motion.div>
  );
}

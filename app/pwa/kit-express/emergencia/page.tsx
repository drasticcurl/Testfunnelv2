'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { emergencyMeals } from '@/lib/pwa/bump-content';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function EmergenciaPage() {
  return (
    <div className="pb-24">
      {/* Back + Header */}
      <div className="px-4 pt-6 pb-2">
        <Link
          href="/pwa/kit-express"
          className="inline-flex items-center gap-1 text-sm text-charcoal/50 hover:text-sage transition-colors mb-3"
        >
          ← Kit Anti-Excusas
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🆘</span>
          <div>
            <h1 className="font-serif text-xl font-semibold text-charcoal">
              Menú de Emergencia
            </h1>
            <p className="text-xs text-charcoal/50">
              7 comidas · exactamente 3 ingredientes · ≤ 5 min
            </p>
          </div>
        </div>
        <p className="text-sm text-charcoal/60 mt-3 leading-relaxed">
          Para esos días que no tenés ganas de cocinar. Abrí la heladera, agarrá
          3 cosas y en menos de 5 minutos tenés comida real lista.
        </p>
      </div>

      {/* Emergency meal cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 mt-4 space-y-3"
      >
        {emergencyMeals.map((meal) => (
          <motion.div
            key={meal.id}
            variants={item}
            className="flex items-stretch bg-coral-soft/20 border border-coral-soft/40 rounded-2xl overflow-hidden"
          >
            {/* Left emoji badge */}
            <div className="flex items-center justify-center w-16 bg-coral-soft/30 shrink-0">
              <span className="text-2xl">{meal.emoji}</span>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-charcoal text-sm truncate">
                  {meal.name}
                </h3>
                <span className="text-[10px] bg-coral/10 text-coral px-1.5 py-0.5 rounded-full font-medium shrink-0">
                  {meal.time}
                </span>
              </div>

              {/* 3 ingredient pills */}
              <div className="flex flex-wrap gap-1 mb-1.5">
                {meal.ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="text-[11px] bg-white/70 text-charcoal/70 px-2 py-0.5 rounded-full border border-coral-soft/30"
                  >
                    {ing}
                  </span>
                ))}
              </div>

              {/* 1-line instruction */}
              <p className="text-[11px] text-charcoal/60 leading-relaxed">
                {meal.instruction}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

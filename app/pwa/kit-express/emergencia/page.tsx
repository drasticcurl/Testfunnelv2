'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { emergencyMeals } from '@/lib/pwa/bump-content';
import { Icon } from '@/components/pwa/ui/Icon';
import { computeStagger } from '@/lib/pwa/ui/motion';

export default function EmergenciaPage() {
  // Single consistent, capped inter-item entrance delay for the meal list.
  const delays = computeStagger(emergencyMeals.length);

  return (
    <div className="pb-24">
      {/* Back + Header */}
      <div className="px-4 pt-6 pb-2">
        <Link
          href="/pwa/kit-express"
          className="inline-flex items-center gap-1 font-body text-sm text-charcoal/50 hover:text-terracotta transition-colors mb-3"
        >
          <Icon name="back" size="sm" decorative /> Kit Anti-Excusas
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🆘</span>
          <div>
            <h1 className="font-heading text-xl font-semibold text-charcoal">
              Menú de Emergencia
            </h1>
            <p className="font-body text-xs text-charcoal/50">
              7 comidas · exactamente 3 ingredientes · ≤ 5 min
            </p>
          </div>
        </div>
        <p className="font-body text-sm text-charcoal/60 mt-3 leading-relaxed">
          Para esos días que no tenés ganas de cocinar. Abrí la heladera, agarrá
          3 cosas y en menos de 5 minutos tenés comida real lista.
        </p>
      </div>

      {/* Emergency meal cards */}
      <div className="px-4 mt-4 space-y-3">
        {emergencyMeals.map((meal, i) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: delays[i] / 1000 }}
            className="flex items-stretch bg-terracotta-soft/20 border border-terracotta-soft/40 rounded-2xl overflow-hidden"
          >
            {/* Left emoji badge */}
            <div className="flex items-center justify-center w-16 bg-terracotta-soft/30 shrink-0">
              <span className="text-2xl">{meal.emoji}</span>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-body font-semibold text-charcoal text-sm truncate">
                  {meal.name}
                </h3>
                <span className="font-body text-[10px] bg-terracotta/10 text-terracotta px-1.5 py-0.5 rounded-full font-medium shrink-0">
                  {meal.time}
                </span>
              </div>

              {/* 3 ingredient pills */}
              <div className="flex flex-wrap gap-1 mb-1.5">
                {meal.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="font-body text-[11px] bg-warm/70 text-charcoal/70 px-2 py-0.5 rounded-full border border-terracotta-soft/30"
                  >
                    {ing}
                  </span>
                ))}
              </div>

              {/* 1-line instruction */}
              <p className="font-body text-[11px] text-charcoal/60 leading-relaxed">
                {meal.instruction}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

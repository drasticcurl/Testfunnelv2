'use client';

import { motion } from 'framer-motion';
import { CATEGORIES, type SymptomCategory } from '@/lib/pwa/microbiota-symptoms';
import { computeStagger } from '@/lib/pwa/ui/motion';

interface CategoryBreakdownProps {
  categoryScores: Record<SymptomCategory, { points: number; max: number; percentage: number }>;
}

/**
 * Desglose de puntuación por categoría con barras animadas.
 * Porcentaje alto = más síntomas = peor.
 */
export default function CategoryBreakdown({ categoryScores }: CategoryBreakdownProps) {
  // Single consistent, capped inter-item entrance delay for the category list.
  const delays = computeStagger(CATEGORIES.length);

  function getBarColor(percentage: number): string {
    if (percentage <= 25) return 'bg-terracotta-dark';
    if (percentage <= 50) return 'bg-terracotta';
    if (percentage <= 75) return 'bg-warning';
    return 'bg-error';
  }

  function getStatusLabel(percentage: number): string {
    if (percentage <= 25) return 'Bien';
    if (percentage <= 50) return 'Moderado';
    if (percentage <= 75) return 'Elevado';
    return 'Alto';
  }

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg text-charcoal font-semibold">Desglose por categoría</h3>

      <div className="space-y-2">
        {CATEGORIES.map((cat, index) => {
          const data = categoryScores[cat.id];
          if (!data) return null;

          return (
            <motion.div
              key={cat.id}
              className="bg-warm rounded-lg p-3 shadow-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delays[index] / 1000 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cat.emoji}</span>
                  <span className="font-body text-sm font-medium text-charcoal">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-body text-xs text-charcoal/50">
                    {data.points}/{data.max}
                  </span>
                  <span
                    className={`font-body text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      data.percentage <= 25
                        ? 'bg-terracotta-soft text-terracotta-dark'
                        : data.percentage <= 50
                        ? 'bg-terracotta-soft text-terracotta'
                        : data.percentage <= 75
                        ? 'bg-warning/15 text-warning'
                        : 'bg-error/15 text-error'
                    }`}
                  >
                    {getStatusLabel(data.percentage)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-terracotta-soft/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getBarColor(data.percentage)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${data.percentage}%` }}
                  transition={{ duration: 0.6, delay: 0.3 + delays[index] / 1000, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="font-body text-xs text-charcoal/50 text-center mt-2">
        Porcentaje más bajo = mejor salud en esa área
      </p>
    </div>
  );
}

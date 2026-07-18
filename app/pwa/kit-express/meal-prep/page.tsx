'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { mealPrepSteps, mealPrepResult } from '@/lib/pwa/bump-content';
import { Icon } from '@/components/pwa/ui/Icon';
import { computeStagger } from '@/lib/pwa/ui/motion';

export default function MealPrepPage() {
  // Single consistent, capped inter-item entrance delay for the timeline steps
  // plus the closing result card.
  const delays = computeStagger(mealPrepSteps.length + 1);

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
          <span className="text-2xl">⏱️</span>
          <div>
            <h1 className="font-heading text-xl font-semibold text-charcoal">
              Meal Prep Dominical
            </h1>
            <p className="font-body text-xs text-charcoal/50">
              1 hora un domingo → 4 días resueltos
            </p>
          </div>
        </div>
        <p className="font-body text-sm text-charcoal/60 mt-3 leading-relaxed">
          Dedicá 1 hora el domingo y dejá lunes a jueves resueltos. Sin pensar,
          sin improvisar, solo calentás y armás el plato.
        </p>
      </div>

      {/* Timeline */}
      <div className="px-4 mt-6 relative">
        {/* Timeline line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-terracotta/20 rounded-full" />

        <div className="space-y-4">
          {mealPrepSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: delays[index] / 1000 }}
              className="flex items-start gap-3 relative"
            >
              {/* Time badge */}
              <div className="w-14 shrink-0 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-terracotta text-warm flex items-center justify-center text-[10px] font-bold z-10">
                  {index + 1}
                </div>
                <span className="font-body text-[9px] text-charcoal/40 mt-0.5 text-center leading-tight">
                  {step.timeRange}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 bg-terracotta-soft/40 border border-terracotta/10 rounded-xl p-3">
                <p className="font-body text-sm font-medium text-charcoal">
                  {step.action}
                </p>
                <p className="font-body text-[11px] text-charcoal/60 mt-0.5">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut', delay: delays[mealPrepSteps.length] / 1000 }}
          className="mt-6 bg-terracotta/10 border border-terracotta/20 rounded-2xl p-5 flex items-center gap-3"
        >
          <Icon name="success" size="lg" decorative className="text-success" />
          <div>
            <p className="font-body text-base font-semibold text-charcoal">Resultado</p>
            <p className="font-body text-sm text-charcoal/60 mt-0.5">{mealPrepResult}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

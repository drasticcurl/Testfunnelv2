'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { mealPrepSteps, mealPrepResult } from '@/lib/pwa/bump-content';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function MealPrepPage() {
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
          <span className="text-2xl">⏱️</span>
          <div>
            <h1 className="font-serif text-xl font-semibold text-charcoal">
              Meal Prep Dominical
            </h1>
            <p className="text-xs text-charcoal/50">
              1 hora un domingo → 4 días resueltos
            </p>
          </div>
        </div>
        <p className="text-sm text-charcoal/60 mt-3 leading-relaxed">
          Dedicá 1 hora el domingo y dejá lunes a jueves resueltos. Sin pensar,
          sin improvisar, solo calentás y armás el plato.
        </p>
      </div>

      {/* Timeline */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 mt-6 relative"
      >
        {/* Timeline line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-sage/20 rounded-full" />

        <div className="space-y-4">
          {mealPrepSteps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={item}
              className="flex items-start gap-3 relative"
            >
              {/* Time badge */}
              <div className="w-14 shrink-0 flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-sage text-white flex items-center justify-center text-[10px] font-bold z-10">
                  {index + 1}
                </div>
                <span className="text-[9px] text-charcoal/40 mt-0.5 text-center leading-tight">
                  {step.timeRange}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 bg-sage-soft/40 border border-sage/10 rounded-xl p-3">
                <p className="text-sm font-medium text-charcoal">
                  {step.action}
                </p>
                <p className="text-[11px] text-charcoal/60 mt-0.5">
                  {step.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result card */}
        <motion.div
          variants={item}
          className="mt-6 bg-sage/10 border border-sage/20 rounded-2xl p-5 flex items-center gap-3"
        >
          <span className="text-3xl">✅</span>
          <div>
            <p className="text-base font-semibold text-charcoal">Resultado</p>
            <p className="text-sm text-charcoal/60 mt-0.5">{mealPrepResult}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

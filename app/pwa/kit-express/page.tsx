'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { isTestMode } from '@/lib/pwa/test-mode';
import LockedOverlay from '@/components/pwa/recetas/LockedOverlay';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function KitExpressPage() {
  const testMode = isTestMode();
  const hasBump = testMode;

  return (
    <div className="pb-24 relative">
      {!hasBump && (
        <div className="fixed inset-0 z-50">
          <LockedOverlay />
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="font-serif text-2xl text-charcoal font-semibold">
          Kit Anti-Excusas ⚡
        </h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Comidas en 10 min o menos. Sin excusas, sin complicaciones.
        </p>
      </div>

      {/* 3 cards → sub-páginas */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 mt-6 space-y-4"
      >
        {/* Card 1: Menú de Emergencia */}
        <motion.div variants={item}>
          <Link
            href="/pwa/kit-express/emergencia"
            className="block bg-gradient-to-r from-coral-soft/30 to-coral-soft/10 rounded-2xl p-5 border border-coral-soft/40 hover:border-coral/40 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-coral-soft/40 flex items-center justify-center shrink-0">
                  <span className="text-3xl">🆘</span>
                </div>
                <div>
                  <h2 className="font-semibold text-charcoal text-base">
                    Menú de Emergencia
                  </h2>
                  <p className="text-charcoal/50 text-xs mt-0.5">
                    7 comidas · 3 ingredientes · ≤ 5 min
                  </p>
                  <p className="text-charcoal/40 text-[11px] mt-1">
                    Para esos días que no tenés ganas de nada
                  </p>
                </div>
              </div>
              <span className="text-charcoal/30 group-hover:text-coral transition-colors text-xl">
                →
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Card 2: Meal Prep Dominical */}
        <motion.div variants={item}>
          <Link
            href="/pwa/kit-express/meal-prep"
            className="block rounded-2xl p-5 border transition-colors group"
            style={{ background: 'linear-gradient(to right, #FFF5F0, #FFFAF7)', borderColor: 'rgba(192,85,58,0.15)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--terracotta-soft)' }}>
                  <span className="text-3xl">⏱️</span>
                </div>
                <div>
                  <h2 className="font-semibold text-charcoal text-base">
                    Meal Prep Dominical
                  </h2>
                  <p className="text-charcoal/50 text-xs mt-0.5">
                    1 hora un domingo → 4 días resueltos
                  </p>
                  <p className="text-charcoal/40 text-[11px] mt-1">
                    Paso a paso para dejar la semana resuelta
                  </p>
                </div>
              </div>
              <span className="text-charcoal/30 group-hover:text-sage transition-colors text-xl">
                →
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Card 3: Tabla de Swaps */}
        <motion.div variants={item}>
          <Link
            href="/pwa/kit-express/swaps"
            className="block bg-gradient-to-r from-cream-warm to-cream rounded-2xl p-5 border border-sand/30 hover:border-sand/50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-cream-warm flex items-center justify-center shrink-0">
                  <span className="text-3xl">🔄</span>
                </div>
                <div>
                  <h2 className="font-semibold text-charcoal text-base">
                    Tabla de Swaps
                  </h2>
                  <p className="text-charcoal/50 text-xs mt-0.5">
                    20 sustituciones reales
                  </p>
                  <p className="text-charcoal/40 text-[11px] mt-1">
                    Si no conseguís X, usá Y
                  </p>
                </div>
              </div>
              <span className="text-charcoal/30 group-hover:text-charcoal/60 transition-colors text-xl">
                →
              </span>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

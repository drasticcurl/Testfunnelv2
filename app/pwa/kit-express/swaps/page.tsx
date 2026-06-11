'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { swapTable } from '@/lib/pwa/bump-content';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

export default function SwapsPage() {
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
          <span className="text-2xl">🔄</span>
          <div>
            <h1 className="font-serif text-xl font-semibold text-charcoal">
              Tabla de Swaps
            </h1>
            <p className="text-xs text-charcoal/50">
              20 sustituciones reales
            </p>
          </div>
        </div>
        <p className="text-sm text-charcoal/60 mt-3 leading-relaxed">
          Si no conseguís un ingrediente o está caro, acá tenés con qué
          reemplazarlo sin perder los beneficios antiinflamatorios.
        </p>
      </div>

      {/* Swap cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="px-4 mt-4 space-y-2"
      >
        {swapTable.map((swap) => (
          <motion.div
            key={swap.id}
            variants={item}
            className="bg-white border border-sand/30 rounded-xl p-3 flex items-center gap-2"
          >
            {/* Original */}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-charcoal truncate block">
                {swap.original}
              </span>
            </div>

            {/* Arrow */}
            <div className="shrink-0 w-8 flex items-center justify-center">
              <span className="text-sage font-bold text-lg">→</span>
            </div>

            {/* Substitute */}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-sage truncate block">
                {swap.substitute}
              </span>
              <span className="text-[10px] text-charcoal/50 block truncate">
                {swap.reason}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { swapTable } from '@/lib/pwa/bump-content';
import { Icon } from '@/components/pwa/ui/Icon';
import { computeStagger } from '@/lib/pwa/ui/motion';

export default function SwapsPage() {
  // Single consistent, capped inter-item entrance delay for the swap list.
  const delays = computeStagger(swapTable.length);

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
          <span className="text-2xl">🔄</span>
          <div>
            <h1 className="font-heading text-xl font-semibold text-charcoal">
              Tabla de Swaps
            </h1>
            <p className="font-body text-xs text-charcoal/50">
              20 sustituciones reales
            </p>
          </div>
        </div>
        <p className="font-body text-sm text-charcoal/60 mt-3 leading-relaxed">
          Si no conseguís un ingrediente o está caro, acá tenés con qué
          reemplazarlo sin perder los beneficios antiinflamatorios.
        </p>
      </div>

      {/* Swap cards */}
      <div className="px-4 mt-4 space-y-2">
        {swapTable.map((swap, i) => (
          <motion.div
            key={swap.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut', delay: delays[i] / 1000 }}
            className="bg-warm border border-warm-border rounded-xl p-3 flex items-center gap-2"
          >
            {/* Original */}
            <div className="flex-1 min-w-0">
              <span className="font-body text-sm font-medium text-charcoal truncate block">
                {swap.original}
              </span>
            </div>

            {/* Arrow */}
            <div className="shrink-0 w-8 flex items-center justify-center">
              <span className="text-terracotta font-bold text-lg">→</span>
            </div>

            {/* Substitute */}
            <div className="flex-1 min-w-0">
              <span className="font-body text-sm font-medium text-terracotta truncate block">
                {swap.substitute}
              </span>
              <span className="font-body text-[10px] text-charcoal/50 block truncate">
                {swap.reason}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

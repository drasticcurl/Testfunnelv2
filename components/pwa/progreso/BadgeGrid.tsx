'use client';

import { motion } from 'framer-motion';
import BadgeCard, { type Badge } from './BadgeCard';
import { computeStagger } from '@/lib/pwa/ui/motion';

interface BadgeGridProps {
  badges: Badge[];
}

export default function BadgeGrid({ badges }: BadgeGridProps) {
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  // Single consistent, capped inter-item entrance delay for the badge grid.
  const delays = computeStagger(badges.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold text-charcoal">Logros</h2>
        <span className="font-body text-xs text-charcoal/50 bg-terracotta-soft px-2.5 py-1 rounded-full">
          {unlockedCount}/{badges.length} desbloqueados
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-3">
        {badges.map((badge, i) => (
          <BadgeCard key={badge.id} badge={badge} delayMs={delays[i]} />
        ))}
      </div>
    </motion.div>
  );
}

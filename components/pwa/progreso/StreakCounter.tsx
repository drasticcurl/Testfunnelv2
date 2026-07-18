'use client';

import { motion } from 'framer-motion';

interface StreakCounterProps {
  streak: number;
  bestStreak: number;
}

export default function StreakCounter({ streak, bestStreak }: StreakCounterProps) {
  const flames = Array.from({ length: Math.min(streak, 7) });

  return (
    <motion.div
      className="bg-gradient-to-br from-terracotta-soft to-warm rounded-2xl p-5 border border-terracotta/15"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className="w-14 h-14 rounded-full bg-warm flex items-center justify-center shadow-sm border border-terracotta/10"
            animate={streak >= 3 ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-3xl">{streak >= 3 ? '🔥' : '✨'}</span>
          </motion.div>
          <div>
            <p className="font-heading text-3xl font-bold text-charcoal">{streak}</p>
            <p className="font-body text-charcoal/60 text-sm">
              {streak === 1 ? 'día consecutivo' : 'días consecutivos'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-body text-xs text-charcoal/40">Mejor racha</p>
          <p className="font-heading text-lg font-semibold text-terracotta">{bestStreak}</p>
        </div>
      </div>

      {/* Flame indicators */}
      {streak > 0 && (
        <div className="mt-4 flex items-center gap-1.5">
          {flames.map((_, i) => (
            <motion.div
              key={i}
              className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
            >
              <span className="text-sm">🔥</span>
            </motion.div>
          ))}
          {streak > 7 && (
            <span className="font-body text-xs text-charcoal/40 ml-1">+{streak - 7}</span>
          )}
        </div>
      )}

      {streak === 0 && (
        <p className="mt-3 font-body text-sm text-charcoal/50">
          Completá tu primer día para arrancar tu racha 💪
        </p>
      )}
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

export interface Badge {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string; // date string
}

interface BadgeCardProps {
  badge: Badge;
  index?: number;
}

export default function BadgeCard({ badge, index = 0 }: BadgeCardProps) {
  return (
    <motion.div
      className={`relative rounded-2xl p-4 border text-center transition-all ${
        badge.unlocked
          ? 'bg-white border-sage/20 shadow-sm'
          : 'bg-cream-warm/50 border-sand/20 opacity-60'
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: badge.unlocked ? 1 : 0.6, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={badge.unlocked ? { scale: 1.03 } : {}}
    >
      {/* Badge icon */}
      <div
        className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 ${
          badge.unlocked ? 'bg-sage-soft' : 'bg-sand/20 grayscale'
        }`}
      >
        <span className="text-2xl">{badge.icon}</span>
      </div>

      {/* Title */}
      <p
        className={`text-xs font-semibold ${
          badge.unlocked ? 'text-charcoal' : 'text-charcoal/40'
        }`}
      >
        {badge.title}
      </p>

      {/* Description */}
      <p className="text-[10px] text-charcoal/50 mt-0.5 leading-tight">
        {badge.description}
      </p>

      {/* Unlocked indicator */}
      {badge.unlocked && (
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-sage rounded-full flex items-center justify-center shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + index * 0.05, type: 'spring' }}
        >
          <span className="text-[10px] text-white">✓</span>
        </motion.div>
      )}

      {/* Lock overlay */}
      {!badge.unlocked && (
        <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
          <span className="text-lg opacity-30">🔒</span>
        </div>
      )}
    </motion.div>
  );
}

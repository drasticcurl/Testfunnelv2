'use client';

import { motion } from 'framer-motion';

interface DayCompleteBannerProps {
  day: number;
}

export default function DayCompleteBanner({ day }: DayCompleteBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-sage-soft border border-sage rounded-[16px] p-4 text-center"
    >
      <div className="text-3xl mb-2">🎉</div>
      <h3 className="font-serif font-semibold text-lg text-charcoal">
        ¡Día {day} completado!
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        {day < 30
          ? `Excelente progreso. El día ${day + 1} ya está disponible.`
          : '¡Completaste los 30 días del protocolo! Tu microbiota te lo agradece.'}
      </p>
    </motion.div>
  );
}

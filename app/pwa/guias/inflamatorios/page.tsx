'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { INFLAMMATORY_FOODS } from '@/lib/pwa/foods-data';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function InflamatoriosPage() {
  return (
    <motion.div
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Back link */}
      <motion.div variants={item}>
        <Link
          href="/pwa/guias"
          className="text-sage text-sm font-medium hover:underline"
        >
          ← Guías
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={item}>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">
          Los 14 alimentos que te inflaman
        </h1>
        <p className="text-charcoal/60 text-sm mt-2 leading-relaxed">
          Estos son los que vas a evitar durante los 7 días. No los demonices — 
          solo sacalos temporalmente y observá el cambio.
        </p>
      </motion.div>

      {/* Food cards */}
      {INFLAMMATORY_FOODS.map((food, index) => (
        <motion.div
          key={index}
          variants={item}
          className="bg-white rounded-2xl p-4 shadow-sm border border-coral/10"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-soft/30 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">{food.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-charcoal text-[14px] leading-tight">
                {food.name}
              </h3>
              <div className="mt-2 space-y-1.5">
                <p className="text-[13px] text-charcoal/70 leading-relaxed">
                  <span className="font-medium text-coral/80">Por qué inflama:</span>{' '}
                  {food.reason}
                </p>
                <p className="text-[13px] text-charcoal/70 leading-relaxed">
                  <span className="font-medium text-sage">Reemplazá por:</span>{' '}
                  {food.alternative}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Bottom rule */}
      <motion.div
        variants={item}
        className="bg-sage-soft rounded-2xl p-4 border border-sage/15"
      >
        <p className="text-sm text-charcoal/70 leading-relaxed">
          <span className="font-semibold">Regla práctica:</span> si tiene más de 5 ingredientes 
          en la etiqueta o uno que no podrías comprar suelto en la verdulería, dejalo afuera estos 7 días.
        </p>
      </motion.div>
    </motion.div>
  );
}

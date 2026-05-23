'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const guides = [
  {
    href: '/pwa/guias/inflamatorios',
    emoji: '🚫',
    title: '14 Alimentos Inflamatorios',
    description: 'Los que vas a evitar durante los 7 días. Sacalos y observá el cambio.',
    borderColor: 'border-coral/20',
    hoverBorder: 'hover:border-coral/40',
    bgAccent: 'bg-coral-soft/20',
  },
  {
    href: '/pwa/guias/antiinflamatorios',
    emoji: '🌿',
    title: '21 Alimentos Antiinflamatorios',
    description: 'Tus aliados del plan. Baratos, fáciles de conseguir y súper efectivos.',
    borderColor: 'border-sage/20',
    hoverBorder: 'hover:border-sage/40',
    bgAccent: 'bg-sage-soft/40',
  },
  {
    href: '/pwa/guias/suplementacion',
    emoji: '💊',
    title: 'Guía de Suplementación',
    description: 'Los 5 suplementos clave, cuándo tomarlos y alternativas naturales.',
    borderColor: 'border-sage/20',
    hoverBorder: 'hover:border-sage/40',
    bgAccent: 'bg-sage-soft/40',
  },
  {
    href: '/pwa/guias/ritual',
    emoji: '🌅',
    title: 'Ritual de Mañana — 5 min',
    description: 'Activá tu sistema digestivo antes del desayuno. Todos los días.',
    borderColor: 'border-sand/30',
    hoverBorder: 'hover:border-sage/40',
    bgAccent: 'bg-cream-warm',
  },
];

export default function GuiasPage() {
  return (
    <motion.div
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">
          Tus guías
        </h1>
        <p className="text-charcoal/60 text-sm mt-1 leading-relaxed">
          Todo lo que necesitás para el protocolo, en un solo lugar.
        </p>
      </motion.div>

      {/* Guide cards */}
      {guides.map((guide) => (
        <motion.div key={guide.href} variants={item}>
          <Link
            href={guide.href}
            className={`block bg-white rounded-2xl p-5 shadow-sm border ${guide.borderColor} ${guide.hoverBorder} transition-all group`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl ${guide.bgAccent} flex items-center justify-center flex-shrink-0`}>
                <span className="text-2xl">{guide.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-charcoal text-[15px] leading-tight">
                    {guide.title}
                  </h2>
                  <span className="text-charcoal/30 group-hover:text-sage transition-colors text-lg ml-2">
                    →
                  </span>
                </div>
                <p className="text-charcoal/55 text-[13px] mt-1.5 leading-relaxed">
                  {guide.description}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}

      {/* Bottom note */}
      <motion.div
        variants={item}
        className="bg-sage-soft/50 rounded-2xl p-4 border border-sage/10"
      >
        <p className="text-xs text-charcoal/60 leading-relaxed">
          💡 Estas guías complementan tu plan de 7 días. No las leas todas de una — 
          empezá por los inflamatorios y el ritual de mañana.
        </p>
      </motion.div>
    </motion.div>
  );
}

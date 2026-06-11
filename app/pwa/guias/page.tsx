'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { BONUS_GUIDES } from '@/lib/pwa/bonus-guides';

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
    description: 'Los que vas a eliminar durante los 7 días. Sacalos y sentí el cambio.',
    borderColor: 'border-[rgba(192,85,58,0.2)]',
    hoverBorder: 'hover:border-[rgba(192,85,58,0.4)]',
    bgAccent: 'bg-[#FFF5F0]',
  },
  {
    href: '/pwa/guias/antiinflamatorios',
    emoji: '🌿',
    title: '21 Alimentos Antiinflamatorios',
    description: 'Tus aliados del plan. Baratos, fáciles de conseguir y muy efectivos.',
    borderColor: 'border-[rgba(192,85,58,0.15)]',
    hoverBorder: 'hover:border-[rgba(192,85,58,0.3)]',
    bgAccent: 'bg-[#FFF5F0]',
  },
  {
    href: '/pwa/guias/suplementacion',
    emoji: '💊',
    title: 'Guía de Suplementación',
    description: 'Los 5 suplementos que amplifican el efecto del agua de arroz. Con alternativas naturales.',
    borderColor: 'border-[rgba(192,85,58,0.15)]',
    hoverBorder: 'hover:border-[rgba(192,85,58,0.3)]',
    bgAccent: 'bg-[#FFF5F0]',
  },
  {
    href: '/pwa/guias/ritual',
    emoji: '🌾',
    title: 'Ritual del Agua de Arroz — 5 min',
    description: 'El ritual matutino completo: agua de arroz + respiración + masaje. Lo hacés todos los días.',
    borderColor: 'border-[rgba(192,85,58,0.15)]',
    hoverBorder: 'hover:border-[rgba(192,85,58,0.3)]',
    bgAccent: 'bg-[#FFF5F0]',
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

      {/* Bonos exclusivos del Programa de 30 Días TURBO */}
      <motion.div variants={item} className="pt-2">
        <h2 className="font-serif text-lg font-semibold text-charcoal flex items-center gap-2">
          ✨ Tus bonos TURBO
        </h2>
        <p className="text-charcoal/55 text-[13px] mt-1 leading-relaxed">
          Los 3 regalos exclusivos que vienen con tu Programa de 30 Días.
        </p>
      </motion.div>

      {BONUS_GUIDES.map((bonus) => (
        <motion.div key={bonus.slug} variants={item}>
          <Link
            href={`/pwa/guias/bonus/${bonus.slug}`}
            className="block bg-white rounded-2xl p-5 shadow-sm border border-[rgba(245,130,31,0.2)] hover:border-[rgba(236,72,153,0.4)] transition-all group"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(245,130,31,0.12), rgba(236,72,153,0.12))' }}
              >
                <span className="text-2xl">{bonus.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-charcoal text-[15px] leading-tight">
                      {bonus.title}
                    </h2>
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #F5821F, #EC4899)' }}
                    >
                      Bono
                    </span>
                  </div>
                  <span className="text-charcoal/30 group-hover:text-coral transition-colors text-lg ml-2">
                    →
                  </span>
                </div>
                <p className="text-charcoal/55 text-[13px] mt-1.5 leading-relaxed">
                  {bonus.cardDescription}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}

      {/* Bottom note */}
      <motion.div
        variants={item}
        className="rounded-2xl p-4 border"
        style={{ backgroundColor: 'var(--terracotta-soft)', borderColor: 'rgba(192,85,58,0.15)' }}
      >
        <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
          💡 Empezá por el <strong>Ritual del Agua de Arroz</strong> (lo hacés mañana temprano) y los alimentos inflamatorios (sabé qué evitar desde hoy).
        </p>
      </motion.div>
    </motion.div>
  );
}

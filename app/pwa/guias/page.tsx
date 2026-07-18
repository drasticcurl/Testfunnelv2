'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { BONUS_GUIDES } from '@/lib/pwa/bonus-guides';
import { isVipUnlocked } from '@/lib/pwa/vip-access';
import { RICE_WATER_PATH } from '@/lib/pwa/rice-water';
import { computeStagger } from '@/lib/pwa/ui/motion';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  // Entrance driven by the shared stagger scheduler (single consistent inter-item
  // delay within the 40–80 ms band, capped at 800 ms).
  show: (delayMs: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', delay: delayMs / 1000 },
  }),
};

const guides = [
  {
    href: '/pwa/guias/inflamatorios',
    emoji: '🚫',
    title: '14 Alimentos Inflamatorios',
    description: 'Los que vas a eliminar durante los 7 días. Sacalos y sentí el cambio.',
    borderColor: 'border-terracotta/20',
    hoverBorder: 'hover:border-terracotta/40',
    bgAccent: 'bg-terracotta-soft',
  },
  {
    href: '/pwa/guias/antiinflamatorios',
    emoji: '🌿',
    title: '21 Alimentos Antiinflamatorios',
    description: 'Tus aliados del plan. Baratos, fáciles de conseguir y muy efectivos.',
    borderColor: 'border-terracotta/15',
    hoverBorder: 'hover:border-terracotta/30',
    bgAccent: 'bg-terracotta-soft',
  },
  {
    href: '/pwa/guias/suplementacion',
    emoji: '💊',
    title: 'Guía de Suplementación',
    description: 'Los 5 suplementos que amplifican el efecto del agua de arroz. Con alternativas naturales.',
    borderColor: 'border-terracotta/15',
    hoverBorder: 'hover:border-terracotta/30',
    bgAccent: 'bg-terracotta-soft',
  },
  {
    href: '/pwa/guias/ritual',
    emoji: '🌾',
    title: 'Ritual del Agua de Arroz — 5 min',
    description: 'El ritual matutino completo: agua de arroz + respiración + masaje. Lo hacés todos los días.',
    borderColor: 'border-terracotta/15',
    hoverBorder: 'hover:border-terracotta/30',
    bgAccent: 'bg-terracotta-soft',
  },
];

export default function GuiasPage() {
  // Si el dispositivo todavía no desbloqueó el VIP, mostramos una entrada para
  // ingresar el código (los compradores VIP llegan por link, pero esto es el
  // fallback visible dentro de la app). Una vez desbloqueado, el acceso al VIP
  // pasa al tab 👑 del bottom nav y ocultamos esta entrada.
  const [vipUnlocked, setVipUnlocked] = useState(true);
  useEffect(() => {
    setVipUnlocked(isVipUnlocked());
  }, []);

  // Single consistent, capped inter-item entrance delays for each list.
  const guideDelays = computeStagger(guides.length);
  const bonusDelays = computeStagger(BONUS_GUIDES.length);

  return (
    <motion.div
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header — page-title level (heading family, 30px, semibold). */}
      <motion.div variants={item} custom={0}>
        <h1 className="font-heading text-3xl font-semibold text-charcoal">
          Tus guías
        </h1>
        <p className="font-body text-muted text-sm mt-1 leading-relaxed">
          Todo lo que necesitás para el protocolo, en un solo lugar.
        </p>
      </motion.div>

      {/* Hero — Agua de Arroz: el método central */}
      <motion.div variants={item} custom={0}>
        <Link
          href={RICE_WATER_PATH}
          className="block rounded-lg p-5 border border-terracotta/30 shadow-sm bg-gradient-to-br from-terracotta to-terracotta-light hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-fast ease-standard group"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-md bg-warm/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🌾</span>
            </div>
            <div className="flex-1 min-w-0 text-warm">
              <div className="flex items-center gap-2">
                <span className="font-body text-[9px] font-bold uppercase tracking-wider bg-warm/25 px-1.5 py-0.5 rounded-full">
                  El método central
                </span>
              </div>
              <h2 className="font-body font-semibold text-base leading-tight mt-1.5">
                Guía del Agua de Arroz Prebiótica
              </h2>
              <p className="font-body text-warm/85 text-[13px] mt-1 leading-relaxed">
                La receta paso a paso: cómo prepararla y conservarla de forma segura. El elemento principal de todo el método.
              </p>
            </div>
            <span className="text-warm/80 text-lg flex-shrink-0" aria-hidden="true">→</span>
          </div>
        </Link>
      </motion.div>

      {/* Guide cards */}
      {guides.map((guide, idx) => (
        <motion.div key={guide.href} variants={item} custom={guideDelays[idx]}>
          <Link
            href={guide.href}
            className={`block bg-warm rounded-lg p-5 shadow-sm border ${guide.borderColor} ${guide.hoverBorder} transition-colors duration-fast ease-standard group`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-md ${guide.bgAccent} flex items-center justify-center flex-shrink-0`}>
                <span className="text-2xl">{guide.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-body font-semibold text-charcoal text-[15px] leading-tight">
                    {guide.title}
                  </h2>
                  <span className="text-muted-light group-hover:text-terracotta transition-colors duration-fast ease-standard text-lg ml-2" aria-hidden="true">
                    →
                  </span>
                </div>
                <p className="font-body text-muted text-[13px] mt-1.5 leading-relaxed">
                  {guide.description}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}

      {/* Bonos exclusivos del Programa de 30 Días TURBO */}
      <motion.div variants={item} custom={0} className="pt-2">
        <h2 className="font-heading text-lg font-semibold text-charcoal flex items-center gap-2">
          ✨ Tus bonos TURBO
        </h2>
        <p className="font-body text-muted text-[13px] mt-1 leading-relaxed">
          Los 3 regalos exclusivos que vienen con tu Programa de 30 Días.
        </p>
      </motion.div>

      {BONUS_GUIDES.map((bonus, idx) => (
        <motion.div key={bonus.slug} variants={item} custom={bonusDelays[idx]}>
          <Link
            href={`/pwa/guias/bonus/${bonus.slug}`}
            className="block bg-warm rounded-lg p-5 shadow-sm border border-warm-border hover:border-terracotta/40 transition-colors duration-fast ease-standard group"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(245,130,31,0.12), rgba(236,72,153,0.12))' }}
              >
                <span className="text-2xl">{bonus.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="font-body font-semibold text-charcoal text-[15px] leading-tight">
                      {bonus.title}
                    </h2>
                    <span
                      className="font-body text-[9px] font-bold uppercase tracking-wider text-warm px-1.5 py-0.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #F5821F, #EC4899)' }}
                    >
                      Bono
                    </span>
                  </div>
                  <span className="text-muted-light group-hover:text-terracotta transition-colors duration-fast ease-standard text-lg ml-2" aria-hidden="true">
                    →
                  </span>
                </div>
                <p className="font-body text-muted text-[13px] mt-1.5 leading-relaxed">
                  {bonus.cardDescription}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}

      {/* Entrada al VIP por código (solo si todavía no se desbloqueó) */}
      {!vipUnlocked && (
        <motion.div variants={item} custom={0} className="pt-2">
          <Link
            href="/pwa/vip"
            className="block rounded-lg p-5 border border-transparent text-warm shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-fast ease-standard"
            style={{ background: 'linear-gradient(135deg, #C9A227, #E8B923)' }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-warm/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👑</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-body font-semibold text-[15px] leading-tight">¿Tenés Acceso VIP?</h2>
                <p className="font-body text-warm/85 text-[13px] mt-1 leading-relaxed">
                  Ingresá tu código para desbloquear el contenido exclusivo de por vida.
                </p>
              </div>
              <span className="text-warm/80 text-lg flex-shrink-0" aria-hidden="true">→</span>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Bottom note */}
      <motion.div
        variants={item}
        custom={0}
        className="rounded-lg p-4 border border-terracotta/15 bg-terracotta-soft"
      >
        <p className="font-body text-xs leading-relaxed text-muted">
          💡 Empezá por la <Link href={RICE_WATER_PATH} className="font-semibold underline text-terracotta">Guía del Agua de Arroz</Link> (el método central) y los alimentos inflamatorios (sabé qué evitar desde hoy).
        </p>
      </motion.div>
    </motion.div>
  );
}

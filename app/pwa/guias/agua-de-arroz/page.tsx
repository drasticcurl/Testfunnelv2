'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  RICE_WATER_TIMING,
  RICE_WATER_STEPS,
  RICE_WATER_SAFETY,
  RICE_WATER_SCIENCE,
} from '@/lib/pwa/rice-water';
import GuideSources from '@/components/pwa/guias/GuideSources';

const RICE_WATER_SOURCES = [
  {
    label: 'MDPI/IJMS 2024 — Almidón resistente, butirato e inflamación intestinal',
    url: 'https://www.mdpi.com/1422-0067/25/13/7379/html',
  },
  {
    label: 'PMC — Butirato: energía del colonocito y barrera intestinal',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11520540/',
  },
  {
    label: 'PubMed — Almidón resistente, microbiota y barrera intestinal',
    url: 'https://pubmed.ncbi.nlm.nih.gov/38282825/',
  },
  {
    label: 'FoodSafety.gov — Conservación segura del arroz cocido (Bacillus cereus)',
    url: 'https://www.foodsafety.gov/food-safety-charts/cold-food-storage-charts',
  },
];

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

export default function AguaDeArrozPage() {
  return (
    <motion.div
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Back link */}
      <motion.div variants={item}>
        <Link href="/pwa/guias" className="text-sage text-sm font-medium hover:underline">
          ← Guías
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={item}>
        <span className="text-[11px] font-bold uppercase tracking-wider text-sage bg-sage-soft px-2 py-1 rounded-full">
          El método central
        </span>
        <h1 className="font-serif text-2xl font-semibold mt-3" style={{ color: 'var(--charcoal)' }}>
          Guía del Método: Agua de Arroz Prebiótica
        </h1>
        <p className="text-charcoal/60 text-sm mt-2 leading-relaxed">
          Es el elemento principal del protocolo. Bien preparada, activa el almidón resistente que
          alimenta tu microbiota y desinflama. Seguí el paso a paso exacto — el orden y el frío importan.
        </p>
      </motion.div>

      {/* Momento de consumo */}
      <motion.div
        variants={item}
        className="rounded-2xl p-4 border"
        style={{ backgroundColor: 'var(--sage-soft)', borderColor: 'rgba(122,139,116,0.2)' }}
      >
        <h2 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--charcoal)' }}>
          <span className="text-lg">{RICE_WATER_TIMING.emoji}</span>
          {RICE_WATER_TIMING.title}
        </h2>
        <p className="text-[13px] text-charcoal/65 leading-relaxed mt-2">
          {RICE_WATER_TIMING.text}
        </p>
      </motion.div>

      {/* Preparación paso a paso */}
      <motion.div variants={item}>
        <h2 className="font-serif text-lg font-semibold mb-1" style={{ color: 'var(--charcoal)' }}>
          🥣 Preparación correcta y segura
        </h2>
        <p className="text-charcoal/55 text-[13px] leading-relaxed mb-3">
          Para activar el almidón resistente de forma real y segura, seguí el proceso de cocción,
          enfriamiento y reposo controlado.
        </p>
      </motion.div>

      {/* Timeline steps */}
      <motion.div variants={item} className="relative">
        <div className="absolute left-[22px] top-8 bottom-8 w-0.5 bg-sage/20 rounded-full" />

        <div className="space-y-4">
          {RICE_WATER_STEPS.map((step) => (
            <motion.div key={step.order} variants={item} className="relative flex gap-4">
              {/* Step number circle */}
              <div
                className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                style={{ background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-light))' }}
              >
                <span className="text-white font-bold text-sm">{step.order}</span>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-sand/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{step.emoji}</span>
                  <h3 className="font-semibold text-charcoal text-[14px]">{step.title}</h3>
                </div>
                <p className="text-[13px] text-charcoal/70 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Safety box — destacado */}
      <motion.div
        variants={item}
        className="rounded-2xl p-4 border-2"
        style={{ backgroundColor: '#FFF7ED', borderColor: 'rgba(192,85,58,0.35)' }}
      >
        <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--terracotta-dark)' }}>
          <span className="text-lg">{RICE_WATER_SAFETY.emoji}</span>
          {RICE_WATER_SAFETY.title}
        </h3>
        <p className="text-[12.5px] text-charcoal/70 leading-relaxed mt-2">
          {RICE_WATER_SAFETY.text}
        </p>
      </motion.div>

      {/* Science section */}
      <motion.div
        variants={item}
        className="rounded-2xl p-4 border"
        style={{ backgroundColor: 'var(--terracotta-soft)', borderColor: 'rgba(192,85,58,0.15)' }}
      >
        <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--charcoal)' }}>
          🧠 ¿Por qué funciona?
        </h3>
        <p className="text-[12px] text-charcoal/60 leading-relaxed">{RICE_WATER_SCIENCE}</p>
      </motion.div>

      {/* Link al ritual completo */}
      <motion.div variants={item}>
        <Link
          href="/pwa/guias/ritual"
          className="block rounded-2xl p-4 border bg-white shadow-sm hover:border-sage/40 transition-colors group"
          style={{ borderColor: 'rgba(122,139,116,0.2)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌅</span>
              <div>
                <p className="font-semibold text-charcoal text-[14px]">Ritual de mañana (5 min)</p>
                <p className="text-charcoal/55 text-[12px] mt-0.5">
                  Sumá la respiración, el masaje y el estiramiento que amplifican tu agua de arroz.
                </p>
              </div>
            </div>
            <span className="text-charcoal/30 group-hover:text-sage transition-colors text-lg ml-2">→</span>
          </div>
        </Link>
      </motion.div>

      {/* Fuentes */}
      <motion.div variants={item}>
        <GuideSources sources={RICE_WATER_SOURCES} />
      </motion.div>
    </motion.div>
  );
}

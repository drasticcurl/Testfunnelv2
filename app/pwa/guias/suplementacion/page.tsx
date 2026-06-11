'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  SUPPLEMENTS,
  PROTOCOL_BY_WEEK,
  SUPPLEMENTS_TO_AVOID,
  INTERACTIONS,
  MEDICAL_DISCLAIMER,
} from '@/lib/pwa/supplement-guide';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function SupplementAccordion({ supplement }: { supplement: (typeof SUPPLEMENTS)[0] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage/10 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-11 h-11 rounded-xl bg-sage-soft flex items-center justify-center flex-shrink-0">
          <span className="text-xl">{supplement.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-charcoal text-[14px]">{supplement.name}</h3>
          <p className="text-[12px] text-charcoal/55 mt-0.5 line-clamp-1">
            {supplement.purpose.split('.')[0]}.
          </p>
        </div>
        <span className={`text-charcoal/40 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 pb-4 space-y-3"
        >
          {/* Purpose */}
          <div>
            <p className="text-xs font-semibold text-sage uppercase tracking-wider mb-1">¿Para qué?</p>
            <p className="text-[13px] text-charcoal/70 leading-relaxed">{supplement.purpose}</p>
          </div>

          {/* What to look for */}
          <div>
            <p className="text-xs font-semibold text-sage uppercase tracking-wider mb-1">Qué buscar al comprar</p>
            <p className="text-[13px] text-charcoal/70 leading-relaxed">{supplement.whatToLookFor}</p>
          </div>

          {/* Dose & when */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-sage-soft/50 rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-sage uppercase">Dosis</p>
              <p className="text-[12px] text-charcoal/70 mt-0.5">{supplement.dose}</p>
            </div>
            <div className="bg-cream-warm rounded-lg p-2.5">
              <p className="text-[10px] font-semibold text-charcoal/50 uppercase">Cuándo</p>
              <p className="text-[12px] text-charcoal/70 mt-0.5">{supplement.when}</p>
            </div>
          </div>

          {/* Natural alternative */}
          <div className="bg-sage-soft/30 rounded-xl p-3 border border-sage/10">
            <p className="text-xs font-semibold text-sage uppercase tracking-wider mb-1">
              🌱 Alternativa natural (sin cápsulas)
            </p>
            <p className="text-[13px] text-charcoal/70 leading-relaxed">{supplement.naturalAlternative}</p>
          </div>

          {/* Brands */}
          {supplement.brands && (
            <div>
              <p className="text-xs font-semibold text-charcoal/50 uppercase tracking-wider mb-1.5">
                Marcas por país
              </p>
              <div className="space-y-1">
                {supplement.brands.map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px]">
                    <span className="font-medium text-charcoal/60 whitespace-nowrap">{b.country}</span>
                    <span className="text-charcoal/70">{b.brand}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function SuplementacionPage() {
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
          Guía de suplementación natural
        </h1>
        <p className="text-charcoal/60 text-sm mt-2 leading-relaxed">
          Los 5 suplementos con evidencia real para tu intestino. Cada uno tiene 
          una alternativa natural si no querés tomar cápsulas.
        </p>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        variants={item}
        className="bg-amber-50 rounded-2xl p-4 border border-amber-200/60"
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-[12px] text-amber-900/70 leading-relaxed">
            {MEDICAL_DISCLAIMER}
          </p>
        </div>
      </motion.div>

      {/* Supplements accordion */}
      <motion.div variants={item} className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-charcoal">
          Los 5 suplementos clave
        </h2>
        {SUPPLEMENTS.map((supp, i) => (
          <SupplementAccordion key={i} supplement={supp} />
        ))}
      </motion.div>

      {/* Protocol by week */}
      <motion.div variants={item} className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-charcoal">
          Protocolo por semana
        </h2>
        {PROTOCOL_BY_WEEK.map((week, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-sage/10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-sage-soft flex items-center justify-center">
                <span className="text-xs font-bold text-sage">{week.weeks}</span>
              </div>
              <div>
                <p className="text-[11px] text-charcoal/50 uppercase tracking-wider">
                  Semanas {week.weeks}
                </p>
                <p className="text-sm font-semibold text-charcoal">{week.title}</p>
              </div>
            </div>
            <div className="space-y-2">
              {week.supplements.map((s, j) => (
                <div key={j} className="flex items-start gap-2 text-[12px] bg-cream/50 rounded-lg p-2">
                  <span className="font-semibold text-charcoal/80 whitespace-nowrap min-w-[90px]">
                    {s.name}
                  </span>
                  <span className="text-charcoal/60">
                    {s.dose} · {s.moment} · <span className="text-sage">{s.objective}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* What you DON'T need */}
      <motion.div variants={item} className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-charcoal">
          Lo que NO necesitás
        </h2>
        {SUPPLEMENTS_TO_AVOID.map((supp, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-coral/10">
            <h3 className="font-semibold text-charcoal text-[13px] flex items-center gap-2">
              <span className="text-coral">✗</span> {supp.name}
            </h3>
            <p className="text-[12px] text-charcoal/60 mt-1.5 leading-relaxed">{supp.reason}</p>
          </div>
        ))}
      </motion.div>

      {/* Interactions */}
      <motion.div variants={item} className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-charcoal">
          Interacciones importantes
        </h2>
        <div className="bg-amber-50/50 rounded-2xl p-3 border border-amber-200/40">
          <p className="text-[11px] text-amber-800/70 mb-3">
            ⚠️ Consultá siempre con tu médico si tomás alguno de estos medicamentos:
          </p>
          <div className="space-y-2.5">
            {INTERACTIONS.map((inter, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-amber-100">
                <p className="text-[12px] font-semibold text-charcoal/80">{inter.medication}</p>
                <p className="text-[11px] text-charcoal/50 mt-0.5">
                  Interactúa con: <span className="font-medium text-charcoal/70">{inter.supplement}</span>
                </p>
                <p className="text-[11px] text-charcoal/60 mt-1">{inter.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Final note */}
      <motion.div
        variants={item}
        className="bg-sage-soft/50 rounded-2xl p-4 border border-sage/10"
      >
        <p className="text-[13px] text-charcoal/70 leading-relaxed italic">
          &quot;No hay un suplemento que repare lo que una mala alimentación rompió. Pero sí hay 
          nutrientes que, junto con un plan de alimentación correcto, aceleran el proceso 
          de recuperación intestinal.&quot;
        </p>
      </motion.div>
    </motion.div>
  );
}

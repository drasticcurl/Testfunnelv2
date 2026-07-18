'use client';

/**
 * /pwa/vip/guia/[slug] — renderer compartido de las guías VIP en texto
 * (masterclasses, mini-guías, protocolo anti-rebote, calculadora PRO).
 *
 * El contenido vive en lib/pwa/vip-content.ts. Mismo formato visual que
 * /pwa/guias/bonus/[slug], con identidad VIP (badge dorado/corona).
 *
 * Nota: el badge dorado de VIP es un acento de marca deliberado (no forma parte
 * de la paleta terracotta/warm), por eso conserva su gradiente propio.
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import GuideSources from '@/components/pwa/guias/GuideSources';
import { getVipGuide, type VipCategory, type VipSource } from '@/lib/pwa/vip-content';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const CATEGORY_LABEL: Record<VipCategory, string> = {
  masterclass: '👑 Masterclass VIP',
  'mini-guia': '👑 Mini-guía VIP',
  protocolo: '👑 Protocolo VIP',
};

/** Máximo de fuentes a renderizar (alineado con el límite del tipo VipGuide). */
const MAX_SOURCES = 50;

/**
 * Filtra las fuentes válidas de una guía preservando su orden de aparición,
 * hasta un máximo de MAX_SOURCES. Una fuente es válida cuando su `label`, tras
 * recortar espacios, tiene entre 1 y 200 caracteres, y su `url` comienza con
 * `http://` o `https://` sin distinción de mayúsculas/minúsculas.
 */
function getValidSources(sources: VipSource[] | undefined): VipSource[] {
  if (!sources || sources.length === 0) return [];
  return sources
    .filter((s) => {
      if (!s || typeof s.label !== 'string' || typeof s.url !== 'string') return false;
      const labelLen = s.label.trim().length;
      if (labelLen < 1 || labelLen > 200) return false;
      return /^https?:\/\//i.test(s.url);
    })
    .slice(0, MAX_SOURCES);
}

export default function VipGuidePage() {
  const params = useParams();
  const slug = String(params.slug);
  const guide = getVipGuide(slug);

  if (!guide) {
    return (
      <div className="space-y-4">
        <Link href="/pwa/vip" className="text-terracotta text-sm font-body font-medium hover:underline">
          ← VIP
        </Link>
        <p className="font-body text-charcoal/50 text-center py-12">Contenido no encontrado.</p>
      </div>
    );
  }

  const validSources = getValidSources(guide.sources);

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
      {/* Back link */}
      <motion.div variants={item}>
        <Link href="/pwa/vip" className="text-terracotta text-sm font-body font-medium hover:underline">
          ← VIP
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={item}>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-warm px-2.5 py-1 rounded-full mb-2"
          style={{ background: 'linear-gradient(135deg, #C9A227, #E8B923)' }}
        >
          {CATEGORY_LABEL[guide.category]}
        </span>
        <h1 className="font-heading text-2xl font-semibold flex items-center gap-2 text-charcoal">
          <span>{guide.emoji}</span> {guide.title}
        </h1>
        <p className="font-body text-charcoal/60 text-sm mt-3 leading-relaxed">{guide.intro}</p>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {guide.sections.map((section, i) => (
          <motion.div
            key={i}
            variants={item}
            className="bg-warm rounded-2xl p-5 shadow-sm border border-warm-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{section.emoji}</span>
              <h3 className="font-body font-semibold text-charcoal text-[15px] leading-tight">
                {section.title}
              </h3>
            </div>
            <p className="font-body text-[13px] text-charcoal/70 leading-relaxed">{section.body}</p>

            {section.items && section.items.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {section.items.map((it, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 font-body text-[13px] text-charcoal/70 leading-relaxed"
                  >
                    <span className="text-terracotta mt-0.5 flex-shrink-0">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      {/* CTA opcional */}
      {guide.cta && (
        <motion.div variants={item}>
          <Link
            href={guide.cta.href}
            className="block w-full text-center rounded-full bg-gradient-to-r from-terracotta to-terracotta-dark text-warm font-body font-semibold px-6 py-3.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-transform"
          >
            {guide.cta.label}
          </Link>
        </motion.div>
      )}

      {/* Closing card */}
      <motion.div
        variants={item}
        className="rounded-2xl p-5 border border-terracotta/15 text-center bg-terracotta-soft"
      >
        <span className="text-3xl">{guide.emoji}</span>
        <p className="font-heading text-lg font-semibold mt-2 text-charcoal">
          {guide.closingTitle}
        </p>
        <p className="font-body text-xs mt-2 text-charcoal/60">{guide.closingText}</p>
      </motion.div>

      {/* Fuentes (solo si hay al menos una válida) — última sección de la guía */}
      {validSources.length > 0 && (
        <motion.div variants={item}>
          <GuideSources sources={validSources} />
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.p
        variants={item}
        className="font-body text-[10px] text-charcoal/40 text-center leading-relaxed px-2"
      >
        Contenido educativo e informativo. No reemplaza la consulta con un profesional de la salud.
        Ante cualquier condición médica, embarazo o lactancia, consultá a tu médico.
      </motion.p>
    </motion.div>
  );
}

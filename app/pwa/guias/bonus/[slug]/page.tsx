'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getBonusGuide } from '@/lib/pwa/bonus-guides';

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

export default function BonusGuidePage() {
  const params = useParams();
  const slug = String(params.slug);
  const guide = getBonusGuide(slug);

  if (!guide) {
    return (
      <div className="space-y-4">
        <Link href="/pwa/guias" className="text-sage text-sm font-medium hover:underline">
          ← Guías
        </Link>
        <p className="text-charcoal/50 text-center py-12">Bono no encontrado.</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-5" variants={container} initial="hidden" animate="show">
      {/* Back link */}
      <motion.div variants={item}>
        <Link href="/pwa/guias" className="text-sage text-sm font-medium hover:underline">
          ← Guías
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={item}>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full mb-2"
          style={{ background: 'linear-gradient(135deg, #F5821F, #EC4899)' }}>
          ✨ Bono TURBO
        </span>
        <h1 className="font-serif text-2xl font-semibold flex items-center gap-2" style={{ color: 'var(--charcoal)' }}>
          <span>{guide.emoji}</span> {guide.title}
        </h1>
        <p className="text-charcoal/60 text-sm mt-3 leading-relaxed">{guide.intro}</p>
      </motion.div>

      {/* Sections */}
      <div className="space-y-4">
        {guide.sections.map((section, i) => (
          <motion.div
            key={i}
            variants={item}
            className="bg-white rounded-2xl p-5 shadow-sm border border-sand/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{section.emoji}</span>
              <h3 className="font-semibold text-charcoal text-[15px] leading-tight">
                {section.title}
              </h3>
            </div>
            <p className="text-[13px] text-charcoal/70 leading-relaxed">{section.body}</p>

            {section.items && section.items.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {section.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2 text-[13px] text-charcoal/70 leading-relaxed">
                    <span className="text-sage mt-0.5 flex-shrink-0">•</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        ))}
      </div>

      {/* Closing card */}
      <motion.div
        variants={item}
        className="rounded-2xl p-5 border text-center"
        style={{ background: 'linear-gradient(135deg, var(--terracotta-soft), #FFF5F0)', borderColor: 'rgba(192,85,58,0.15)' }}
      >
        <span className="text-3xl">{guide.emoji}</span>
        <p className="font-serif text-lg font-semibold mt-2" style={{ color: 'var(--charcoal)' }}>
          {guide.closingTitle}
        </p>
        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
          {guide.closingText}
        </p>
      </motion.div>
    </motion.div>
  );
}

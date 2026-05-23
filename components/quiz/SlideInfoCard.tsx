'use client';

import { motion } from 'framer-motion';
import { SlideDefinition } from '@/lib/types';

interface SlideInfoCardProps {
  slide: SlideDefinition;
  onContinue: () => void;
}

export default function SlideInfoCard({ slide, onContinue }: SlideInfoCardProps) {
  const content = slide.infoContent;
  if (!content) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-5xl mb-6"
      >
        {content.icon || '💡'}
      </motion.div>

      <div className="card-quiz">
        <h3 className="font-serif text-xl text-white mb-3">{content.title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{content.body}</p>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="btn-primary w-full mt-6"
      >
        Continuar
      </motion.button>
    </motion.div>
  );
}

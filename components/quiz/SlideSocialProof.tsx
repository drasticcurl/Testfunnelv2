'use client';

import { motion } from 'framer-motion';
import { SlideDefinition } from '@/lib/types';

interface SlideSocialProofProps {
  slide: SlideDefinition;
  onContinue: () => void;
}

export default function SlideSocialProof({ slide, onContinue }: SlideSocialProofProps) {
  const testimonial = slide.testimonial;
  if (!testimonial) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <p className="text-gray-400 text-sm mb-4">Lo que dicen nuestros usuarios</p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-night-800 border border-night-600 rounded-2xl p-6 relative"
      >
        {/* Chat bubble tail */}
        <div className="absolute -bottom-2 left-8 w-4 h-4 bg-night-800 border-b border-r border-night-600 transform rotate-45" />

        <p className="text-white text-sm leading-relaxed italic mb-4">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">
              {testimonial.name[0]}
            </span>
          </div>
          <span className="text-gray-300 text-sm font-medium">
            {testimonial.name}, {testimonial.age}
          </span>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="btn-primary w-full mt-8"
      >
        Continuar
      </motion.button>
    </motion.div>
  );
}

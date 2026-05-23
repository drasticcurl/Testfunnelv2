'use client';

import { motion } from 'framer-motion';
import { SlideDefinition } from '@/lib/types';

interface SlideGenderProps {
  slide: SlideDefinition;
  onSelect: (value: string) => void;
}

export default function SlideGender({ slide, onSelect }: SlideGenderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="text-center"
    >
      <h2 className="font-serif text-2xl text-white mb-8">{slide.question}</h2>
      <div className="grid grid-cols-2 gap-4">
        {slide.options?.map((option) => (
          <motion.button
            key={option.id}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(option.id)}
            className="bg-night-800 border border-night-600 hover:border-accent/60 rounded-xl p-6 flex flex-col items-center gap-3 transition-colors"
          >
            <span className="text-4xl">{option.emoji}</span>
            <span className="text-white font-medium">{option.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

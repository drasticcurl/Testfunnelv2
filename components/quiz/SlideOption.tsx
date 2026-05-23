'use client';

import { motion } from 'framer-motion';
import { SlideDefinition } from '@/lib/types';

interface SlideOptionProps {
  slide: SlideDefinition;
  onSelect: (value: string) => void;
  selected?: string;
}

export default function SlideOption({ slide, onSelect, selected }: SlideOptionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="font-serif text-2xl text-white mb-2 text-center">{slide.question}</h2>
      {slide.subtitle && (
        <p className="text-gray-400 text-sm text-center mb-6">{slide.subtitle}</p>
      )}
      <div className="space-y-3">
        {slide.options?.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(option.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
              selected === option.id
                ? 'bg-accent/10 border-accent text-white'
                : 'bg-night-800 border-night-600 hover:border-night-500 text-gray-200'
            }`}
          >
            {option.emoji && <span className="text-xl">{option.emoji}</span>}
            <span className="font-medium">{option.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

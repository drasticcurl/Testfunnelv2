'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideDefinition } from '@/lib/types';

interface SlideMultiSelectProps {
  slide: SlideDefinition;
  onSubmit: (values: string[]) => void;
}

export default function SlideMultiSelect({ slide, onSubmit }: SlideMultiSelectProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOption = (id: string) => {
    setSelected((prev) => {
      if (id === 'nada') return ['nada'];
      const without = prev.filter((s) => s !== 'nada');
      return without.includes(id) ? without.filter((s) => s !== id) : [...without, id];
    });
  };

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
      <div className="space-y-3 mb-6">
        {slide.options?.map((option, index) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggleOption(option.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${
              selected.includes(option.id)
                ? 'bg-accent/10 border-accent text-white'
                : 'bg-night-800 border-night-600 hover:border-night-500 text-gray-200'
            }`}
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                selected.includes(option.id) ? 'bg-accent border-accent' : 'border-gray-500'
              }`}
            >
              {selected.includes(option.id) && (
                <svg className="w-3 h-3 text-night-900" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="font-medium">{option.label}</span>
          </motion.button>
        ))}
      </div>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => selected.length > 0 && onSubmit(selected)}
        disabled={selected.length === 0}
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continuar
      </motion.button>
    </motion.div>
  );
}

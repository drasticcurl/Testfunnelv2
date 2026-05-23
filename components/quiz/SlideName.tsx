'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideDefinition } from '@/lib/types';

interface SlideNameProps {
  slide: SlideDefinition;
  onSubmit: (name: string) => void;
}

export default function SlideName({ slide, onSubmit }: SlideNameProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length >= 2) {
      onSubmit(trimmed);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="font-serif text-2xl text-white mb-2">{slide.question}</h2>
        {slide.subtitle && <p className="text-gray-400 text-sm">{slide.subtitle}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="input-quiz"
          autoFocus
        />
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={name.trim().length < 2}
          className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar
        </motion.button>
      </form>
    </motion.div>
  );
}

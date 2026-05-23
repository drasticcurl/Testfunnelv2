'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlideDefinition } from '@/lib/types';

interface SlideEmailProps {
  slide: SlideDefinition;
  onSubmit: (email: string) => void;
}

export default function SlideEmail({ slide, onSubmit }: SlideEmailProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Ingresá tu email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Ingresá un email válido');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="font-serif text-2xl text-white mb-2">{slide.question}</h2>
        {slide.subtitle && <p className="text-gray-400 text-sm">{slide.subtitle}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            placeholder="tu@email.com"
            className="input-quiz"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="btn-primary w-full"
        >
          Ver mi resultado
        </motion.button>
        <p className="text-gray-500 text-xs text-center">
          No compartimos tu email. Cero spam.
        </p>
      </form>
    </motion.div>
  );
}

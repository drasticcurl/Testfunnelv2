'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { text: 'Analizando tu patrón de sueño...', icon: '🔬' },
  { text: 'Identificando tu tipo de insomnio...', icon: '🧠' },
  { text: 'Calculando severidad...', icon: '📊' },
  { text: 'Generando tu protocolo personalizado...', icon: '📋' },
  { text: '¡Listo! Preparando tu resultado...', icon: '✨' },
];

const TESTIMONIALS = [
  '"En la noche 3 ya dormía de corrido" — Martín, 45',
  '"No puedo creer que algo tan simple funcione" — Carolina, 38',
  '"Probé de todo, esto fue lo primero que funcionó" — Anabel, 52',
];

interface SlideLoadingProps {
  onComplete: () => void;
  duration?: number;
}

export default function SlideLoading({ onComplete, duration = 8000 }: SlideLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);

      // Update step based on progress
      const newStep = Math.min(STEPS.length - 1, Math.floor((p / 100) * STEPS.length));
      setStepIndex(newStep);

      if (p >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-5xl mb-6"
      >
        🌙
      </motion.div>

      <h2 className="font-serif text-xl text-white mb-2">
        Creando tu protocolo...
      </h2>

      {/* Progress bar */}
      <div className="w-full h-2.5 bg-night-700 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <span className="text-lg">{STEPS[stepIndex].icon}</span>
          <span className="text-gray-300 text-sm">{STEPS[stepIndex].text}</span>
        </motion.div>
      </AnimatePresence>

      {/* Rotating testimonials */}
      <div className="border-t border-night-700 pt-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={testimonialIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-gray-400 text-xs italic"
          >
            {TESTIMONIALS[testimonialIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

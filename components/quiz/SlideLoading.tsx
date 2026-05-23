'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FACTS = [
  '1 de cada 3 argentinos duerme mal de forma crónica',
  'El insomnio acelera el envejecimiento celular 3x',
  'Dormir menos de 6 horas aumenta el riesgo cardíaco un 48%',
  'Tu cerebro se limpia de toxinas solo durante el sueño profundo',
  'La falta de sueño afecta tu memoria a corto plazo en un 40%',
];

interface SlideLoadingProps {
  onComplete: () => void;
  duration?: number; // ms
}

export default function SlideLoading({ onComplete, duration = 8000 }: SlideLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / duration) * 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % FACTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center"
    >
      <div className="mb-8">
        <div className="text-5xl mb-4">🔬</div>
        <h2 className="font-serif text-2xl text-white mb-2">Analizando tu perfil de sueño...</h2>
        <p className="text-gray-400 text-sm">Estamos procesando tus respuestas</p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-night-700 rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-accent-hover rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Rotating facts */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-gray-300 text-sm px-4"
          >
            💡 {FACTS[factIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Percentage */}
      <p className="text-accent font-mono text-lg mt-4">{Math.round(progress)}%</p>
    </motion.div>
  );
}

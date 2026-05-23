'use client';

import { motion } from 'framer-motion';
import { QuizResult } from '@/lib/types';

interface SlideResultProps {
  result: QuizResult;
  onContinue: () => void;
}

function SeverityBadge({ severidad }: { severidad: number }) {
  let label: string;
  let color: string;
  if (severidad <= 3) {
    label = 'Leve';
    color = 'bg-green-500/20 text-green-400 border-green-500/30';
  } else if (severidad <= 6) {
    label = 'Moderado';
    color = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  } else {
    label = 'Severo';
    color = 'bg-red-500/20 text-red-400 border-red-500/30';
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${color}`}>
      {label} ({severidad}/10)
    </span>
  );
}

function AnimatedBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const getColor = (v: number) => {
    if (v < 40) return 'from-red-500 to-red-400';
    if (v < 65) return 'from-yellow-500 to-yellow-400';
    return 'from-green-500 to-green-400';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="h-2.5 bg-night-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${getColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function SlideResult({ result, onContinue }: SlideResultProps) {
  // Score bars based on severity (inverted for display)
  const sleepQuality = Math.max(10, 100 - result.severidad * 9);
  const sleepDebt = Math.min(95, result.severidad * 10);
  const recoveryPotential = Math.min(95, 70 + (10 - result.severidad) * 2);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <p className="text-gray-400 text-sm mb-2">Tu perfil de sueño:</p>
        <h2 className="font-serif text-3xl text-white mb-3">{result.tipoNombre}</h2>
        <SeverityBadge severidad={result.severidad} />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-300 text-sm mb-8 px-2"
      >
        {result.tipoDescripcion}
      </motion.p>

      {/* Animated bars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-4 mb-8 text-left"
      >
        <AnimatedBar label="Calidad de sueño" value={sleepQuality} delay={0.8} />
        <AnimatedBar label="Deuda de sueño" value={sleepDebt} delay={1.0} />
        <AnimatedBar label="Potencial de recuperación" value={recoveryPotential} delay={1.2} />
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="btn-primary w-full"
      >
        Ver mi plan personalizado →
      </motion.button>
    </motion.div>
  );
}

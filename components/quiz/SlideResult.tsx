'use client';

import { motion } from 'framer-motion';
import { QuizResult } from '@/lib/types';

interface SlideResultProps {
  result: QuizResult;
  onContinue: () => void;
}

const TIPO_EMOJI: Record<string, string> = {
  mente_acelerada: '🧠',
  despertador: '⏰',
  zombi: '🧟',
  irregular: '🔄',
};

function SeverityMeter({ severidad }: { severidad: number }) {
  const percentage = (severidad / 10) * 100;
  const getColor = () => {
    if (severidad <= 3) return 'from-green-400 to-green-500';
    if (severidad <= 6) return 'from-yellow-400 to-orange-400';
    return 'from-orange-500 to-red-500';
  };
  const getLabel = () => {
    if (severidad <= 3) return 'Leve';
    if (severidad <= 6) return 'Moderado';
    return 'Severo';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-400 text-xs">Severidad</span>
        <span className="text-white text-sm font-semibold">{getLabel()} ({severidad}/10)</span>
      </div>
      <div className="h-3 bg-night-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${getColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function StatBar({ label, value, delay, inverted = false }: { label: string; value: number; delay: number; inverted?: boolean }) {
  const displayValue = inverted ? 100 - value : value;
  const getColor = () => {
    if (displayValue >= 65) return 'from-green-400 to-green-500';
    if (displayValue >= 40) return 'from-yellow-400 to-orange-400';
    return 'from-red-400 to-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium">{displayValue}%</span>
      </div>
      <div className="h-2 bg-night-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${getColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${displayValue}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function SlideResult({ result, onContinue }: SlideResultProps) {
  const emoji = TIPO_EMOJI[result.tipo] || '🌙';
  const sleepQuality = Math.max(10, 100 - result.severidad * 9);
  const recoveryPotential = Math.min(95, 70 + (10 - result.severidad) * 2.5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="text-center mb-5"
      >
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-1.5 mb-4">
          <span className="text-lg">{emoji}</span>
          <span className="text-accent text-xs font-semibold uppercase tracking-wide">Tu diagnóstico</span>
        </div>
        <h2 className="font-serif text-3xl text-white mb-2">{result.tipoNombre}</h2>
        <p className="text-gray-300 text-sm leading-relaxed px-2">
          {result.tipoDescripcion}
        </p>
      </motion.div>

      {/* Severity meter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-quiz mb-4"
      >
        <SeverityMeter severidad={result.severidad} />
      </motion.div>

      {/* Profile bars */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-quiz space-y-3 mb-5"
      >
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1">Tu perfil de sueño</p>
        <StatBar label="Calidad de sueño" value={sleepQuality} delay={0.9} />
        <StatBar label="Deuda de sueño" value={result.severidad * 10} delay={1.1} inverted />
        <StatBar label="Potencial de recuperación" value={recoveryPotential} delay={1.3} />
      </motion.div>

      {/* Recovery message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="bg-accent/5 border border-accent/20 rounded-xl p-4 mb-6 text-center"
      >
        <p className="text-accent text-sm font-medium mb-1">Buena noticia</p>
        <p className="text-gray-300 text-xs">
          Personas con tu perfil mejoran un <span className="text-white font-semibold">73%</span> en los primeros 7 días del protocolo.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="btn-primary w-full text-base py-3.5"
      >
        Ver mi plan personalizado →
      </motion.button>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { QuizResult } from '@/lib/types';

interface SlidePlanPreviewProps {
  result: QuizResult;
  onContinue: () => void;
}

const PLAN_DAYS = [
  { day: 1, title: 'Reset de disruptores', desc: 'Eliminá lo que sabotea tu sueño', unlocked: true },
  { day: 2, title: 'Tu rutina pre-sueño', desc: 'Rutina de 15 min que apaga tu mente', unlocked: true },
  { day: 3, title: 'Respiración + Body Scan', desc: 'Técnica 4-7-8 para dormirte en minutos', unlocked: false },
  { day: 4, title: 'Optimización del ambiente', desc: 'Luz, temperatura, ruido — checklist', unlocked: false },
  { day: 5, title: 'Alimentación pro-sueño', desc: 'Qué cenar y qué evitar', unlocked: false },
  { day: 6, title: 'Protocolo anti-rumiación', desc: 'Para la mente que no para', unlocked: false },
  { day: 7, title: 'Consolidación', desc: 'Tu plan de mantenimiento', unlocked: false },
];

export default function SlidePlanPreview({ result, onContinue }: SlidePlanPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-5">
        <p className="text-accent text-xs font-semibold uppercase tracking-wider mb-1">
          Tu plan personalizado
        </p>
        <h2 className="font-serif text-2xl text-white mb-1">
          Protocolo de 7 Noches
        </h2>
        <p className="text-gray-400 text-sm">
          Diseñado para: <span className="text-white font-medium">{result.tipoNombre}</span>
        </p>
      </div>

      {/* Plan days - first 2 visible, rest blurred */}
      <div className="space-y-2 mb-6">
        {PLAN_DAYS.map((item, index) => (
          <motion.div
            key={item.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            className={`relative flex items-center gap-3 p-3 rounded-xl border ${
              item.unlocked
                ? 'bg-night-800 border-night-600'
                : 'bg-night-800/50 border-night-700/50'
            }`}
          >
            {/* Day number */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
              item.unlocked
                ? 'bg-accent/20 text-accent'
                : 'bg-night-700 text-gray-500'
            }`}>
              {item.day}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${!item.unlocked ? 'blur-[2px]' : ''}`}>
              <p className="text-white text-sm font-medium truncate">{item.title}</p>
              <p className="text-gray-400 text-xs truncate">{item.desc}</p>
            </div>

            {/* Lock icon */}
            {!item.unlocked && (
              <span className="text-gray-500 text-sm flex-shrink-0">🔒</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Unlock CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <p className="text-gray-400 text-xs mb-3">
          Tu plan ya está listo. Solo necesitás desbloquearlo.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onContinue}
          className="btn-primary w-full text-base py-3.5"
        >
          Desbloquear mi protocolo completo →
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

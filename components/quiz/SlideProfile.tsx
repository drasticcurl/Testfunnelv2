'use client';

import { motion } from 'framer-motion';

interface ProfileBar {
  label: string;
  value: number;
  color: 'red' | 'yellow' | 'green';
}

interface SlideProfileProps {
  bars: ProfileBar[];
  nombre?: string;
  onContinue: () => void;
}

export default function SlideProfile({ bars, nombre, onContinue }: SlideProfileProps) {
  const getGradient = (color: 'red' | 'yellow' | 'green') => {
    switch (color) {
      case 'red': return 'from-red-500 to-red-400';
      case 'yellow': return 'from-yellow-500 to-yellow-400';
      case 'green': return 'from-green-500 to-green-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm mb-1">
          {nombre ? `${nombre}, tu` : 'Tu'} perfil de sueño:
        </p>
        <h2 className="font-serif text-2xl text-white">Análisis Completo</h2>
      </div>

      <div className="card-quiz space-y-5">
        {bars.map((bar, index) => (
          <div key={bar.label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{bar.label}</span>
              <span className="text-white font-medium">{bar.value}%</span>
            </div>
            <div className="h-3 bg-night-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${getGradient(bar.color)}`}
                initial={{ width: 0 }}
                animate={{ width: `${bar.value}%` }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="btn-primary w-full mt-6"
      >
        Ver mi resultado →
      </motion.button>
    </motion.div>
  );
}

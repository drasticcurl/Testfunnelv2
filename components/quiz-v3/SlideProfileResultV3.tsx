'use client';

/**
 * SlideProfileResultV3 — perfil generado compacto.
 * Muestra tipo + severidad + 3 barras (severidad, potencial, urgencia).
 * Más directo que V2, sin tanta explicación.
 */

import { motion } from 'framer-motion';
import { useQuizStoreV3 } from '@/lib/quiz-v3/store';
import { calcularTipoV3, calcularSeveridadV3, calcularPerfilBarsV3 } from '@/lib/quiz-v3/helpers';
import Button from '@/components/ui/Button';

interface Props {
  onNext: () => void;
}

const TIPO_NOMBRES: Record<number, string> = {
  1: 'Hinchazón Matutina',
  2: 'Hinchazón Postprandial',
  3: 'Hinchazón Vespertina',
  4: 'Hinchazón Crónica',
};

export function SlideProfileResultV3({ onNext }: Props) {
  const answers = useQuizStoreV3((s) => s.answers);
  const tipo = calcularTipoV3(answers);
  const severidad = calcularSeveridadV3(answers);
  const bars = calcularPerfilBarsV3(answers);

  const sevLabel = severidad >= 7 ? 'Alta' : severidad >= 4 ? 'Moderada' : 'Leve';
  const sevColor = severidad >= 7 ? '#C25450' : severidad >= 4 ? '#D9A441' : '#5B8A60';

  return (
    <div className="max-w-md mx-auto text-center">
      <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold">
        Tu diagnóstico está listo
      </h2>

      {/* Tipo badge */}
      <div className="mt-4">
        <span className="inline-block bg-coral-soft px-4 py-1.5 rounded-full font-sans text-sm font-semibold text-coral">
          Tipo {tipo}: {TIPO_NOMBRES[tipo]}
        </span>
      </div>

      {/* Severity */}
      <div className="mt-5 bg-white rounded-xl p-5 border border-[#EFECE7] shadow-sm text-left">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-xs font-medium text-[#5C5852] uppercase tracking-wider">
            Severidad
          </span>
          <span className="font-sans text-sm font-bold" style={{ color: sevColor }}>
            {sevLabel} ({severidad}/10)
          </span>
        </div>
        <div className="h-3 bg-[#EFECE7] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: sevColor }}
            initial={{ width: 0 }}
            animate={{ width: `${(severidad / 10) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>

      {/* Profile bars */}
      <div className="mt-4 bg-white rounded-xl p-5 border border-[#EFECE7] shadow-sm space-y-4 text-left">
        <ProfileBar label="Potencial de mejora" value={bars.potencial} color="#5B8A60" />
        <ProfileBar label="Urgencia" value={bars.urgencia} color="#E07856" />
      </div>

      {/* Message */}
      <div className="mt-4 bg-sage-soft rounded-xl p-4">
        <p className="font-sans text-sm text-charcoal">
          👍 <strong>Tu caso tiene alto potencial de mejora.</strong> Con el protocolo correcto, mujeres con tu perfil se deshinchan en los primeros 3-5 días.
        </p>
      </div>

      <div className="mt-6">
        <Button variant="primary" size="lg" onClick={onNext}>
          VER MI PLAN →
        </Button>
      </div>
    </div>
  );
}

function ProfileBar({ label, value, color }: { label: string; value: number; color: string }) {
  const levelLabel = value >= 80 ? 'Alto' : value >= 50 ? 'Medio' : 'Bajo';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-sans text-sm text-charcoal font-medium">{label}</span>
        <span className="font-sans text-xs font-semibold" style={{ color }}>{levelLabel}</span>
      </div>
      <div className="h-2 bg-[#EFECE7] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}

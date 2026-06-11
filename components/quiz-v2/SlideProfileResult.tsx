'use client';

/**
 * SlideProfileResult — pantalla de "perfil generado" al estilo MusesAcademy.
 *
 * Muestra:
 *  - Barra de severidad (confidence level equivalente) de rojo a verde
 *  - Prueba social / mensaje de resultado
 *  - 4 barras: Motivación, Potencial, Foco, Conocimiento
 *  - Botón continuar
 */

import { motion } from 'framer-motion';
import { useQuizStoreV2 } from '@/lib/quiz-v2/store';
import { calcularSeveridadV2, calcularPerfilBars, calcularTipoV2 } from '@/lib/quiz-v2/helpers';
import { type QuizAnswersV2 } from '@/lib/quiz-v2/types';
import { QUIZ_RESULT_TYPE_NAMES } from '@/lib/quiz-v2/config';
import Button from '@/components/ui/Button';

interface Props {
  onNext: () => void;
}

const SEVERITY_LABELS = [
  { max: 3, label: 'Leve', color: '#5B8A60' },
  { max: 5, label: 'Moderada', color: '#D9A441' },
  { max: 7, label: 'Alta', color: '#E07856' },
  { max: 10, label: 'Severa', color: '#C25450' },
];

function getSeverityInfo(score: number) {
  for (const s of SEVERITY_LABELS) {
    if (score <= s.max) return s;
  }
  return SEVERITY_LABELS[SEVERITY_LABELS.length - 1];
}

export function SlideProfileResult({ onNext }: Props) {
  const answers = useQuizStoreV2((s) => s.answers);
  const nombre = typeof answers.nombre === 'string' ? answers.nombre : undefined;

  const severidad = calcularSeveridadV2(answers);
  const tipo = calcularTipoV2(answers);
  const bars = calcularPerfilBars(answers);
  const sevInfo = getSeverityInfo(severidad);
  const sevPercent = (severidad / 10) * 100;

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <h2 className="font-serif text-2xl md:text-3xl text-charcoal text-center font-semibold leading-tight">
        {nombre ? `${nombre}, tu Perfil Digestivo está listo` : 'Tu Perfil Digestivo está listo'}
      </h2>

      {/* Tipo de hinchazón */}
      <div className="mt-4 text-center">
        <span className="inline-block bg-coral-soft px-4 py-1.5 rounded-full font-sans text-sm font-semibold text-coral">
          Tipo {tipo}: {QUIZ_RESULT_TYPE_NAMES[tipo]}
        </span>
      </div>

      {/* Severity bar */}
      <div className="mt-6 bg-white rounded-xl p-5 border border-[#EFECE7] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-sans text-xs font-medium text-[#5C5852] uppercase tracking-wider">
            Nivel de severidad
          </span>
          <span
            className="font-sans text-sm font-bold"
            style={{ color: sevInfo.color }}
          >
            {sevInfo.label}
          </span>
        </div>

        {/* Gradient bar */}
        <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-[#5B8A60] via-[#D9A441] to-[#C25450]">
          <motion.div
            className="absolute top-0 left-0 h-full bg-white/80"
            initial={{ width: '100%' }}
            animate={{ width: `${100 - sevPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            style={{ right: 0, left: 'auto' }}
          />
          {/* Pointer */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-md"
            style={{ borderColor: sevInfo.color }}
            initial={{ left: '0%' }}
            animate={{ left: `${sevPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </div>

        <div className="flex justify-between mt-1 text-[10px] text-[#9B9890] font-sans">
          <span>Leve</span>
          <span>Moderada</span>
          <span>Alta</span>
          <span>Severa</span>
        </div>
      </div>

      {/* Social proof message */}
      <div className="mt-4 bg-sage-soft rounded-xl p-4 text-center">
        <p className="font-sans text-sm text-charcoal">
          👍 <strong>Puntaje bueno para lograr resultados rápidos.</strong>
        </p>
        <p className="mt-1 font-sans text-xs text-[#5C5852]">
          Mujeres con tu perfil reportan hasta 3 cm menos de panza en 7 días con el protocolo correcto.
        </p>
      </div>

      {/* Profile bars */}
      <div className="mt-5 bg-white rounded-xl p-5 border border-[#EFECE7] shadow-sm space-y-4">
        <ProfileBar label="Motivación" value={bars.motivacion} color="#5B8A60" />
        <ProfileBar label="Potencial de mejora" value={bars.potencial} color="#7A9B7E" />
        <ProfileBar label="Foco" value={bars.foco} color={bars.foco >= 60 ? '#5B8A60' : '#D9A441'} />
        <ProfileBar label="Conocimiento" value={bars.conocimiento} color={bars.conocimiento >= 50 ? '#7A9B7E' : '#E07856'} />
      </div>

      {/* Espejo de dolor — refleja sus respuestas */}
      <div className="mt-5 bg-cream-warm rounded-xl p-4 border border-[#EFECE7]">
        <p className="font-sans text-sm text-charcoal leading-relaxed">
          {buildPainMirror(answers)}
        </p>
        <p className="mt-2 font-sans text-xs text-sage font-medium">
          El Protocolo Chau Hinchazón está diseñado exactamente para este perfil.
        </p>
      </div>

      {/* Continue */}
      <div className="mt-8 text-center">
        <Button variant="primary" size="lg" onClick={onNext}>
          VER MI PLAN PERSONALIZADO →
        </Button>
      </div>
    </div>
  );
}

function buildPainMirror(answers: QuizAnswersV2): string {
  const parts: string[] = [];

  // Impacto emocional
  const emocion = answers.impacto_emocional;
  const EMOCION_MAP: Record<string, string> = {
    insegura: 'te sentís insegura con tu cuerpo',
    frustrada: 'estás frustrada porque nada funciona',
    avergonzada: 'te da vergüenza en lo social',
    cansada: 'te sentís cansada y pesada todo el día',
    todas: 'te sentís insegura, frustrada y cansada',
  };
  if (emocion && typeof emocion === 'string' && EMOCION_MAP[emocion]) {
    parts.push(`Nos dijiste que ${EMOCION_MAP[emocion]}`);
  }

  // Qué probó
  const probo = answers.ya_probo;
  if (Array.isArray(probo) && probo.length > 0 && !probo.includes('nada')) {
    parts.push('que ya probaste soluciones sin resultado');
  }

  // Tiempo con problema
  const tiempo = answers.tiempo_con_problema;
  const TIEMPO_MAP: Record<string, string> = {
    menos_6m: 'hace menos de 6 meses',
    '6m_2a': 'hace más de 6 meses',
    '2a_5a': 'hace más de 2 años',
    mas_5a: 'hace más de 5 años',
  };
  if (tiempo && typeof tiempo === 'string' && TIEMPO_MAP[tiempo]) {
    parts.push(`y que convivís con esto ${TIEMPO_MAP[tiempo]}`);
  }

  if (parts.length === 0) {
    return 'Tu perfil muestra que necesitás un protocolo personalizado que ataque la causa real de tu inflamación.';
  }

  return `${parts.join(', ')}. Eso no es normal — y tiene solución.`;
}

function ProfileBar({ label, value, color }: { label: string; value: number; color: string }) {
  const levelLabel = value >= 80 ? 'Alto' : value >= 50 ? 'Medio' : 'Bajo';

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-sans text-sm text-charcoal font-medium">{label}</span>
        <span className="font-sans text-xs font-semibold" style={{ color }}>
          {levelLabel}
        </span>
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

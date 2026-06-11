'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuizStore } from '@/lib/quiz-v2/store';
import { calcularDiagnostico, getNombre, getBarDescriptions, getDiagnosisUrgency } from '@/lib/quiz-v2/helpers';

interface Props {
  onNext: () => void;
}

export function SlideDiagnosisResult({ onNext }: Props) {
  const answers   = useQuizStore((s) => s.answers);
  const nombre    = getNombre(answers);
  const diagnostico = calcularDiagnostico(answers);
  const barDescriptions = getBarDescriptions(answers, diagnostico);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  const bars = [
    {
      label: 'Nivel de Inflamación',
      value: diagnostico.nivelInflamacion,
      statusLabel: diagnostico.severityLabel,
      color: '#E53935',
      bgColor: '#FDECEA',
      description: barDescriptions.inflamacion,
    },
    {
      label: 'Riesgo de Acumulación',
      value: diagnostico.riesgoAcumulacion,
      statusLabel: diagnostico.riesgoAcumulacion >= 85 ? 'Crítico' : diagnostico.riesgoAcumulacion >= 70 ? 'Alto' : 'Moderado',
      color: '#E53935',
      bgColor: '#FDECEA',
      description: barDescriptions.riesgo,
    },
    {
      label: 'Eficiencia Metabólica',
      value: diagnostico.eficienciaMetabolica,
      statusLabel: 'Bajo',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      isLow: true,
      description: barDescriptions.eficiencia,
    },
  ];

  return (
    <motion.div
      className="min-h-screen flex flex-col items-start justify-start px-5 py-10"
      style={{ backgroundColor: 'var(--warm)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col gap-6">

        {/* Headline */}
        <div className="text-center">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3"
            style={{ backgroundColor: '#FDECEA', color: '#E53935', fontFamily: 'var(--font-sans)' }}
          >
            ⚠️ Diagnóstico Finalizado: Análisis de Riesgo
          </div>
          <motion.h2
            className="text-2xl md:text-3xl leading-tight"
            style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {nombre ? `${nombre}, tus resultados indican un ` : 'Tus resultados indican un '}
            <span style={{ color: '#E53935' }}>Bloqueo Digestivo {diagnostico.severityLabel}</span>.
          </motion.h2>
          <motion.p
            className="text-sm mt-2 leading-relaxed"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Tranquila, esto explica por qué las dietas anteriores no te funcionaron. No es tu culpa, es pura biología.
          </motion.p>
        </div>

        {/* Barras de diagnóstico */}
        <div className="flex flex-col gap-4">
          {bars.map((bar, i) => (
            <motion.div
              key={bar.label}
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: '#fff', borderColor: 'var(--warm-border)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
                  {bar.label}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-2xl font-bold tabular-nums animate-count-up"
                    style={{ color: bar.color, fontFamily: 'var(--font-sans)' }}
                  >
                    {bar.value}%
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: bar.bgColor, color: bar.color, fontFamily: 'var(--font-sans)' }}
                  >
                    {bar.statusLabel}
                  </span>
                </div>
              </div>
              {/* Track */}
              <div className="diagnosis-bar--track">
                <div
                  className="diagnosis-bar"
                  style={{
                    width: animate ? `${bar.value}%` : '0%',
                    backgroundColor: bar.color,
                    transition: `width ${1.2 + i * 0.3}s cubic-bezier(0.4,0,0.2,1) ${0.4 + i * 0.15}s`,
                  }}
                />
              </div>
              {bar.isLow && (
                <p className="mt-1.5 text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
                  ↑ Proyección con el protocolo: 68% en 30 días
                </p>
              )}
              {/* Descripción de la barra */}
              <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>
                {bar.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Burbuja de urgencia (estado de emergencia + reversible) — única burbuja */}
        <motion.div
          className="rounded-2xl p-4 border"
          style={{ backgroundColor: '#FDECEA', borderColor: 'rgba(229,57,53,0.25)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-sans)' }}>
            {getDiagnosisUrgency()}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <button type="button" onClick={onNext} className="btn-primary animate-bounce-cta">
            👇 VER MI PROTOCOLO DE DESBLOQUEO AHORA 👇
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}

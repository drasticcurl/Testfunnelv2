'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  type AssessmentResult,
  type StoredAssessment,
  getStoredAssessments,
  getInterpretation,
} from '@/lib/pwa/microbiota-symptoms';
import ScoreGauge from '@/components/pwa/calculadora/ScoreGauge';
import CategoryBreakdown from '@/components/pwa/calculadora/CategoryBreakdown';
import { Button } from '@/components/pwa/ui/Button';
import { LoadingState } from '@/components/pwa/ui/LoadingState';

export default function ResultadoPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [previousAssessment, setPreviousAssessment] = useState<StoredAssessment | null>(null);

  useEffect(() => {
    // Leer resultado actual de sessionStorage
    const raw = sessionStorage.getItem('pwa_microbiota_current_result');
    if (!raw) {
      router.replace('/pwa/calculadora');
      return;
    }

    const parsed = JSON.parse(raw) as AssessmentResult;
    setResult(parsed);

    // Buscar assessment anterior para comparación
    const allAssessments = getStoredAssessments();
    // El último es el actual (recién guardado), el penúltimo es el anterior
    if (allAssessments.length >= 2) {
      setPreviousAssessment(allAssessments[allAssessments.length - 2]);
    }
  }, [router]);

  if (!result) {
    // Loading_State styled with Design_System tokens, announced to assistive tech.
    return (
      <div className="py-20">
        <LoadingState variant="spinner" message="Cargando tu resultado…" />
      </div>
    );
  }

  const { score, interpretation, totalPoints, maxPoints, categoryScores } = result;
  const scoreDiff = previousAssessment ? score - previousAssessment.score : null;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <motion.div
        className="text-center space-y-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-heading text-2xl text-charcoal font-semibold">Tu resultado</h1>
        <p className="font-body text-xs text-charcoal/50">
          Evaluación de microbiota · {new Date().toLocaleDateString('es-AR')}
        </p>
      </motion.div>

      {/* Gauge */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <ScoreGauge score={score} size={260} />
      </motion.div>

      {/* Interpretation card */}
      <motion.div
        className="bg-warm border border-warm-border rounded-xl p-5 shadow-sm space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{interpretation.emoji}</span>
          <div>
            <h2 className={`font-heading text-lg font-semibold ${interpretation.color}`}>
              {interpretation.label}
            </h2>
            <p className="font-body text-xs text-charcoal/50">
              {totalPoints} / {maxPoints} puntos de síntomas
            </p>
          </div>
        </div>
        <p className="font-body text-sm text-charcoal/70 leading-relaxed">{interpretation.description}</p>
      </motion.div>

      {/* Comparison with previous */}
      {previousAssessment && scoreDiff !== null && (
        <motion.div
          className="bg-terracotta-soft rounded-xl p-4 space-y-2"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          <h3 className="font-heading text-base text-charcoal font-semibold flex items-center gap-2">
            📈 Comparación con tu evaluación anterior
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Previous score */}
            <div className="bg-warm rounded-lg p-3 text-center">
              <p className="font-body text-xs text-charcoal/50 mb-1">Anterior</p>
              <p className="font-body text-xl font-bold text-charcoal">{previousAssessment.score.toFixed(1)}</p>
              <p className="font-body text-[10px] text-charcoal/40">
                {new Date(previousAssessment.takenAt).toLocaleDateString('es-AR')}
              </p>
            </div>
            {/* Current score */}
            <div className="bg-warm rounded-lg p-3 text-center">
              <p className="font-body text-xs text-charcoal/50 mb-1">Actual</p>
              <p className="font-body text-xl font-bold text-charcoal">{score.toFixed(1)}</p>
              <p className="font-body text-[10px] text-charcoal/40">Hoy</p>
            </div>
          </div>
          {/* Difference */}
          <div className="text-center pt-1">
            <span
              className={`inline-flex items-center gap-1 font-body text-sm font-semibold px-3 py-1 rounded-full ${
                scoreDiff > 0
                  ? 'bg-terracotta/10 text-terracotta-dark'
                  : scoreDiff < 0
                  ? 'bg-error/10 text-error'
                  : 'bg-warm-border text-charcoal/50'
              }`}
            >
              {scoreDiff > 0 ? '↑' : scoreDiff < 0 ? '↓' : '='}
              {scoreDiff > 0 ? '+' : ''}
              {scoreDiff.toFixed(1)} puntos
              {scoreDiff > 0 && ' de mejora'}
              {scoreDiff < 0 && ' de cambio'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Category breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: previousAssessment ? 1.0 : 0.8 }}
      >
        <CategoryBreakdown categoryScores={categoryScores} />
      </motion.div>

      {/* Actions */}
      <motion.div
        className="space-y-3 pt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.2 }}
      >
        <Button variant="primary" onClick={() => router.push('/pwa/dashboard')} className="w-full">
          Volver al inicio
        </Button>
        <Button variant="outline" onClick={() => router.push('/pwa/plan')} className="w-full">
          Ver mi plan de acción
        </Button>
      </motion.div>

      {/* Tip */}
      <motion.div
        className="bg-warm-border rounded-lg p-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.4 }}
      >
        <p className="font-body text-xs text-charcoal/60 leading-relaxed">
          💡 <strong>Tip:</strong> Repetí esta evaluación cada 7 días para ver tu progreso.
          Los cambios se reflejan mejor con consistencia en el protocolo.
        </p>
      </motion.div>
    </div>
  );
}

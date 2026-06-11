'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SYMPTOMS,
  CATEGORIES,
  SCALE_LABELS,
  canTakeNewAssessment,
  calculateFullResult,
  saveAssessment,
} from '@/lib/pwa/microbiota-symptoms';
import SymptomSlider from '@/components/pwa/calculadora/SymptomSlider';

const SYMPTOMS_PER_PAGE = 5;

export default function CalculadoraPage() {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    SYMPTOMS.forEach((s) => {
      initial[s.id] = 0;
    });
    return initial;
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check cooldown
  const { allowed, daysRemaining } = canTakeNewAssessment();

  // Pagination
  const totalPages = Math.ceil(SYMPTOMS.length / SYMPTOMS_PER_PAGE);
  const currentSymptoms = SYMPTOMS.slice(
    currentPage * SYMPTOMS_PER_PAGE,
    (currentPage + 1) * SYMPTOMS_PER_PAGE
  );

  // Current category for the page header
  const currentCategory = useMemo(() => {
    const firstSymptom = currentSymptoms[0];
    if (!firstSymptom) return null;
    return CATEGORIES.find((c) => c.id === firstSymptom.category);
  }, [currentPage]);

  // Progress
  const progress = ((currentPage + 1) / totalPages) * 100;
  const answeredCount = Object.values(responses).filter((v) => v > 0).length;

  function handleChange(symptomId: string, value: number) {
    setResponses((prev) => ({ ...prev, [symptomId]: value }));
  }

  function handleNext() {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePrev() {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleSubmit() {
    setIsSubmitting(true);

    // Calcular resultado y guardar
    const result = calculateFullResult(responses);
    saveAssessment(result);

    // Guardar resultado actual en sessionStorage para la página de resultado
    sessionStorage.setItem('pwa_microbiota_current_result', JSON.stringify(result));

    // Navegar a resultado
    router.push('/pwa/calculadora/resultado');
  }

  const isLastPage = currentPage === totalPages - 1;

  // Si no puede tomar un nuevo assessment
  if (!allowed) {
    return (
      <div className="space-y-6 py-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-sage-soft rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="font-serif text-2xl text-charcoal font-semibold">
            Todavía no podés retomar
          </h1>
          <p className="text-charcoal/60 text-sm leading-relaxed">
            Para que los resultados sean significativos, esperá al menos 7 días entre evaluaciones.
          </p>
          <div className="bg-sage-soft rounded-lg p-4">
            <p className="text-sage-dark font-medium text-sm">
              Podés volver a evaluar en{' '}
              <span className="font-bold">{daysRemaining} día{daysRemaining !== 1 ? 's' : ''}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/pwa/dashboard')}
            className="mt-4 text-sage font-medium text-sm underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="font-serif text-2xl text-charcoal font-semibold">
          Calculadora de Microbiota
        </h1>
        <p className="text-xs text-charcoal/50">
          Evaluá 20 síntomas · Escala 0–4
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-charcoal/50">
          <span>
            Página {currentPage + 1} de {totalPages}
          </span>
          <span>{answeredCount}/20 respondidas</span>
        </div>
        <div className="h-1.5 bg-sage-soft rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sage to-coral"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Category indicator */}
      {currentCategory && (
        <motion.div
          key={currentCategory.id}
          className="flex items-center gap-2 bg-sage-soft/50 rounded-lg px-3 py-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-lg">{currentCategory.emoji}</span>
          <span className="text-sm font-medium text-sage-dark">{currentCategory.label}</span>
        </motion.div>
      )}

      {/* Scale legend (first page only) */}
      {currentPage === 0 && (
        <div className="bg-cream-warm rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-charcoal/70 mb-1.5">Escala de frecuencia:</p>
          <div className="grid grid-cols-5 gap-1 text-center">
            {Object.entries(SCALE_LABELS).map(([val, label]) => (
              <div key={val} className="space-y-0.5">
                <div className="text-xs font-bold text-sage">{val}</div>
                <div className="text-[9px] text-charcoal/50 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          className="space-y-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentSymptoms.map((symptom) => (
            <SymptomSlider
              key={symptom.id}
              number={symptom.number}
              label={symptom.label}
              value={responses[symptom.id] ?? 0}
              onChange={(val) => handleChange(symptom.id, val)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3 pt-2">
        {currentPage > 0 && (
          <button
            onClick={handlePrev}
            className="flex-1 py-3 px-4 rounded-full border-2 border-sage text-sage font-semibold text-sm transition-all hover:bg-sage-soft active:scale-95"
          >
            ← Anterior
          </button>
        )}

        {!isLastPage ? (
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 rounded-full bg-sage text-white font-semibold text-sm transition-all hover:bg-sage-dark active:scale-95 shadow-md"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-full bg-coral text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Calculando...' : 'Ver mi resultado 🧬'}
          </button>
        )}
      </div>

      {/* Info disclaimer */}
      <p className="text-[10px] text-charcoal/40 text-center leading-relaxed pt-1">
        Esta calculadora no diagnostica enfermedades. Es una herramienta de autoconocimiento basada en el GSRS.
      </p>
    </div>
  );
}

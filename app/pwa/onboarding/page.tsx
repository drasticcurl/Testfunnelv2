'use client';

/**
 * /pwa/onboarding — flujo de bienvenida para usuarios nuevos.
 *
 * Tres pasos:
 *  1) Bienvenida personalizada (saludo con su nombre).
 *  2) Restricciones alimentarias (filtra recetas y plan).
 *  3) Tour de la app (qué hay en cada sección).
 *
 * Por qué NO mostramos tipo/severidad acá:
 *  - Esos datos vienen del quiz pre-compra y la PWA todavía no los tiene
 *    server-side (vendrán cuando hagamos la tabla `profiles`).
 *  - Hardcodear "Tipo 3 / 7 de 10" para todos es engañoso y rompe la
 *    confianza si el usuario no se siente identificado.
 *  - El recap del diagnóstico ya lo vio en /resultados antes de comprar.
 *
 * Al terminar:
 *  - Guarda preferencias dietéticas en localStorage.
 *  - Marca el flag de onboarding completo.
 *  - Redirige al dashboard.
 *
 * Si el usuario volviera a /pwa/onboarding después de completarlo, lo
 * dejamos pasar (puede querer revisar/cambiar sus preferencias). El flag
 * solo se usa en el login para decidir adónde redirigirlo la primera vez.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { usePwaUser } from '@/lib/pwa/use-pwa-user';
import {
  DietaryPreferences,
  saveDietaryPreferences,
} from '@/lib/pwa/dietary-preferences';
import { markOnboardingCompleted } from '@/lib/pwa/onboarding-state';

const TOTAL_STEPS = 3;

const TOUR_CARDS = [
  { icon: '📋', title: 'Plan día a día', desc: 'Tu protocolo paso a paso' },
  { icon: '📊', title: 'Diario', desc: 'Registrá cómo te sentís' },
  { icon: '🍽️', title: 'Recetas', desc: 'Recetas antiinflamatorias' },
  { icon: '🧮', title: 'Calculadora', desc: 'Tu score de microbiota' },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { nombre } = usePwaUser();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreferences>({
    sin_gluten: false,
    sin_lactosa: false,
    vegetariano: false,
  });

  function nextStep() {
    setDirection(1);
    if (step === 1) {
      // Salimos del paso de preferencias dietéticas: guardarlas.
      saveDietaryPreferences(dietaryPrefs);
    }
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      // Onboarding completo: marcar flag y mandar al dashboard.
      markOnboardingCompleted();
      router.push('/pwa/dashboard');
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      {/* Progress dots — uno por paso */}
      <div className="flex items-center gap-2 mb-8" aria-label={`Paso ${step + 1} de ${TOTAL_STEPS}`}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === step
                ? 'bg-sage w-6'
                : i < step
                ? 'bg-sage/60 w-2.5'
                : 'bg-sand/60 w-2.5'
            }`}
          />
        ))}
      </div>

      {/* Animated steps */}
      <div className="w-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {step === 0 && <StepBienvenida nombre={nombre} onNext={nextStep} />}
            {step === 1 && (
              <StepDietaryPreferences
                prefs={dietaryPrefs}
                setPrefs={setDietaryPrefs}
                onNext={nextStep}
              />
            )}
            {step === 2 && <StepTour onNext={nextStep} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── STEP 1: Bienvenida ─────────────────────────────────────────────────────

function StepBienvenida({ nombre, onNext }: { nombre: string; onNext: () => void }) {
  return (
    <div className="text-center space-y-6">
      <div>
        <p className="text-charcoal/60 text-sm mb-1">Bienvenida al protocolo</p>
        <h1 className="font-serif text-3xl font-semibold text-charcoal leading-tight">
          ¡Hola, {nombre}! 👋
        </h1>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/20 text-left space-y-4">
        <p className="text-charcoal/80 text-sm leading-relaxed">
          Estás a un paso de empezar el Método del Agua de Arroz.
        </p>
        <p className="text-charcoal/70 text-sm leading-relaxed">
          Antes de arrancar, te vamos a hacer{' '}
          <strong className="text-charcoal">2 preguntas rápidas</strong> para personalizar tu plan
          y mostrarte cómo funciona la app.
        </p>

        <div className="rounded-xl p-4 mt-3" style={{ backgroundColor: 'var(--terracotta-soft)' }}>
          <p className="font-serif text-sm font-semibold text-charcoal mb-1">Tu protocolo incluye</p>
          <ul className="text-xs text-charcoal/70 space-y-1.5 mt-2">
            <li>✓ Ritual del Agua de Arroz (mañana, 5 min/día)</li>
            <li>✓ Plan antiinflamatorio de 30 días</li>
            <li>✓ Recetas adaptadas a tu perfil</li>
            <li>✓ Diario de síntomas con gráficos</li>
            <li>✓ Lista de compras semanal</li>
          </ul>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 px-6 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-light))' }}
      >
        Empecemos →
      </button>
    </div>
  );
}

// ─── STEP 2: Preferencias dietéticas ────────────────────────────────────────

const DIETARY_OPTIONS = [
  {
    key: 'sin_gluten' as const,
    icon: '🌾',
    label: 'Sin Gluten',
    desc: 'Excluir recetas con trigo, avena, centeno',
  },
  {
    key: 'sin_lactosa' as const,
    icon: '🥛',
    label: 'Sin Lactosa',
    desc: 'Excluir recetas con lácteos',
  },
  {
    key: 'vegetariano' as const,
    icon: '🥬',
    label: 'Vegetariano',
    desc: 'Solo recetas sin carne ni pescado',
  },
];

function StepDietaryPreferences({
  prefs,
  setPrefs,
  onNext,
}: {
  prefs: DietaryPreferences;
  setPrefs: (p: DietaryPreferences) => void;
  onNext: () => void;
}) {
  const togglePref = (key: keyof DietaryPreferences) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const activeCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-charcoal/60 text-sm mb-1">Paso 2 de 3</p>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">
          ¿Tenés alguna restricción alimentaria?
        </h1>
        <p className="text-sm text-charcoal/60 mt-2">
          Adaptamos tu plan y recetas automáticamente. Podés cambiarlo después.
        </p>
      </div>

      <div className="space-y-3">
        {DIETARY_OPTIONS.map((option) => (
          <button
            key={option.key}
            onClick={() => togglePref(option.key)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
              prefs[option.key]
                ? 'border-sage bg-sage-soft shadow-sm'
                : 'border-sand/40 bg-white hover:border-sage/40'
            }`}
          >
            <span className="text-3xl">{option.icon}</span>
            <div className="text-left flex-1">
              <p className="font-medium text-sm text-charcoal">{option.label}</p>
              <p className="text-xs text-charcoal/50 mt-0.5">{option.desc}</p>
            </div>
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                prefs[option.key] ? 'border-sage bg-sage' : 'border-sand'
              }`}
            >
              {prefs[option.key] && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3 7L6 10L11 4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-cream-warm/50 rounded-xl p-3 border border-sand/20">
        <p className="text-xs text-charcoal/60 leading-relaxed">
          💡 Si tenés una condición médica específica, consultá con tu médico antes de empezar. El plan
          tiene alternativas para cada restricción.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 px-6 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-light))' }}
      >
        {activeCount > 0 ? `Aplicar ${activeCount} y continuar →` : 'Sin restricciones, continuar →'}
      </button>
    </div>
  );
}

// ─── STEP 3: Tour ───────────────────────────────────────────────────────────

function StepTour({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-charcoal/60 text-sm mb-1">Paso 3 de 3</p>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">
          Tu app, por dentro
        </h1>
        <p className="text-sm text-charcoal/60 mt-2">
          Acá tenés todo lo que necesitás para tu protocolo
        </p>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {TOUR_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center text-center gap-2"
          >
            <span className="text-3xl">{card.icon}</span>
            <h3 className="font-semibold text-sm text-charcoal">{card.title}</h3>
            <p className="text-xs text-charcoal/60 leading-snug">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-sage-soft/40 rounded-xl p-4 text-center">
        <p className="text-sm text-charcoal/80 leading-relaxed">
          <strong className="text-charcoal">Tip:</strong> agregá la app a la pantalla de inicio
          de tu celular para abrirla con un toque, como una app nativa.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3.5 px-6 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        style={{ background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-light))' }}
      >
        ¡Empezar mi protocolo!
      </button>
    </div>
  );
}

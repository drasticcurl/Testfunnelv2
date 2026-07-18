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
import {
  markMedicalDisclaimerAccepted,
  markOnboardingCompleted,
} from '@/lib/pwa/onboarding-state';
import { Button } from '@/components/pwa/ui/Button';
import { Icon } from '@/components/pwa/ui/Icon';
import { usePwaInstall } from '@/lib/pwa/use-pwa-install';
import { computeStagger } from '@/lib/pwa/ui/motion';

/**
 * Un paso del onboarding. `blocking` indica si `nextStep` puede quedar
 * gated (p. ej. el disclaimer no deja avanzar hasta aceptar el checkbox).
 * El refactor de `nextStep` que consume este flag se hace en la tarea 3.2.
 */
interface OnboardingStep {
  id: 'welcome' | 'disclaimer' | 'dietary' | 'tour' | 'install';
  blocking: boolean;
}

/**
 * Config declarativa que reemplaza el `TOTAL_STEPS = 3` hardcodeado.
 * Orden: bienvenida → disclaimer médico → preferencias → tour → instalar.
 * El disclaimer (index 1) y el paso de instalación (index 4) se implementan
 * en las tareas 4 y 5; acá solo dejamos el andamiaje para el render por índice.
 */
const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  { id: 'welcome', blocking: false },
  { id: 'disclaimer', blocking: true },
  { id: 'dietary', blocking: false },
  { id: 'tour', blocking: false },
  { id: 'install', blocking: false },
] as const;

const TOTAL_STEPS = ONBOARDING_STEPS.length;

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

    // Efectos de salida atados al `id` del paso actual (no al índice numérico):
    // como la secuencia ahora tiene 5 pasos, hardcodear índices se rompe al
    // reordenar. Derivamos el efecto desde ONBOARDING_STEPS[step].id.
    const currentId = ONBOARDING_STEPS[step].id;
    if (currentId === 'disclaimer') {
      // Salimos del disclaimer médico: persistir el consentimiento.
      markMedicalDisclaimerAccepted();
    } else if (currentId === 'dietary') {
      // Salimos del paso de preferencias dietéticas: guardarlas.
      saveDietaryPreferences(dietaryPrefs);
    }

    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      // Onboarding completo (último paso = install): marcar flag y al dashboard.
      markOnboardingCompleted();
      router.push('/pwa/dashboard');
    }
  }

  // Texto/aria-label de progreso derivado dinámicamente del total de pasos.
  const stepLabel = `Paso ${step + 1} de ${TOTAL_STEPS}`;
  const currentStepId = ONBOARDING_STEPS[step].id;

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
      {/* Progress dots — uno por paso definido en ONBOARDING_STEPS */}
      <div className="flex items-center gap-2 mb-8" aria-label={stepLabel}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === step
                ? 'bg-terracotta w-6'
                : i < step
                ? 'bg-terracotta/60 w-2.5'
                : 'bg-warm-border w-2.5'
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
            {/*
              Render por índice basado en el `id` del paso actual. El paso
              `disclaimer` (bloqueante) y el paso `install` (no bloqueante)
              usan sus componentes reales StepMedicalDisclaimer / StepInstallApp.
            */}
            {currentStepId === 'welcome' && (
              <StepBienvenida nombre={nombre} onNext={nextStep} />
            )}
            {currentStepId === 'disclaimer' && (
              <StepMedicalDisclaimer stepLabel={stepLabel} onNext={nextStep} />
            )}
            {currentStepId === 'dietary' && (
              <StepDietaryPreferences
                prefs={dietaryPrefs}
                setPrefs={setDietaryPrefs}
                onNext={nextStep}
                stepLabel={stepLabel}
              />
            )}
            {currentStepId === 'tour' && (
              <StepTour onNext={nextStep} stepLabel={stepLabel} />
            )}
            {currentStepId === 'install' && (
              <StepInstallApp stepLabel={stepLabel} onNext={nextStep} />
            )}
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
        <p className="font-body text-charcoal/60 text-sm mb-1">Bienvenida al protocolo</p>
        <h1 className="font-heading text-3xl font-semibold text-charcoal leading-tight">
          ¡Hola, {nombre}! 👋
        </h1>
      </div>

      <div className="bg-warm rounded-2xl p-6 shadow-sm border border-warm-border text-left space-y-4">
        <p className="font-body text-charcoal/80 text-sm leading-relaxed">
          Estás a un paso de empezar el Método del Agua de Arroz.
        </p>
        <p className="font-body text-charcoal/70 text-sm leading-relaxed">
          Antes de arrancar, te vamos a hacer{' '}
          <strong className="text-charcoal">2 preguntas rápidas</strong> para personalizar tu plan
          y mostrarte cómo funciona la app.
        </p>

        <div className="rounded-xl p-4 mt-3 bg-terracotta-soft">
          <p className="font-heading text-sm font-semibold text-charcoal mb-1">Tu protocolo incluye</p>
          <ul className="font-body text-xs text-charcoal/70 space-y-1.5 mt-2">
            <li>✓ Ritual del Agua de Arroz (mañana, 5 min/día)</li>
            <li>✓ Plan antiinflamatorio de 30 días</li>
            <li>✓ Recetas adaptadas a tu perfil</li>
            <li>✓ Diario de síntomas con gráficos</li>
            <li>✓ Lista de compras semanal</li>
          </ul>
        </div>
      </div>

      <Button variant="primary" onClick={onNext} className="w-full">
        Empecemos →
      </Button>
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
  stepLabel,
}: {
  prefs: DietaryPreferences;
  setPrefs: (p: DietaryPreferences) => void;
  onNext: () => void;
  stepLabel: string;
}) {
  const togglePref = (key: keyof DietaryPreferences) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const activeCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="font-body text-charcoal/60 text-sm mb-1">{stepLabel}</p>
        <h1 className="font-heading text-2xl font-semibold text-charcoal">
          ¿Tenés alguna restricción alimentaria?
        </h1>
        <p className="font-body text-sm text-charcoal/60 mt-2">
          Adaptamos tu plan y recetas automáticamente. Podés cambiarlo después.
        </p>
      </div>

      <div className="space-y-3">
        {DIETARY_OPTIONS.map((option) => (
          <button
            key={option.key}
            onClick={() => togglePref(option.key)}
            className={`w-full min-h-[44px] flex items-center gap-4 p-4 rounded-xl border transition-all ${
              prefs[option.key]
                ? 'border-terracotta bg-terracotta-soft shadow-sm'
                : 'border-warm-border bg-warm hover:border-terracotta/40'
            }`}
          >
            <span className="text-3xl">{option.icon}</span>
            <div className="text-left flex-1">
              <p className="font-body font-medium text-sm text-charcoal">{option.label}</p>
              <p className="font-body text-xs text-charcoal/50 mt-0.5">{option.desc}</p>
            </div>
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                prefs[option.key] ? 'border-terracotta bg-terracotta' : 'border-warm-border'
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
                    stroke="var(--warm)"
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

      <div className="bg-warm-border/50 rounded-xl p-3 border border-warm-border">
        <p className="font-body text-xs text-charcoal/60 leading-relaxed">
          💡 Si tenés una condición médica específica, consultá con tu médico antes de empezar. El plan
          tiene alternativas para cada restricción.
        </p>
      </div>

      <Button variant="primary" onClick={onNext} className="w-full">
        {activeCount > 0 ? `Aplicar ${activeCount} y continuar →` : 'Sin restricciones, continuar →'}
      </Button>
    </div>
  );
}

// ─── STEP 3: Tour ───────────────────────────────────────────────────────────

function StepTour({ onNext, stepLabel }: { onNext: () => void; stepLabel: string }) {
  // Single consistent, capped inter-item entrance delay for the tour cards.
  const delays = computeStagger(TOUR_CARDS.length);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="font-body text-charcoal/60 text-sm mb-1">{stepLabel}</p>
        <h1 className="font-heading text-2xl font-semibold text-charcoal">
          Tu app, por dentro
        </h1>
        <p className="font-body text-sm text-charcoal/60 mt-2">
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
            transition={{ delay: delays[i] / 1000, duration: 0.3 }}
            className="bg-warm rounded-2xl p-4 shadow-sm border border-warm-border flex flex-col items-center text-center gap-2"
          >
            <span className="text-3xl">{card.icon}</span>
            <h3 className="font-body font-semibold text-sm text-charcoal">{card.title}</h3>
            <p className="font-body text-xs text-charcoal/60 leading-snug">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-terracotta-soft/40 rounded-xl p-4 text-center">
        <p className="font-body text-sm text-charcoal/80 leading-relaxed">
          <strong className="text-charcoal">Tip:</strong> agregá la app a la pantalla de inicio
          de tu celular para abrirla con un toque, como una app nativa.
        </p>
      </div>

      <Button variant="primary" onClick={onNext} className="w-full">
        ¡Empezar mi protocolo!
      </Button>
    </div>
  );
}


// ─── STEP 2: Disclaimer médico (bloqueante) ─────────────────────────────────
//
// Paso `disclaimer` (index 1). Bloquea el avance hasta que la usuaria marca
// el checkbox de aceptación: el botón "Continuar" queda `disabled` (y con
// `aria-disabled`) mientras `accepted === false`. Como el <Button> ya evita
// disparar `onClick` cuando está deshabilitado, `onNext` solo puede ejecutarse
// con `accepted === true`; desmarcar el checkbox vuelve a deshabilitarlo.
//
// Accesibilidad: el input está asociado a un <label> y expone `aria-checked`.
// El checkbox se renderiza siempre operable aunque la accesibilidad se cumpla
// solo parcialmente (nunca se impide el render). Usa los tokens de diseño
// existentes (terracotta, warm, charcoal, warm-border, terracotta-soft).

function StepMedicalDisclaimer({
  stepLabel,
  onNext,
}: {
  stepLabel: string;
  onNext: () => void;
}) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="font-body text-charcoal/60 text-sm mb-1">{stepLabel}</p>
        <h1 className="font-heading text-2xl font-semibold text-charcoal">
          Antes de empezar
        </h1>
      </div>

      <div className="bg-warm rounded-2xl p-6 shadow-sm border border-warm-border text-left space-y-3">
        <p className="font-body text-sm text-charcoal/80 leading-relaxed">
          Este plan es de carácter informativo y de bienestar general.{' '}
          <strong className="text-charcoal">
            Si tenés alguna enfermedad o condición médica, consultá a tu médico
            antes de comenzar el plan.
          </strong>{' '}
          No reemplaza el consejo, diagnóstico ni tratamiento profesional.
        </p>
      </div>

      {/* Checkbox de aceptación — label asociado + aria-checked */}
      <label className="flex items-start gap-3 cursor-pointer bg-terracotta-soft/40 rounded-xl p-4 border border-warm-border">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          aria-checked={accepted}
          className="mt-0.5 w-5 h-5 accent-terracotta"
        />
        <span className="font-body text-sm text-charcoal/80">
          Leí y acepto el aviso médico.
        </span>
      </label>

      <Button
        variant="primary"
        onClick={onNext}
        disabled={!accepted}
        aria-disabled={!accepted}
        className="w-full"
      >
        Continuar →
      </Button>
    </div>
  );
}


// ─── STEP 5: Instalar App (no bloqueante) ────────────────────────────────────
//
// Paso `install` (index 4). NO bloquea el avance: siempre expone un control
// visible y habilitado para continuar/saltar hacia el dashboard. Consume la
// lógica centralizada de `usePwaInstall()` y adapta la UI por plataforma:
//
//   - android (`canPrompt`): botón "Instalar ahora" → dispara el prompt nativo
//     vía `promptInstall()`; si resuelve 'accepted' avanza con `onNext()`.
//   - ios: botón que despliega instrucciones manuales (Compartir → Agregar a
//     pantalla de inicio → Agregar), reutilizando el patrón de InstallPrompt.
//   - standalone: indica que la app ya está instalada y ofrece continuar.
//   - unsupported: paso informativo con opción de continuar/saltar.
//
// Usa tokens de diseño existentes (terracotta, warm, charcoal, warm-border,
// terracotta-soft) y el Button/Icon de @/components/pwa/ui.
//
// Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6

function StepInstallApp({
  stepLabel,
  onNext,
}: {
  stepLabel: string;
  onNext: () => void;
}) {
  const { platform, canPrompt, isStandalone, promptInstall } = usePwaInstall();
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  async function handleInstall() {
    // En iOS no hay prompt nativo: mostramos las instrucciones manuales.
    if (platform === 'ios') {
      setShowIOSHelp(true);
      return;
    }
    const outcome = await promptInstall();
    // Instalada correctamente: avanzamos automáticamente al dashboard.
    if (outcome === 'accepted') onNext();
  }

  // Copy contextual del control de avance/salto (siempre visible y habilitado).
  const skipLabel =
    platform === 'standalone' || isStandalone
      ? 'Ya está instalada, continuar →'
      : 'Saltar por ahora';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="font-body text-charcoal/60 text-sm mb-1">{stepLabel}</p>
        <h1 className="font-heading text-2xl font-semibold text-charcoal">
          Instalá la app
        </h1>
        <p className="font-body text-sm text-charcoal/60 mt-2">
          Accedé más rápido desde tu pantalla de inicio y usala sin conexión.
        </p>
      </div>

      {/* Tarjeta informativa con ícono de descarga (tokens de diseño). */}
      <div className="bg-warm rounded-2xl p-6 shadow-sm border border-warm-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-terracotta-soft rounded-lg flex items-center justify-center flex-shrink-0 text-terracotta">
            <Icon name="download" size="md" decorative />
          </div>
          <div className="flex-1 min-w-0">
            {(platform === 'standalone' || isStandalone) && (
              <p className="font-body text-sm text-charcoal/80 leading-relaxed">
                ¡Genial! La app ya está instalada en tu dispositivo. Podés
                continuar hacia tu protocolo.
              </p>
            )}
            {platform === 'android' && (
              <p className="font-body text-sm text-charcoal/80 leading-relaxed">
                Instalá la app en tu dispositivo con un toque para abrirla como
                una app nativa.
              </p>
            )}
            {platform === 'ios' && (
              <p className="font-body text-sm text-charcoal/80 leading-relaxed">
                En iPhone/iPad podés agregarla a tu pantalla de inicio desde
                Safari en unos pocos pasos.
              </p>
            )}
            {platform === 'unsupported' && (
              <p className="font-body text-sm text-charcoal/80 leading-relaxed">
                Tu navegador no permite instalarla automáticamente. Podés
                continuar y agregarla más tarde desde el menú de tu navegador.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* iOS: instrucciones manuales (Compartir → Agregar a inicio → Agregar). */}
      {platform === 'ios' && showIOSHelp && (
        <div className="bg-warm rounded-2xl p-6 shadow-sm border border-warm-border">
          <ol className="space-y-4 font-body text-sm text-charcoal/80">
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-terracotta-soft rounded-full flex items-center justify-center flex-shrink-0 text-terracotta font-semibold text-xs">
                1
              </span>
              <span>
                Tocá el botón{' '}
                <strong className="text-charcoal">Compartir</strong>{' '}
                <span className="inline-flex align-middle text-terracotta">
                  <Icon name="share" size="sm" decorative />
                </span>{' '}
                en la barra de Safari
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-terracotta-soft rounded-full flex items-center justify-center flex-shrink-0 text-terracotta font-semibold text-xs">
                2
              </span>
              <span>
                Desplazá y tocá{' '}
                <strong className="text-charcoal">
                  &quot;Agregar a pantalla de inicio&quot;
                </strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 bg-terracotta-soft rounded-full flex items-center justify-center flex-shrink-0 text-terracotta font-semibold text-xs">
                3
              </span>
              <span>
                Confirmá tocando{' '}
                <strong className="text-charcoal">&quot;Agregar&quot;</strong>
              </span>
            </li>
          </ol>
        </div>
      )}

      {/* Acción de instalación específica por plataforma (Android nativo / iOS). */}
      {canPrompt && (
        <Button variant="primary" onClick={handleInstall} className="w-full">
          Instalar ahora
        </Button>
      )}
      {platform === 'ios' && !showIOSHelp && (
        <Button variant="primary" onClick={handleInstall} className="w-full">
          Ver instrucciones
        </Button>
      )}

      {/*
        Control de avance SIEMPRE visible y habilitado: el paso nunca bloquea.
        En standalone es la acción primaria; en el resto de casos es un salto
        secundario (variante outline).
      */}
      <Button
        variant={platform === 'standalone' || isStandalone ? 'primary' : 'outline'}
        onClick={onNext}
        className="w-full"
      >
        {skipLabel}
      </Button>
    </div>
  );
}

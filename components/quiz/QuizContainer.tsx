'use client';

/**
 * QuizContainer - logica principal del quiz.
 * - Lee currentStep del store y renderiza el slide correcto
 * - Maneja transiciones con AnimatePresence
 * - Dispara tracking: QuizQ3 (slide tiempo_con_problema) | Lead + QuizComplete (post-email)
 * - En cada llamada a /api/track o /api/submit-quiz adjunta fbc/fbp del browser
 *   asi CAPI puede dedupear con el Pixel client.
 * - Al terminar: redirect a /resultados con todos los params
 *
 * REDESIGN v2: ahora maneja name_capture (slide propio antes del email).
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/lib/quiz-store';
import { slides } from '@/lib/quiz-data';
import { buildResultsUrl } from '@/lib/tipos-hinchazon';
import { captureUTMs, getMetaCookies, getUTMs } from '@/lib/cookies';
import { SlideQuestion } from './SlideQuestion';
import { SlideInfoCard } from './SlideInfoCard';
import { SlideNameCapture } from './SlideNameCapture';
import { SlideEmailCapture } from './SlideEmailCapture';
import { SlideLoading } from './SlideLoading';
import { QuizProgress } from './QuizProgress';

export function QuizContainer() {
  const router = useRouter();
  const currentStep = useQuizStore((s) => s.currentStep);
  const answers = useQuizStore((s) => s.answers);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const next = useQuizStore((s) => s.next);

  const slide = slides[currentStep];
  const initialized = useRef(false);

  // Index del slide de nombre para saber cuándo mostrar header personalizado
  const nameSlideIndex = slides.findIndex((s) => s.type === 'name_capture');

  // Al montar: capturar UTMs y resetear el quiz si el usuario ya lo había
  // completado antes (el store persiste en localStorage). Sin esto, alguien
  // que vuelve a /quiz cae directo a /resultados por el currentStep viejo.
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      captureUTMs();

      // Si el currentStep está fuera de rango (quiz ya completado), reset.
      const step = useQuizStore.getState().currentStep;
      if (step > 0 && !slides[step]) {
        useQuizStore.getState().reset();
      }

      // Auto-start: marcar startedAt si no está marcado
      if (!useQuizStore.getState().startedAt) {
        useQuizStore.setState({ startedAt: Date.now() });
      }

      // Fire QuizStart pixel
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.fbq) w.fbq('trackCustom', 'QuizStart');
      }
    }
  }, []);

  // Tracking: QuizProgress on every slide change
  useEffect(() => {
    if (currentStep >= 0 && typeof window !== 'undefined' && initialized.current) {
      const meta = getMetaCookies();
      const utms = getUTMs();
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'QuizProgress',
          fbc: meta.fbc,
          fbp: meta.fbp,
          custom: {
            slide: currentStep + 1, // 1-indexed for admin funnel compatibility
            total_slides: slides.length,
            question_id: slide?.id || 'unknown',
            utms,
          },
        }),
      }).catch(() => {
        // Non-blocking — don't break quiz flow
      });
    }
  }, [currentStep, slide]);

  // Tracking: QuizQ3 al llegar a la pregunta tiempo_con_problema (slide 2)
  useEffect(() => {
    if (
      slide &&
      slide.type === 'question' &&
      slide.id === 'tiempo_con_problema' &&
      typeof window !== 'undefined' &&
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq('trackCustom', 'QuizQ3');
    }
  }, [slide]);

  // Si pasamos del ultimo slide, redirect (failsafe)
  useEffect(() => {
    if (!slide && currentStep > 0) {
      router.replace(buildResultsUrl(answers));
    }
  }, [slide, currentStep, answers, router]);

  if (!slide) return null;

  const handleNameSubmit = (nombre: string) => {
    setAnswer('nombre', nombre);
    next(); // -> SlideEmailCapture
  };

  const handleEmailSubmit = async (email: string) => {
    // Persistir en el store antes del POST
    setAnswer('email', email);

    // Leemos el nombre del store (capturado en SlideNameCapture)
    const nombre = useQuizStore.getState().answers.nombre;

    // POST al webhook (no-block: si falla, igual avanzamos)
    try {
      const meta = getMetaCookies();
      await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...useQuizStore.getState().answers,
          email,
          nombre,
          fbc: meta.fbc,
          fbp: meta.fbp,
        }),
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[quiz] submit-quiz failed:', err);
    }

    // Tracking: Lead + QuizComplete
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) {
        w.fbq('track', 'Lead');
        w.fbq('trackCustom', 'QuizComplete');
      }
    }

    next(); // -> SlideLoading
  };

  const handleLoadingComplete = () => {
    router.push(buildResultsUrl(answers));
  };

  const showProgress = slide.type !== 'loading';

  // Show quiz title header on the first slide only
  const isFirstSlide = currentStep === 0;
  const nombreEnStore =
    typeof answers.nombre === 'string' ? answers.nombre : undefined;

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {showProgress && <QuizProgress currentSlide={currentStep} />}

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={String(slide.id) + ':' + currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full max-w-2xl"
          >
            {isFirstSlide && (
              <div className="text-center mb-8">
                <h1 className="font-serif text-2xl md:text-3xl text-charcoal leading-tight font-semibold">
                  Test: descubrí cuál de los{' '}
                  <span className="italic text-coral">4 tipos de hinchazón</span>{' '}
                  estás sufriendo
                </h1>
                <p className="mt-3 font-sans text-sm md:text-base text-[#5C5852]">
                  Tarda 2 minutos · Resultado personalizado al final
                </p>
                <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs md:text-sm font-sans text-[#5C5852]">
                  <li>⏱️ 2 minutos</li>
                  <li>🔒 100% anónimo</li>
                  <li>✅ Plan personalizado gratis</li>
                </ul>
              </div>
            )}

            {/* Header personalizado post-nombre: aparece en slides después de dar el nombre */}
            {!isFirstSlide && nombreEnStore && slide.type !== 'name_capture' && slide.type !== 'loading' && currentStep > nameSlideIndex && (
              <p className="text-center mb-6 font-serif text-lg md:text-xl text-sage font-medium">
                {nombreEnStore}, ya casi tenemos tu plan
              </p>
            )}

            {slide.type === 'question' && (
              <SlideQuestion slide={slide} onNext={next} />
            )}

            {slide.type === 'info_card' && (
              <SlideInfoCard slide={slide} onContinue={next} />
            )}

            {slide.type === 'name_capture' && (
              <SlideNameCapture
                onSubmit={handleNameSubmit}
                defaultValue={nombreEnStore}
              />
            )}

            {slide.type === 'email_capture' && (
              <SlideEmailCapture
                nombre={nombreEnStore}
                onSubmit={handleEmailSubmit}
              />
            )}

            {slide.type === 'loading' && (
              <SlideLoading onComplete={handleLoadingComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

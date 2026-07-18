'use client';

/**
 * QuizContainerLatam — orquestador del Quiz LATAM "Método del Agua de Arroz".
 *
 * Fork simplificado de QuizContainerV2 para el funnel paralelo `/latam`:
 *  - Español NEUTRO ("tú"): usa los slides `*Latam`.
 *  - SIN test A/B/C de entrada: una sola landing.
 *  - SIN captura de email ni llamada a /api/submit-quiz (no existe email_capture).
 *  - Mantiene el tracking QuizStart/QuizProgress a /api/track con quiz_version: 'latam'.
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '@/lib/quiz-v2/store';
import { slidesV3Latam as slides, SLIDES_WITHOUT_PROGRESS_LATAM as SLIDES_WITHOUT_PROGRESS } from '@/lib/quiz-v2/data-latam';
import { captureUTMs, getMetaCookies, getUTMs } from '@/lib/cookies';
import type { SlideV3 } from '@/lib/quiz-v2/types';

import { QuizProgressV3 }           from './QuizProgressV3';
import { SlideLandingHookLatam }    from './SlideLandingHookLatam';
import { SlideNameCaptureLatam }    from './SlideNameCaptureLatam';
import { SlideNumberSlider }        from './SlideNumberSlider';
import { SlideBodyType }            from './SlideBodyType';
import { SlideQuestion }            from './SlideQuestion';
import { SlideViralNewsLatam }      from './SlideViralNewsLatam';
import { SlideExpertBridgeLatam }   from './SlideExpertBridgeLatam';
import { SlideDiagnosisResultLatam }from './SlideDiagnosisResultLatam';
import { SlideLoadingStepsLatam }   from './SlideLoadingStepsLatam';
import { SlideSalesPageLatam }      from './SlideSalesPageLatam';

export function QuizContainerLatam() {
  const currentStep  = useQuizStore((s) => s.currentStep);
  const answers      = useQuizStore((s) => s.answers);
  const setAnswer    = useQuizStore((s) => s.setAnswer);
  const next         = useQuizStore((s) => s.next);
  const initialized  = useRef(false);

  const slide = slides[currentStep] as SlideV3 | undefined;

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    captureUTMs();
    useQuizStore.getState().reset();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq('trackCustom', 'QuizStartLatam');
    }

    const meta = getMetaCookies();
    const utms = getUTMs();
    fetch('/api/track', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'QuizProgress', fbc: meta.fbc, fbp: meta.fbp,
        custom: { slide: 0, total_slides: slides.length, question_id: 'landing_hook', quiz_version: 'latam', utms },
      }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Track por slide ───────────────────────────────────────────────────────
  useEffect(() => {
    if (currentStep === 0 || !initialized.current || !slide) return;
    const meta = getMetaCookies();
    const utms = getUTMs();
    fetch('/api/track', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'QuizProgress', fbc: meta.fbc, fbp: meta.fbp,
        custom: { slide: currentStep, total_slides: slides.length, question_id: slide.id, quiz_version: 'latam', utms },
      }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, slide]);

  if (!slide) return null;

  const isFullscreen = ['landing_hook', 'expert_bridge', 'diagnosis_result', 'loading_steps', 'sales_page'].includes(slide.type);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ backgroundColor: 'var(--warm)', minHeight: '100vh' }}>
      {/* Progress bar (excluida en slides fullscreen) */}
      {!SLIDES_WITHOUT_PROGRESS.has(slide.type) && (
        <QuizProgressV3 currentStep={currentStep} />
      )}

      {/* Slides fullscreen sin wrapper extra */}
      {isFullscreen ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.id}-${currentStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {slide.type === 'landing_hook'    && <SlideLandingHookLatam onNext={next} />}
            {slide.type === 'expert_bridge'   && <SlideExpertBridgeLatam onNext={next} />}
            {slide.type === 'diagnosis_result'&& <SlideDiagnosisResultLatam onNext={next} />}
            {slide.type === 'loading_steps'   && <SlideLoadingStepsLatam onComplete={next} />}
            {slide.type === 'sales_page'      && <SlideSalesPageLatam />}
          </motion.div>
        </AnimatePresence>
      ) : (
        /* Slides normales: wrapper centrado con padding */
        <div className="flex items-center justify-center min-h-screen px-5 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${slide.id}-${currentStep}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="w-full"
            >
              {/* Name capture */}
              {slide.type === 'name_capture' && (
                <SlideNameCaptureLatam
                  onSubmit={(nombre) => { setAnswer('nombre', nombre); next(); }}
                  defaultValue={typeof answers.nombre === 'string' ? answers.nombre : ''}
                />
              )}

              {/* Age slider */}
              {slide.type === 'age_slider' && (
                <SlideNumberSlider
                  slide={slide}
                  onNext={(v) => { setAnswer('edad', v); next(); }}
                />
              )}

              {/* Number sliders: peso_actual, altura, peso_deseado */}
              {slide.type === 'number_slider' && (
                <SlideNumberSlider
                  slide={slide}
                  onNext={(v) => {
                    setAnswer(slide.id as keyof typeof answers, v);
                    next();
                  }}
                />
              )}

              {/* Body type */}
              {slide.type === 'body_type' && (
                <SlideBodyType
                  slide={slide}
                  onNext={(v) => { setAnswer('tipo_cuerpo', v); next(); }}
                />
              )}

              {/* Question (single y multi) */}
              {slide.type === 'question' && (
                <SlideQuestion
                  slide={slide}
                  currentValue={answers[slide.id as keyof typeof answers] as string | string[] | undefined}
                  onAnswer={(v) => setAnswer(slide.id as keyof typeof answers, v)}
                  onNext={next}
                />
              )}

              {/* Viral news */}
              {slide.type === 'viral_news' && (
                <SlideViralNewsLatam
                  onNext={(v) => { setAnswer('viral_news', v); next(); }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

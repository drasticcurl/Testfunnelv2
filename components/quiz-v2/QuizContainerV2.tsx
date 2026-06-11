'use client';

/**
 * QuizContainerV2 — orquestador del Quiz V3 "Método del Agua de Arroz"
 * 22 slides: landing_hook → sales_page embebida
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '@/lib/quiz-v2/store';
import { slidesV3, SLIDES_WITHOUT_PROGRESS } from '@/lib/quiz-v2/data';
import { captureUTMs, getMetaCookies, getUTMs } from '@/lib/cookies';
import { useCountry } from '@/lib/quiz-v2/CountryContext';
import type { SlideV3 } from '@/lib/quiz-v2/types';

import { QuizProgressV3 }      from './QuizProgressV3';
import { SlideLandingHook }    from './SlideLandingHook';
import { SlideNameCaptureV3 }  from './SlideNameCapture';
import { SlideEmailCaptureV3 } from './SlideEmailCapture';
import { SlideNumberSlider }   from './SlideNumberSlider';
import { SlideBodyType }       from './SlideBodyType';
import { SlideQuestion }       from './SlideQuestion';
import { SlideViralNews }      from './SlideViralNews';
import { SlideExpertBridge }   from './SlideExpertBridge';
import { SlideDiagnosisResult }from './SlideDiagnosisResult';
import { SlideLoadingSteps }   from './SlideLoadingSteps';
import { SlideSalesPageV3 }    from './SlideSalesPageV3';

export function QuizContainerV2() {
  const currentStep  = useQuizStore((s) => s.currentStep);
  const answers      = useQuizStore((s) => s.answers);
  const setAnswer    = useQuizStore((s) => s.setAnswer);
  const next         = useQuizStore((s) => s.next);
  const initialized  = useRef(false);
  // País detectado o forzado por la ruta SEO. Se manda en cada evento del
  // funnel (QuizProgress, ViewContent, Purchase) y al guardar el lead, así
  // /admin/funnel puede segmentar por país.
  const { country }  = useCountry();

  const slide = slidesV3[currentStep] as SlideV3 | undefined;

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    captureUTMs();
    useQuizStore.getState().reset();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && (window as any).fbq) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).fbq('trackCustom', 'QuizStartV3');
    }

    const meta = getMetaCookies();
    const utms = getUTMs();
    fetch('/api/track', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'QuizProgress', fbc: meta.fbc, fbp: meta.fbp,
        custom: { slide: 0, total_slides: slidesV3.length, question_id: 'landing_hook', quiz_version: 'v3', utms },
      }),
    }).catch(() => {});
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
        custom: { slide: currentStep, total_slides: slidesV3.length, question_id: slide.id, quiz_version: 'v3', country, utms },
      }),
    }).catch(() => {});
  }, [currentStep, slide, country]);

  if (!slide) return null;

  const isFullscreen = ['landing_hook', 'expert_bridge', 'diagnosis_result', 'email_capture', 'loading_steps', 'sales_page'].includes(slide.type);

  // ── Email capture: dispara submit-quiz fire-and-forget ──────────────────
  const handleEmailSubmit = (email: string) => {
    setAnswer('email', email);
    const meta = getMetaCookies();
    const utms = getUTMs();
    // Mandamos TODAS las answers actuales + email + país detectado/forzado.
    // El endpoint persiste en `clientes` (con country) y dispara CAPI Lead.
    const body = {
      ...useQuizStore.getState().answers,
      email,
      country,
      fbc: meta.fbc,
      fbp: meta.fbp,
      utms,
    };
    fetch('/api/submit-quiz', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
    next();
  };

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
            {slide.type === 'landing_hook'    && <SlideLandingHook    onNext={next} />}
            {slide.type === 'expert_bridge'   && <SlideExpertBridge   onNext={next} />}
            {slide.type === 'diagnosis_result'&& <SlideDiagnosisResult onNext={next} />}
            {slide.type === 'email_capture'   && (
              <div className="flex items-center justify-center min-h-screen px-5 py-12">
                <SlideEmailCaptureV3
                  onSubmit={handleEmailSubmit}
                  defaultValue={typeof answers.email === 'string' ? answers.email : ''}
                  nombre={typeof answers.nombre === 'string' ? answers.nombre : undefined}
                />
              </div>
            )}
            {slide.type === 'loading_steps'   && <SlideLoadingSteps   onComplete={next} />}
            {slide.type === 'sales_page'      && <SlideSalesPageV3 />}
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
                <SlideNameCaptureV3
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
                <SlideViralNews
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

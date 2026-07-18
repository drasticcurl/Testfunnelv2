'use client';

/**
 * QuizContainerV2 — orquestador del Quiz V3 "Método del Agua de Arroz"
 * 22 slides: landing_hook → sales_page embebida (sin captura de email)
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStore } from '@/lib/quiz-v2/store';
import { slidesV3, SLIDES_WITHOUT_PROGRESS } from '@/lib/quiz-v2/data';
import { captureUTMs, getMetaCookies, getUTMs } from '@/lib/cookies';
import {
  getFunnelVariant,
  funnelEventName,
  isFunnelExperimentEnabled,
  type FunnelVariant,
  type FunnelStep,
} from '@/lib/quiz-v2/funnelVariant';
import type { SlideV3 } from '@/lib/quiz-v2/types';

import { QuizProgressV3 }      from './QuizProgressV3';
import { SlideLandingHook }    from './SlideLandingHook';
import { SlideNameCaptureV3 }  from './SlideNameCapture';
import { SlideNumberSlider }   from './SlideNumberSlider';
import { SlideBodyType }       from './SlideBodyType';
import { SlideQuestion }       from './SlideQuestion';
import { SlideViralNews }      from './SlideViralNews';
import { SlideExpertBridge }   from './SlideExpertBridge';
import { SlideDiagnosisResult }from './SlideDiagnosisResult';
import { SlideLoadingSteps }   from './SlideLoadingSteps';
import { SlideSalesPageV3 }    from './SlideSalesPageV3';
import { SlideSalesPageV3B }   from './SlideSalesPageV3B';
import { FunnelBTheme }        from './FunnelBTheme';
import { chooseRender }        from './chooseFunnelRender';

export function QuizContainerV2() {
  const currentStep  = useQuizStore((s) => s.currentStep);
  const answers      = useQuizStore((s) => s.answers);
  const setAnswer    = useQuizStore((s) => s.setAnswer);
  const next         = useQuizStore((s) => s.next);
  const goTo         = useQuizStore((s) => s.goTo);
  const initialized  = useRef(false);

  // ── Test A/B/C de entrada — DESACTIVADO ────────────────────────────────────
  // El test de entrada quedó desactivado por completo: la entrada usa SIEMPRE el
  // hook normal (variante B / SlideLandingHook), sin asignar/randomizar variantes
  // ni emitir eventos ab_entry_* para tráfico nuevo. La data histórica ab_entry_*
  // se preserva en el store (ver lib/quiz-v2/abEntry.ts y lib/admin/store.ts).

  // ── Test full-funnel A/B (solo Argentina) ──────────────────────────────────
  // Variante de funnel: A=control, B=rebrand. Se resuelve UNA vez en el cliente
  // (post-mount) y un único valor maneja branding (FunnelBTheme) + sales page.
  const [funnelVariant, setFunnelVariant] = useState<FunnelVariant>('A');
  const funnelVariantRef     = useRef<FunnelVariant>('A');
  const firedFunnelStart     = useRef(false);
  const firedFunnelComplete  = useRef(false);

  const slide = slidesV3[currentStep] as SlideV3 | undefined;
  const lastIndex = slidesV3.length - 1;

  // Dispara un evento del test full-funnel (af_<V>_<step>). Solo cuando el
  // experimento está ON (con el flag OFF NO se emite ningún af_*; LATAM no usa
  // este container). Fire-and-forget: nunca bloquea el avance del funnel.
  const fireFunnelEvent = (step: FunnelStep) => {
    if (!isFunnelExperimentEnabled()) return;
    const v = funnelVariantRef.current;
    const meta = getMetaCookies();
    const utms = getUTMs();
    fetch('/api/track', {
      method: 'POST', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: funnelEventName(v, step), fbc: meta.fbc, fbp: meta.fbp,
        custom: { quiz_version: 'ar', utms, funnel_variant: v },
      }),
    }).catch(() => {});
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    captureUTMs();
    useQuizStore.getState().reset();

    // Resolver la variante del test FULL-FUNNEL (A/B) UNA vez. Un único valor
    // maneja branding + sales page. Con el flag OFF o en LATAM devuelve 'A'.
    const fv = getFunnelVariant('ar');
    funnelVariantRef.current = fv;
    setFunnelVariant(fv);

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
        custom: { slide: 0, total_slides: slidesV3.length, question_id: 'landing_hook', quiz_version: 'ar', utms },
      }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Atajo de QA ─────────────────────────────────────────────────────────────
  // Con ?test=true saltamos directo a la sales page (último slide) para poder
  // probar el botón de pago sin recorrer todo el quiz. Corre una sola vez al
  // montar y después del reset() del init, así que pisa el currentStep a 0.
  const testShortcutDone = useRef(false);
  useEffect(() => {
    if (testShortcutDone.current) return;
    testShortcutDone.current = true;
    if (typeof window === 'undefined') return;
    const isTest = new URLSearchParams(window.location.search).get('test') === 'true';
    if (isTest) {
      goTo(slidesV3.length - 1);
    }
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
        custom: { slide: currentStep, total_slides: slidesV3.length, question_id: slide.id, quiz_version: 'ar', utms },
      }),
    }).catch(() => {});

    // Test full-funnel: "quiz_start" (llegó a la 1ª pregunta real) y
    // "quiz_complete" (llegó al slide de la sales page). Solo cuando el
    // experimento está ON (fireFunnelEvent ya hace ese guard).
    if (currentStep >= 1 && !firedFunnelStart.current) {
      firedFunnelStart.current = true;
      fireFunnelEvent('quiz_start');
    }
    if (currentStep >= lastIndex && !firedFunnelComplete.current) {
      firedFunnelComplete.current = true;
      fireFunnelEvent('quiz_complete');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, slide]);

  if (!slide) return null;

  const isFullscreen = ['landing_hook', 'expert_bridge', 'diagnosis_result', 'loading_steps', 'sales_page'].includes(slide.type);

  // Plan de render del test full-funnel: un único valor resuelto maneja tanto
  // el branding (FunnelBTheme) como la sales page (A vs B), garantizando
  // consistencia dentro de un mismo mount (ver chooseRender / Property P5).
  const renderPlan = chooseRender(funnelVariant);

  // ── Render ────────────────────────────────────────────────────────────────
  const body = (
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
            {slide.type === 'landing_hook' && <SlideLandingHook onNext={next} />}
            {slide.type === 'expert_bridge'   && <SlideExpertBridge   onNext={next} />}
            {slide.type === 'diagnosis_result'&& <SlideDiagnosisResult onNext={next} />}
            {slide.type === 'loading_steps'   && <SlideLoadingSteps   onComplete={next} />}
            {slide.type === 'sales_page'      && (
              renderPlan.sales === 'B' ? <SlideSalesPageV3B /> : <SlideSalesPageV3 />
            )}
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

  // Funnel B: envolver TODO el árbol en FunnelBTheme (rebrand scopeado). Funnel
  // A: pass-through sin wrapper, byte-idéntico a hoy.
  return renderPlan.theme === 'b' ? <FunnelBTheme>{body}</FunnelBTheme> : body;
}

'use client';

/**
 * QuizContainerV2 — orquestador principal del quiz funnel V2.
 *
 * Similar a QuizContainer (V1) pero:
 *  - Maneja slide types adicionales (age_selector, social_proof, etc.)
 *  - No redirige a /resultados: la sales page está embebida como último slide
 *  - Usa su propio store (quiz-v2/store)
 *  - Trackea con quiz_version: 'v2'
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStoreV2 } from '@/lib/quiz-v2/store';
import { slidesV2 } from '@/lib/quiz-v2/data';
import { captureUTMs, getMetaCookies, getUTMs } from '@/lib/cookies';

import { SlideAgeSelector } from './SlideAgeSelector';
import { SlideSocialProof } from './SlideSocialProof';
import { SlideProfileResult } from './SlideProfileResult';
import { SlideWeeklyPlan } from './SlideWeeklyPlan';
import { SlideLoadingWithQuestions } from './SlideLoadingWithQuestions';
import { SlideSalesPage } from './SlideSalesPage';
import { QuizProgressV2 } from './QuizProgressV2';

// Reuse V1 components for shared types
import { SlideInfoCard } from '@/components/quiz/SlideInfoCard';
import { SlideNameCapture } from '@/components/quiz/SlideNameCapture';


export function QuizContainerV2() {
  const currentStep = useQuizStoreV2((s) => s.currentStep);
  const answers = useQuizStoreV2((s) => s.answers);
  const setAnswer = useQuizStoreV2((s) => s.setAnswer);
  const next = useQuizStoreV2((s) => s.next);

  const slide = slidesV2[currentStep];
  const initialized = useRef(false);

  // Init: capture UTMs, always reset for fresh start, fire QuizStart
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      captureUTMs();

      // Always reset — direct traffic funnel, no reason to resume mid-quiz
      useQuizStoreV2.getState().reset();

      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.fbq) w.fbq('trackCustom', 'QuizStartV2');
      }

      // Always fire slide=0 on init to count session as a "start".
      // Needed because persisted state may resume at a later step.
      const meta = getMetaCookies();
      const utms = getUTMs();
      fetch('/api/track', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'QuizProgress',
          fbc: meta.fbc,
          fbp: meta.fbp,
          custom: {
            slide: 0,
            total_slides: slidesV2.length,
            question_id: slidesV2[0]?.id || 'edad',
            quiz_version: 'v2',
            utms,
          },
        }),
      }).catch(() => {});
    }
  }, []);

  // Track every slide change (0-indexed: slide = currentStep)
  useEffect(() => {
    if (currentStep >= 0 && typeof window !== 'undefined' && initialized.current) {
      const meta = getMetaCookies();
      const utms = getUTMs();
      fetch('/api/track', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'QuizProgress',
          fbc: meta.fbc,
          fbp: meta.fbp,
          custom: {
            slide: currentStep,
            total_slides: slidesV2.length,
            question_id: slide?.id || 'unknown',
            quiz_version: 'v2',
            utms,
          },
        }),
      }).catch(() => {});
    }
  }, [currentStep, slide]);

  // Skip "cuando_evento" if user chose "no" in "evento_importante"
  useEffect(() => {
    if (slide?.id === 'cuando_evento') {
      const eventoAnswer = useQuizStoreV2.getState().answers.evento_importante;
      if (eventoAnswer === 'no') {
        next();
      }
    }
  }, [currentStep, slide, next]);

  if (!slide) return null;


  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleNameSubmit = (nombre: string) => {
    setAnswer('nombre', nombre);
    next();
  };

  const handleLoadingComplete = () => {
    next();
  };

  // Determine which slides show progress bar
  const showProgress =
    slide.type !== 'sales_page' &&
    slide.type !== 'loading_with_questions';

  const nombreEnStore =
    typeof answers.nombre === 'string' ? answers.nombre : undefined;


  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {showProgress && <QuizProgressV2 currentSlide={currentStep} />}

      <div className={`flex-1 flex items-center justify-center ${slide.type === 'sales_page' ? '' : 'px-6 py-12'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={String(slide.id) + ':' + currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`w-full ${slide.type === 'sales_page' ? '' : 'max-w-2xl'}`}
          >
            {slide.type === 'age_selector' && (
              <SlideAgeSelector slide={slide} onNext={next} />
            )}

            {slide.type === 'social_proof' && (
              <SlideSocialProof slide={slide} onNext={next} />
            )}

            {slide.type === 'question' && (
              <SlideQuestionV2 slide={slide} onNext={next} />
            )}

            {slide.type === 'info_card' && (
              <SlideInfoCard slide={slide as any} onContinue={next} />
            )}

            {slide.type === 'name_capture' && (
              <SlideNameCapture
                onSubmit={handleNameSubmit}
                defaultValue={nombreEnStore}
              />
            )}

            {slide.type === 'profile_result' && (
              <SlideProfileResult onNext={next} />
            )}

            {slide.type === 'weekly_plan' && (
              <SlideWeeklyPlan onNext={next} />
            )}

            {slide.type === 'loading_with_questions' && (
              <SlideLoadingWithQuestions
                slide={slide}
                onComplete={handleLoadingComplete}
              />
            )}

            {slide.type === 'sales_page' && (
              <SlideSalesPage />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}


// ─── V2-specific question component (uses V2 store) ─────────────────────────

import { useState } from 'react';
import { OptionCard } from '@/components/quiz/OptionCard';
import Button from '@/components/ui/Button';
import type { SlideV2 } from '@/lib/quiz-v2/types';

type QuestionSlideV2 = Extract<SlideV2, { type: 'question' }>;

function SlideQuestionV2({ slide, onNext }: { slide: QuestionSlideV2; onNext: () => void }) {
  const setAnswer = useQuizStoreV2((s) => s.setAnswer);
  const currentValue = useQuizStoreV2((s) => s.answers[slide.id]);

  const [selected, setSelected] = useState<string[]>(() => {
    if (Array.isArray(currentValue)) return currentValue;
    if (typeof currentValue === 'string') return [currentValue];
    return [];
  });

  const handleSingleClick = (value: string) => {
    setSelected([value]);
    setAnswer(slide.id, value);
    setTimeout(() => onNext(), 250);
  };

  const handleMultiToggle = (value: string) => {
    const nextSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setSelected(nextSelected);
    setAnswer(slide.id, nextSelected);
  };

  const handleContinue = () => {
    if (selected.length > 0) onNext();
  };

  return (
    <div>
      <h2 className="font-serif text-2xl md:text-3xl text-charcoal text-center leading-tight font-semibold">
        {slide.question}
      </h2>

      {slide.subtitle && (
        <p className="mt-3 font-sans text-sm text-[#5C5852] text-center">
          {slide.subtitle}
        </p>
      )}

      <div
        className="mt-8 grid gap-3"
        role={slide.multiple ? 'group' : 'radiogroup'}
        aria-label={slide.question}
      >
        {slide.options.map((opt) => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            emoji={opt.emoji}
            selected={selected.includes(opt.value)}
            multi={slide.multiple}
            onClick={() =>
              slide.multiple
                ? handleMultiToggle(opt.value)
                : handleSingleClick(opt.value)
            }
          />
        ))}
      </div>

      {slide.multiple && (
        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="lg"
            disabled={selected.length === 0}
            onClick={handleContinue}
          >
            CONTINUAR →
          </Button>
        </div>
      )}
    </div>
  );
}

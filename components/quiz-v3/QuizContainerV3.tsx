'use client';

/**
 * QuizContainerV3 — orquestador del quiz funnel V3 (Google Ads).
 *
 * Ultra-corto: 6 preguntas → email → loading → perfil → plan → venta.
 * Sin social proof, sin info cards, sin nombre. Directo al grano.
 *
 * Reutiliza componentes de V1 (SlideEmailCapture, OptionCard, Button)
 * y V2 (SlideProfileResult, SlideWeeklyPlan, SlideSalesPage) adaptados.
 */

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuizStoreV3 } from '@/lib/quiz-v3/store';
import { slidesV3 } from '@/lib/quiz-v3/data';
import { captureUTMs, getMetaCookies } from '@/lib/cookies';
import { trackV3Event } from '@/lib/quiz-v3/track';

import { QuizProgressV3 } from './QuizProgressV3';
import { SlideEmailCapture } from '@/components/quiz/SlideEmailCapture';
import { SlideProfileResultV3 } from './SlideProfileResultV3';
import { SlideWeeklyPlanV3 } from './SlideWeeklyPlanV3';
import { SlideSalesPageV3 } from './SlideSalesPageV3';
import { SlideLoadingV3 } from './SlideLoadingV3';
import { OptionCard } from '@/components/quiz/OptionCard';
import Button from '@/components/ui/Button';
import type { SlideV3 } from '@/lib/quiz-v3/types';

export function QuizContainerV3() {
  const currentStep = useQuizStoreV3((s) => s.currentStep);
  const answers = useQuizStoreV3((s) => s.answers);
  const setAnswer = useQuizStoreV3((s) => s.setAnswer);
  const next = useQuizStoreV3((s) => s.next);

  const slide = slidesV3[currentStep];
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      captureUTMs();

      // Always reset — direct traffic funnel, no reason to resume mid-quiz
      useQuizStoreV3.getState().reset();

      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.fbq) w.fbq('trackCustom', 'QuizStartV3');
      }

      // Fire slide=0 via sendBeacon (most reliable)
      trackV3Event('QuizProgress', { slide: 0, question_id: slidesV3[0]?.id });
    }
  }, []);

  // Track every slide (0-indexed: slide = currentStep)
  useEffect(() => {
    if (currentStep >= 0 && typeof window !== 'undefined' && initialized.current) {
      trackV3Event('QuizProgress', { slide: currentStep, question_id: slide?.id || 'unknown' });
    }
  }, [currentStep, slide]);

  if (!slide) return null;

  const handleEmailSubmit = async (email: string) => {
    setAnswer('email', email);

    try {
      const meta = getMetaCookies();
      await fetch('/api/submit-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...useQuizStoreV3.getState().answers,
          email,
          fbc: meta.fbc,
          fbp: meta.fbp,
          quiz_version: 'v3',
        }),
      });
    } catch (err) {
      console.error('[quiz-v3] submit-quiz failed:', err);
    }

    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.fbq) {
        w.fbq('track', 'Lead');
        w.fbq('trackCustom', 'QuizCompleteV3');
      }
    }

    next();
  };

  const showProgress =
    slide.type !== 'sales_page' &&
    slide.type !== 'loading' &&
    slide.type !== 'profile_result' &&
    slide.type !== 'weekly_plan';

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {showProgress && <QuizProgressV3 currentSlide={currentStep} />}

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
            {slide.type === 'question' && (
              <SlideQuestionV3 slide={slide} onNext={next} />
            )}

            {slide.type === 'email_capture' && (
              <SlideEmailCapture onSubmit={handleEmailSubmit} />
            )}

            {slide.type === 'loading' && (
              <SlideLoadingV3 onComplete={next} />
            )}

            {slide.type === 'profile_result' && (
              <SlideProfileResultV3 onNext={next} />
            )}

            {slide.type === 'weekly_plan' && (
              <SlideWeeklyPlanV3 onNext={next} />
            )}

            {slide.type === 'sales_page' && (
              <SlideSalesPageV3 />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── V3 Question component (uses V3 store) ──────────────────────────────────

type QuestionSlideV3 = Extract<SlideV3, { type: 'question' }>;

function SlideQuestionV3({ slide, onNext }: { slide: QuestionSlideV3; onNext: () => void }) {
  const setAnswer = useQuizStoreV3((s) => s.setAnswer);
  const currentValue = useQuizStoreV3((s) => s.answers[slide.id]);

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
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    setSelected(next);
    setAnswer(slide.id, next);
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

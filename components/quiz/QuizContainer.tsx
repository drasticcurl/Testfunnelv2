'use client';

import { useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/quiz/store';
import { slidesCorto } from '@/lib/quiz/slides';
import { Gender } from '@/lib/types';
import { captureUTMs, trackPixelEvent, trackServerEvent } from '@/lib/tracking';
import QuizLayout from './QuizLayout';
import SlideGender from './SlideGender';
import SlideOption from './SlideOption';
import SlideMultiSelect from './SlideMultiSelect';
import SlideEmail from './SlideEmail';
import SlideLoading from './SlideLoading';
import SlideResult from './SlideResult';
import SlideInfoCard from './SlideInfoCard';
import SlideSocialProof from './SlideSocialProof';
import SlideCheckpoint from './SlideCheckpoint';
import SlidePlanPreview from './SlidePlanPreview';
import SlideSalesPage from './SlideSalesPage';

export default function QuizContainer() {
  const {
    currentSlideIndex,
    genero,
    result,
    setSlides,
    setAnswer,
    setGenero,
    setEmail,
    nextSlide,
    computeResult,
    getVisibleSlides,
  } = useQuizStore();

  useEffect(() => {
    setSlides(slidesCorto);
    captureUTMs();
    trackPixelEvent('QuizStart');
    trackServerEvent('QuizStart');
  }, [setSlides]);

  const visibleSlides = getVisibleSlides();
  const currentSlide = visibleSlides[currentSlideIndex];

  const handleLoadingComplete = useCallback(() => {
    computeResult();
    trackPixelEvent('QuizComplete');
    trackServerEvent('QuizComplete');
    nextSlide();
  }, [computeResult, nextSlide]);

  if (!currentSlide) return null;

  const interactiveSlides = visibleSlides.filter(
    (s) => !['loading', 'result', 'sales', 'plan_preview'].includes(s.type)
  );
  const progressTotal = interactiveSlides.length;
  const progressCurrent = Math.min(currentSlideIndex + 1, progressTotal);
  const showProgress = !['loading', 'result', 'sales', 'plan_preview'].includes(currentSlide.type);

  const renderSlide = () => {
    switch (currentSlide.type) {
      case 'gender':
        return (
          <SlideGender
            slide={currentSlide}
            onSelect={(value) => {
              setGenero(value as Gender);
              setAnswer(currentSlide.id, value);
              nextSlide();
            }}
          />
        );
      case 'single':
        return (
          <SlideOption
            slide={currentSlide}
            onSelect={(value) => {
              setAnswer(currentSlide.id, value);
              nextSlide();
            }}
          />
        );
      case 'multi':
        return (
          <SlideMultiSelect
            slide={currentSlide}
            onSubmit={(values) => {
              setAnswer(currentSlide.id, values);
              nextSlide();
            }}
          />
        );
      case 'email':
        return (
          <SlideEmail
            slide={currentSlide}
            onSubmit={(email) => {
              setEmail(email);
              nextSlide();
            }}
          />
        );
      case 'info_card':
        return <SlideInfoCard slide={currentSlide} onContinue={nextSlide} />;
      case 'social_proof':
        return <SlideSocialProof slide={currentSlide} onContinue={nextSlide} />;
      case 'checkpoint':
        return <SlideCheckpoint slide={currentSlide} onContinue={nextSlide} />;
      case 'loading':
        return <SlideLoading onComplete={handleLoadingComplete} />;
      case 'result':
        return result ? <SlideResult result={result} onContinue={nextSlide} /> : null;
      case 'plan_preview':
        return result ? <SlidePlanPreview result={result} onContinue={nextSlide} /> : null;
      case 'sales':
        return result ? <SlideSalesPage result={result} /> : null;
      default:
        return null;
    }
  };

  return (
    <QuizLayout
      currentStep={progressCurrent}
      totalSteps={progressTotal}
      showProgress={showProgress}
    >
      <AnimatePresence mode="wait">
        <div key={currentSlide.id}>{renderSlide()}</div>
      </AnimatePresence>
    </QuizLayout>
  );
}

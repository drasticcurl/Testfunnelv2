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

  // Determine which interactive slides to count for progress
  const interactiveSlides = visibleSlides.filter(
    (s) => !['loading', 'result', 'sales'].includes(s.type)
  );
  const progressTotal = interactiveSlides.length;
  const progressCurrent = Math.min(
    currentSlideIndex + 1,
    progressTotal
  );
  const showProgress = !['loading', 'result', 'sales'].includes(currentSlide.type);

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
      case 'loading':
        return <SlideLoading onComplete={handleLoadingComplete} />;
      case 'result':
        return result ? (
          <SlideResult result={result} onContinue={nextSlide} />
        ) : null;
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

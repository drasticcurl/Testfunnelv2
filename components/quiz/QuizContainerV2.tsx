'use client';

import { useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuizStore } from '@/lib/quiz/store';
import { slidesLargo } from '@/lib/quiz/slides-v2';
import { generateProfileBars } from '@/lib/quiz/calculate-result';
import { Gender } from '@/lib/types';
import QuizLayout from './QuizLayout';
import SlideGender from './SlideGender';
import SlideOption from './SlideOption';
import SlideMultiSelect from './SlideMultiSelect';
import SlideEmail from './SlideEmail';
import SlideName from './SlideName';
import SlideLoading from './SlideLoading';
import SlideResult from './SlideResult';
import SlideInfoCard from './SlideInfoCard';
import SlideSocialProof from './SlideSocialProof';
import SlideProfile from './SlideProfile';
import SlideSalesPage from './SlideSalesPage';

export default function QuizContainerV2() {
  const {
    currentSlideIndex,
    answers,
    genero,
    nombre,
    result,
    setSlides,
    setAnswer,
    setGenero,
    setEmail,
    setNombre,
    nextSlide,
    computeResult,
    getVisibleSlides,
  } = useQuizStore();

  useEffect(() => {
    setSlides(slidesLargo);
  }, [setSlides]);

  const visibleSlides = getVisibleSlides();
  const currentSlide = visibleSlides[currentSlideIndex];

  const handleLoadingComplete = useCallback(() => {
    computeResult();
    nextSlide();
  }, [computeResult, nextSlide]);

  if (!currentSlide) return null;

  const interactiveSlides = visibleSlides.filter(
    (s) => !['loading', 'result', 'sales', 'profile'].includes(s.type)
  );
  const progressTotal = interactiveSlides.length;
  const progressCurrent = Math.min(currentSlideIndex + 1, progressTotal);
  const showProgress = !['loading', 'result', 'sales', 'profile'].includes(currentSlide.type);

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
      case 'name':
        return (
          <SlideName
            slide={currentSlide}
            onSubmit={(name) => {
              setNombre(name);
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
      case 'loading':
        return <SlideLoading onComplete={handleLoadingComplete} />;
      case 'profile':
        const bars = generateProfileBars(answers);
        return <SlideProfile bars={bars} nombre={nombre} onContinue={nextSlide} />;
      case 'result':
        return result ? <SlideResult result={result} onContinue={nextSlide} /> : null;
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

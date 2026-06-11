'use client';

import { slidesV3, SLIDES_WITHOUT_PROGRESS } from '@/lib/quiz-v2/data';

interface Props {
  currentStep: number;
}

export function QuizProgressV3({ currentStep }: Props) {
  const slide = slidesV3[currentStep];
  if (!slide || SLIDES_WITHOUT_PROGRESS.has(slide.type)) return null;

  const total    = slidesV3.filter((s) => !SLIDES_WITHOUT_PROGRESS.has(s.type)).length;
  const current  = slidesV3.slice(0, currentStep + 1).filter((s) => !SLIDES_WITHOUT_PROGRESS.has(s.type)).length;
  const progress = Math.round((current / total) * 100);

  return (
    <div className="sticky top-0 z-20 w-full" style={{ backgroundColor: 'var(--warm)' }}>
      <div className="quiz-progress-track">
        <div
          className="quiz-progress-bar transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

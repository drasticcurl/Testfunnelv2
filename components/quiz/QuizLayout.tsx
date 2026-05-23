'use client';

import { ReactNode } from 'react';
import ProgressBar from './ProgressBar';

interface QuizLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  showProgress?: boolean;
}

export default function QuizLayout({ children, currentStep, totalSteps, showProgress = true }: QuizLayoutProps) {
  return (
    <div className="min-h-screen bg-night-900 flex flex-col">
      {showProgress && (
        <div className="sticky top-0 z-50 bg-night-900/95 backdrop-blur-sm border-b border-night-700/30 px-4 py-3">
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>
      )}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

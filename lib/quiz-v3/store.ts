/**
 * Store del Quiz V3 — Zustand con persistencia en localStorage.
 * Separado de V1 y V2 para no interferir con el A/B.
 * Key: 'chau-hinchazon-quiz-v3'
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizAnswersV3 } from './types';

interface QuizStateV3 {
  currentStep: number;
  answers: QuizAnswersV3;
  startedAt: number | null;

  setAnswer: (id: string, value: string | string[]) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
}

export const useQuizStoreV3 = create<QuizStateV3>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: {},
      startedAt: null,

      setAnswer: (id, value) =>
        set((state) => ({
          answers: { ...state.answers, [id]: value },
        })),

      next: () =>
        set((state) => ({
          currentStep: state.currentStep + 1,
          startedAt: state.startedAt ?? Date.now(),
        })),

      prev: () =>
        set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

      reset: () => set({ currentStep: 0, answers: {}, startedAt: null }),
    }),
    { name: 'chau-hinchazon-quiz-v3' },
  ),
);

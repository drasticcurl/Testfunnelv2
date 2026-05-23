/**
 * Store del Quiz V2 — Zustand con persistencia en localStorage.
 * Separado del store V1 para no interferir con el A/B.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizAnswersV2 } from './types';

interface QuizStateV2 {
  currentStep: number;
  answers: QuizAnswersV2;
  startedAt: number | null;

  setAnswer: (id: string, value: string | string[]) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export const useQuizStoreV2 = create<QuizStateV2>()(
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

      goTo: (step) => set({ currentStep: step }),

      reset: () => set({ currentStep: 0, answers: {}, startedAt: null }),
    }),
    { name: 'chau-hinchazon-quiz-v2' },
  ),
);

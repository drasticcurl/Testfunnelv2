/**
 * Store del Quiz V3 — "Método del Agua de Arroz"
 * Zustand con persistencia en localStorage.
 * Key: STORAGE_KEYS.quizState (ver lib/constants.ts)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizAnswers } from './types';
import { slidesV3 } from './data';
import { STORAGE_KEYS } from '@/lib/constants';

interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  startedAt: number | null;

  setAnswer: (id: keyof QuizAnswers, value: QuizAnswers[keyof QuizAnswers]) => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: {},
      startedAt: null,

      setAnswer: (id, value) =>
        set((state) => ({ answers: { ...state.answers, [id]: value } })),

      next: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, slidesV3.length - 1),
          startedAt: state.startedAt ?? Date.now(),
        })),

      prev: () =>
        set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

      goTo: (step) =>
        set({ currentStep: Math.max(0, Math.min(step, slidesV3.length - 1)) }),

      reset: () =>
        set({ currentStep: 0, answers: {}, startedAt: null }),
    }),
    { name: STORAGE_KEYS.quizState },
  ),
);

// Legacy alias para no romper imports existentes
/** @deprecated Usar useQuizStore */
export const useQuizStoreV2 = useQuizStore;

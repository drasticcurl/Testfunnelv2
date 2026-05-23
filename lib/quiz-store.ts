/**
 * Store global del quiz - Zustand con persistencia en localStorage.
 * Fuente de verdad: docs/02-QUIZ.md
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizAnswers } from './quiz-types';

interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  startedAt: number | null;

  /** Marca el inicio del quiz y avanza al slide 1 */
  start: () => void;

  /** Guarda la respuesta de una pregunta */
  setAnswer: (id: keyof QuizAnswers, value: string | string[]) => void;

  /** Avanza al siguiente slide */
  next: () => void;

  /** Retrocede al slide anterior (minimo 0) */
  prev: () => void;

  /** Resetea todo el estado */
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: {},
      startedAt: null,

      start: () => set({ startedAt: Date.now(), currentStep: 1 }),

      setAnswer: (id, value) =>
        set((state) => ({
          answers: { ...state.answers, [id]: value },
        })),

      next: () => set((state) => ({ currentStep: state.currentStep + 1 })),

      prev: () =>
        set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

      reset: () => set({ currentStep: 0, answers: {}, startedAt: null }),
    }),
    { name: 'anti-hinchazon-quiz' },
  ),
);

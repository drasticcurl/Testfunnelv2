import { create } from 'zustand';
import { Gender, QuizResult, SlideDefinition } from '@/lib/types';
import { calculateResult } from './calculate-result';

interface QuizState {
  // Navigation
  currentSlideIndex: number;
  slides: SlideDefinition[];

  // Answers
  answers: Record<string, string | string[]>;
  genero: Gender | null;
  email: string;
  nombre: string;

  // Result
  result: QuizResult | null;
  quizCompleted: boolean;

  // Actions
  setSlides: (slides: SlideDefinition[]) => void;
  setAnswer: (slideId: string, answer: string | string[]) => void;
  setGenero: (genero: Gender) => void;
  setEmail: (email: string) => void;
  setNombre: (nombre: string) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  computeResult: () => void;
  getVisibleSlides: () => SlideDefinition[];
  reset: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentSlideIndex: 0,
  slides: [],
  answers: {},
  genero: null,
  email: '',
  nombre: '',
  result: null,
  quizCompleted: false,

  setSlides: (slides) => set({ slides }),

  setAnswer: (slideId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [slideId]: answer },
    })),

  setGenero: (genero) => set({ genero }),
  setEmail: (email) => set({ email }),
  setNombre: (nombre) => set({ nombre }),

  nextSlide: () => {
    const { currentSlideIndex, getVisibleSlides } = get();
    const visible = getVisibleSlides();
    if (currentSlideIndex < visible.length - 1) {
      set({ currentSlideIndex: currentSlideIndex + 1 });
    }
  },

  prevSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({ currentSlideIndex: currentSlideIndex - 1 });
    }
  },

  goToSlide: (index) => set({ currentSlideIndex: index }),

  computeResult: () => {
    const { answers, genero, email, nombre } = get();
    if (!genero) return;
    const result = calculateResult(answers, genero, email, nombre || undefined);
    set({ result, quizCompleted: true });
  },

  getVisibleSlides: () => {
    const { slides, genero } = get();
    return slides.filter((slide) => {
      if (!slide.genderSpecific) return true;
      return slide.genderSpecific === genero;
    });
  },

  reset: () =>
    set({
      currentSlideIndex: 0,
      answers: {},
      genero: null,
      email: '',
      nombre: '',
      result: null,
      quizCompleted: false,
    }),
}));

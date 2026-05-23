/**
 * Barrel export for quiz-v2 module.
 */

export { slidesV2, getProgressSection, PROGRESS_SECTIONS } from './data';
export { useQuizStoreV2 } from './store';
export { calcularTipoV2, calcularSeveridadV2, calcularPerfilBars, generateWeeklyPlan } from './helpers';
export type {
  SlideV2,
  QuestionIdV2,
  QuizAnswersV2,
  TipoHinchazonV2,
  ProgressSection,
} from './types';

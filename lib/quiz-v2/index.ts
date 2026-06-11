/**
 * Barrel export — quiz-v2 module (V3 — Método del Agua de Arroz)
 */
export { slidesV3, SLIDES_WITHOUT_PROGRESS } from './data';
export { useQuizStore } from './store';
export {
  calcularDiagnostico,
  calcularIMC,
  calcularPesoProyectado,
  getSeverityLabel,
  getNombre,
} from './helpers';
export type {
  SlideV3,
  QuestionId,
  QuizAnswers,
  DiagnosisResult,
  IMCResult,
  IMCCategoria,
  WeightProjection,
  SeverityLabel,
  QuizOption,
  BodyTypeOption,
} from './types';

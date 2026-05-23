/**
 * Helpers para Quiz V3 — cálculo de tipo, severidad, profile bars.
 * Misma lógica que V2 pero adaptada a los question IDs de V3.
 */

import { QuizAnswersV3, TipoHinchazonV3 } from './types';

export function calcularTipoV3(answers: QuizAnswersV3): TipoHinchazonV3 {
  const momento = answers.momento_hinchazon;
  if (momento === 'manana') return 1;
  if (momento === 'almuerzo') return 2;
  if (momento === 'tarde_noche') return 3;
  if (momento === 'todo_el_dia') return 4;
  return 3;
}

export function calcularSeveridadV3(answers: QuizAnswersV3): number {
  let score = 0;

  const tiempo = answers.tiempo_con_problema;
  if (tiempo === 'mas_5a') score += 3;
  else if (tiempo === '2a_5a') score += 2.5;
  else if (tiempo === '6m_2a') score += 1.5;
  else score += 0.5;

  const sintomas = answers.sintomas;
  if (Array.isArray(sintomas)) {
    score += Math.min(sintomas.length * 0.7, 3);
  }

  const emocion = answers.impacto_emocional;
  if (emocion === 'todas') score += 2;
  else if (emocion === 'frustrada') score += 1.5;
  else if (emocion === 'insegura') score += 1;
  else score += 0.5;

  const probo = answers.ya_probo;
  if (Array.isArray(probo) && probo.length >= 3) score += 1.5;
  else if (Array.isArray(probo) && probo.length >= 1) score += 0.5;

  return Math.min(Math.round(score * 10) / 10, 10);
}

export function calcularPerfilBarsV3(answers: QuizAnswersV3): {
  severidad: number;
  potencial: number;
  urgencia: number;
} {
  const sev = calcularSeveridadV3(answers);

  // Severidad as percentage
  const severidad = Math.min(sev * 10, 100);

  // Potencial de mejora (inversamente proporcional a lo que ya probó)
  const probo = answers.ya_probo;
  let potencial = 85;
  if (Array.isArray(probo) && probo.includes('nada')) potencial = 95;
  else if (Array.isArray(probo) && probo.length >= 4) potencial = 70;

  // Urgencia (basada en impacto emocional)
  let urgencia = 60;
  if (answers.impacto_emocional === 'todas') urgencia = 95;
  else if (answers.impacto_emocional === 'frustrada') urgencia = 85;
  else if (answers.impacto_emocional === 'insegura') urgencia = 75;

  return { severidad, potencial, urgencia };
}

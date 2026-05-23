/**
 * Helpers para Quiz V2 — cálculo de tipo, severidad, profile bars.
 */

import { QuizAnswersV2, TipoHinchazonV2 } from './types';

/**
 * Calcula el tipo de hinchazón a partir de las respuestas V2.
 * Lógica idéntica a V1 (basada en momento_hinchazon).
 */
export function calcularTipoV2(answers: QuizAnswersV2): TipoHinchazonV2 {
  const momento = answers.momento_hinchazon;
  if (momento === 'manana') return 1;
  if (momento === 'almuerzo') return 2;
  if (momento === 'tarde_noche') return 3;
  if (momento === 'todo_el_dia') return 4;
  return 3; // default
}

/**
 * Calcula severidad (0-10) a partir de las respuestas.
 */
export function calcularSeveridadV2(answers: QuizAnswersV2): number {
  let score = 0;

  // Tiempo con problema: más tiempo = más severidad
  const tiempo = answers.tiempo_con_problema;
  if (tiempo === 'mas_5a') score += 3;
  else if (tiempo === '2a_5a') score += 2.5;
  else if (tiempo === '6m_2a') score += 1.5;
  else score += 0.5;

  // Frecuencia
  const freq = answers.frecuencia;
  if (freq === 'diaria') score += 3;
  else if (freq === '4_6') score += 2;
  else if (freq === '2_3') score += 1;
  else score += 0.5;

  // Síntomas: cada uno suma
  const sintomas = answers.sintomas;
  if (Array.isArray(sintomas)) {
    score += Math.min(sintomas.length * 0.5, 2.5);
  }

  // Impacto emocional
  const emocion = answers.impacto_emocional;
  if (emocion === 'todas') score += 1.5;
  else if (emocion === 'insegura' || emocion === 'frustrada') score += 1;
  else score += 0.5;

  return Math.min(Math.round(score * 10) / 10, 10);
}

/**
 * Profile bars para la pantalla de "perfil generado".
 * Returns values between 0-100 for each metric.
 */
export function calcularPerfilBars(answers: QuizAnswersV2): {
  motivacion: number;
  potencial: number;
  foco: number;
  conocimiento: number;
} {
  // Motivación
  let motivacion = 50;
  if (answers.motivacion === 'urgente') motivacion = 95;
  else if (answers.motivacion === 'importante') motivacion = 75;
  else motivacion = 50;

  // Potencial (basado en severidad — más severidad = más espacio para mejorar)
  const sev = calcularSeveridadV2(answers);
  const potencial = Math.min(60 + sev * 4, 95);

  // Foco
  let foco = 50;
  if (answers.foco === 'si') foco = 90;
  else if (answers.foco === 'mas_o_menos') foco = 65;
  else if (answers.foco === 'me_cuesta') foco = 40;
  else foco = 25;

  // Conocimiento (microbiota + ya probó)
  let conocimiento = 30;
  if (answers.conocimiento_microbiota === 'si') conocimiento += 30;
  else if (answers.conocimiento_microbiota === 'sospechaba') conocimiento += 15;
  const probo = answers.ya_probo;
  if (Array.isArray(probo) && probo.length > 2) conocimiento += 20;
  else if (Array.isArray(probo) && probo.length > 0) conocimiento += 10;
  conocimiento = Math.min(conocimiento, 90);

  return { motivacion, potencial, foco, conocimiento };
}

/**
 * Genera las semanas del plan semanal para el gráfico.
 */
export function generateWeeklyPlan(): {
  week: number;
  label: string;
  percent: number;
  color: string;
}[] {
  return [
    { week: 1, label: 'Semana 1 — Limpieza', percent: 25, color: '#E07856' },
    { week: 2, label: 'Semana 2 — Reincorporación', percent: 50, color: '#D9A441' },
    { week: 3, label: 'Semana 3 — Estabilización', percent: 75, color: '#7A9B7E' },
    { week: 4, label: 'Semana 4 — Mantenimiento', percent: 100, color: '#5B8A60' },
  ];
}

/**
 * Logica de scoring del quiz: tipo de hinchazon (1-4) y severidad (0-10).
 * Fuente de verdad: docs/_QUIZ-DATA.md
 *
 * Tipos:
 *   1 → Hinchazon Matutina        (despertar inflamada)
 *   2 → Hinchazon Postprandial    (despues de comer)
 *   3 → Hinchazon Vespertina      (acumula durante el dia, MAS COMUN)
 *   4 → Hinchazon Cronica         (todo el dia)
 *
 * El tipo se calcula con MULTIPLES inputs (no solo `momento_del_dia`):
 *   - momento_del_dia define el tipo BASE
 *   - sintomas + tiempo_con_problema + impacto_emocional + ya_probo
 *     pueden PROMOCIONAR a tipo 4 (Cronica) si hay >=3 senales de cronicidad
 *
 * La severidad (0-10) usa: tiempo + cantidad sintomas + ya_probo + impacto.
 */

import { QuizAnswers, TipoHinchazon } from './quiz-types';

function tipoBase(momento: unknown): TipoHinchazon {
  if (momento === 'manana') return 1;
  if (momento === 'almuerzo') return 2;
  if (momento === 'tarde_noche') return 3;
  if (momento === 'todo_el_dia') return 4;
  return 3; // default: el tipo mas comun
}

export function calcularTipo(answers: QuizAnswers): TipoHinchazon {
  const base = tipoBase(answers.momento_del_dia);

  // Si ya es tipo 4 (todo el dia) no hay que promocionar mas
  if (base === 4) return 4;

  // Signos de cronicidad: si hay >=3, el caso es cronico aunque
  // el momento del dia sugiera otro tipo
  const sintomas = (answers.sintomas as string[]) || [];
  const yaProbo = (answers.ya_probo as string[]) || [];

  let cronicidadSignals = 0;

  // Senal 1: muchos sintomas simultaneos
  if (sintomas.length >= 5) cronicidadSignals++;

  // Senal 2: convive con el problema hace mucho tiempo
  if (answers.tiempo_con_problema === 'mas_5a') cronicidadSignals++;
  else if (answers.tiempo_con_problema === '2a_5a') cronicidadSignals += 0.5;

  // Senal 3: combinacion de sintomas severos (fatiga + estrenimiento o panza_marcada)
  const sintomasSeveros = ['fatiga_post_comida', 'estrenimiento', 'panza_marcada'];
  const matchesSeveros = sintomas.filter((s) => sintomasSeveros.includes(s)).length;
  if (matchesSeveros >= 2) cronicidadSignals++;

  // Senal 4: impacto emocional total (afecta varias dimensiones)
  if (answers.impacto_emocional === 'todas') cronicidadSignals++;

  // Senal 5: ya probo MUCHAS cosas y nada funciono (>=3 intentos distintos)
  const intentos = yaProbo.filter((p) => p !== 'nada').length;
  if (intentos >= 3) cronicidadSignals++;

  if (cronicidadSignals >= 3) return 4;

  return base;
}

export function calcularSeveridad(answers: QuizAnswers): number {
  let score = 0;

  // Tiempo con el problema (0-8)
  const tiempoMap: Record<string, number> = {
    menos_6m: 2,
    '6m_2a': 4,
    '2a_5a': 6,
    mas_5a: 8,
  };
  score += tiempoMap[answers.tiempo_con_problema as string] || 0;

  // Cantidad de sintomas (0-3) — con max 6 sintomas, esto da 0-3
  const sintomas = (answers.sintomas as string[]) || [];
  score += Math.min(sintomas.length * 0.5, 3);

  // Ya probo cosas y nada funciono (0-2): cuanto mas probo, mas severo
  const yaProbo = (answers.ya_probo as string[]) || [];
  const intentos = yaProbo.filter((p) => p !== 'nada').length;
  score += Math.min(intentos * 0.5, 2);

  // Impacto emocional (0-1)
  if (answers.impacto_emocional === 'todas') score += 1;
  else if (answers.impacto_emocional) score += 0.5;

  // Score 0-14, normalizamos a /10
  return Math.min(Math.round(score), 10);
}

/**
 * Construye la URL completa hacia /resultados con todos los params.
 * Llamar desde el QuizContainer despues del slide loading.
 *
 * Params persistidos en URL (para que /resultados los renderice):
 *   - apertura, momento, tiempo, sintomas, probo, emocion, objetivo,
 *     compromiso, tipo (calculado), severidad (calculada), nombre
 */
export function buildResultsUrl(answers: QuizAnswers): string {
  const params = new URLSearchParams();

  if (answers.apertura) params.set('apertura', String(answers.apertura));
  if (answers.momento_del_dia) params.set('momento', String(answers.momento_del_dia));
  if (answers.tiempo_con_problema) params.set('tiempo', String(answers.tiempo_con_problema));
  if (answers.impacto_emocional) params.set('emocion', String(answers.impacto_emocional));
  if (answers.objetivo) params.set('objetivo', String(answers.objetivo));
  if (answers.compromiso) params.set('compromiso', String(answers.compromiso));

  const sintomas = Array.isArray(answers.sintomas) ? answers.sintomas.join(',') : '';
  if (sintomas) params.set('sintomas', sintomas);

  const yaProbo = Array.isArray(answers.ya_probo) ? answers.ya_probo.join(',') : '';
  if (yaProbo) params.set('probo', yaProbo);

  params.set('tipo', calcularTipo(answers).toString());
  params.set('severidad', calcularSeveridad(answers).toString());

  if (answers.nombre) params.set('nombre', String(answers.nombre));

  return `/resultados?${params.toString()}`;
}

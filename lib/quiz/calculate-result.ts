import { InsomniaTipo, Gender, QuizResult, TIPO_MAP } from '@/lib/types';

/**
 * Mapea la respuesta de "problema principal" al tipo de insomnio
 */
function getTipoFromProblema(respuesta: string): InsomniaTipo {
  switch (respuesta) {
    case 'no_duermo':
      return 'mente_acelerada';
    case 'me_despierto':
      return 'despertador';
    case 'no_descanso':
      return 'zombi';
    case 'sin_horario':
      return 'irregular';
    default:
      return 'mente_acelerada';
  }
}

/**
 * Calcula la severidad (1-10) basándose en las respuestas
 */
function calcularSeveridad(respuestas: Record<string, string | string[]>): number {
  let severidad = 4; // base

  // Duración del problema
  const duracion = respuestas.duracion as string;
  if (duracion === 'mas_2_anios') severidad += 3;
  else if (duracion === '6m_2_anios') severidad += 2;
  else if (duracion === '1_6_meses') severidad += 1;

  // Pantalla antes de dormir
  const pantalla = respuestas.pantalla as string;
  if (pantalla === 'siempre') severidad += 1;

  // Intentos previos
  const intentos = respuestas.intentos as string[];
  if (intentos && Array.isArray(intentos)) {
    if (intentos.includes('pastillas')) severidad += 2;
    if (intentos.includes('nada')) severidad -= 1;
    if (intentos.length >= 3) severidad += 1;
  }

  // Horas de sueño (solo v2)
  const horas = respuestas.horas_sueno as string;
  if (horas === 'menos_5') severidad += 1;

  // Café después de las 14hs (solo v2)
  const cafe = respuestas.cafe as string;
  if (cafe === 'si_siempre') severidad += 1;

  // Impacto emocional (solo v2)
  const emocional = respuestas.emocional as string;
  if (emocional === 'todas') severidad += 1;

  // Clamp entre 1 y 10
  return Math.max(1, Math.min(10, severidad));
}

/**
 * Calcula el resultado completo del quiz
 */
export function calculateResult(
  respuestas: Record<string, string | string[]>,
  genero: Gender,
  email: string,
  nombre?: string
): QuizResult {
  const tipo = getTipoFromProblema(respuestas.problema_principal as string);
  const severidad = calcularSeveridad(respuestas);
  const tipoData = TIPO_MAP[tipo];

  return {
    tipo,
    tipoNombre: tipoData.nombre,
    tipoDescripcion: tipoData.descripcion,
    severidad,
    genero,
    email,
    nombre,
  };
}

/**
 * Genera datos de perfil para la versión larga (barras tipo BetterMe)
 */
export function generateProfileBars(respuestas: Record<string, string | string[]>): {
  label: string;
  value: number;
  color: 'red' | 'yellow' | 'green';
}[] {
  const severidad = calcularSeveridad(respuestas);

  // Calidad de sueño: inversamente proporcional a severidad
  const calidadSueno = Math.max(10, 100 - severidad * 9);

  // Higiene del sueño: basada en pantalla + café + horario
  let higiene = 60;
  const pantalla = respuestas.pantalla as string;
  if (pantalla === 'siempre') higiene -= 25;
  else if (pantalla === 'a_veces') higiene -= 10;
  const cafe = respuestas.cafe as string;
  if (cafe === 'si_siempre') higiene -= 15;
  else if (cafe === 'a_veces') higiene -= 5;

  // Regulación: basada en hora de acostarse y horas de sueño
  let regulacion = 50;
  const hora = respuestas.hora_acostarse as string;
  if (hora === 'antes_22' || hora === '22_23') regulacion += 20;
  else if (hora === 'despues_00') regulacion -= 15;
  const horas = respuestas.horas_sueno as string;
  if (horas === 'mas_7' || horas === '6_7') regulacion += 15;
  else if (horas === 'menos_5') regulacion -= 20;

  // Potencial de mejora: siempre alto (motivador)
  const potencial = Math.min(95, 70 + (10 - calidadSueno / 10) * 2);

  const getColor = (v: number): 'red' | 'yellow' | 'green' => {
    if (v < 40) return 'red';
    if (v < 65) return 'yellow';
    return 'green';
  };

  return [
    { label: 'Calidad de sueño', value: Math.round(calidadSueno), color: getColor(calidadSueno) },
    { label: 'Higiene del sueño', value: Math.round(Math.max(10, higiene)), color: getColor(Math.max(10, higiene)) },
    { label: 'Regulación circadiana', value: Math.round(Math.max(10, regulacion)), color: getColor(Math.max(10, regulacion)) },
    { label: 'Potencial de mejora', value: Math.round(potencial), color: 'green' },
  ];
}

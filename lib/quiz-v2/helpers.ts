/**
 * Helpers del Quiz V3 — "Método del Agua de Arroz"
 * Cálculo del diagnóstico, proyección de peso y utilidades.
 */

import { QuizAnswers, DiagnosisResult, SeverityLabel, WeightProjection, IMCResult, IMCCategoria } from './types';

// ─── IMC ──────────────────────────────────────────────────────────────────────

export function calcularIMC(answers: QuizAnswers): IMCResult | null {
  const peso   = answers.peso_actual;
  const altura = answers.altura;
  if (!peso || !altura || altura < 100) return null;

  const alturaM = altura / 100;
  const valor   = Math.round((peso / (alturaM * alturaM)) * 10) / 10;

  const getCategoria = (imc: number): IMCCategoria => {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25)   return 'Normal';
    if (imc < 30)   return 'Sobrepeso';
    if (imc < 35)   return 'Obesidad I';
    return 'Obesidad II';
  };

  const getColor = (cat: IMCCategoria): string => {
    if (cat === 'Normal')     return '#43A047';
    if (cat === 'Bajo peso')  return '#F59E0B';
    if (cat === 'Sobrepeso')  return '#F59E0B';
    return '#E53935'; // Obesidad I/II
  };

  const categoria = getCategoria(valor);

  // IMC objetivo basado en peso deseado.
  // El objetivo nunca puede ser mayor que el peso actual (no se "sube" de peso).
  const pesoDeseado  = Math.min(answers.peso_deseado ?? peso, peso);
  const imcObjetivo  = Math.round((pesoDeseado / (alturaM * alturaM)) * 10) / 10;
  const categoriaObjetivo = getCategoria(imcObjetivo);

  return { valor, categoria, color: getColor(categoria), imcObjetivo, categoriaObjetivo };
}

// ─── DIAGNÓSTICO ─────────────────────────────────────────────────────────────

export function calcularDiagnostico(answers: QuizAnswers): DiagnosisResult {
  const nivelInflamacion     = calcularNivelInflamacion(answers);
  const riesgoAcumulacion    = calcularRiesgoAcumulacion(answers);
  const eficienciaMetabolica = calcularEficienciaMetabolica(answers);
  const severityLabel        = getSeverityLabel(nivelInflamacion);
  const reframeText          = getReframeText(answers);
  const imc                  = calcularIMC(answers);

  return { nivelInflamacion, riesgoAcumulacion, eficienciaMetabolica, severityLabel, reframeText, imc };
}

function calcularNivelInflamacion(answers: QuizAnswers): number {
  let score = 40;
  if (answers.tipo_cuerpo === 'plus_size')        score += 25;
  else if (answers.tipo_cuerpo === 'sobrepeso')   score += 20;
  else if (answers.tipo_cuerpo === 'unos_kilos')  score += 12;
  else score += 4;

  // donde_acumula ahora es string (single-select)
  const acumula = answers.donde_acumula;
  if (acumula === 'abdomen') score += 14;
  else if (acumula === 'cintura') score += 8;
  else score += 4;

  const impide = answers.impide_deshincharse ?? [];
  if (impide.includes('metabolismo_lento')) score += 10;
  if (impide.includes('ansiedad_comida'))   score += 8;
  if (impide.includes('retencion'))         score += 6;

  if (answers.horas_sueno === 'menos_5h') score += 10;
  else if (answers.horas_sueno === '5_6h') score += 5;

  if (answers.agua_dia === 'menos_1l') score += 7;
  else if (answers.agua_dia === '1_2l') score += 3;

  return Math.min(Math.round(score), 97);
}

function calcularRiesgoAcumulacion(answers: QuizAnswers): number {
  let score = 35;
  if (answers.rutina_diaria === 'sedentaria')   score += 28;
  else if (answers.rutina_diaria === 'poco_activa') score += 18;
  else if (answers.rutina_diaria === 'moderada')    score += 8;
  else score += 2;

  if (answers.embarazos === '3_mas') score += 14;
  else if (answers.embarazos === '2')   score += 10;
  else if (answers.embarazos === '1')   score += 5;
  else score += 2;

  if (answers.tipo_cuerpo === 'plus_size')  score += 16;
  else if (answers.tipo_cuerpo === 'sobrepeso')   score += 10;
  else if (answers.tipo_cuerpo === 'unos_kilos')  score += 5;

  const lograr = answers.que_queres_lograr ?? [];
  if (lograr.includes('bajar_peso')) score += 6;

  return Math.min(Math.round(score), 95);
}

function calcularEficienciaMetabolica(answers: QuizAnswers): number {
  let score = 60;
  if (answers.tipo_cuerpo === 'plus_size')  score -= 26;
  else if (answers.tipo_cuerpo === 'sobrepeso')   score -= 18;
  else if (answers.tipo_cuerpo === 'unos_kilos')  score -= 10;

  if (answers.horas_sueno === 'menos_5h') score -= 16;
  else if (answers.horas_sueno === '5_6h') score -= 9;

  if (answers.agua_dia === 'menos_1l') score -= 13;
  else if (answers.agua_dia === '1_2l') score -= 7;

  if (answers.rutina_diaria === 'sedentaria')   score -= 10;
  else if (answers.rutina_diaria === 'poco_activa') score -= 5;

  return Math.max(Math.round(score), 8);
}

export function getSeverityLabel(inflam: number): SeverityLabel {
  if (inflam >= 90) return 'Crítico';
  if (inflam >= 78) return 'Severo';
  if (inflam >= 68) return 'Alto';
  return 'Moderado';
}

export function getReframeText(answers: QuizAnswers): string {
  const impide  = answers.impide_deshincharse ?? [];
  const acumula = answers.donde_acumula; // ahora string

  if (impide.includes('metabolismo_lento')) {
    return 'Tu metabolismo lento es una respuesta biológica a años de inflamación intestinal acumulada — no es una falla de voluntad. El Método del Agua de Arroz reactiva tu metabolismo atacando la raíz del problema.';
  }
  if (impide.includes('ansiedad_comida')) {
    return 'La ansiedad por la comida es una señal de disbiosis intestinal: tus bacterias malas piden azúcar para sobrevivir. El Método del Agua de Arroz las reemplaza por bacterias buenas en 7 días.';
  }
  if (acumula === 'abdomen' || acumula === 'cintura') {
    return 'La grasa abdominal es la más relacionada con inflamación crónica de bajo grado. No es grasa común — es grasa inflamatoria. El Método del Agua de Arroz la ataca específicamente con prebióticos naturales.';
  }
  if (answers.embarazos && answers.embarazos !== 'ninguno') {
    return 'Los embarazos cambian permanentemente tu microbiota y tu metabolismo. Esto no es irreversible — el Método del Agua de Arroz fue diseñado pensando específicamente en el cuerpo de la mujer post-embarazo.';
  }
  return 'Tu cuerpo no es el problema. Es la inflamación intestinal crónica que nadie te diagnosticó. El Método del Agua de Arroz la elimina en 7 días con ingredientes que ya tenés en tu casa.';
}

// ─── DESCRIPCIONES DE LAS BARRAS (urgencia agresiva, estilo "informe") ────────

export interface BarDescription {
  /** Texto explicativo bajo cada barra del diagnóstico. */
  inflamacion: string;
  riesgo: string;
  eficiencia: string;
}

/**
 * Descripciones por barra del diagnóstico. Generan urgencia explicando, en
 * lenguaje simple y alarmante (pero reversible), qué significa cada número.
 * Se personalizan según la zona donde acumula y las horas de sueño.
 */
export function getBarDescriptions(answers: QuizAnswers, d: DiagnosisResult): BarDescription {
  const acumula = answers.donde_acumula;
  const zona =
    acumula === 'abdomen' ? 'el abdomen'
    : acumula === 'cintura' ? 'la cintura'
    : acumula === 'piernas' ? 'las piernas'
    : acumula === 'brazos' ? 'los brazos'
    : acumula === 'espalda' ? 'la espalda'
    : 'la zona media';

  const duermePoco = answers.horas_sueno === 'menos_5h' || answers.horas_sueno === '5_6h';

  return {
    inflamacion:
      `Tu intestino está inflamado y reteniendo líquidos. Tu cuerpo acumula la hinchazón principalmente en ${zona}, por eso te sentís pesada e hinchada incluso comiendo poco.`,
    riesgo:
      `Tu cuerpo está en "modo acumulación": guarda en vez de eliminar. ` +
      (duermePoco
        ? 'Dormir poco dispara el cortisol y empeora la retención justo cuando más querés deshincharte.'
        : 'Mientras este patrón siga activo, ni la dieta más estricta logra resultados duraderos.'),
    eficiencia:
      `Tu metabolismo está trabajando al mínimo: solo usás el ${d.eficienciaMetabolica}% de tu capacidad para procesar lo que comés. Por eso te falta energía y te cuesta bajar de peso.`,
  };
}

/**
 * Burbuja de cierre del diagnóstico (entre las barras y el CTA).
 * Genera urgencia fuerte pero deja claro que es 100% reversible.
 */
export function getDiagnosisUrgency(): string {
  return 'Básicamente, tu cuerpo está en "estado de emergencia": mientras esta inflamación siga activa, ni la dieta más estricta ni matarte en el gimnasio van a funcionar, porque tu cuerpo se resiste a soltar la hinchazón y la grasa. La buena noticia es que esto es 100% reversible de forma natural, sin pasar hambre y desde tu casa.';
}

// ─── INFORME PERSONALIZADO (sales page) ───────────────────────────────────────

const OBJETIVO_TEXTO: Record<string, string> = {
  bajar_peso: 'bajar de peso de forma saludable',
  deshinchar: 'deshinchar tu panza',
  seguridad: 'sentirte más segura con tu cuerpo',
  energia: 'tener más energía durante el día',
  digestion: 'mejorar tu digestión',
  piel: 'mejorar tu piel',
};

/**
 * Párrafo de diagnóstico inicial personalizado para la sales page.
 * Menciona el obstáculo principal, el objetivo, el IMC y las horas de sueño.
 */
export function getInformeDiagnostico(answers: QuizAnswers): string {
  const imc = calcularIMC(answers);

  // Objetivo principal (primer seleccionado)
  const objetivos = answers.que_queres_lograr ?? [];
  const objetivoPrincipal = objetivos.length > 0 ? OBJETIVO_TEXTO[objetivos[0]] ?? 'sentirte mejor' : 'sentirte mejor';

  // Obstáculo principal
  const impide = answers.impide_deshincharse ?? [];
  let obstaculo = '';
  if (impide.includes('falta_tiempo')) obstaculo = 'Entiendo que la falta de tiempo es un gran obstáculo en tu día a día';
  else if (impide.includes('ansiedad_comida')) obstaculo = 'Sé que la ansiedad por la comida te juega en contra';
  else if (impide.includes('metabolismo_lento')) obstaculo = 'Entiendo que sentís que tu metabolismo está más lento que antes';
  else if (impide.includes('retencion')) obstaculo = 'Sé que la retención de líquidos te tiene siempre hinchada';
  else obstaculo = 'Sé lo frustrante que es intentarlo una y otra vez sin resultados';

  const partes: string[] = [`${obstaculo}, y que tu objetivo principal es ${objetivoPrincipal}.`];

  if (imc) {
    partes.push(`Con un IMC de ${imc.valor} (${imc.categoria.toLowerCase()})`);
    if (answers.horas_sueno === 'menos_5h') partes.push('y durmiendo menos de 5 horas, es normal que te sientas así.');
    else if (answers.horas_sueno === '5_6h') partes.push('y durmiendo apenas 5 a 6 horas, es normal que te sientas así.');
    else partes.push('ya tenemos un punto de partida claro.');
  }

  partes.push('¡Pero no te preocupes! Ya armé un plan con el Método del Agua de Arroz pensado especialmente para vos y tus necesidades.');

  return partes.join(' ');
}

export interface InformeResumen {
  /** Bullets cortos y escaneables del diagnóstico inicial. */
  bullets: string[];
  /** Frase de cierre (el "Método del Agua de Arroz" se resalta en el componente). */
  cierre: string;
}

/**
 * Versión escaneable del informe: bullets cortos en vez de un párrafo largo.
 * La gente no lee párrafos — esto entra de un vistazo.
 */
export function getInformeResumen(answers: QuizAnswers): InformeResumen {
  const imc = calcularIMC(answers);
  const bullets: string[] = [];

  // Obstáculo principal
  const impide = answers.impide_deshincharse ?? [];
  if (impide.includes('falta_tiempo')) bullets.push('Tu mayor obstáculo: la falta de tiempo en el día a día.');
  else if (impide.includes('ansiedad_comida')) bullets.push('Tu mayor obstáculo: la ansiedad por la comida.');
  else if (impide.includes('metabolismo_lento')) bullets.push('Tu mayor obstáculo: sentís el metabolismo lento.');
  else if (impide.includes('retencion')) bullets.push('Tu mayor obstáculo: la retención de líquidos.');

  // Objetivo principal
  const objetivos = answers.que_queres_lograr ?? [];
  if (objetivos.length > 0) {
    const obj = OBJETIVO_TEXTO[objetivos[0]] ?? 'sentirte mejor';
    bullets.push(`Tu objetivo principal: ${obj}.`);
  }

  // IMC
  if (imc) bullets.push(`Tu IMC actual: ${imc.valor} (${imc.categoria.toLowerCase()}).`);

  // Sueño (solo si duerme poco — suma urgencia)
  if (answers.horas_sueno === 'menos_5h') bullets.push('Dormís menos de 5 horas: eso frena tu metabolismo.');
  else if (answers.horas_sueno === '5_6h') bullets.push('Dormís apenas 5 a 6 horas: tu cuerpo no llega a recuperarse.');

  return {
    bullets,
    cierre: 'Ya armé un plan con el Método del Agua de Arroz pensado especialmente para vos.',
  };
}

export interface Recomendacion {
  icon: string;
  title: string;
  desc: string;
}

/**
 * Recomendaciones personalizadas según las respuestas del quiz.
 * Devuelve 3-4 items con emoji, título y descripción.
 */
export function getRecomendaciones(answers: QuizAnswers): Recomendacion[] {
  const recs: Recomendacion[] = [];
  const impide = answers.impide_deshincharse ?? [];
  const objetivos = answers.que_queres_lograr ?? [];

  if (impide.includes('falta_tiempo')) {
    recs.push({ icon: '⏰', title: 'Tiempo es oro', desc: 'Dejá el agua de arroz preparada la noche anterior para tus mañanas ocupadas.' });
  }
  if (answers.agua_dia === 'menos_1l' || answers.agua_dia === '1_2l') {
    recs.push({ icon: '💧', title: 'Hidratación clave', desc: 'Sumá el agua de arroz para hidratarte y acelerar el deshinchado desde adentro.' });
  }
  if (answers.horas_sueno === 'menos_5h' || answers.horas_sueno === '5_6h') {
    recs.push({ icon: '😴', title: 'Descanso y metabolismo', desc: 'La rutina nocturna del protocolo ayuda a que tu intestino descanse y te levantes deshinchada.' });
  }
  if (impide.includes('ansiedad_comida')) {
    recs.push({ icon: '🍽️', title: 'Cortar la ansiedad', desc: 'El almidón resistente sacia y reduce los antojos de azúcar a la tarde-noche.' });
  }
  if (objetivos.includes('piel')) {
    recs.push({ icon: '✨', title: 'Piel más limpia', desc: 'Al desinflamar el intestino, la piel se ve más pareja y luminosa.' });
  }
  if (objetivos.includes('digestion')) {
    recs.push({ icon: '🌿', title: 'Mejor digestión', desc: 'Los prebióticos del agua de arroz regulan el tránsito y reducen los gases.' });
  }

  // Fallbacks para asegurar al menos 3 items.
  const fallbacks: Recomendacion[] = [
    { icon: '🌾', title: 'Empezá en ayunas', desc: 'Tomá el agua de arroz apenas te levantás para activar el deshinchado del día.' },
    { icon: '📋', title: 'Plan a tu medida', desc: 'Seguí el protocolo de 7 días adaptado a tu perfil, sin dietas imposibles.' },
    { icon: '⚡', title: 'Resultados rápidos', desc: 'Desde el día 3 vas a notar la panza más plana y menos pesadez.' },
  ];
  for (const fb of fallbacks) {
    if (recs.length >= 4) break;
    if (!recs.some((r) => r.title === fb.title)) recs.push(fb);
  }

  return recs.slice(0, 4);
}

// ─── PROYECCIÓN DE PESO ───────────────────────────────────────────────────────

export function calcularPesoProyectado(answers: QuizAnswers): WeightProjection {
  const pesoActual  = answers.peso_actual  ?? 72;
  const pesoDeseado = answers.peso_deseado ?? 65;
  const diferencia  = pesoActual - pesoDeseado;
  const bajadaKg    = Math.min(Math.max(diferencia, 2), 7);
  const pesoProyectado = Math.round((pesoActual - bajadaKg) * 10) / 10;

  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 30);
  const fechaProyectada = fecha.toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return { pesoActual, pesoProyectado, bajadaKg, fechaProyectada };
}

// ─── UTILIDADES ───────────────────────────────────────────────────────────────

export function getNombre(answers: QuizAnswers): string {
  const n = answers.nombre;
  if (!n || typeof n !== 'string') return '';
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
}

// ─── Legacy aliases (para no romper imports de V2) ───────────────────────────

/** @deprecated Usar calcularDiagnostico */
export function calcularTipoV2(answers: QuizAnswers): number {
  const d = calcularDiagnostico(answers);
  if (d.nivelInflamacion >= 90) return 4;
  if (d.nivelInflamacion >= 78) return 3;
  if (d.nivelInflamacion >= 68) return 2;
  return 1;
}

/** @deprecated Usar calcularDiagnostico */
export function calcularSeveridadV2(answers: QuizAnswers): number {
  return calcularDiagnostico(answers).nivelInflamacion / 10;
}

/** @deprecated */
export function calcularPerfilBars(answers: QuizAnswers) {
  const d = calcularDiagnostico(answers);
  return {
    motivacion:    Math.min(100 - d.nivelInflamacion + 40, 95),
    potencial:     d.eficienciaMetabolica + 60,
    foco:          70,
    conocimiento:  40,
  };
}

/** @deprecated */
export function generateWeeklyPlan() {
  return [
    { week: 1, label: 'Semana 1 — Preparación', percent: 25, color: '#C0553A' },
    { week: 2, label: 'Semana 2 — Eliminación',  percent: 50, color: '#D4785C' },
    { week: 3, label: 'Semana 3 — Restauración', percent: 75, color: '#43A047' },
    { week: 4, label: 'Semana 4 — Consolidación',percent: 100, color: '#2E7D32' },
  ];
}

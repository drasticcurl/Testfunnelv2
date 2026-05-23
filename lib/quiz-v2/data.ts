/**
 * Quiz V2 — Funnel largo "Chau Hinchazón" (estilo MusesAcademy).
 *
 * ~32 pasos: preguntas intercaladas con social proof, info cards,
 * pantalla de perfil, loading inteligente, y la venta embebida al final.
 *
 * ESTRUCTURA:
 *  Sección 1 - "Tu perfil digestivo" (pasos 0-10)
 *  Sección 2 - "Hábitos y causas"    (pasos 11-19)
 *  Sección 3 - "Tu plan ideal"       (pasos 20-27)
 *  Sección 4 - "Casi listo"          (pasos 28-32+)
 *
 * Basado en: MusesAcademy quiz structure, Alen Sultanic's Hidden Architecture,
 * Ryan Levesque ASK Method, BetterMe/Noom onboarding flows.
 */

import { SlideV2, ProgressSection } from './types';

// Mapa: slide index → sección de la progress bar
export const PROGRESS_SECTIONS: { upTo: number; label: ProgressSection }[] = [
  { upTo: 10, label: 'Tu perfil digestivo' },
  { upTo: 19, label: 'Hábitos y causas' },
  { upTo: 27, label: 'Tu plan ideal' },
  { upTo: 999, label: 'Casi listo' },
];

export function getProgressSection(step: number): ProgressSection {
  for (const s of PROGRESS_SECTIONS) {
    if (step <= s.upTo) return s.label;
  }
  return 'Casi listo';
}

export const slidesV2: SlideV2[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 1: "Tu perfil digestivo"
  // ═══════════════════════════════════════════════════════════════════════════

  // 0 — AGE SELECTOR (grilla 2x2)
  {
    type: 'age_selector',
    id: 'edad',
    headline: 'Deshinchá tu panza en 7 días con un plan personalizado',
    subtitle: 'Según tu rango de edad',
    options: [
      { value: '25_34', label: '25-34', ageRange: '25-34 años' },
      { value: '35_44', label: '35-44', ageRange: '35-44 años' },
      { value: '45_54', label: '45-54', ageRange: '45-54 años' },
      { value: '55_mas', label: '55+', ageRange: '55+ años' },
    ],
  },

  // 1 — SOCIAL PROOF #1
  {
    type: 'social_proof',
    id: 'social_1',
    number: '12,847+',
    text: 'mujeres argentinas ya usan Chau Hinchazón',
    subtext: 'Y reportan sentirse más livianas en los primeros 3 días.',
  },

  // 2 — Situación actual (opener emocional)
  {
    type: 'question',
    id: 'situacion_actual',
    question: '¿Cuál es tu situación actual con la hinchazón?',
    multiple: false,
    options: [
      { value: 'todos_dias', label: 'Me hincho todos los días', emoji: '😩' },
      { value: 'no_se_causa', label: 'No sé qué me la causa', emoji: '🤔' },
      { value: 'probe_todo', label: 'Ya probé de todo sin resultados', emoji: '😤' },
      { value: 'comoda', label: 'Quiero sentirme cómoda con mi cuerpo', emoji: '✨' },
    ],
  },

  // 3 — Momento del día
  {
    type: 'question',
    id: 'momento_hinchazon',
    question: '¿En qué momento del día sentís MÁS la hinchazón?',
    multiple: false,
    options: [
      { value: 'manana', label: 'Apenas me levanto', emoji: '🌅' },
      { value: 'almuerzo', label: 'Después del almuerzo', emoji: '🍽️' },
      { value: 'tarde_noche', label: 'A la tarde / noche', emoji: '🌙' },
      { value: 'todo_el_dia', label: 'Todo el día sin parar', emoji: '😩' },
    ],
  },

  // 4 — Frecuencia
  {
    type: 'question',
    id: 'frecuencia',
    question: '¿Con qué frecuencia te sentís hinchada?',
    multiple: false,
    options: [
      { value: 'diaria', label: 'Todos los días' },
      { value: '4_6', label: '4 a 6 días por semana' },
      { value: '2_3', label: '2 a 3 días por semana' },
      { value: 'comidas', label: 'Solo después de ciertas comidas' },
    ],
  },

  // 5 — SOCIAL PROOF #2
  {
    type: 'social_proof',
    id: 'social_2',
    number: '¡Podemos ayudarte!',
    text: 'Es normal querer resolver esto — descubrí cómo miles de mujeres lo lograron con un protocolo simple de 7 días.',
    subtext: 'Sin dietas restrictivas, sin pasar hambre, sin suplementos caros.',
  },

  // 6 — Tiempo con el problema
  {
    type: 'question',
    id: 'tiempo_con_problema',
    question: '¿Hace cuánto convivís con esta hinchazón?',
    multiple: false,
    options: [
      { value: 'menos_6m', label: 'Menos de 6 meses' },
      { value: '6m_2a', label: 'Entre 6 meses y 2 años' },
      { value: '2a_5a', label: 'Entre 2 y 5 años' },
      { value: 'mas_5a', label: 'Más de 5 años (ya es mi normal)' },
    ],
  },

  // 7 — Síntomas (multi)
  {
    type: 'question',
    id: 'sintomas',
    question: '¿Cuáles de estos síntomas tenés?',
    subtitle: 'Marcá todos los que apliquen.',
    multiple: true,
    options: [
      { value: 'gases', label: 'Gases frecuentes' },
      { value: 'pesadez', label: 'Pesadez después de comer' },
      { value: 'estrenimiento', label: 'Estreñimiento' },
      { value: 'panza_dura', label: 'Panza dura al final del día' },
      { value: 'eructos', label: 'Eructos constantes' },
      { value: 'fatiga', label: 'Cansancio después de comer' },
    ],
  },

  // 8 — Qué empeora (multi)
  {
    type: 'question',
    id: 'que_empeora',
    question: '¿Qué sentís que empeora tu hinchazón?',
    subtitle: 'Elegí todas las que apliquen.',
    multiple: true,
    options: [
      { value: 'harinas', label: 'Pan, pastas, harinas' },
      { value: 'lacteos', label: 'Lácteos' },
      { value: 'estres', label: 'El estrés' },
      { value: 'cena_tarde', label: 'Cenar tarde' },
      { value: 'no_se', label: 'No sé, me pasa con todo' },
      { value: 'verduras', label: 'Algunas verduras (brócoli, coliflor)' },
    ],
  },

  // 9 — SOCIAL PROOF #3 (testimonial card)
  {
    type: 'social_proof',
    id: 'social_3',
    number: '¡Te entendemos!',
    text: 'Miles de mujeres como vos encontraron la solución con nuestro protocolo personalizado. Menos estrés, mejores resultados.',
    testimonials: [
      { quote: 'Al día 4 ya no me cerraba el jean. No lo podía creer.', author: 'Anabela, 41 · Buenos Aires' },
      { quote: 'En 7 días entendí cuál era el alimento que me inflamaba hace años.', author: 'Lucía, 38 · Córdoba' },
    ],
  },

  // 10 — Qué probó (multi)
  {
    type: 'question',
    id: 'ya_probo',
    question: '¿Qué probaste para solucionarlo?',
    subtitle: 'Marcá todo lo que aplique.',
    multiple: true,
    options: [
      { value: 'dietas', label: 'Dietas restrictivas (keto, ayuno, detox)' },
      { value: 'infusiones', label: 'Té de boldo, manzanilla, infusiones' },
      { value: 'suplementos', label: 'Suplementos / probióticos' },
      { value: 'sin_gluten', label: 'Eliminé gluten o lactosa' },
      { value: 'medico', label: 'Fui al médico o nutricionista' },
      { value: 'nada', label: 'Nada todavía' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 2: "Hábitos y causas"
  // ═══════════════════════════════════════════════════════════════════════════

  // 11 — Impacto emocional
  {
    type: 'question',
    id: 'impacto_emocional',
    question: '¿Cómo te hace sentir tener la panza hinchada?',
    multiple: false,
    options: [
      { value: 'insegura', label: 'Insegura con mi cuerpo' },
      { value: 'frustrada', label: 'Frustrada porque nada funciona' },
      { value: 'avergonzada', label: 'Avergonzada en lo social' },
      { value: 'cansada', label: 'Cansada y pesada todo el día' },
      { value: 'todas', label: 'Todas las anteriores' },
    ],
  },

  // 12 — Impacto social
  {
    type: 'question',
    id: 'impacto_social',
    question: '¿Evitás situaciones sociales por la hinchazón?',
    multiple: false,
    options: [
      { value: 'si_mucho', label: 'Sí, bastante seguido' },
      { value: 'a_veces', label: 'A veces evito salir o ponerme cierta ropa' },
      { value: 'poco', label: 'Casi nunca, pero me incomoda' },
      { value: 'no', label: 'No, no me afecta socialmente' },
    ],
  },

  // 13 — INFO CARD: Las 3 causas
  {
    type: 'info_card',
    id: 'info_causas',
    title: 'La hinchazón crónica NO es normal',
    body: 'La ciencia identifica 3 causas principales: disbiosis intestinal (desequilibrio de bacterias), alimentos inflamatorios ocultos en tu dieta diaria, y desregulación del eje intestino-cerebro por estrés. Las 3 se corrigen con un protocolo alimenticio de 7 días.',
    source: 'Cleveland Clinic — Bloated Stomach, 2023',
    ctaLabel: 'Entendido',
  },

  // 14 — Conocimiento microbiota
  {
    type: 'question',
    id: 'conocimiento_microbiota',
    question: '¿Sabías que el 73% de las mujeres confunde inflamación con grasa?',
    subtitle: 'Investigación Journal of Gastroenterology, 2023',
    multiple: false,
    options: [
      { value: 'no_sabia', label: 'No, no tenía idea' },
      { value: 'sospechaba', label: 'Algo sospechaba' },
      { value: 'si', label: 'Sí, ya lo sabía' },
    ],
  },

  // 15 — Dieta actual
  {
    type: 'question',
    id: 'dieta_actual',
    question: '¿Cómo describirías tu alimentación actual?',
    multiple: false,
    options: [
      { value: 'variada', label: 'Variada, como de todo' },
      { value: 'restrictiva', label: 'Restrictiva, evito muchas cosas' },
      { value: 'desordenada', label: 'Desordenada, sin horarios fijos' },
      { value: 'saludable', label: 'Bastante saludable pero igual me hincho' },
    ],
  },

  // 16 — Agua
  {
    type: 'question',
    id: 'habitos_agua',
    question: '¿Cuánta agua tomás por día?',
    multiple: false,
    options: [
      { value: 'menos_1l', label: 'Menos de 1 litro' },
      { value: '1_2l', label: 'Entre 1 y 2 litros' },
      { value: 'mas_2l', label: 'Más de 2 litros' },
      { value: 'no_se', label: 'No llevo la cuenta' },
    ],
  },

  // 17 — Estrés
  {
    type: 'question',
    id: 'estres',
    question: '¿Cómo calificarías tu nivel de estrés?',
    subtitle: 'El estrés activa directamente la inflamación intestinal.',
    multiple: false,
    options: [
      { value: 'alto', label: 'Alto — me estreso casi todos los días' },
      { value: 'moderado', label: 'Moderado — tengo momentos de calma' },
      { value: 'bajo', label: 'Bajo — me siento bastante tranquila' },
    ],
  },

  // 18 — Sueño
  {
    type: 'question',
    id: 'sueno',
    question: '¿Cómo dormís normalmente?',
    multiple: false,
    options: [
      { value: 'mal', label: 'Mal — me cuesta dormir o me despierto' },
      { value: 'regular', label: 'Regular — 5 a 6 horas' },
      { value: 'bien', label: 'Bien — 7+ horas, descanso bien' },
    ],
  },

  // 19 — Ejercicio
  {
    type: 'question',
    id: 'ejercicio',
    question: '¿Hacés actividad física regularmente?',
    multiple: false,
    options: [
      { value: 'no', label: 'No, muy sedentaria' },
      { value: 'poco', label: '1-2 veces por semana' },
      { value: 'regular', label: '3-4 veces por semana' },
      { value: 'mucho', label: 'Casi todos los días' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 3: "Tu plan ideal"
  // ═══════════════════════════════════════════════════════════════════════════

  // 20 — Estrategias de interés (multi)
  {
    type: 'question',
    id: 'estrategias_interes',
    question: '¿Qué te gustaría aprender más?',
    subtitle: 'Elegí todas las que te interesen.',
    multiple: true,
    options: [
      { value: 'alimentos', label: 'Qué alimentos me inflaman' },
      { value: 'recetas', label: 'Recetas antiinflamatorias fáciles' },
      { value: 'rutina', label: 'Rutina matutina para deshinchar' },
      { value: 'suplementos', label: 'Suplementos que funcionan' },
      { value: 'estres', label: 'Manejar el estrés digestivo' },
    ],
  },

  // 21 — SOCIAL PROOF #4 (diversas, felices)
  {
    type: 'social_proof',
    id: 'social_4',
    number: '¡Estás en el camino correcto!',
    text: 'Mujeres que responden como vos logran sentirse más livianas en menos de 7 días. Ya estás un paso adelante.',
  },

  // 22 — Objetivo
  {
    type: 'question',
    id: 'objetivo',
    question: '¿Qué resultado querés lograr en los próximos 7 días?',
    multiple: false,
    options: [
      { value: 'panza_plana', label: 'Bajar 2-3 cm de panza', emoji: '📏' },
      { value: 'liviana', label: 'Sentirme liviana después de comer', emoji: '🌿' },
      { value: 'digestion', label: 'Mejorar mi digestión', emoji: '✨' },
      { value: 'todo', label: 'Todo lo anterior', emoji: '🎯' },
    ],
  },

  // 23 — Motivación
  {
    type: 'question',
    id: 'motivacion',
    question: '¿Qué tanto te motiva resolver este problema?',
    multiple: false,
    options: [
      { value: 'urgente', label: 'Es urgente, afecta mi día a día' },
      { value: 'importante', label: 'Es importante, quiero resolverlo pronto' },
      { value: 'curioso', label: 'Quiero explorar opciones' },
    ],
  },

  // 24 — Foco
  {
    type: 'question',
    id: 'foco',
    question: '¿Te resulta fácil mantener el foco en un plan?',
    multiple: false,
    options: [
      { value: 'si', label: 'Sí, puedo mantener una rutina' },
      { value: 'mas_o_menos', label: 'Más o menos, a veces me distraigo' },
      { value: 'me_cuesta', label: 'Me cuesta bastante' },
      { value: 'abandono', label: 'Suelo abandonar rápido' },
    ],
  },

  // 25 — PERFIL GENERADO (pantalla de resultado intermedio)
  {
    type: 'profile_result',
    id: 'perfil',
  },

  // 26 — Evento importante
  {
    type: 'question',
    id: 'evento_importante',
    question: '¿Tenés algún evento importante próximamente?',
    subtitle: 'Tener algo concreto es un gran motivador para lograr tu objetivo.',
    multiple: false,
    options: [
      { value: 'cumple', label: 'Cumpleaños' },
      { value: 'vacaciones', label: 'Vacaciones' },
      { value: 'reunion', label: 'Reunión familiar / evento social' },
      { value: 'salud', label: 'Consulta médica' },
      { value: 'no', label: 'No tengo nada especial por ahora' },
    ],
  },

  // 27 — Cuándo evento
  {
    type: 'question',
    id: 'cuando_evento',
    question: '¿Cuándo es tu evento?',
    subtitle: 'Vamos a tener esto en cuenta para tu plan.',
    multiple: false,
    options: [
      { value: 'semana', label: 'En una semana' },
      { value: 'mes', label: 'En un mes' },
      { value: 'meses', label: 'En unos meses' },
      { value: 'anio', label: 'En el próximo año' },
      { value: 'skip', label: 'Saltear este paso' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SECCIÓN 4: "Casi listo"
  // ═══════════════════════════════════════════════════════════════════════════

  // 28 — Tiempo diario
  {
    type: 'question',
    id: 'tiempo_diario',
    question: '¿Cuánto tiempo podés dedicarle al protocolo cada día?',
    multiple: false,
    options: [
      { value: '5min', label: '5 min/día' },
      { value: '10min', label: '10 min/día' },
      { value: '15min', label: '15 min/día' },
      { value: '20min', label: '20 min/día' },
    ],
  },

  // 29 — PLAN SEMANAL (gráfico de progreso)
  {
    type: 'weekly_plan',
    id: 'plan_semanal',
  },

  // 30 — LOADING INTELIGENTE (con micro-preguntas)
  {
    type: 'loading_with_questions',
    id: 'loading_inteligente',
    steps: [
      {
        label: 'Definiendo objetivos',
        question: '¿Estás dispuesta a seguir el plan completo?',
        questionId: 'loading_q1',
      },
      {
        label: 'Analizando causas',
        question: '¿Sabías que ciertos alimentos fermentan en tu intestino y causan hinchazón?',
        questionId: 'loading_q2',
      },
      {
        label: 'Ajustando contenido',
        question: '¿Querés incluir recetas fáciles en tu plan?',
        questionId: 'loading_q3',
      },
    ],
  },

  // 31 — NAME CAPTURE
  { type: 'name_capture', id: 'nombre' },

  // 32 — SALES PAGE (embebida, sin redirect)
  {
    type: 'sales_page',
    id: 'ventas',
  },
];

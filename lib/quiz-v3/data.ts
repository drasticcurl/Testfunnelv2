/**
 * Quiz V3 — Funnel ultra-corto "Chau Hinchazón" para Google Ads.
 *
 * 11 slides: 6 preguntas diagnósticas → email → loading → perfil → plan → venta.
 * Sin social proof intermedios, sin info cards educativas, sin nombre.
 *
 * Pensado para:
 *  - Alto intent (la persona buscó "hinchazón abdominal solución" en Google)
 *  - Poca paciencia (quiere respuesta rápida)
 *  - La venta embebida (como V2) para no romper el flujo
 */

import { SlideV3 } from './types';

export const slidesV3: SlideV3[] = [
  // 0 — Momento del día (diagnóstica directa, sin intro)
  {
    type: 'question',
    id: 'momento_hinchazon',
    question: '¿En qué momento del día se te hincha más la panza?',
    multiple: false,
    options: [
      { value: 'manana', label: 'Apenas me levanto', emoji: '🌅' },
      { value: 'almuerzo', label: 'Después del almuerzo', emoji: '🍽️' },
      { value: 'tarde_noche', label: 'A la tarde / noche', emoji: '🌙' },
      { value: 'todo_el_dia', label: 'Todo el día', emoji: '😩' },
    ],
  },

  // 1 — Tiempo con el problema
  {
    type: 'question',
    id: 'tiempo_con_problema',
    question: '¿Hace cuánto convivís con esta hinchazón?',
    multiple: false,
    options: [
      { value: 'menos_6m', label: 'Menos de 6 meses' },
      { value: '6m_2a', label: 'Entre 6 meses y 2 años' },
      { value: '2a_5a', label: 'Entre 2 y 5 años' },
      { value: 'mas_5a', label: 'Más de 5 años' },
    ],
  },

  // 2 — Síntomas (multi)
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

  // 3 — Qué probó (multi)
  {
    type: 'question',
    id: 'ya_probo',
    question: '¿Qué probaste para solucionarlo?',
    subtitle: 'Marcá todo lo que aplique.',
    multiple: true,
    options: [
      { value: 'dietas', label: 'Dietas restrictivas' },
      { value: 'infusiones', label: 'Infusiones / tés' },
      { value: 'suplementos', label: 'Suplementos / probióticos' },
      { value: 'sin_gluten', label: 'Eliminé gluten o lactosa' },
      { value: 'medico', label: 'Médico o nutricionista' },
      { value: 'nada', label: 'Nada todavía' },
    ],
  },

  // 4 — Impacto emocional (1 sola pregunta)
  {
    type: 'question',
    id: 'impacto_emocional',
    question: '¿Cómo te hace sentir la hinchazón?',
    multiple: false,
    options: [
      { value: 'insegura', label: 'Insegura con mi cuerpo' },
      { value: 'frustrada', label: 'Frustrada porque nada funciona' },
      { value: 'cansada', label: 'Cansada y pesada todo el día' },
      { value: 'todas', label: 'Todas las anteriores' },
    ],
  },

  // 5 — Objetivo
  {
    type: 'question',
    id: 'objetivo',
    question: '¿Qué resultado querés lograr en 7 días?',
    multiple: false,
    options: [
      { value: 'panza_plana', label: 'Deshinchar mi panza', emoji: '📏' },
      { value: 'liviana', label: 'Sentirme liviana después de comer', emoji: '🌿' },
      { value: 'digestion', label: 'Mejorar mi digestión', emoji: '✨' },
      { value: 'todo', label: 'Todo lo anterior', emoji: '🎯' },
    ],
  },

  // 6 — Email capture (sin nombre, mínima fricción)
  { type: 'email_capture', id: 'email' },

  // 7 — Loading rápido (6 seg)
  { type: 'loading', id: 'loading' },

  // 8 — Perfil generado (tipo + severidad + barras)
  { type: 'profile_result', id: 'perfil' },

  // 9 — Plan semanal (gráfico)
  { type: 'weekly_plan', id: 'plan_semanal' },

  // 10 — Sales page embebida
  { type: 'sales_page', id: 'ventas' },
];

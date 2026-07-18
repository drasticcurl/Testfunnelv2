/**
 * Quiz V3 — "Método del Agua de Arroz"
 * 22 slides: hook → diagnóstico → sales page embebida
 */

import { SlideV3 } from './types';

export const slidesV3: SlideV3[] = [
  // ── SLIDE 0: Landing Hook ────────────────────────────────────────────────
  { type: 'landing_hook', id: 'landing_hook' },

  // ── SLIDE 1: Edad (slider) ───────────────────────────────────────────────
  {
    type: 'age_slider', id: 'edad',
    headline: '¿Cuántos años tenés?',
    min: 18, max: 65, defaultValue: 38, unit: 'años',
  },

  // ── SLIDE 2: Tipo de cuerpo ──────────────────────────────────────────────
  {
    type: 'body_type', id: 'tipo_cuerpo',
    headline: '¿Cuál describe mejor tu cuerpo ahora mismo?',
    options: [
      { value: 'en_forma',   label: 'En forma',             imgKey: 'body-en-forma',   emojiFallback: '🧍‍♀️' },
      { value: 'unos_kilos', label: 'Algunos kilos de más', imgKey: 'body-unos-kilos', emojiFallback: '🧍‍♀️' },
      { value: 'sobrepeso',  label: 'Sobrepeso',            imgKey: 'body-sobrepeso',  emojiFallback: '🧍‍♀️' },
      { value: 'plus_size',  label: 'Plus size',            imgKey: 'body-plus-size',  emojiFallback: '🧍‍♀️' },
    ],
  },

  // ── SLIDE 3: Dónde acumula (SINGLE — menos fricción) ─────────────────────
  {
    type: 'question', id: 'donde_acumula',
    question: '¿Dónde acumulás más grasa?',
    subtitle: 'Elegí la zona principal',
    multiple: false,
    options: [
      { value: 'abdomen', label: 'Abdomen / panza',  emoji: '🎯' },
      { value: 'cintura', label: 'Cintura',           emoji: '📏' },
      { value: 'piernas', label: 'Piernas y muslos',  emoji: '🦵' },
      { value: 'brazos',  label: 'Brazos',            emoji: '💪' },
      { value: 'espalda', label: 'Espalda',           emoji: '🧍‍♀️' },
      { value: 'cara',    label: 'Cara / papada',     emoji: '😊' },
    ],
  },

  // ── SLIDE 4: Noticia viral ───────────────────────────────────────────────
  { type: 'viral_news', id: 'viral_news' },

  // ── SLIDE 5: Nombre (después de 4 respuestas — usuario ya comprometido) ──
  { type: 'name_capture', id: 'nombre' },

  // ── SLIDE 6: Cómo afecta (usa {nombre}) ─────────────────────────────────
  {
    type: 'question', id: 'como_afecta',
    question: '¿Cómo afecta la panza en tu vida diaria?',
    multiple: false,
    options: [
      { value: 'ropa',       label: 'Me cuesta encontrar ropa que me quede bien' },
      { value: 'autoestima', label: 'Afecta mi autoestima y seguridad' },
      { value: 'salud',      label: 'Me preocupa mi salud a largo plazo' },
      { value: 'funcional',  label: 'Me impide hacer cosas que disfruto' },
    ],
  },

  // ── SLIDE 7: Probaste antes (reemplaza "conforme panza" — agita fracasos) ──
  {
    type: 'question', id: 'conforme_panza',
    question: '¿Probaste antes métodos o dietas para bajar de peso sin resultados duraderos?',
    multiple: false,
    options: [
      { value: 'si_muchas',  label: 'Sí, probé muchas cosas y ninguna funcionó', emoji: '😤' },
      { value: 'si_alguna',  label: 'Sí, algunas funcionaron pero volví a subir', emoji: '😞' },
      { value: 'pocas',      label: 'Pocas veces, no sé bien por dónde empezar',  emoji: '🤔' },
      { value: 'primera_vez',label: 'Es la primera vez que pruebo algo así',       emoji: '✨' },
    ],
  },

  // ── SLIDE 8: Qué te impide (multi) ──────────────────────────────────────
  {
    type: 'question', id: 'impide_deshincharse',
    question: '¿Qué te impide deshincharte y bajar de peso?',
    subtitle: 'Marcá todo lo que aplique',
    multiple: true,
    options: [
      { value: 'ansiedad_comida',   label: 'Ansiedad por la comida' },
      { value: 'falta_tiempo',      label: 'Falta de tiempo' },
      { value: 'metabolismo_lento', label: 'Metabolismo lento' },
      { value: 'falta_motivacion',  label: 'Falta de motivación / constancia' },
      { value: 'dietas_aburridas',  label: 'Dietas aburridas o muy restrictivas' },
      { value: 'retencion',         label: 'Retención de líquidos' },
    ],
  },

  // ── SLIDE 9: No es tu culpa (validación emocional) ───────────────────────
  {
    type: 'question', id: 'no_es_tu_culpa',
    question: '¿Estás de acuerdo con la Lic. Natalia en que el fracaso de las dietas anteriores NO ES TU CULPA?',
    subtitle: 'Es una respuesta biológica que se puede corregir con el método correcto',
    multiple: false,
    options: [
      { value: 'totalmente', label: '😍 ¡Totalmente! Siempre me culpo y me frustra' },
      { value: 'en_parte',   label: '🤔 En parte... pero siento que algo en mi cuerpo no funciona bien' },
      { value: 'no_sabia',   label: '😥 No lo sabía... siempre pensé que era yo el problema' },
    ],
  },

  // ── SLIDE 10: Qué querés lograr (multi — opciones principales primero) ────
  {
    type: 'question', id: 'que_queres_lograr',
    question: '¿Qué querés lograr?',
    subtitle: 'Podés elegir más de una',
    multiple: true,
    options: [
      { value: 'bajar_peso',  label: 'Bajar de peso de forma saludable' },
      { value: 'deshinchar',  label: 'Deshinchar la panza' },
      { value: 'seguridad',   label: 'Sentirme más segura con mi cuerpo' },
      { value: 'energia',     label: 'Tener más energía durante el día' },
      { value: 'digestion',   label: 'Mejorar mi digestión' },
      { value: 'piel',        label: 'Mejorar mi piel' },
    ],
  },

  // ── SLIDE 11: Peso actual (slider) ───────────────────────────────────────
  {
    type: 'number_slider', id: 'peso_actual',
    headline: '¿Cuánto pesás actualmente?',
    min: 40, max: 150, defaultValue: 72, unit: 'kg',
  },

  // ── SLIDE 12: Altura (slider) ────────────────────────────────────────────
  {
    type: 'number_slider', id: 'altura',
    headline: '¿Cuánto medís?',
    min: 140, max: 190, defaultValue: 163, unit: 'cm',
  },

  // ── SLIDE 13: Peso deseado (slider) ──────────────────────────────────────
  // min/max/default reales se calculan dinámicamente en SlideNumberSlider
  // según el peso actual (default = actual-10, min = actual-30, max = actual).
  {
    type: 'number_slider', id: 'peso_deseado',
    headline: '¿Cuál es tu peso ideal?',
    min: 40, max: 150, defaultValue: 62, unit: 'kg',
  },

  // ── SLIDE 14: Embarazos ───────────────────────────────────────────────────
  {
    type: 'question', id: 'embarazos',
    question: '¿Cuántos embarazos tuviste?',
    multiple: false,
    options: [
      { value: 'ninguno', label: 'Nunca estuve embarazada' },
      { value: '1',       label: '1 embarazo' },
      { value: '2',       label: '2 embarazos' },
      { value: '3_mas',   label: '3 o más embarazos' },
    ],
  },

  // ── SLIDE 15: Rutina diaria ───────────────────────────────────────────────
  {
    type: 'question', id: 'rutina_diaria',
    question: '¿Cómo es tu rutina diaria?',
    multiple: false,
    options: [
      { value: 'sedentaria',  label: 'Sedentaria (trabajo de oficina/casa)' },
      { value: 'poco_activa', label: 'Poco activa (camino un poco)' },
      { value: 'moderada',    label: 'Moderadamente activa' },
      { value: 'muy_activa',  label: 'Muy activa (ejercicio regular)' },
    ],
  },

  // ── SLIDE 16: Horas de sueño ──────────────────────────────────────────────
  {
    type: 'question', id: 'horas_sueno',
    question: '¿Cuántas horas dormís por noche?',
    multiple: false,
    options: [
      { value: 'menos_5h', label: 'Menos de 5 horas' },
      { value: '5_6h',     label: '5 a 6 horas' },
      { value: '7_8h',     label: '7 a 8 horas' },
      { value: 'mas_8h',   label: 'Más de 8 horas' },
    ],
  },

  // ── SLIDE 17: Agua por día ────────────────────────────────────────────────
  {
    type: 'question', id: 'agua_dia',
    question: '¿Cuánta agua tomás por día?',
    multiple: false,
    options: [
      { value: 'menos_1l', label: 'Menos de 1 litro' },
      { value: '1_2l',     label: '1 a 2 litros' },
      { value: '2_3l',     label: '2 a 3 litros' },
      { value: 'mas_3l',   label: 'Más de 3 litros' },
    ],
  },

  // ── SLIDE 18: Expert Bridge ───────────────────────────────────────────────
  { type: 'expert_bridge', id: 'expert_bridge' },

  // ── SLIDE 19: Diagnóstico ─────────────────────────────────────────────────
  { type: 'diagnosis_result', id: 'diagnosis_result' },

  // ── SLIDE 20: Loading ─────────────────────────────────────────────────────
  { type: 'loading_steps', id: 'loading_steps' },

  // ── SLIDE 21: Sales Page ──────────────────────────────────────────────────
  { type: 'sales_page', id: 'sales_page' },
];

// Slides que NO muestran progress bar
export const SLIDES_WITHOUT_PROGRESS = new Set([
  'landing_hook',
  'expert_bridge',
  'diagnosis_result',
  'loading_steps',
  'sales_page',
]);

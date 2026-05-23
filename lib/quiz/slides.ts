import { SlideDefinition } from '@/lib/types';

/**
 * Quiz Corto (Google Ads) — 10-12 slides
 * Alto intent, directo al grano
 */
export const slidesCorto: SlideDefinition[] = [
  {
    id: 'genero',
    type: 'gender',
    question: '¿Con cuál te identificás?',
    options: [
      { id: 'hombre', label: 'Hombre', emoji: '👨' },
      { id: 'mujer', label: 'Mujer', emoji: '👩' },
    ],
  },
  {
    id: 'problema_principal',
    type: 'single',
    question: '¿Cuál es tu problema principal con el sueño?',
    subtitle: 'Elegí el que más te identifique',
    options: [
      { id: 'no_duermo', label: 'No puedo dormirme, mi cabeza no para', emoji: '🧠' },
      { id: 'me_despierto', label: 'Me despierto de noche y no vuelvo a dormir', emoji: '⏰' },
      { id: 'no_descanso', label: 'Duermo pero me levanto destruido/a', emoji: '🧟' },
      { id: 'sin_horario', label: 'Mi horario de sueño es un desastre', emoji: '🔄' },
    ],
  },
  {
    id: 'duracion',
    type: 'single',
    question: '¿Hace cuánto tenés este problema?',
    options: [
      { id: 'menos_1_mes', label: 'Menos de 1 mes' },
      { id: '1_6_meses', label: '1 a 6 meses' },
      { id: '6m_2_anios', label: '6 meses a 2 años' },
      { id: 'mas_2_anios', label: 'Más de 2 años' },
    ],
  },
  {
    id: 'pantalla',
    type: 'single',
    question: '¿Usás pantalla en la última hora antes de dormir?',
    subtitle: 'Celular, tablet, computadora o TV',
    options: [
      { id: 'siempre', label: 'Sí, siempre', emoji: '📱' },
      { id: 'a_veces', label: 'A veces' },
      { id: 'no', label: 'No, casi nunca' },
    ],
  },
  {
    id: 'intentos',
    type: 'multi',
    question: '¿Qué probaste ya para dormir mejor?',
    subtitle: 'Podés elegir varias opciones',
    multiSelect: true,
    options: [
      { id: 'melatonina', label: 'Melatonina' },
      { id: 'infusiones', label: 'Infusiones / tés' },
      { id: 'apps', label: 'Apps de meditación' },
      { id: 'pastillas', label: 'Pastillas recetadas' },
      { id: 'nada', label: 'Nada todavía' },
    ],
  },
  {
    id: 'impacto_hombre',
    type: 'single',
    question: '¿Dormir mal afecta más tu rendimiento laboral o tu humor?',
    genderSpecific: 'hombre',
    options: [
      { id: 'rendimiento', label: 'Mi rendimiento laboral', emoji: '💼' },
      { id: 'humor', label: 'Mi humor / irritabilidad', emoji: '😤' },
      { id: 'ambos', label: 'Las dos cosas', emoji: '😩' },
    ],
  },
  {
    id: 'impacto_mujer',
    type: 'single',
    question: '¿Tu problema de sueño empeora con tu ciclo hormonal o en momentos de estrés emocional?',
    genderSpecific: 'mujer',
    options: [
      { id: 'ciclo', label: 'Sí, con mi ciclo hormonal', emoji: '🌙' },
      { id: 'estres', label: 'Sí, con el estrés emocional', emoji: '💭' },
      { id: 'ambos', label: 'Las dos cosas', emoji: '😔' },
      { id: 'no_relacion', label: 'No noto relación', emoji: '🤷‍♀️' },
    ],
  },
  {
    id: 'objetivo',
    type: 'single',
    question: '¿Qué resultado querés lograr?',
    options: [
      { id: 'dormirme_rapido', label: 'Dormirme rápido al acostarme', emoji: '😴' },
      { id: 'no_despertarme', label: 'No despertarme de noche', emoji: '🌙' },
      { id: 'energia', label: 'Levantarme con energía real', emoji: '⚡' },
      { id: 'horario', label: 'Tener un horario regular de sueño', emoji: '🕐' },
    ],
  },
  {
    id: 'email',
    type: 'email',
    question: 'Ingresá tu email para ver tu resultado personalizado',
    subtitle: 'Te vamos a mostrar tu perfil de sueño y un plan para mejorarlo',
  },
  {
    id: 'loading',
    type: 'loading',
  },
  {
    id: 'resultado',
    type: 'result',
  },
  {
    id: 'sales',
    type: 'sales',
  },
];

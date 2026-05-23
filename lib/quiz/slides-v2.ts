import { SlideDefinition } from '@/lib/types';

/**
 * Quiz Largo (Facebook Ads) — 18-22 slides
 * Social proof + info cards intercaladas, construye conciencia
 */
export const slidesLargo: SlideDefinition[] = [
  {
    id: 'edad',
    type: 'single',
    question: '¿Cuántos años tenés?',
    subtitle: 'Esto nos ayuda a personalizar tu protocolo',
    options: [
      { id: '25_34', label: '25 - 34 años' },
      { id: '35_44', label: '35 - 44 años' },
      { id: '45_54', label: '45 - 54 años' },
      { id: '55_plus', label: '55 o más' },
    ],
  },
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
    id: 'info_card_1',
    type: 'info_card',
    infoContent: {
      title: '¿Sabías que...?',
      body: '1 de cada 3 argentinos duerme mal de forma crónica. El insomnio no tratado acelera el envejecimiento celular hasta 3 veces más rápido.',
      icon: '🧬',
    },
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
    id: 'hora_acostarse',
    type: 'single',
    question: '¿A qué hora te acostás normalmente?',
    options: [
      { id: 'antes_22', label: 'Antes de las 22:00' },
      { id: '22_23', label: 'Entre 22:00 y 23:00' },
      { id: '23_00', label: 'Entre 23:00 y 00:00' },
      { id: 'despues_00', label: 'Después de medianoche' },
    ],
  },
  {
    id: 'horas_sueno',
    type: 'single',
    question: '¿Cuántas horas dormís en promedio por noche?',
    options: [
      { id: 'menos_5', label: 'Menos de 5 horas', emoji: '😰' },
      { id: '5_6', label: '5 a 6 horas', emoji: '😴' },
      { id: '6_7', label: '6 a 7 horas', emoji: '😐' },
      { id: 'mas_7', label: 'Más de 7 horas', emoji: '🤔' },
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
    id: 'cafe',
    type: 'single',
    question: '¿Tomás café o mate después de las 14hs?',
    options: [
      { id: 'si_siempre', label: 'Sí, todos los días', emoji: '☕' },
      { id: 'a_veces', label: 'A veces' },
      { id: 'no', label: 'No, nunca después de esa hora' },
    ],
  },
  {
    id: 'actividad_fisica',
    type: 'single',
    question: '¿Hacés actividad física?',
    options: [
      { id: 'regular', label: 'Sí, de forma regular (3+ veces/semana)', emoji: '🏃' },
      { id: 'a_veces', label: 'A veces (1-2 veces/semana)' },
      { id: 'no', label: 'No, casi nunca', emoji: '🛋️' },
    ],
  },
  {
    id: 'info_card_2',
    type: 'info_card',
    infoContent: {
      title: 'Tu cerebro se limpia de noche',
      body: 'Durante el sueño profundo, tu cerebro elimina proteínas tóxicas acumuladas durante el día. Sin sueño de calidad, estas toxinas se acumulan y afectan tu memoria, concentración y estado de ánimo.',
      icon: '🧠',
    },
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
    id: 'emocional',
    type: 'single',
    question: '¿Cómo te afecta dormir mal en tu día a día?',
    subtitle: 'Elegí lo que más sentís',
    options: [
      { id: 'humor', label: 'Me arruina el humor', emoji: '😤' },
      { id: 'rendimiento', label: 'No rindo en nada', emoji: '📉' },
      { id: 'envejecimiento', label: 'Me siento viejo/a', emoji: '👴' },
      { id: 'todas', label: 'Todas las anteriores', emoji: '😩' },
    ],
  },
  {
    id: 'social_proof',
    type: 'social_proof',
    testimonial: {
      name: 'Carolina',
      age: 42,
      text: 'Llevaba 3 años durmiendo mal. En la noche 4 del protocolo ya noté un cambio enorme. Ahora me duermo en 15 minutos.',
    },
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
    id: 'nombre',
    type: 'name',
    question: '¿Cómo te llamás?',
    subtitle: 'Para personalizar tu protocolo de sueño',
  },
  {
    id: 'email',
    type: 'email',
    question: 'Ingresá tu email para ver tu perfil de sueño',
    subtitle: 'Vamos a generarte un análisis personalizado',
  },
  {
    id: 'loading',
    type: 'loading',
  },
  {
    id: 'profile',
    type: 'profile',
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

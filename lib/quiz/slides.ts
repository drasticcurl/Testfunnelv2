import { SlideDefinition } from '@/lib/types';

/**
 * Quiz Corto (Google Ads) — 14-16 slides
 * Alto intent, directo pero con social proof intercalado y educación
 * Estructura: Perfil → Diagnóstico → Plan ideal → Resultado → Sales
 */
export const slidesCorto: SlideDefinition[] = [
  // === SECCIÓN 1: Tu perfil de sueño (0-5) ===
  {
    id: 'genero',
    type: 'gender',
    question: '¿Con cuál te identificás?',
    subtitle: 'Para personalizar tu protocolo de sueño',
    options: [
      { id: 'hombre', label: 'Hombre', emoji: '👨' },
      { id: 'mujer', label: 'Mujer', emoji: '👩' },
    ],
  },
  {
    id: 'problema_principal',
    type: 'single',
    question: '¿Cuál es tu mayor problema con el sueño?',
    subtitle: 'Esta respuesta define tu tipo de insomnio',
    options: [
      { id: 'no_duermo', label: 'No puedo dormirme, mi cabeza no para', emoji: '🧠' },
      { id: 'me_despierto', label: 'Me despierto de madrugada y no vuelvo a dormir', emoji: '⏰' },
      { id: 'no_descanso', label: 'Duermo las horas pero me levanto destruido/a', emoji: '🧟' },
      { id: 'sin_horario', label: 'No tengo horario fijo, mi sueño es un caos', emoji: '🔄' },
    ],
  },
  {
    id: 'frecuencia',
    type: 'single',
    question: '¿Con qué frecuencia te pasa esto?',
    subtitle: 'Dormir mal más de 3 noches por semana ya se considera insomnio clínico',
    options: [
      { id: 'todas', label: 'Todas o casi todas las noches', emoji: '😩' },
      { id: '3_5', label: '3 a 5 noches por semana' },
      { id: '1_2', label: '1 a 2 noches por semana' },
      { id: 'ocasional', label: 'Ocasionalmente (algunas veces al mes)' },
    ],
  },
  {
    id: 'social_proof_1',
    type: 'social_proof',
    testimonial: {
      name: 'Martín',
      age: 42,
      text: 'Llevaba 4 años sin dormir una noche completa. En la noche 3 del protocolo algo cambió. Ahora duermo de corrido casi todas las noches.',
    },
  },
  {
    id: 'duracion',
    type: 'single',
    question: '¿Hace cuánto tenés este problema?',
    subtitle: 'Cuanto más tiempo lleves, más urgente es tratarlo — pero también más posibilidad de mejora rápida',
    options: [
      { id: 'menos_1_mes', label: 'Menos de 1 mes' },
      { id: '1_6_meses', label: '1 a 6 meses' },
      { id: '6m_2_anios', label: '6 meses a 2 años' },
      { id: 'mas_2_anios', label: 'Más de 2 años' },
    ],
  },
  {
    id: 'intentos',
    type: 'multi',
    question: '¿Qué probaste ya para dormir mejor?',
    subtitle: 'El 80% de estas soluciones tratan el síntoma, no la causa',
    multiSelect: true,
    options: [
      { id: 'melatonina', label: 'Melatonina' },
      { id: 'infusiones', label: 'Infusiones / tés' },
      { id: 'apps', label: 'Apps de meditación' },
      { id: 'pastillas', label: 'Pastillas recetadas' },
      { id: 'nada', label: 'Nada todavía' },
    ],
  },

  // === SECCIÓN 2: Hábitos y causas (6-10) ===
  {
    id: 'info_card_1',
    type: 'info_card',
    infoContent: {
      title: 'Dormir mal no es normal',
      body: 'Tu cuerpo tiene un sistema de sueño que se puede reparar. El problema no sos vos — es que nadie te enseñó cómo funciona tu reloj biológico.',
      icon: '💡',
    },
  },
  {
    id: 'pantalla',
    type: 'single',
    question: '¿Usás pantalla en la última hora antes de dormir?',
    subtitle: 'La luz azul suprime la producción de melatonina hasta 3 horas',
    options: [
      { id: 'siempre', label: 'Sí, siempre', emoji: '📱' },
      { id: 'a_veces', label: 'A veces' },
      { id: 'no', label: 'No, casi nunca' },
    ],
  },
  {
    id: 'impacto_hombre',
    type: 'single',
    question: '¿Cómo te afecta dormir mal en tu día a día?',
    subtitle: 'El sueño deficiente reduce el rendimiento cognitivo tanto como el alcohol',
    genderSpecific: 'hombre',
    options: [
      { id: 'rendimiento', label: 'No rindo en el trabajo', emoji: '💼' },
      { id: 'humor', label: 'Estoy irritable todo el día', emoji: '😤' },
      { id: 'fisico', label: 'Me siento viejo y sin energía', emoji: '😩' },
      { id: 'todo', label: 'Todo lo anterior', emoji: '💀' },
    ],
  },
  {
    id: 'impacto_mujer',
    type: 'single',
    question: '¿Cómo te afecta dormir mal en tu día a día?',
    subtitle: 'La falta de sueño desregula las hormonas del hambre, el humor y la energía',
    genderSpecific: 'mujer',
    options: [
      { id: 'ansiedad', label: 'Ansiedad y carga mental que no para', emoji: '💭' },
      { id: 'agotamiento', label: 'Agotamiento constante', emoji: '😩' },
      { id: 'humor', label: 'Irritabilidad con mi familia', emoji: '😤' },
      { id: 'todo', label: 'Todo lo anterior', emoji: '💀' },
    ],
  },
  {
    id: 'objetivo',
    type: 'single',
    question: '¿Qué resultado querés lograr en 7 días?',
    subtitle: 'Tu respuesta define el enfoque de tu protocolo personalizado',
    options: [
      { id: 'dormirme_rapido', label: 'Dormirme en menos de 15 minutos', emoji: '😴' },
      { id: 'no_despertarme', label: 'Dormir de corrido toda la noche', emoji: '🌙' },
      { id: 'energia', label: 'Levantarme con energía real', emoji: '⚡' },
      { id: 'horario', label: 'Tener un horario regular', emoji: '🕐' },
    ],
  },

  // === SECCIÓN 3: Resultado y transición (11-15) ===
  {
    id: 'compromiso',
    type: 'single',
    question: '¿Podés dedicarle 15 minutos antes de dormir?',
    subtitle: 'Es todo lo que necesitás. Sin pastillas, sin apps complicadas.',
    options: [
      { id: 'si', label: 'Sí, sin problema', emoji: '✅' },
      { id: 'lo_intento', label: 'Lo intento', emoji: '🤔' },
      { id: 'depende', label: 'Depende el día', emoji: '📅' },
    ],
  },
  {
    id: 'email',
    type: 'email',
    question: 'Ingresá tu email para generar tu diagnóstico',
    subtitle: 'Te vamos a mostrar tu tipo de insomnio, severidad y un plan personalizado',
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
    id: 'plan_preview',
    type: 'plan_preview',
  },
  {
    id: 'sales',
    type: 'sales',
  },
];

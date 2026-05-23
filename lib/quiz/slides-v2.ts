import { SlideDefinition } from '@/lib/types';

/**
 * Quiz Largo (Facebook Ads) — 26-28 slides
 * Social proof intercalado, educación, checkpoint, plan preview borroso
 * Estructura basada en: micro-compromisos escalados + rewards intermedios
 */
export const slidesLargo: SlideDefinition[] = [
  // ═══════ SECCIÓN 1: "Tu perfil de sueño" (0-10) ═══════
  // Objetivo: Enganchar, identificar con el problema, clasificar tipo
  {
    id: 'edad',
    type: 'single',
    question: '¿Cuántos años tenés?',
    subtitle: 'Tu edad afecta directamente cómo produce melatonina tu cuerpo',
    options: [
      { id: '25_34', label: '25 - 34' },
      { id: '35_44', label: '35 - 44' },
      { id: '45_54', label: '45 - 54' },
      { id: '55_plus', label: '55+' },
    ],
  },
  {
    id: 'genero',
    type: 'gender',
    question: '¿Con cuál te identificás?',
    subtitle: 'Los protocolos de sueño funcionan diferente según el perfil hormonal',
    options: [
      { id: 'hombre', label: 'Hombre', emoji: '👨' },
      { id: 'mujer', label: 'Mujer', emoji: '👩' },
    ],
  },
  {
    id: 'social_proof_1',
    type: 'social_proof',
    testimonial: {
      name: 'Carolina',
      age: 38,
      text: 'Pensé que era normal dormir mal. Después del protocolo entendí que llevaba años con el sistema de sueño desregulado. En una semana cambió todo.',
    },
  },
  {
    id: 'problema_principal',
    type: 'single',
    question: '¿Cuál es tu mayor problema con el sueño?',
    subtitle: 'Esta respuesta define tu tipo de insomnio — es la más importante',
    options: [
      { id: 'no_duermo', label: 'No puedo dormirme, mi mente no para', emoji: '🧠' },
      { id: 'me_despierto', label: 'Me despierto a las 2-4am y no vuelvo', emoji: '⏰' },
      { id: 'no_descanso', label: 'Duermo las horas pero no descanso', emoji: '🧟' },
      { id: 'sin_horario', label: 'No tengo horario, mi ritmo está roto', emoji: '🔄' },
    ],
  },
  {
    id: 'frecuencia',
    type: 'single',
    question: '¿Con qué frecuencia te pasa?',
    subtitle: 'Más de 3 noches por semana ya es insomnio clínico según la OMS',
    options: [
      { id: 'todas', label: 'Todas o casi todas las noches', emoji: '😩' },
      { id: '3_5', label: '3 a 5 noches por semana' },
      { id: '1_2', label: '1 a 2 noches por semana' },
      { id: 'ocasional', label: 'Ocasionalmente' },
    ],
  },
  {
    id: 'duracion',
    type: 'single',
    question: '¿Hace cuánto venís durmiendo mal?',
    subtitle: 'Cuanto más tiempo lleves, más arraigado está el patrón — pero también se resetea rápido con el método correcto',
    options: [
      { id: 'menos_1_mes', label: 'Menos de 1 mes' },
      { id: '1_6_meses', label: '1 a 6 meses' },
      { id: '6m_2_anios', label: '6 meses a 2 años' },
      { id: 'mas_2_anios', label: 'Más de 2 años' },
    ],
  },
  {
    id: 'sintomas',
    type: 'multi',
    question: '¿Qué síntomas tenés durante el día?',
    subtitle: 'Cada síntoma que marcás es una señal de que tu sistema de sueño necesita un reset',
    multiSelect: true,
    options: [
      { id: 'cansancio', label: 'Cansancio constante', emoji: '😴' },
      { id: 'concentracion', label: 'Falta de concentración', emoji: '🧠' },
      { id: 'irritabilidad', label: 'Irritabilidad', emoji: '😤' },
      { id: 'ansiedad', label: 'Ansiedad', emoji: '💭' },
      { id: 'dolor_cabeza', label: 'Dolor de cabeza', emoji: '🤕' },
      { id: 'hambre', label: 'Hambre excesiva / antojos', emoji: '🍫' },
    ],
  },
  {
    id: 'social_proof_2',
    type: 'social_proof',
    testimonial: {
      name: 'Martín',
      age: 45,
      text: 'Me despertaba a las 3am todas las noches desde hace 2 años. El protocolo me enseñó que mi cortisol estaba desregulado. En 5 noches ya dormía de corrido.',
    },
  },
  {
    id: 'causas',
    type: 'multi',
    question: '¿Qué creés que te impide dormir bien?',
    subtitle: 'Identificar la causa es el primer paso. El 70% de las personas atribuyen su insomnio a causas incorrectas.',
    multiSelect: true,
    options: [
      { id: 'estres', label: 'Estrés / preocupaciones', emoji: '😰' },
      { id: 'pantalla', label: 'Pantallas antes de dormir', emoji: '📱' },
      { id: 'horarios', label: 'Horarios irregulares', emoji: '🕐' },
      { id: 'cafe', label: 'Cafeína / mate', emoji: '☕' },
      { id: 'ambiente', label: 'Ruido / luz / temperatura', emoji: '🏠' },
      { id: 'no_se', label: 'No sé qué es', emoji: '🤷' },
    ],
  },
  {
    id: 'intentos',
    type: 'multi',
    question: '¿Qué probaste ya?',
    subtitle: 'Si algo no funcionó, no es tu culpa — es que trataba el síntoma, no la causa real',
    multiSelect: true,
    options: [
      { id: 'melatonina', label: 'Melatonina' },
      { id: 'infusiones', label: 'Infusiones / tés' },
      { id: 'apps', label: 'Apps de meditación' },
      { id: 'pastillas', label: 'Pastillas recetadas' },
      { id: 'terapia', label: 'Terapia / psicólogo' },
      { id: 'nada', label: 'Nada todavía' },
    ],
  },

  // ═══════ SECCIÓN 2: "Hábitos y causas" (11-18) ═══════
  // Objetivo: Educar mientras preguntás. Cada subtitle enseña algo.
  {
    id: 'impacto_emocional',
    type: 'single',
    question: '¿Cómo te afecta emocionalmente dormir mal?',
    subtitle: 'El sueño deficiente reduce la regulación emocional un 60% — no es debilidad, es biología',
    options: [
      { id: 'ansiedad', label: 'Me genera ansiedad constante', emoji: '😰' },
      { id: 'humor', label: 'Estoy irritable con todos', emoji: '😤' },
      { id: 'triste', label: 'Me siento triste o sin motivación', emoji: '😔' },
      { id: 'desconexion', label: 'Me siento desconectado/a de todo', emoji: '🫥' },
    ],
  },
  {
    id: 'impacto_hombre',
    type: 'single',
    question: '¿En qué área te afecta más?',
    subtitle: 'Los hombres que duermen menos de 6 horas tienen niveles de testosterona equivalentes a 10 años más',
    genderSpecific: 'hombre',
    options: [
      { id: 'trabajo', label: 'Rendimiento laboral', emoji: '💼' },
      { id: 'fisico', label: 'Rendimiento físico / gym', emoji: '💪' },
      { id: 'relacion', label: 'Relación de pareja', emoji: '❤️' },
      { id: 'todo', label: 'Todas las áreas', emoji: '📉' },
    ],
  },
  {
    id: 'impacto_mujer',
    type: 'single',
    question: '¿En qué área te afecta más?',
    subtitle: 'La falta de sueño desregula estrógeno y progesterona, empeorando síntomas en cada ciclo',
    genderSpecific: 'mujer',
    options: [
      { id: 'ciclo', label: 'Mi ciclo hormonal empeora', emoji: '🌙' },
      { id: 'carga_mental', label: 'Mi carga mental es insostenible', emoji: '🧠' },
      { id: 'piel_peso', label: 'Mi piel/peso se deterioran', emoji: '😔' },
      { id: 'todo', label: 'Todas las áreas', emoji: '📉' },
    ],
  },
  {
    id: 'info_card_1',
    type: 'info_card',
    infoContent: {
      title: 'Tu cuerpo se repara de noche',
      body: 'Durante el sueño profundo, tu cerebro elimina proteínas tóxicas, se consolida la memoria, y se regeneran las células. Sin sueño de calidad, este proceso se detiene. La buena noticia: tu sistema de sueño se puede resetear en 5-7 días.',
      icon: '🧬',
    },
  },
  {
    id: 'pantalla',
    type: 'single',
    question: '¿Usás pantalla en la última hora antes de dormir?',
    subtitle: 'La luz azul suprime la melatonina hasta 3 horas. Un solo scroll puede retrasar tu reloj biológico 90 minutos.',
    options: [
      { id: 'siempre', label: 'Sí, todos los días', emoji: '📱' },
      { id: 'a_veces', label: 'A veces' },
      { id: 'no', label: 'Casi nunca' },
    ],
  },
  {
    id: 'cafe',
    type: 'single',
    question: '¿Tomás café o mate después de las 14hs?',
    subtitle: 'La cafeína tiene una vida media de 5-6 horas. Un café a las 16hs todavía está activo en tu cerebro a las 22hs.',
    options: [
      { id: 'si_siempre', label: 'Sí, todos los días', emoji: '☕' },
      { id: 'a_veces', label: 'A veces' },
      { id: 'no', label: 'No, corto antes de las 14hs' },
    ],
  },
  {
    id: 'hora_acostarse',
    type: 'single',
    question: '¿A qué hora te acostás normalmente?',
    subtitle: 'Tu ventana de sueño ideal cambia según tu cronotipo. Te vamos a ayudar a encontrarla.',
    options: [
      { id: 'antes_22', label: 'Antes de las 22:00' },
      { id: '22_23', label: '22:00 a 23:00' },
      { id: '23_00', label: '23:00 a 00:00' },
      { id: 'despues_00', label: 'Después de medianoche' },
    ],
  },
  {
    id: 'horas_sueno',
    type: 'single',
    question: '¿Cuántas horas dormís por noche?',
    subtitle: 'No siempre es cuántas horas — es la calidad de esas horas lo que importa',
    options: [
      { id: 'menos_5', label: 'Menos de 5 horas', emoji: '😰' },
      { id: '5_6', label: '5 a 6 horas' },
      { id: '6_7', label: '6 a 7 horas' },
      { id: 'mas_7', label: 'Más de 7 horas', emoji: '🤔' },
    ],
  },

  // ═══════ SECCIÓN 3: "Tu plan ideal" (19-25) ═══════
  // Objetivo: Transicionar de diagnóstico a solución. Commitment escalation.
  {
    id: 'social_proof_3',
    type: 'social_proof',
    testimonial: {
      name: 'Anabel',
      age: 52,
      text: 'Probé melatonina, apps, pastillas... nada funcionaba. Este protocolo fue lo primero que atacó la CAUSA real. En 7 noches cambió mi vida.',
    },
  },
  {
    id: 'objetivo',
    type: 'single',
    question: '¿Qué resultado querés lograr en 7 días?',
    subtitle: 'Personas con tu perfil logran mejoras visibles desde la noche 3',
    options: [
      { id: 'dormirme_rapido', label: 'Dormirme en menos de 15 minutos', emoji: '😴' },
      { id: 'no_despertarme', label: 'Dormir de corrido sin despertarme', emoji: '🌙' },
      { id: 'energia', label: 'Levantarme con energía real', emoji: '⚡' },
      { id: 'horario', label: 'Tener horarios regulares', emoji: '🕐' },
    ],
  },
  {
    id: 'urgencia',
    type: 'single',
    question: '¿Qué tan urgente es para vos resolver esto?',
    subtitle: 'No hay respuesta incorrecta — solo nos ayuda a personalizar la intensidad',
    options: [
      { id: 'muy_urgente', label: 'Muy urgente, no aguanto más', emoji: '🔥' },
      { id: 'importante', label: 'Importante, quiero resolverlo ya' },
      { id: 'cuando_pueda', label: 'Me gustaría mejorar cuando pueda' },
    ],
  },
  {
    id: 'compromiso',
    type: 'single',
    question: '¿Podés dedicarle 15 minutos antes de dormir?',
    subtitle: 'Es todo lo que necesita el protocolo. Sin pastillas, sin apps complicadas, sin cambios drásticos.',
    options: [
      { id: 'si', label: 'Sí, 100%', emoji: '✅' },
      { id: 'lo_intento', label: 'Puedo intentarlo', emoji: '🤔' },
      { id: 'poco_tiempo', label: 'Tengo poco tiempo pero quiero probar', emoji: '⏰' },
    ],
  },
  {
    id: 'checkpoint',
    type: 'checkpoint',
    infoContent: {
      title: '¡Tu perfil está casi listo!',
      body: 'Ya tenemos suficiente información para generar tu diagnóstico personalizado. Solo faltan 2 pasos más.',
      icon: '✨',
    },
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
    question: 'Ingresá tu email para ver tu diagnóstico completo',
    subtitle: 'Te mostramos tu tipo de insomnio + un plan de 7 noches diseñado para vos',
  },

  // ═══════ SECCIÓN 4: "Resultado y acción" (26-29) ═══════
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

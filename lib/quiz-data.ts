/**
 * Definicion declarativa de los slides del quiz.
 * Fuente de verdad: docs/_QUIZ-DATA.md
 *
 * REDESIGN v2 — basado en research de Noom, BetterMe, Alen Sultanic
 * (Hidden Architecture), Ryan Levesque (ASK Method) y FunnelOfTheWeek.
 *
 * Cambios vs v1:
 *  - Eliminada `edad` como primera pregunta (era la peor — fría,
 *    demográfica, no abre problem-state). Reemplazada por `apertura`
 *    emocional.
 *  - Síntomas reducidos de 8 a 6 (cabe sin scroll en mobile).
 *  - Eliminada `frecuencia` (redundante con tiempo + síntomas).
 *  - Eliminados los 3 yes-set en fila (`si_natural`, `si_plan_simple`,
 *    `si_ver_plan`) que se sentían manipuladores.
 *  - Agregada `objetivo`: pregunta medible para personalizar resultados.
 *  - Agregada `compromiso`: pregunta de tiempo concreta que no es yes-set.
 *  - Slide nombre = capture obligatorio en slide propio (antes era
 *    opcional escondido en email_capture).
 *  - Email capture = solo email, obligatorio.
 *  - Info card #1 = infografía hardcoded (sin imagen Cloudinary que
 *    puede fallar en 3G LATAM).
 *  - Info card #2 = educational sin claim numérico no demostrable.
 *
 * Mapa actualizado:
 *   0  question:   apertura            (single — emocional)
 *   1  question:   momento_del_dia     (single — define tipo BASE)
 *   2  question:   tiempo_con_problema (single — severidad)
 *   3  info_card:  info_1              (infografía 73%/27% inflamación vs grasa)
 *   4  question:   sintomas            (multi — 6 opciones)
 *   5  question:   ya_probo            (multi)
 *   6  info_card:  info_2_dato         (educacional, sin claim numérico)
 *   7  question:   impacto_emocional   (single)
 *   8  info_card:  info_3              (las 3 causas)
 *   9  name_capture                    (nombre OBLIGATORIO — se siente como 1 pregunta más)
 *   10 question:   objetivo            (single — qué quiere lograr)
 *   11 question:   compromiso          (single — cuánto tiempo dedica)
 *   12 info_card:  info_pre_email      (testimonio motivacional — reduce abandon del email gate)
 *   13 email_capture                   (email OBLIGATORIO, solo 1 campo)
 *   14 loading                         (12s, checkmarks + testimonios)
 */

import { Slide } from './quiz-types';

export const slides: Slide[] = [
  // 0 — APERTURA EMOCIONAL (reemplaza la vieja pregunta de edad)
  // Abre problem-state. La persona "se ve" en una de las opciones y eso
  // valida que está en el lugar correcto.
  {
    type: 'question',
    id: 'apertura',
    question: 'Antes de empezar, ¿qué te trajo hasta acá hoy?',
    multiple: false,
    options: [
      { value: 'panza_todo_dia', label: 'Mi panza está hinchada todo el día', emoji: '😩' },
      { value: 'no_se_que_cae_mal', label: 'No sé qué alimento me cae mal', emoji: '🤔' },
      { value: 'ya_probe_todo', label: 'Ya probé de todo y nada funciona', emoji: '😤' },
      { value: 'comoda_cuerpo', label: 'Quiero sentirme cómoda con mi cuerpo otra vez', emoji: '✨' },
    ],
  },

  // 1 — Pregunta diagnóstica: momento del día (define tipo BASE)
  {
    type: 'question',
    id: 'momento_del_dia',
    question: '¿En qué momento del día notás MÁS la hinchazón?',
    multiple: false,
    options: [
      { value: 'manana', label: 'Apenas me levanto', emoji: '🌅' },
      { value: 'almuerzo', label: 'Después del almuerzo', emoji: '🍽️' },
      { value: 'tarde_noche', label: 'A la tarde / noche', emoji: '🌙' },
      { value: 'todo_el_dia', label: 'Todo el día sin parar', emoji: '😩' },
    ],
  },

  // 2 — Pregunta diagnóstica: tiempo con el problema (severidad)
  {
    type: 'question',
    id: 'tiempo_con_problema',
    question: '¿Hace cuánto tiempo convivís con esta hinchazón?',
    multiple: false,
    options: [
      { value: 'menos_6m', label: 'Menos de 6 meses' },
      { value: '6m_2a', label: 'Entre 6 meses y 2 años' },
      { value: '2a_5a', label: 'Entre 2 y 5 años' },
      { value: 'mas_5a', label: 'Más de 5 años (es mi normal)' },
    ],
  },

  // 3 — INFO CARD #1 (infografía hardcoded — 73% inflamación / 27% grasa)
  // Reemplaza la imagen Cloudinary anterior. Tema: las dietas de peso no
  // resuelven inflamación. Patient education / reframe.
  {
    type: 'info_card',
    id: 'info_1',
    title: '',
    body: '',
    variant: 'infographic',
    infographicKey: 'inflamacion_vs_grasa',
    ctaLabel: 'Continuar',
  },

  // 4 — Pregunta diagnóstica: síntomas (multi, 6 opciones — antes 8)
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
      { value: 'panza_marcada', label: 'Se me marca la panza al final del día' },
      { value: 'eructos', label: 'Eructos constantes' },
      { value: 'fatiga_post_comida', label: 'Cansancio después de comer' },
    ],
  },

  // 5 — Pregunta diagnóstica: qué probó (multi)
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

  // 6 — INFO CARD #2 (educational, SIN claim numérico no demostrable)
  // Reemplaza el viejo "86% reportaron menos hinchazón al día 3" que
  // era un claim suelto sin fuente — riesgo de compliance Meta.
  {
    type: 'info_card',
    id: 'info_2_dato',
    title: 'Lo que pasa adentro de tu intestino',
    body: 'Cuando hay disbiosis (desequilibrio en tu microbiota), las bacterias "malas" producen gases y toxinas que inflaman las paredes del intestino. Esa inflamación se ve por fuera como una panza dura, marcada y pesada — aunque comas poco.',
    source: 'Cleveland Clinic — Bloated Stomach: Causes & When to Be Concerned',
    ctaLabel: 'Continuar',
  },

  // 7 — Pregunta diagnóstica: impacto emocional
  {
    type: 'question',
    id: 'impacto_emocional',
    question: '¿Cómo te hace sentir tener la panza hinchada?',
    multiple: false,
    options: [
      { value: 'insegura', label: 'Insegura con mi cuerpo' },
      { value: 'frustrada', label: 'Frustrada porque ya probé de todo' },
      { value: 'avergonzada', label: 'Avergonzada en lo social' },
      { value: 'cansada', label: 'Cansada físicamente' },
      { value: 'todas', label: 'Todas las anteriores' },
    ],
  },

  // 8 — INFO CARD #3 (educación + autoridad: las 3 causas)
  {
    type: 'info_card',
    id: 'info_3',
    title: 'La hinchazón crónica NO es normal',
    body: 'Estudios recientes la asocian a 3 causas: disbiosis intestinal, alimentos inflamatorios ocultos en tu dieta diaria, y mal funcionamiento del eje intestino-cerebro. Las 3 se corrigen con un protocolo alimenticio específico de 7 días.',
    ctaLabel: 'Ver mi plan personalizado',
  },

  // 9 — CAPTURA NOMBRE (movido acá desde posición 11)
  // Después de info_3 ("las 3 causas") la persona está enganchada con el
  // contenido educativo. "¿Cómo te llamamos?" se siente como una pregunta
  // más, no como un form. Con 2 preguntas de buffer después (objetivo +
  // compromiso), el email queda solo y con menos friction.
  // Bonus: después de dar el nombre, los slides siguientes muestran
  // "Carolina, ya casi tenemos tu plan" como header personalizado.
  { type: 'name_capture', id: 'nombre' },

  // 10 — Pregunta de OBJETIVO (medible — para personalizar /resultados)
  {
    type: 'question',
    id: 'objetivo',
    question: '¿Qué resultado querés lograr en los próximos 7 días?',
    multiple: false,
    options: [
      { value: 'panza_plana', label: 'Bajar 2-3 cm de panza', emoji: '📏' },
      { value: 'liviana', label: 'Sentirme liviana después de comer', emoji: '🌿' },
      { value: 'mejor_digestion', label: 'Mejorar mi digestión en general', emoji: '✨' },
      { value: 'todo', label: 'Todo lo anterior', emoji: '🎯' },
    ],
  },

  // 11 — Pregunta de COMPROMISO (tiempo, no yes-set)
  {
    type: 'question',
    id: 'compromiso',
    question: '¿Cuánto tiempo podés dedicarle al protocolo cada día?',
    subtitle: 'Cualquier respuesta sirve — adaptamos el plan a tu agenda real.',
    multiple: false,
    options: [
      { value: '5min', label: '5 minutos al día (lo justo para arrancar)' },
      { value: '10_15min', label: '10 a 15 minutos al día (perfecto para resultados)' },
      { value: '20_30min', label: '20 a 30 minutos al día (compromiso total)' },
      { value: 'lo_necesario', label: 'Lo que sea necesario para que funcione' },
    ],
  },

  // 12 — INFO CARD PRE-EMAIL (testimonio motivacional)
  // Reduce el abandon del email gate (~15%). La persona acaba de responder
  // "compromiso" y antes de pedir el email le mostramos social proof que
  // refuerza que vale la pena dejar el dato.
  {
    type: 'info_card',
    id: 'info_pre_email',
    title: 'Mujeres como vos ya lo lograron',
    body: '+1.200 mujeres completaron este test y recibieron su plan personalizado. Las que lo siguieron reportan sentirse más livianas al día 3 — con solo 10 minutos al día.',
    ctaLabel: 'Quiero mi plan →',
  },

  // 13 — CAPTURA EMAIL (OBLIGATORIO, solo 1 campo)
  { type: 'email_capture', id: 'email' },

  // 14 — LOADING (12s con checkmarks + testimonios rotando)
  { type: 'loading', id: 'loading' },
];

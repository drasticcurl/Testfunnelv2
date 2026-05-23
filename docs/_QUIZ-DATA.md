# _QUIZ-DATA.md — Datos canónicos del quiz

> **Compartido — fuente de verdad de las preguntas, opciones, lógica de scoring.**
> Si lo modificás acá, todos los agentes que lo necesiten usan la nueva versión.

## Estructura del quiz

- **Total:** 16 slides
- **Preguntas reales:** 10 (las que se cuentan en la barra de progreso)
- **Info cards:** 3 (entre preguntas)
- **Slides especiales:** 3 (intro + email capture + loading)
- **Tiempo estimado:** 2:30–3:00 min
- **Tasa finalización objetivo:** 70%+

## Mapa completo de slides

| # | Tipo | ID | Contenido |
|---|---|---|---|
| 1 | intro | `intro` | Bienvenida + CTA "Empezar" |
| 2 | question | `edad` | Edad (single) |
| 3 | question | `momento_del_dia` | Momento del día (single) |
| 4 | question | `tiempo_con_problema` | Hace cuánto (single) |
| 5 | info_card | `info_1` | "73% confunde inflamación con grasa" |
| 6 | question | `sintomas` | Síntomas (multi) |
| 7 | question | `ya_probo` | Qué probó (multi) |
| 8 | info_card | `info_2_testimonio` | Testimonio Carolina |
| 9 | question | `impacto_emocional` | Cómo se siente (single) |
| 10 | question | `frecuencia` | Frecuencia (single) |
| 11 | info_card | `info_3` | Las 3 causas |
| 12 | question | `si_natural` | SÍ-street #1 (single) |
| 13 | question | `si_plan_simple` | SÍ-street #2 (single) |
| 14 | question | `si_ver_plan` | SÍ-street #3 (single) |
| 15 | email_capture | `email` | Captura de email |
| 16 | loading | `loading` | Pantalla de carga 4s |

---

## Definición declarativa de slides (TypeScript)

> Esto va literal en `lib/quiz-data.ts` que crea el agente 02.

```ts
import { Slide } from './quiz-types';

export const slides: Slide[] = [
  // 1 — INTRO
  { type: 'intro', id: 'intro' },

  // 2 — Pregunta 1: edad (baja fricción + identificación)
  {
    type: 'question',
    id: 'edad',
    question: '¿Cuál es tu rango de edad?',
    multiple: false,
    options: [
      { value: '25_34', label: '25 a 34' },
      { value: '35_44', label: '35 a 44' },
      { value: '45_54', label: '45 a 54' },
      { value: '55_mas', label: '55 o más' },
    ],
  },

  // 3 — Pregunta 2: momento del día
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

  // 4 — Pregunta 3: tiempo con el problema
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

  // 5 — INFO CARD #1
  {
    type: 'info_card',
    id: 'info_1',
    title: '¿Sabías que…?',
    body: 'El 73% de las mujeres confunde inflamación intestinal con grasa abdominal. Por eso las dietas no les funcionan: están atacando el problema equivocado.',
    source: 'Journal of Gastroenterology, 2023',
    ctaLabel: 'Continuar',
  },

  // 6 — Pregunta 4: síntomas (multi)
  {
    type: 'question',
    id: 'sintomas',
    question: '¿Cuáles de estos síntomas tenés? (marcá todos los que apliquen)',
    multiple: true,
    options: [
      { value: 'gases', label: 'Gases frecuentes' },
      { value: 'pesadez', label: 'Pesadez después de comer' },
      { value: 'eructos', label: 'Eructos constantes' },
      { value: 'estrenimiento', label: 'Estreñimiento' },
      { value: 'panza_marcada', label: 'Se me marca la panza al final del día' },
      { value: 'ruidos', label: 'Ruidos abdominales' },
      { value: 'cansancio', label: 'Cansancio después de comer' },
      { value: 'mala_digestion', label: 'Mala digestión' },
    ],
  },

  // 7 — Pregunta 5: ya probó (multi)
  {
    type: 'question',
    id: 'ya_probo',
    question: '¿Qué probaste para solucionarlo? (marcá todo lo que aplique)',
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

  // 8 — INFO CARD #2 (testimonio)
  {
    type: 'info_card',
    id: 'info_2_testimonio',
    title: 'Lo que pasó en 7 días',
    body: '"En 7 días no podía creer la diferencia. Me bajó la panza visiblemente y dejé de sentirme pesada después de comer." — Carolina M., 42 años, Buenos Aires.',
    ctaLabel: 'Continuar',
  },

  // 9 — Pregunta 6: impacto emocional
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

  // 10 — Pregunta 7: frecuencia
  {
    type: 'question',
    id: 'frecuencia',
    question: '¿Con qué frecuencia experimentás hinchazón?',
    multiple: false,
    options: [
      { value: 'diaria', label: 'Todos los días' },
      { value: '4_6_dias', label: '4 a 6 días por semana' },
      { value: '2_3_dias', label: '2 a 3 días por semana' },
      { value: 'comidas_especificas', label: 'Solo después de ciertas comidas' },
    ],
  },

  // 11 — INFO CARD #3 (educación + autoridad)
  {
    type: 'info_card',
    id: 'info_3',
    title: 'La hinchazón crónica NO es normal',
    body: 'Estudios recientes la asocian a 3 causas: disbiosis intestinal, alimentos inflamatorios ocultos en tu dieta diaria, y mal funcionamiento del eje intestino-cerebro. Las 3 se corrigen con un protocolo alimenticio específico de 7 días.',
    ctaLabel: 'Ver mi plan personalizado',
  },

  // 12 — SÍ-STREET #1
  {
    type: 'question',
    id: 'si_natural',
    question: '¿Te gustaría desinflamarte de forma natural, sin pastillas ni dietas extremas?',
    multiple: false,
    options: [
      { value: 'si_total', label: 'Sí, totalmente' },
      { value: 'si_dudosa', label: 'Sí, pero ya probé de todo' },
      { value: 'no_segura', label: 'No estoy segura' },
    ],
  },

  // 13 — SÍ-STREET #2
  {
    type: 'question',
    id: 'si_plan_simple',
    question: '¿Estás dispuesta a seguir un plan simple de 7 días si te garantiza resultados visibles?',
    multiple: false,
    options: [
      { value: 'si_dame', label: 'Sí, dame el plan' },
      { value: 'si_simple', label: 'Sí, si es realmente simple' },
      { value: 'pensar', label: 'Lo pensaría' },
    ],
  },

  // 14 — SÍ-STREET #3
  {
    type: 'question',
    id: 'si_ver_plan',
    question: '¿Querés ver el plan exacto que diseñamos para tu tipo de hinchazón?',
    multiple: false,
    options: [
      { value: 'si_ya', label: '¡Sí, mostrámelo ya!' },
      { value: 'si', label: 'Sí, quiero verlo' },
    ],
  },

  // 15 — CAPTURA EMAIL
  { type: 'email_capture', id: 'email' },

  // 16 — LOADING
  { type: 'loading', id: 'loading' },
];
```

---

## Tipos TypeScript canónicos

> Esto va literal en `lib/quiz-types.ts` que crea el agente 02 (lo importan 03 y 04).

```ts
export type QuestionId =
  | 'edad'
  | 'momento_del_dia'
  | 'tiempo_con_problema'
  | 'sintomas'
  | 'ya_probo'
  | 'impacto_emocional'
  | 'frecuencia'
  | 'si_natural'
  | 'si_plan_simple'
  | 'si_ver_plan';

export type Slide =
  | { type: 'intro'; id: 'intro' }
  | {
      type: 'question';
      id: QuestionId;
      question: string;
      subtitle?: string;
      multiple: boolean;
      options: { value: string; label: string; emoji?: string }[];
    }
  | {
      type: 'info_card';
      id: string;
      title: string;
      body: string;
      source?: string;
      ctaLabel?: string;
    }
  | { type: 'email_capture'; id: 'email' }
  | { type: 'loading'; id: 'loading' };

export type QuizAnswers = {
  [K in QuestionId]?: string | string[];
} & {
  email?: string;
  nombre?: string;
};

export type TipoHinchazon = 1 | 2 | 3 | 4;
```

---

## Lógica de scoring

> Esto va en `lib/tipos-hinchazon.ts` que crea el agente 03 o 02 (a definir).

```ts
import { QuizAnswers, TipoHinchazon } from './quiz-types';

export function calcularTipo(answers: QuizAnswers): TipoHinchazon {
  const momento = answers.momento_del_dia;

  // Tipo 1: Hinchazón Matutina
  if (momento === 'manana') return 1;
  // Tipo 2: Hinchazón Postprandial
  if (momento === 'almuerzo') return 2;
  // Tipo 3: Hinchazón Inflamatoria Vespertina (la más común)
  if (momento === 'tarde_noche') return 3;
  // Tipo 4: Hinchazón Crónica Persistente
  if (momento === 'todo_el_dia') return 4;

  return 3; // default
}

export function calcularSeveridad(answers: QuizAnswers): number {
  let score = 0;

  // Tiempo con el problema
  const tiempoMap: Record<string, number> = {
    menos_6m: 2, '6m_2a': 4, '2a_5a': 6, mas_5a: 8,
  };
  score += tiempoMap[answers.tiempo_con_problema as string] || 0;

  // Cantidad de síntomas
  const sintomas = (answers.sintomas as string[]) || [];
  score += Math.min(sintomas.length * 0.5, 3);

  // Frecuencia
  const frecuenciaMap: Record<string, number> = {
    diaria: 3, '4_6_dias': 2, '2_3_dias': 1, comidas_especificas: 0.5,
  };
  score += frecuenciaMap[answers.frecuencia as string] || 0;

  // Score 0–14, lo normalizamos a /10
  return Math.min(Math.round(score), 10);
}
```

---

## Construcción de la URL de redirect a /resultados

```ts
export function buildResultsUrl(answers: QuizAnswers): string {
  const params = new URLSearchParams();

  if (answers.edad) params.set('edad', String(answers.edad));
  if (answers.momento_del_dia) params.set('momento', String(answers.momento_del_dia));
  if (answers.tiempo_con_problema) params.set('tiempo', String(answers.tiempo_con_problema));
  if (answers.frecuencia) params.set('frecuencia', String(answers.frecuencia));
  if (answers.impacto_emocional) params.set('emocion', String(answers.impacto_emocional));

  const sintomas = Array.isArray(answers.sintomas) ? answers.sintomas.join(',') : '';
  if (sintomas) params.set('sintomas', sintomas);

  const yaProbo = Array.isArray(answers.ya_probo) ? answers.ya_probo.join(',') : '';
  if (yaProbo) params.set('probo', yaProbo);

  params.set('tipo', calcularTipo(answers).toString());
  params.set('severidad', calcularSeveridad(answers).toString());

  if (answers.nombre) params.set('nombre', String(answers.nombre));

  return `/resultados?${params.toString()}`;
}
```

---

## Diccionarios de personalización (para /resultados)

> El agente 03 los usa para renderizar copy dinámico.

```ts
export const TIPOS_HINCHAZON = {
  1: {
    nombre: 'HINCHAZÓN MATUTINA',
    descripcion: 'Tu cuerpo arrastra inflamación de la noche anterior. Esto suele indicar una microbiota desequilibrada que no termina de procesar bien durante el descanso.',
  },
  2: {
    nombre: 'HINCHAZÓN POSTPRANDIAL',
    descripcion: 'Tu sistema digestivo reacciona inflamatoriamente a alimentos específicos del almuerzo. Es de los tipos más fáciles de revertir con el protocolo correcto.',
  },
  3: {
    nombre: 'HINCHAZÓN INFLAMATORIA VESPERTINA',
    descripcion: 'El tipo más común en mujeres adultas. Tu intestino acumula inflamación durante el día por exposición a alimentos inflamatorios "ocultos" en tu dieta.',
  },
  4: {
    nombre: 'HINCHAZÓN CRÓNICA PERSISTENTE',
    descripcion: 'Tu microbiota está significativamente desequilibrada. Necesitás un reset intestinal estructurado para recuperar la función digestiva normal.',
  },
};

export const EMOCIONES_TEXTO = {
  insegura: 'insegura con tu cuerpo',
  frustrada: 'frustrada porque ya probaste de todo',
  avergonzada: 'avergonzada en lo social',
  cansada: 'físicamente agotada',
  todas: 'una combinación de inseguridad, frustración y cansancio',
};

export const TIEMPO_TEXTO = {
  menos_6m: 'hace menos de 6 meses',
  '6m_2a': 'desde hace entre 6 meses y 2 años',
  '2a_5a': 'hace ya entre 2 y 5 años',
  mas_5a: 'desde hace más de 5 años, casi como tu normal',
};

export const MOMENTO_TEXTO = {
  manana: 'apenas te levantás',
  almuerzo: 'después del almuerzo',
  tarde_noche: 'a la tarde y noche',
  todo_el_dia: 'durante todo el día sin parar',
};

export const PROBO_TEXTO: Record<string, string> = {
  dietas: 'dietas restrictivas como keto o ayuno',
  infusiones: 'infusiones (boldo, manzanilla)',
  suplementos: 'suplementos y probióticos',
  sin_gluten: 'eliminar gluten o lactosa',
  medico: 'consultas médicas',
};
```

---

## Eventos de tracking que dispara el quiz

| Evento | Cuándo | Pixel |
|---|---|---|
| `QuizStart` | Click en "Empezar el test" (slide 1) | trackCustom |
| `QuizQ3` | Llega a slide 4 (pregunta 3) | trackCustom |
| `QuizComplete` | Submit del email (slide 15) | trackCustom |
| `Lead` | Submit del email | track (estándar) |

(Los eventos de la página de resultados los dispara el agente 03.)

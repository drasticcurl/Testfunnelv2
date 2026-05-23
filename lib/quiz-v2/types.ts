/**
 * Tipos del Quiz Funnel V2 — "Chau Hinchazón" estilo MusesAcademy.
 *
 * A diferencia de V1 (15 slides con redirect a /resultados), V2 es un funnel
 * largo (~30+ pasos) donde la página de ventas está embebida al final.
 * No hay redirect — el quiz VENDE solo.
 *
 * Slide types nuevos:
 *  - age_selector: grilla 2x2 con rangos de edad + imágenes placeholder
 *  - social_proof: pantalla de prueba social (número + texto + imagen)
 *  - profile_result: "perfil" generado con barras de nivel
 *  - loading_with_questions: barra de carga con micro-preguntas al 50%
 *  - weekly_plan: gráfico de progreso semanal
 *  - sales_page: página de ventas embebida final (pricing, countdown, FAQ, etc.)
 *
 * Se mantienen de V1 (reutilizados):
 *  - question (single/multi)
 *  - info_card
 *  - name_capture
 *  - email_capture
 */

// ─── Question IDs ───────────────────────────────────────────────────────────

export type QuestionIdV2 =
  | 'edad'
  | 'situacion_actual'
  | 'momento_hinchazon'
  | 'frecuencia'
  | 'tiempo_con_problema'
  | 'sintomas'
  | 'que_empeora'
  | 'ya_probo'
  | 'impacto_emocional'
  | 'impacto_social'
  | 'objetivo'
  | 'motivacion'
  | 'compromiso_tiempo'
  | 'conocimiento_microbiota'
  | 'dieta_actual'
  | 'habitos_agua'
  | 'estres'
  | 'sueno'
  | 'ejercicio'
  | 'estrategias_interes'
  | 'foco'
  | 'evento_importante'
  | 'cuando_evento'
  | 'tiempo_diario'
  // Loading micro-questions
  | 'loading_q1'
  | 'loading_q2'
  | 'loading_q3'
  // Email opt-in
  | 'email_optin';

// ─── Slide Types ────────────────────────────────────────────────────────────

export type SlideV2 =
  | {
      type: 'age_selector';
      id: 'edad';
      headline: string;
      subtitle?: string;
      options: { value: string; label: string; ageRange: string }[];
    }
  | {
      type: 'social_proof';
      id: string;
      number: string;
      text: string;
      subtext?: string;
      testimonials?: { quote: string; author: string }[];
    }
  | {
      type: 'question';
      id: QuestionIdV2;
      question: string;
      subtitle?: string;
      multiple: boolean;
      options: { value: string; label: string; emoji?: string }[];
      /** Optional image description (for AI-generated or placeholder) */
      image?: string;
    }
  | {
      type: 'info_card';
      id: string;
      title: string;
      body: string;
      source?: string;
      ctaLabel?: string;
      variant?: 'text' | 'infographic';
      infographicKey?: string;
    }
  | { type: 'name_capture'; id: 'nombre' }
  | { type: 'email_capture'; id: 'email' }
  | {
      type: 'profile_result';
      id: 'perfil';
      /** Dynamic — computed from answers at render time */
    }
  | {
      type: 'weekly_plan';
      id: 'plan_semanal';
    }
  | {
      type: 'loading_with_questions';
      id: 'loading_inteligente';
      steps: {
        label: string;
        question?: string;
        questionId?: QuestionIdV2;
      }[];
    }
  | {
      type: 'sales_page';
      id: 'ventas';
    };

// ─── Progress Bar Sections ──────────────────────────────────────────────────

export type ProgressSection =
  | 'Tu perfil digestivo'
  | 'Hábitos y causas'
  | 'Tu plan ideal'
  | 'Casi listo';

// ─── Store ──────────────────────────────────────────────────────────────────

export type QuizAnswersV2 = {
  [K in QuestionIdV2]?: string | string[];
} & {
  email?: string;
  nombre?: string;
};

export type TipoHinchazonV2 = 1 | 2 | 3 | 4;

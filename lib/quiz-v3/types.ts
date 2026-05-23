/**
 * Tipos del Quiz Funnel V3 — "Chau Hinchazón" ultra-corto para Google Ads.
 *
 * Solo 12 pasos: diagnóstico rápido → email → loading → perfil → plan → venta.
 * Sin social proof intermedios, sin info cards, sin nombre.
 * La persona de Google ya tiene alto intent — solo necesita diagnóstico + solución.
 */

export type QuestionIdV3 =
  | 'momento_hinchazon'
  | 'tiempo_con_problema'
  | 'sintomas'
  | 'ya_probo'
  | 'impacto_emocional'
  | 'objetivo';

export type SlideV3 =
  | {
      type: 'question';
      id: QuestionIdV3;
      question: string;
      subtitle?: string;
      multiple: boolean;
      options: { value: string; label: string; emoji?: string }[];
    }
  | { type: 'email_capture'; id: 'email' }
  | { type: 'loading'; id: 'loading' }
  | { type: 'profile_result'; id: 'perfil' }
  | { type: 'weekly_plan'; id: 'plan_semanal' }
  | { type: 'sales_page'; id: 'ventas' };

export type QuizAnswersV3 = {
  [K in QuestionIdV3]?: string | string[];
} & {
  email?: string;
};

export type TipoHinchazonV3 = 1 | 2 | 3 | 4;

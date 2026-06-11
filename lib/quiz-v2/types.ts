/**
 * Types del Quiz V3 — "Método del Agua de Arroz"
 *
 * Funnel de 22 slides inspirado en gelatina-delta.vercel.app:
 *  - Diagnóstico cuantificado con 3 barras (inflamación, riesgo, eficiencia metabólica)
 *  - Hook de curiosidad + autoridad
 *  - Datos numéricos (peso, altura, peso deseado) via sliders
 *  - Oferta única $6.000 ARS
 */

// ─── Question IDs ────────────────────────────────────────────────────────────

export type QuestionId =
  | 'nombre'
  | 'edad'
  | 'tipo_cuerpo'
  | 'donde_acumula'
  | 'viral_news'
  | 'como_afecta'
  | 'conforme_panza'
  | 'impide_deshincharse'
  | 'no_es_tu_culpa'
  | 'que_queres_lograr'
  | 'peso_actual'
  | 'altura'
  | 'peso_deseado'
  | 'embarazos'
  | 'rutina_diaria'
  | 'horas_sueno'
  | 'agua_dia';

// ─── Slide Types ─────────────────────────────────────────────────────────────

export type SlideV3 =
  | { type: 'landing_hook';      id: 'landing_hook' }
  | { type: 'name_capture';      id: 'nombre' }
  | { type: 'email_capture';     id: 'email' }
  | {
      type: 'age_slider';
      id: 'edad';
      headline: string;
      min: number; max: number; defaultValue: number; unit: string;
    }
  | {
      type: 'body_type';
      id: 'tipo_cuerpo';
      headline: string;
      options: BodyTypeOption[];
    }
  | {
      type: 'question';
      id: QuestionId;
      question: string;
      subtitle?: string;
      multiple: boolean;
      options: QuizOption[];
    }
  | { type: 'viral_news';        id: 'viral_news' }
  | {
      type: 'number_slider';
      id: 'peso_actual' | 'altura' | 'peso_deseado';
      headline: string;
      min: number; max: number; defaultValue: number; unit: string;
      note?: string;
    }
  | { type: 'expert_bridge';     id: 'expert_bridge' }
  | { type: 'diagnosis_result';  id: 'diagnosis_result' }
  | { type: 'loading_steps';     id: 'loading_steps' }
  | { type: 'sales_page';        id: 'sales_page' };

// ─── Option types ─────────────────────────────────────────────────────────────

export interface QuizOption {
  value: string;
  label: string;
  emoji?: string;
}

export interface BodyTypeOption {
  value: string;
  label: string;
  imgKey: string;
  emojiFallback: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export interface QuizAnswers {
  nombre?: string;
  email?: string;
  edad?: number;
  tipo_cuerpo?: string;
  donde_acumula?: string;        // single-select
  viral_news?: string;
  como_afecta?: string;
  conforme_panza?: string;
  impide_deshincharse?: string[];
  no_es_tu_culpa?: string;
  que_queres_lograr?: string[];
  peso_actual?: number;
  altura?: number;
  peso_deseado?: number;
  embarazos?: string;
  rutina_diaria?: string;
  horas_sueno?: string;
  agua_dia?: string;
}

// ─── Diagnosis ───────────────────────────────────────────────────────────────

export type SeverityLabel = 'Moderado' | 'Alto' | 'Severo' | 'Crítico';
export type IMCCategoria  = 'Bajo peso' | 'Normal' | 'Sobrepeso' | 'Obesidad I' | 'Obesidad II';

export interface IMCResult {
  valor: number;           // ej: 27.4
  categoria: IMCCategoria;
  color: string;           // color para mostrar en UI
  imcObjetivo: number;     // IMC proyectado si llega al peso deseado
  categoriaObjetivo: IMCCategoria;
}

export interface DiagnosisResult {
  nivelInflamacion: number;       // 62–97  → ALTO (malo)
  riesgoAcumulacion: number;      // 55–95  → ALTO (malo)
  eficienciaMetabolica: number;   // 8–35   → BAJO (malo)
  severityLabel: SeverityLabel;
  reframeText: string;
  imc: IMCResult | null;          // null si no hay peso/altura
}

// ─── Peso proyectado ─────────────────────────────────────────────────────────

export interface WeightProjection {
  pesoActual: number;
  pesoProyectado: number;
  bajadaKg: number;
  fechaProyectada: string; // Ej: "28 de junio de 2026"
}

// ─── Legacy re-exports (para no romper imports que usan los tipos V2) ─────────
/** @deprecated Usar QuizAnswers */
export type QuizAnswersV2 = QuizAnswers;
/** @deprecated Usar SlideV3 */
export type SlideV2 = SlideV3;

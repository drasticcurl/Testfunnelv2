/**
 * Calculadora de Microbiota — 20 síntomas, scoring e interpretaciones.
 *
 * Basado en la estructura de estructura-calculadora-microbiota.md y validado
 * contra el GSRS (Gastrointestinal Symptom Rating Scale) de 15 ítems con
 * extensiones para energía, cerebro, piel, inmunidad y tolerancia.
 *
 * Escala por síntoma: 0–4
 *   0 = Nunca / No tengo
 *   1 = Raramente (1-2 veces por semana)
 *   2 = Frecuentemente (3-4 veces por semana)
 *   3 = Casi siempre (5-6 veces por semana)
 *   4 = Siempre (todos los días)
 *
 * Score final: 10 - (totalPuntos / 80) * 10  →  0 (peor) a 10 (óptimo)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type SymptomCategory =
  | 'digestion'
  | 'transito'
  | 'energia'
  | 'cerebro'
  | 'piel'
  | 'inmunidad'
  | 'tolerancia';

export interface Symptom {
  id: string;
  number: number;
  label: string;
  category: SymptomCategory;
}

export interface CategoryMeta {
  id: SymptomCategory;
  label: string;
  emoji: string;
  maxPoints: number; // items × 4
}

export interface ScoreInterpretation {
  min: number;
  max: number;
  label: string;
  emoji: string;
  description: string;
  color: string; // tailwind class
}

export interface AssessmentResult {
  score: number;
  totalPoints: number;
  maxPoints: number;
  interpretation: ScoreInterpretation;
  categoryScores: Record<SymptomCategory, { points: number; max: number; percentage: number }>;
  responses: Record<string, number>;
}

export interface StoredAssessment {
  id: string;
  score: number;
  totalPoints: number;
  responses: Record<string, number>;
  interpretation: string;
  takenAt: string; // ISO date
}

// ─── Symptoms Data ────────────────────────────────────────────────────────────

export const SYMPTOMS: Symptom[] = [
  // Digestión (5 items = 20 pts max)
  { id: 'hinchazon', number: 1, label: 'Hinchazón abdominal visible', category: 'digestion' },
  { id: 'gases', number: 2, label: 'Gases frecuentes (> 3 episodios/día)', category: 'digestion' },
  { id: 'eructos', number: 3, label: 'Eructos frecuentes', category: 'digestion' },
  { id: 'pesadez', number: 4, label: 'Pesadez post-comida (dura > 2 horas)', category: 'digestion' },
  { id: 'ruidos', number: 5, label: 'Ruidos abdominales frecuentes', category: 'digestion' },

  // Tránsito (5 items = 20 pts max)
  { id: 'estrenimiento', number: 6, label: 'Estreñimiento (< 1 vez/día)', category: 'transito' },
  { id: 'diarrea', number: 7, label: 'Diarrea o heces blandas frecuentes', category: 'transito' },
  { id: 'vaciado_incompleto', number: 8, label: 'Sensación de vaciado incompleto', category: 'transito' },
  { id: 'urgencia', number: 9, label: 'Urgencia para ir al baño', category: 'transito' },
  { id: 'moco', number: 10, label: 'Moco en heces', category: 'transito' },

  // Energía (2 items = 8 pts max)
  { id: 'fatiga_comida', number: 11, label: 'Fatiga después de comer', category: 'energia' },
  { id: 'cansancio', number: 12, label: 'Cansancio general sin causa aparente', category: 'energia' },

  // Cerebro (3 items = 12 pts max)
  { id: 'niebla_mental', number: 13, label: 'Niebla mental / dificultad de concentración', category: 'cerebro' },
  { id: 'humor', number: 14, label: 'Cambios de humor relacionados con el hambre', category: 'cerebro' },
  { id: 'antojos', number: 15, label: 'Antojos intensos de azúcar o harinas', category: 'cerebro' },

  // Piel (2 items = 8 pts max)
  { id: 'acne', number: 16, label: 'Acné o rosácea', category: 'piel' },
  { id: 'eczema', number: 17, label: 'Eczema u otras reacciones cutáneas', category: 'piel' },

  // Inmunidad (2 items = 8 pts max)
  { id: 'resfrios', number: 18, label: 'Resfríos frecuentes (> 4/año)', category: 'inmunidad' },
  { id: 'infecciones', number: 19, label: 'Infecciones urinarias o vaginales recurrentes', category: 'inmunidad' },

  // Tolerancia (1 item = 4 pts max)
  { id: 'intolerancia', number: 20, label: 'Intolerancia a alimentos nuevos / variados', category: 'tolerancia' },
];

export const CATEGORIES: CategoryMeta[] = [
  { id: 'digestion', label: 'Digestión', emoji: '🫃', maxPoints: 20 },
  { id: 'transito', label: 'Tránsito', emoji: '🚽', maxPoints: 20 },
  { id: 'energia', label: 'Energía', emoji: '⚡', maxPoints: 8 },
  { id: 'cerebro', label: 'Cerebro', emoji: '🧠', maxPoints: 12 },
  { id: 'piel', label: 'Piel', emoji: '✨', maxPoints: 8 },
  { id: 'inmunidad', label: 'Inmunidad', emoji: '🛡️', maxPoints: 8 },
  { id: 'tolerancia', label: 'Tolerancia', emoji: '🍽️', maxPoints: 4 },
];

export const SCALE_LABELS: Record<number, string> = {
  0: 'Nunca',
  1: 'Raramente',
  2: 'Frecuente',
  3: 'Casi siempre',
  4: 'Siempre',
};

// ─── Interpretations ──────────────────────────────────────────────────────────

export const INTERPRETATIONS: ScoreInterpretation[] = [
  {
    min: 8,
    max: 10,
    label: 'Microbiota saludable',
    emoji: '🌿',
    description: 'Tu intestino está funcionando bien. Mantené tus hábitos actuales.',
    color: 'text-sage-dark',
  },
  {
    min: 6,
    max: 7.9,
    label: 'En recuperación',
    emoji: '🌱',
    description: 'Vas por buen camino. Mantené el protocolo y vas a seguir mejorando.',
    color: 'text-sage',
  },
  {
    min: 4,
    max: 5.9,
    label: 'Desequilibrio moderado',
    emoji: '⚠️',
    description: 'Necesitás continuar con el protocolo. Los cambios requieren consistencia.',
    color: 'text-yellow-600',
  },
  {
    min: 0,
    max: 3.9,
    label: 'Desequilibrio significativo',
    emoji: '🔴',
    description: 'Tu microbiota necesita atención. Seguí el protocolo y considerá consultar con un profesional.',
    color: 'text-red-500',
  },
];

// ─── Scoring Functions ────────────────────────────────────────────────────────

const MAX_TOTAL_POINTS = 80; // 20 symptoms × 4 max each

/**
 * Calcula el score de microbiota (0–10, donde 10 = óptimo).
 */
export function calculateScore(responses: Record<string, number>): number {
  const totalPoints = Object.values(responses).reduce((sum, val) => sum + val, 0);
  const score = 10 - (totalPoints / MAX_TOTAL_POINTS) * 10;
  return Math.round(score * 10) / 10; // 1 decimal
}

/**
 * Calcula puntos totales de las respuestas.
 */
export function calculateTotalPoints(responses: Record<string, number>): number {
  return Object.values(responses).reduce((sum, val) => sum + val, 0);
}

/**
 * Obtiene la interpretación para un score dado.
 */
export function getInterpretation(score: number): ScoreInterpretation {
  const interpretation = INTERPRETATIONS.find((i) => score >= i.min && score <= i.max);
  return interpretation ?? INTERPRETATIONS[INTERPRETATIONS.length - 1];
}

/**
 * Calcula scores por categoría.
 */
export function getCategoryScores(
  responses: Record<string, number>
): Record<SymptomCategory, { points: number; max: number; percentage: number }> {
  const result = {} as Record<SymptomCategory, { points: number; max: number; percentage: number }>;

  for (const cat of CATEGORIES) {
    const categorySymptoms = SYMPTOMS.filter((s) => s.category === cat.id);
    const points = categorySymptoms.reduce((sum, s) => sum + (responses[s.id] ?? 0), 0);
    const percentage = cat.maxPoints > 0 ? Math.round((points / cat.maxPoints) * 100) : 0;
    result[cat.id] = { points, max: cat.maxPoints, percentage };
  }

  return result;
}

/**
 * Calcula el resultado completo del assessment.
 */
export function calculateFullResult(responses: Record<string, number>): AssessmentResult {
  const totalPoints = calculateTotalPoints(responses);
  const score = calculateScore(responses);
  const interpretation = getInterpretation(score);
  const categoryScores = getCategoryScores(responses);

  return {
    score,
    totalPoints,
    maxPoints: MAX_TOTAL_POINTS,
    interpretation,
    categoryScores,
    responses,
  };
}

// ─── LocalStorage (Test Mode) ─────────────────────────────────────────────────

const STORAGE_KEY = 'pwa_microbiota_assessments';

/**
 * Guarda un assessment en localStorage (test mode).
 */
export function saveAssessment(result: AssessmentResult): StoredAssessment {
  const stored: StoredAssessment = {
    id: crypto.randomUUID(),
    score: result.score,
    totalPoints: result.totalPoints,
    responses: result.responses,
    interpretation: result.interpretation.label,
    takenAt: new Date().toISOString(),
  };

  const existing = getStoredAssessments();
  existing.push(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

  return stored;
}

/**
 * Obtiene todos los assessments guardados.
 */
export function getStoredAssessments(): StoredAssessment[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredAssessment[];
  } catch {
    return [];
  }
}

/**
 * Obtiene el último assessment guardado (para comparación).
 */
export function getLastAssessment(): StoredAssessment | null {
  const all = getStoredAssessments();
  return all.length > 0 ? all[all.length - 1] : null;
}

/**
 * Verifica si se puede tomar un nuevo assessment (mínimo 7 días desde el último).
 */
export function canTakeNewAssessment(): { allowed: boolean; daysRemaining: number } {
  const last = getLastAssessment();
  if (!last) return { allowed: true, daysRemaining: 0 };

  const lastDate = new Date(last.takenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 7) return { allowed: true, daysRemaining: 0 };
  return { allowed: false, daysRemaining: 7 - diffDays };
}

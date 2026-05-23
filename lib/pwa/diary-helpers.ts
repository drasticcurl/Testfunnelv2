/**
 * Diary helpers — types, fake data generator, and localStorage utilities
 * for the symptom diary feature (PWA-05).
 */

import { format, subDays } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SymptomLog {
  id: string;
  date: string; // YYYY-MM-DD
  bloating_am: number; // 1-10
  bloating_pm: number; // 1-10
  energy: number; // 1-10
  stress: number; // 1-10
  sleep_quality: number; // 1-10
  bowel_movement: string;
  symptoms: string[];
  notes: string;
  water_glasses: number;
  plan_adherence: string;
  created_at: string;
}

export const SYMPTOM_OPTIONS = [
  'Gases',
  'Dolor',
  'Distensión',
  'Acidez',
  'Náuseas',
  'Pesadez',
  'Ruidos',
] as const;

export const BOWEL_OPTIONS = [
  { value: 'normal', label: '✅ Normal (1-2 veces, sin esfuerzo)', emoji: '✅' },
  { value: 'mas', label: '⬆️ Más de lo habitual', emoji: '⬆️' },
  { value: 'estrenimiento_leve', label: '⬇️ Estreñimiento leve', emoji: '⬇️' },
  { value: 'estrenimiento_marcado', label: '🔴 Estreñimiento marcado', emoji: '🔴' },
  { value: 'diarrea', label: '💧 Heces blandas / diarrea', emoji: '💧' },
  { value: 'sin_movimiento', label: '⭕ No tuve movimiento', emoji: '⭕' },
] as const;

export const ADHERENCE_OPTIONS = [
  { value: '100', label: '✅ 100% del plan' },
  { value: '75', label: '🟡 Mayoría (75%+)' },
  { value: '50', label: '🟠 Parcialmente (50%)' },
  { value: '0', label: '🔴 No pude seguirlo hoy' },
] as const;

// ─── LocalStorage Utilities ──────────────────────────────────────────────────

const STORAGE_KEY = 'pwa_symptom_logs';

export function getLogsFromStorage(): SymptomLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLogToStorage(log: SymptomLog): void {
  const logs = getLogsFromStorage();
  // Upsert: 1 entry per day
  const existingIdx = logs.findIndex((l) => l.date === log.date);
  if (existingIdx >= 0) {
    logs[existingIdx] = log;
  } else {
    logs.push(log);
  }
  // Sort descending by date
  logs.sort((a, b) => b.date.localeCompare(a.date));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

// ─── Fake Data Generator (test mode) ────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateFakeData(days: number = 7): SymptomLog[] {
  const today = new Date();
  const logs: SymptomLog[] = [];

  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    // Simulate gradual improvement (higher values for older entries)
    const decay = Math.max(0, (days - i) / days);
    const baseBloating = 3 + Math.round(decay * 4);

    logs.push({
      id: `fake-${dateStr}`,
      date: dateStr,
      bloating_am: Math.min(10, Math.max(1, baseBloating + randomBetween(-1, 1))),
      bloating_pm: Math.min(10, Math.max(1, baseBloating + randomBetween(0, 2))),
      energy: Math.min(10, Math.max(1, 10 - baseBloating + randomBetween(-1, 1))),
      stress: randomBetween(2, 6),
      sleep_quality: randomBetween(5, 9),
      bowel_movement: BOWEL_OPTIONS[randomBetween(0, 2)].value,
      symptoms: SYMPTOM_OPTIONS.slice(0, randomBetween(1, 4)) as unknown as string[],
      notes: '',
      water_glasses: randomBetween(4, 10),
      plan_adherence: ADHERENCE_OPTIONS[randomBetween(0, 2)].value,
      created_at: date.toISOString(),
    });
  }

  return logs.sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getEmojiForLog(log: SymptomLog): string {
  const avg = (log.bloating_am + log.bloating_pm) / 2;
  if (avg <= 3) return '😊';
  if (avg <= 5) return '😐';
  if (avg <= 7) return '😟';
  return '😣';
}

export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${parseInt(day)} ${months[parseInt(month) - 1]}`;
}

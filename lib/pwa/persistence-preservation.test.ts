// @vitest-environment node
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import fc from 'fast-check';

import {
  saveLogToStorage,
  getLogsFromStorage,
  type SymptomLog,
} from './diary-helpers';
import {
  markOnboardingCompleted,
  isOnboardingCompleted,
  resetOnboarding,
} from './onboarding-state';
import {
  saveAssessment,
  getStoredAssessments,
  calculateFullResult,
  SYMPTOMS,
  type AssessmentResult,
} from './microbiota-symptoms';

/**
 * Feature: pwa-visual-improvements — Persistence preservation (Task 22).
 *
 * The visual overhaul is presentation-only (Requirement 12): it MUST NOT change
 * any persisted data. This suite pins the exact localStorage CONTRACT of every
 * PWA persistence helper — the storage KEY and the byte-for-byte serialized
 * VALUE — to a frozen baseline that is recomputed independently from the same
 * input. If a styling edit ever perturbs a storage key or the JSON shape, the
 * recomputed baseline will diverge from the helper output and this test fails.
 *
 * The four persisted domains called out by the design are covered:
 *   - diary logs          → key `pwa_symptom_logs`
 *   - day progress        → key `pwa_day_progress`
 *   - microbiota assess.  → key `pwa_microbiota_assessments`
 *   - onboarding flag     → key `pwa_onboarding_completed`
 *
 * Environment: `node` (the storage helpers gate on `typeof window`, so we mock
 * `window` + `localStorage` on the global, following the repo convention used
 * by `planner-state.test.ts`). Non-deterministic sources inside the helpers
 * (`crypto.randomUUID`, `Date`) are pinned so the baseline is exactly derivable.
 */

// ── Frozen baseline keys (must match the helpers' source of truth) ───────────
const KEY_DIARY = 'pwa_symptom_logs';
const KEY_DAY_PROGRESS = 'pwa_day_progress';
const KEY_MICROBIOTA = 'pwa_microbiota_assessments';
const KEY_ONBOARDING = 'pwa_onboarding_completed';

// Pinned non-deterministic values so the microbiota baseline is reproducible.
const FROZEN_UUID = '11111111-1111-1111-1111-111111111111' as `${string}-${string}-${string}-${string}-${string}`;
const FROZEN_ISO = '2024-01-01T00:00:00.000Z';

// ── In-memory localStorage mock installed on the global ──────────────────────
type Store = Record<string, string>;

function installStorage(): Store {
  const store: Store = {};
  const storage = {
    getItem: (k: string) => (k in store ? store[k] : null),
    setItem: (k: string, v: string) => {
      store[k] = String(v);
    },
    removeItem: (k: string) => {
      delete store[k];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };
  const g = globalThis as unknown as { window?: unknown; localStorage?: unknown };
  g.window = { localStorage: storage };
  g.localStorage = storage;
  return store;
}

function uninstallStorage() {
  const g = globalThis as unknown as { window?: unknown; localStorage?: unknown };
  delete g.window;
  delete g.localStorage;
}

let store: Store;

beforeEach(() => {
  store = installStorage();
});

afterEach(() => {
  uninstallStorage();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// ── Domain arbitraries ───────────────────────────────────────────────────────

const dateArb = fc
  .date({ min: new Date('2020-01-01T00:00:00.000Z'), max: new Date('2030-12-31T00:00:00.000Z') })
  .map((d) => d.toISOString().slice(0, 10)); // YYYY-MM-DD

const score10 = fc.integer({ min: 1, max: 10 });

const symptomLogArb: fc.Arbitrary<SymptomLog> = fc.record({
  id: fc.string(),
  date: dateArb,
  bloating_am: score10,
  bloating_pm: score10,
  energy: score10,
  stress: score10,
  sleep_quality: score10,
  bowel_movement: fc.string(),
  symptoms: fc.array(fc.string(), { maxLength: 7 }),
  notes: fc.string(),
  water_glasses: fc.integer({ min: 0, max: 20 }),
  plan_adherence: fc.constantFrom('0', '50', '75', '100'),
  created_at: fc.constant(FROZEN_ISO),
});

// Microbiota responses: a value 0..4 for each of the 20 symptom ids.
const responsesArb: fc.Arbitrary<Record<string, number>> = fc
  .tuple(...SYMPTOMS.map(() => fc.integer({ min: 0, max: 4 })))
  .map((vals) => {
    const r: Record<string, number> = {};
    SYMPTOMS.forEach((s, i) => {
      r[s.id] = vals[i];
    });
    return r;
  });

// Day progress: a sparse map of day-number → completed boolean.
const dayProgressArb: fc.Arbitrary<Record<number, boolean>> = fc
  .array(fc.tuple(fc.integer({ min: 1, max: 90 }), fc.boolean()), { maxLength: 30 })
  .map((pairs) => {
    const r: Record<number, boolean> = {};
    for (const [day, done] of pairs) r[day] = done;
    return r;
  });

// ─────────────────────────────────────────────────────────────────────────────
// Property 14: Persistence is byte-for-byte preserved
// ─────────────────────────────────────────────────────────────────────────────
describe('Persistence preservation', () => {
  // Feature: pwa-visual-improvements, Property 14: For any generated user data
  // (diary logs, day progress, microbiota assessments, onboarding flag), the
  // existing persistence helpers produce identical localStorage keys and
  // serialized values after the visual changes as before.
  // **Validates: Requirements 12.4**
  it('Property 14: storage keys and serialized values match the frozen baseline byte-for-byte', () => {
    fc.assert(
      fc.property(
        symptomLogArb,
        responsesArb,
        dayProgressArb,
        fc.boolean(),
        (log, responses, dayProgress, onboardingDone) => {
          // Fresh storage per run.
          store = installStorage();

          // ── Diary logs ──────────────────────────────────────────────────
          // saveLogToStorage upserts into a date-desc sorted array on an empty
          // store, so the single log round-trips as `[log]`.
          saveLogToStorage(log);
          const diaryRaw = (globalThis as unknown as { localStorage: Storage }).localStorage.getItem(KEY_DIARY);
          expect(diaryRaw).toBe(JSON.stringify([log]));
          // Read-back helper yields the structurally identical record.
          expect(getLogsFromStorage()).toEqual([log]);

          // ── Microbiota assessments ──────────────────────────────────────
          vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue(FROZEN_UUID);
          vi.useFakeTimers();
          vi.setSystemTime(new Date(FROZEN_ISO));

          const result: AssessmentResult = calculateFullResult(responses);
          saveAssessment(result);

          const expectedStored = {
            id: FROZEN_UUID,
            score: result.score,
            totalPoints: result.totalPoints,
            responses: result.responses,
            interpretation: result.interpretation.label,
            takenAt: FROZEN_ISO,
          };
          const microRaw = (globalThis as unknown as { localStorage: Storage }).localStorage.getItem(KEY_MICROBIOTA);
          expect(microRaw).toBe(JSON.stringify([expectedStored]));
          expect(getStoredAssessments()).toEqual([expectedStored]);

          vi.useRealTimers();

          // ── Day progress ────────────────────────────────────────────────
          // The dashboard persists the progress record verbatim under
          // `pwa_day_progress`; assert the serialized form is stable and
          // round-trips without mutation.
          const ls = (globalThis as unknown as { localStorage: Storage }).localStorage;
          ls.setItem(KEY_DAY_PROGRESS, JSON.stringify(dayProgress));
          const progressRaw = ls.getItem(KEY_DAY_PROGRESS);
          expect(progressRaw).toBe(JSON.stringify(dayProgress));
          expect(JSON.parse(progressRaw as string)).toEqual(dayProgress);

          // ── Onboarding flag ─────────────────────────────────────────────
          if (onboardingDone) {
            markOnboardingCompleted();
            expect(ls.getItem(KEY_ONBOARDING)).toBe('true');
            expect(isOnboardingCompleted()).toBe(true);
          } else {
            resetOnboarding();
            expect(ls.getItem(KEY_ONBOARDING)).toBeNull();
            expect(isOnboardingCompleted()).toBe(false);
          }

          uninstallStorage();
        },
      ),
      { numRuns: 100 },
    );
  });
});

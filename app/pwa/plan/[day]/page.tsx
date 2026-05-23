'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PLAN_DATA } from '@/lib/pwa/plan-data';
import MealCard from '@/components/pwa/plan/MealCard';
import DayCompleteBanner from '@/components/pwa/plan/DayCompleteBanner';
import { isTestMode } from '@/lib/pwa/test-mode';
import {
  getDietaryPreferences,
  DietaryPreferences,
  getActivePreferenceLabels,
} from '@/lib/pwa/dietary-preferences';

const PROGRESS_KEY = 'pwa_day_progress';

type DayProgress = Record<number, boolean>;

function getLocalProgress(): DayProgress {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveLocalProgress(progress: DayProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export default function DayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dayNumber = Number(params.day);
  const [isCompleted, setIsCompleted] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreferences>({
    sin_gluten: false,
    sin_lactosa: false,
    vegetariano: false,
  });

  const dayPlan = PLAN_DATA.find((d) => d.day === dayNumber);

  useEffect(() => {
    if (!dayPlan) return;

    const progress = getLocalProgress();
    const hasUpsell = isTestMode(); // In test mode, full access

    // Check if this day is accessible
    if (dayPlan.requiresUpsell && !hasUpsell) {
      router.replace('/pwa/plan');
      return;
    }

    // Check progressive unlock: day N requires day N-1 completed (except day 1)
    if (dayNumber > 1 && !progress[dayNumber - 1]) {
      // Allow if current day is already completed
      if (!progress[dayNumber]) {
        router.replace('/pwa/plan');
        return;
      }
    }

    setIsCompleted(!!progress[dayNumber]);
    setDietaryPrefs(getDietaryPreferences());
  }, [dayNumber, dayPlan, router]);

  if (!dayPlan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Día no encontrado</p>
      </div>
    );
  }

  const handleComplete = () => {
    const progress = getLocalProgress();
    progress[dayNumber] = true;
    saveLocalProgress(progress);
    setIsCompleted(true);
    setJustCompleted(true);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/pwa/plan')}
          className="text-sage text-sm font-medium mb-3 flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Volver al plan
        </button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sage-soft flex items-center justify-center">
            <span className="text-sage font-bold text-lg">{dayNumber}</span>
          </div>
          <div>
            <h1 className="font-serif font-semibold text-2xl text-charcoal">
              Día {dayNumber}
            </h1>
            <p className="text-sm text-gray-600">{dayPlan.title}</p>
          </div>
        </div>
      </div>

      {/* Completion banner */}
      {justCompleted && <DayCompleteBanner day={dayNumber} />}

      {/* Meals */}
      <div className="space-y-3">
        <h2 className="font-serif font-medium text-base text-charcoal">
          Comidas del día
        </h2>
        {getActivePreferenceLabels(dietaryPrefs).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {getActivePreferenceLabels(dietaryPrefs).map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-[10px] font-medium bg-sage-soft text-sage px-2 py-0.5 rounded-full"
              >
                ✓ {label}
              </span>
            ))}
          </div>
        )}
        {dayPlan.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} dietaryPrefs={dietaryPrefs} />
        ))}
      </div>

      {/* Tip del día */}
      <div className="bg-coral-soft border border-coral/20 rounded-[16px] p-4">
        <div className="flex items-start gap-2">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-xs font-semibold text-charcoal uppercase tracking-wide mb-1">
              Tip del día
            </p>
            <p className="text-sm text-charcoal leading-relaxed">
              {dayPlan.tip}
            </p>
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      {!isCompleted && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-10">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleComplete}
              className="w-full bg-sage text-white font-semibold text-sm py-3.5 rounded-full shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
            >
              ✓ Completar este día
            </button>
          </div>
        </div>
      )}

      {/* Already completed indicator */}
      {isCompleted && !justCompleted && (
        <div className="bg-sage-soft border border-sage rounded-[16px] p-3 text-center">
          <p className="text-sm text-sage font-medium">
            ✓ Día completado
          </p>
        </div>
      )}
    </div>
  );
}

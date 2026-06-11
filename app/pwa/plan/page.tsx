'use client';

import { useEffect, useState } from 'react';
import { PLAN_DATA } from '@/lib/pwa/plan-data';
import DayCard, { type DayCardStatus } from '@/components/pwa/plan/DayCard';
import { isTestMode } from '@/lib/pwa/test-mode';

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

function getDayStatus(
  day: number,
  progress: DayProgress,
  hasUpsell: boolean
): DayCardStatus {
  const requiresUpsell = day > 7;

  // If completed
  if (progress[day]) return 'completed';

  // If requires upsell and user doesn't have it
  if (requiresUpsell && !hasUpsell) return 'locked-tier';

  // Day 1 is always available
  if (day === 1) return 'available';

  // Day N is available if day N-1 is completed
  if (progress[day - 1]) return 'available';

  return 'locked-progress';
}

export default function PlanPage() {
  const [progress, setProgress] = useState<DayProgress>({});
  const [hasUpsell, setHasUpsell] = useState(false);

  useEffect(() => {
    const storedProgress = getLocalProgress();
    setProgress(storedProgress);

    // In test mode, full access
    if (isTestMode()) {
      setHasUpsell(true);
    }
  }, []);

  const completedCount = Object.values(progress).filter(Boolean).length;
  const totalDays = hasUpsell ? 30 : 7;
  const progressPercent = Math.round((completedCount / totalDays) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif font-semibold text-2xl text-charcoal">
          Tu Plan Día a Día
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {completedCount === 0
            ? 'Empezá el día 1 y avanzá a tu ritmo'
            : `${completedCount} de ${totalDays} días completados`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Progreso</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--terracotta)' }}>{progressPercent}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--warm-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%`, background: 'linear-gradient(to right, var(--terracotta), var(--terracotta-light))' }}
          />
        </div>
      </div>

      {/* Week sections */}
      {[
        { label: 'Semana 1 — Agua de Arroz + Activación', days: PLAN_DATA.slice(0, 7) },
        { label: 'Semana 2 — Eliminación de Inflamatorios', days: PLAN_DATA.slice(7, 14) },
        { label: 'Semana 3 — Restauración de Microbiota', days: PLAN_DATA.slice(14, 21) },
        { label: 'Semana 4 — Consolidación del Método', days: PLAN_DATA.slice(21, 30) },
      ].map((week, weekIdx) => {
        // Don't show weeks 2-4 if no upsell and not in test mode
        if (weekIdx > 0 && !hasUpsell) return null;

        return (
          <div key={weekIdx} className="space-y-3">
            <h2 className="font-serif font-medium text-base text-charcoal pl-1">
              {week.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {week.days.map((dayPlan) => (
                <DayCard
                  key={dayPlan.day}
                  day={dayPlan.day}
                  title={dayPlan.title}
                  subtitle={dayPlan.subtitle}
                  status={getDayStatus(dayPlan.day, progress, hasUpsell)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Upsell CTA if no upsell */}
      {!hasUpsell && (
        <div className="rounded-2xl p-4 text-center border" style={{ backgroundColor: 'var(--terracotta-soft)', borderColor: 'rgba(192,85,58,0.3)' }}>
          <p className="font-serif font-semibold" style={{ color: 'var(--charcoal)' }}>
            ¿Querés los 30 días completos?
          </p>
          <p className="text-sm mt-1 mb-3" style={{ color: 'var(--muted)' }}>
            Desbloqueá las semanas 2, 3 y 4 con el Programa de 30 Días TURBO
          </p>
          <button className="text-white font-semibold text-sm px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--terracotta), var(--terracotta-light))' }}>
            DESBLOQUEAR PROGRAMA TURBO →
          </button>
        </div>
      )}
    </div>
  );
}

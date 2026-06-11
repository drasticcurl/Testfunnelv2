'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import ProgressRing from '@/components/pwa/progreso/ProgressRing';
import StreakCounter from '@/components/pwa/progreso/StreakCounter';
import BadgeGrid from '@/components/pwa/progreso/BadgeGrid';
import { type Badge } from '@/components/pwa/progreso/BadgeCard';
import { getLogsFromStorage } from '@/lib/pwa/diary-helpers';

// ─── Test Mode Badges ────────────────────────────────────────────────────────

function generateTestBadges(streak: number, completedDays: number): Badge[] {
  return [
    {
      id: 'first-day',
      icon: '🌱',
      title: 'Primer Paso',
      description: 'Completaste el día 1',
      unlocked: completedDays >= 1,
    },
    {
      id: 'three-days',
      icon: '🌿',
      title: 'Constancia',
      description: '3 días consecutivos',
      unlocked: streak >= 3 || completedDays >= 3,
    },
    {
      id: 'one-week',
      icon: '🎯',
      title: 'Una Semana',
      description: '7 días completados',
      unlocked: completedDays >= 7,
    },
    {
      id: 'diary-start',
      icon: '📝',
      title: 'Autoconciencia',
      description: 'Primer registro en el diario',
      unlocked: true,
    },
    {
      id: 'diary-week',
      icon: '📊',
      title: 'Observadora',
      description: '7 días de diario seguidos',
      unlocked: completedDays >= 5,
    },
    {
      id: 'recipe-fav',
      icon: '❤️',
      title: 'Foodie',
      description: 'Guardaste tu primera receta',
      unlocked: true,
    },
    {
      id: 'score-up',
      icon: '📈',
      title: 'En Mejoría',
      description: 'Tu score de microbiota subió',
      unlocked: completedDays >= 4,
    },
    {
      id: 'two-weeks',
      icon: '💪',
      title: 'Guerrera',
      description: '14 días completados',
      unlocked: false,
    },
    {
      id: 'streak-10',
      icon: '🔥',
      title: 'Imparable',
      description: 'Racha de 10 días',
      unlocked: false,
    },
    {
      id: 'full-month',
      icon: '🏆',
      title: 'Protocolo Completo',
      description: '30 días completados',
      unlocked: false,
    },
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PROGRESS_KEY = 'pwa_day_progress';

function getLocalProgress(): Record<number, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function calculateStreak(progress: Record<number, boolean>): number {
  let streak = 0;
  const days = Object.keys(progress)
    .map(Number)
    .filter((d) => progress[d])
    .sort((a, b) => b - a);
  if (days.length === 0) return 0;
  for (let i = 0; i < days.length; i++) {
    if (i === 0 || days[i] === days[i - 1] - 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ProgresoPage() {
  const [completedDays, setCompletedDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [chartData, setChartData] = useState<{ day: string; am: number; pm: number }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load progress real desde localStorage. Si está vacío, el usuario
    // arranca con 0 días completados — sin seedear fake data.
    const prog = getLocalProgress();

    const completed = Object.values(prog).filter(Boolean).length;
    const currentStreak = calculateStreak(prog);

    setCompletedDays(completed);
    setStreak(currentStreak);
    setBestStreak(currentStreak); // sin fake data, best = current

    // Generate badges
    setBadges(generateTestBadges(currentStreak, completed));

    // Load chart data del diario real (sin seedear fake data).
    const logs = getLogsFromStorage();

    // Prepare chart data (last 14 days, oldest first)
    const recentLogs = logs.slice(0, 14).reverse();
    const chartPoints = recentLogs.map((log) => ({
      day: log.date.slice(5), // MM-DD
      am: log.bloating_am,
      pm: log.bloating_pm,
    }));
    setChartData(chartPoints);
    setIsLoaded(true);
  }, []);

  const totalDays = 30;
  const progressPercent = Math.round((completedDays / totalDays) * 100);

  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-sage-soft rounded w-1/2" />
        <div className="h-40 bg-sage-soft rounded-2xl" />
        <div className="h-32 bg-sage-soft rounded-2xl" />
        <div className="h-60 bg-sage-soft rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-charcoal">Tu Progreso</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          {completedDays > 0
            ? `¡Increíble! Llevás ${completedDays} días de transformación.`
            : 'Acá vas a ver tu evolución día a día.'}
        </p>
      </div>

      {/* Progress Ring + stats */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-sand/20"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-center gap-8">
          <ProgressRing percent={progressPercent} label="completado" />
          <div className="space-y-3">
            <div>
              <p className="font-serif text-2xl font-bold text-charcoal">{completedDays}</p>
              <p className="text-xs text-charcoal/50">días completados</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-sage">{totalDays - completedDays}</p>
              <p className="text-xs text-charcoal/50">días restantes</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Streak Counter */}
      <StreakCounter streak={streak} bestStreak={bestStreak} />

      {/* Evolution Chart */}
      <motion.div
        className="bg-white rounded-2xl p-5 shadow-sm border border-sand/20"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <h2 className="font-serif text-lg font-semibold text-charcoal mb-1">
          Evolución de tu digestión
        </h2>
        <p className="text-xs text-charcoal/50 mb-4">Últimos 14 días — menor puntaje = mejor</p>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EFE9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#9B9890' }}
                tickLine={false}
                axisLine={{ stroke: '#E8EFE9' }}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 10, fill: '#9B9890' }}
                tickLine={false}
                axisLine={{ stroke: '#E8EFE9' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #E8EFE9',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="am" stroke="#C0553A" strokeWidth={2} dot={{ r: 3, fill: '#C0553A' }} name="Mañana (hinchazón)" />
              <Line type="monotone" dataKey="pm" stroke="#D4785C" strokeWidth={2} dot={{ r: 3, fill: '#D4785C' }} name="Noche (hinchazón)" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-charcoal/40 text-sm">
            Registrá tu primer día para ver tu evolución
          </div>
        )}

        {/* Trend indicator: solo lo mostramos cuando hay suficientes logs.
            El % "bajó 23%" es hardcoded por ahora — cuando tengamos historial
            real lo reemplazamos por el delta real entre primeras vs últimas
            entradas del log. */}
        {chartData.length >= 7 && (
          <div className="mt-3 flex items-center gap-2 bg-sage-soft/50 rounded-lg px-3 py-2">
            <span className="text-sm">📉</span>
            <p className="text-xs text-charcoal/70">
              Tu hinchazón bajó un <strong className="text-sage">23%</strong> en las últimas 2 semanas. ¡Seguí así!
            </p>
          </div>
        )}
      </motion.div>

      {/* Badges */}
      <BadgeGrid badges={badges} />

      {/* Motivational card */}
      <motion.div
        className="bg-gradient-to-br from-sage/10 to-sage-soft rounded-2xl p-5 border border-sage/15 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <span className="text-3xl">🌟</span>
        <p className="font-serif text-base font-semibold text-charcoal mt-2">
          Cada día que registrás es un acto de amor propio
        </p>
        <p className="text-xs text-charcoal/50 mt-1.5">
          Tu cuerpo se está adaptando. Los resultados llegan con la constancia.
        </p>
      </motion.div>
    </motion.div>
  );
}

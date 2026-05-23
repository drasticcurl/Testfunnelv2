'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePwaUser } from '@/lib/pwa/use-pwa-user';
import { getLogsFromStorage } from '@/lib/pwa/diary-helpers';
import { isOnboardingCompleted } from '@/lib/pwa/onboarding-state';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

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
  // Count consecutive from highest
  for (let i = 0; i < days.length; i++) {
    if (i === 0 || days[i] === days[i - 1] - 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function getMicrobiotaScore(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('pwa_microbiota_assessments');
    if (!stored) return null;
    const assessments = JSON.parse(stored);
    if (assessments.length === 0) return null;
    return assessments[assessments.length - 1].score;
  } catch {
    return null;
  }
}

export default function PwaDashboardPage() {
  const router = useRouter();
  const { nombre } = usePwaUser();
  const [progress, setProgress] = useState<Record<number, boolean>>({});
  const [streak, setStreak] = useState(0);
  const [currentDay, setCurrentDay] = useState(1);
  const [dayPercent, setDayPercent] = useState(0);
  const [lastBloating, setLastBloating] = useState<{ am: number; pm: number } | null>(null);
  const [microbiotaScore, setMicrobiotaScore] = useState<number | null>(null);
  const [todayLogged, setTodayLogged] = useState(false);

  useEffect(() => {
    // Guard: si el usuario nunca completó el onboarding, lo mandamos ahí.
    // Cubre el caso de que entre directo a /pwa/dashboard salteándose el
    // login (ej. con cookie ya existente). El onboarding marca la flag
    // al terminar y vuelve acá.
    if (!isOnboardingCompleted()) {
      router.replace('/pwa/onboarding');
      return;
    }

    // Load progress real desde localStorage. Si está vacío, el usuario arranca
    // en día 1 — no seedeamos progreso falso para que no aparezca como si ya
    // hubiera completado días que nunca tocó.
    const prog = getLocalProgress();
    setProgress(prog);
    setStreak(calculateStreak(prog));

    // Current day = next incomplete
    const completedDays = Object.keys(prog).filter((d) => prog[Number(d)]).map(Number);
    const maxCompleted = completedDays.length > 0 ? Math.max(...completedDays) : 0;
    const nextDay = maxCompleted + 1;
    setCurrentDay(nextDay > 30 ? 30 : nextDay);
    setDayPercent(Math.round((completedDays.length / 30) * 100));

    // Load diary logs reales. Sin fake data: si nunca registró un día,
    // mostramos el card vacío con el CTA "Registrá cómo te sentís".
    const logs = getLogsFromStorage();
    if (logs.length > 0) {
      const latest = logs[0];
      setLastBloating({ am: latest.bloating_am, pm: latest.bloating_pm });
      const today = new Date().toISOString().slice(0, 10);
      setTodayLogged(logs.some((l) => l.date === today));
    }

    // Microbiota score: sin score real lo dejamos en null y el render
    // muestra "—" en lugar de inventar 6.8.
    setMicrobiotaScore(getMicrobiotaScore());
  }, [router]);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Buen día' : greetingHour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <motion.div
      className="space-y-5 pb-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Welcome banner */}
      <motion.div
        variants={item}
        className="bg-gradient-to-br from-sage/10 to-sage-soft rounded-2xl p-5 border border-sage/15"
      >
        <p className="text-charcoal/60 text-sm">{greeting}, {nombre} 👋</p>
        <h1 className="font-serif text-xl font-semibold text-charcoal mt-1">
          Día {currentDay} de tu protocolo
        </h1>
        <p className="text-charcoal/60 text-sm mt-2 leading-relaxed">
          {streak > 3
            ? `¡Llevás ${streak} días seguidos! Tu cuerpo ya lo nota.`
            : 'Cada pequeño paso te acerca a sentirte mejor.'}
        </p>
      </motion.div>

      {/* Card: Día actual con progreso */}
      <motion.div variants={item}>
        <Link
          href={`/pwa/plan/${currentDay}`}
          className="block bg-white rounded-2xl p-5 shadow-sm border border-sand/20 hover:border-sage/30 transition-colors group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-sage-soft flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <div>
                <h2 className="font-semibold text-charcoal text-[15px]">Día {currentDay}</h2>
                <p className="text-charcoal/50 text-xs">
                  {currentDay <= 7 ? 'Fase de limpieza' : currentDay <= 14 ? 'Reincorporación' : currentDay <= 21 ? 'Optimización' : 'Mantenimiento'}
                </p>
              </div>
            </div>
            <span className="text-charcoal/30 group-hover:text-sage transition-colors text-lg">→</span>
          </div>
          <div className="w-full h-2 bg-cream-warm rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${dayPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <p className="text-[11px] text-charcoal/40 mt-1.5">{dayPercent}% del plan completado</p>
        </Link>
      </motion.div>

      {/* Card: Registrar hoy */}
      <motion.div variants={item}>
        <Link
          href={todayLogged ? '/pwa/diario' : '/pwa/diario/nuevo'}
          className="block bg-white rounded-2xl p-5 shadow-sm border border-sand/20 hover:border-sage/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-coral-soft/40 flex items-center justify-center">
                <span className="text-xl">{todayLogged ? '✅' : '📝'}</span>
              </div>
              <div>
                <h2 className="font-semibold text-charcoal text-[15px]">
                  {todayLogged ? 'Registro de hoy ✓' : '¿Cómo estás hoy?'}
                </h2>
                <p className="text-charcoal/50 text-xs">
                  {todayLogged ? 'Ver tu diario de síntomas' : 'Registrá cómo te sentís'}
                </p>
              </div>
            </div>
            <span className="text-charcoal/30 group-hover:text-sage transition-colors text-lg">→</span>
          </div>
          {lastBloating && (
            <div className="mt-3 flex items-center gap-4 text-xs text-charcoal/50">
              <span>Último registro: AM <strong className="text-charcoal/70">{lastBloating.am}/10</strong></span>
              <span>PM <strong className="text-charcoal/70">{lastBloating.pm}/10</strong></span>
            </div>
          )}
        </Link>
      </motion.div>

      {/* Streak + Score row */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <Link
          href="/pwa/progreso"
          className="bg-sage-soft rounded-2xl p-4 border border-sage/15 hover:border-sage/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className="text-xl">{streak >= 3 ? '🔥' : '✨'}</span>
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-charcoal">{streak}</p>
              <p className="text-charcoal/60 text-[11px]">
                {streak === 1 ? 'día de racha' : 'días de racha'}
              </p>
            </div>
          </div>
        </Link>

        {/* Microbiota score */}
        <Link
          href="/pwa/calculadora"
          className="bg-cream-warm rounded-2xl p-4 border border-sand/20 hover:border-sage/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className="text-xl">🧬</span>
            </div>
            <div>
              <p className="font-serif text-xl font-bold text-charcoal">
                {microbiotaScore !== null ? microbiotaScore.toFixed(1) : '—'}
              </p>
              <p className="text-charcoal/60 text-[11px]">score microbiota</p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Tus herramientas */}
      <motion.div variants={item}>
        <p className="text-xs uppercase tracking-wider text-charcoal/40 font-medium mb-3">
          Tus herramientas
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/pwa/guias/ritual"
            className="bg-gradient-to-br from-cream-warm to-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center gap-2 text-center hover:border-sage/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center">
              <span className="text-lg">🌅</span>
            </div>
            <span className="text-xs font-medium text-charcoal/70">Ritual de mañana</span>
          </Link>
          <Link
            href="/pwa/guias/suplementacion"
            className="bg-gradient-to-br from-cream-warm to-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center gap-2 text-center hover:border-sage/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center">
              <span className="text-lg">💊</span>
            </div>
            <span className="text-xs font-medium text-charcoal/70">Suplementación</span>
          </Link>
          <Link
            href="/pwa/guias/inflamatorios"
            className="bg-gradient-to-br from-cream-warm to-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center gap-2 text-center hover:border-sage/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-coral-soft/30 flex items-center justify-center">
              <span className="text-lg">🚫</span>
            </div>
            <span className="text-xs font-medium text-charcoal/70">Inflamatorios</span>
          </Link>
          <Link
            href="/pwa/guias/antiinflamatorios"
            className="bg-gradient-to-br from-cream-warm to-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center gap-2 text-center hover:border-sage/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <span className="text-xs font-medium text-charcoal/70">Antiinflamatorios</span>
          </Link>
        </div>
      </motion.div>

      {/* Kit Express card */}
      <motion.div variants={item}>
        <Link
          href="/pwa/kit-express"
          className="block bg-gradient-to-r from-coral-soft/30 to-coral-soft/10 rounded-2xl p-5 shadow-sm border border-coral-soft/30 hover:border-coral/30 transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-coral-soft/50 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h2 className="font-semibold text-charcoal text-[15px]">Kit Express</h2>
                <p className="text-charcoal/50 text-xs">
                  Menú SOS · Meal Prep · Swaps
                </p>
              </div>
            </div>
            <span className="text-charcoal/30 group-hover:text-coral transition-colors text-lg">→</span>
          </div>
        </Link>
      </motion.div>

      {/* Quick actions 2x2 */}
      <motion.div variants={item}>
        <p className="text-xs uppercase tracking-wider text-charcoal/40 font-medium mb-3">
          Accesos rápidos
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/pwa/plan"
            className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center gap-2 text-center hover:border-sage/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <span className="text-xs font-medium text-charcoal/70">Plan día a día</span>
          </Link>
          <Link
            href="/pwa/recetas"
            className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center gap-2 text-center hover:border-sage/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-coral-soft/40 flex items-center justify-center">
              <span className="text-lg">🍽️</span>
            </div>
            <span className="text-xs font-medium text-charcoal/70">Recetas</span>
          </Link>
          <Link
            href="/pwa/lista-compras"
            className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center gap-2 text-center hover:border-sage/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-cream-warm flex items-center justify-center">
              <span className="text-lg">🛒</span>
            </div>
            <span className="text-xs font-medium text-charcoal/70">Lista compras</span>
          </Link>
          <Link
            href="/pwa/progreso"
            className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20 flex flex-col items-center gap-2 text-center hover:border-sage/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center">
              <span className="text-lg">🏆</span>
            </div>
            <span className="text-xs font-medium text-charcoal/70">Progreso</span>
          </Link>
        </div>
      </motion.div>

      {/* Motivational tip */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20"
      >
        <div className="flex items-start gap-3">
          <span className="text-lg mt-0.5">💡</span>
          <div>
            <p className="text-sm font-medium text-charcoal">Tip del día</p>
            <p className="text-xs text-charcoal/60 mt-1 leading-relaxed">
              Masticá cada bocado 20 veces. La digestión empieza en la boca y reduce la hinchazón hasta un 30%.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

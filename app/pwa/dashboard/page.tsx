'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePwaUser } from '@/lib/pwa/use-pwa-user';
import { getLogsFromStorage } from '@/lib/pwa/diary-helpers';
import { isOnboardingCompleted } from '@/lib/pwa/onboarding-state';
import { RICE_WATER_PATH } from '@/lib/pwa/rice-water';
import { Icon } from '@/components/pwa/ui/Icon';
import { computeStagger } from '@/lib/pwa/ui/motion';

// Entrance stagger driven by the shared scheduler (single consistent inter-item
// delay within the 40–80 ms band, capped at 800 ms). The global
// prefers-reduced-motion block neutralizes the underlying animation.
const ENTRANCE_DELAYS = computeStagger(9);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: (delayMs: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', delay: delayMs / 1000 },
  }),
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
        custom={ENTRANCE_DELAYS[0]}
        className="bg-gradient-to-br from-terracotta/10 to-terracotta-soft rounded-lg p-5 border border-terracotta/15"
      >
        {/* Caption level: body family, small, muted token. */}
        <p className="font-body text-muted text-sm">{greeting}, {nombre} 👋</p>
        {/* Section-heading level: heading family, 20px, semibold. */}
        <h1 className="font-heading text-xl font-semibold text-charcoal mt-1">
          Día {currentDay} de tu protocolo TURBO
        </h1>
        <p className="font-body text-muted text-sm mt-2 leading-relaxed">
          {streak > 3
            ? `¡Llevás ${streak} días seguidos! Tu cuerpo ya lo nota.`
            : 'Cada pequeño paso te acerca a sentirte mejor.'}
        </p>
      </motion.div>

      {/* Card destacada: Agua de Arroz — el método central */}
      <motion.div variants={item} custom={ENTRANCE_DELAYS[1]}>
        <Link
          href={RICE_WATER_PATH}
          className="block rounded-lg p-5 shadow-md border border-terracotta/30 bg-gradient-to-br from-terracotta to-terracotta-light hover:-translate-y-0.5 active:translate-y-0 transition-transform group"
        >
          <div className="flex items-center gap-3 text-warm">
            <div className="w-11 h-11 rounded-md bg-warm/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🌾</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-body font-semibold text-base leading-tight">Tu Agua de Arroz de hoy</h2>
              <p className="font-body text-warm/85 text-sm mt-0.5 leading-relaxed">
                La receta segura paso a paso. El método central, todas las mañanas.
              </p>
            </div>
            <span className="text-warm/80 text-lg flex-shrink-0" aria-hidden="true">→</span>
          </div>
        </Link>
      </motion.div>

      {/* Card: Día actual con progreso */}
      <motion.div variants={item} custom={ENTRANCE_DELAYS[2]}>
        <Link
          href={`/pwa/plan/${currentDay}`}
          className="block bg-warm rounded-lg p-5 shadow-md border border-warm-border hover:border-terracotta/30 transition-colors duration-fast ease-standard group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-md bg-terracotta-soft flex items-center justify-center text-terracotta">
                <Icon name="plan" size="md" decorative />
              </div>
              <div>
                <h2 className="font-body font-semibold text-charcoal text-base">Día {currentDay}</h2>
                <p className="font-body text-muted text-sm">
                  {currentDay <= 7 ? 'Fase de limpieza' : currentDay <= 14 ? 'Reincorporación' : currentDay <= 21 ? 'Optimización' : 'Mantenimiento'}
                </p>
              </div>
            </div>
            <span className="text-muted-light group-hover:text-terracotta transition-colors duration-fast ease-standard text-lg" aria-hidden="true">→</span>
          </div>
          <div className="w-full h-2 bg-warm-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-terracotta to-terracotta-dark rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${dayPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
          <p className="font-body text-sm text-muted-light mt-1.5">{dayPercent}% del plan completado</p>
        </Link>
      </motion.div>

      {/* Card: Registrar hoy */}
      <motion.div variants={item} custom={ENTRANCE_DELAYS[3]}>
        <Link
          href={todayLogged ? '/pwa/diario' : '/pwa/diario/nuevo'}
          className="block bg-warm rounded-lg p-5 shadow-md border border-warm-border hover:border-terracotta/30 transition-colors duration-fast ease-standard group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-md flex items-center justify-center ${todayLogged ? 'bg-success/15 text-success' : 'bg-terracotta-soft text-terracotta'}`}>
                <Icon name={todayLogged ? 'success' : 'diary'} size="md" decorative />
              </div>
              <div>
                <h2 className="font-body font-semibold text-charcoal text-base">
                  {todayLogged ? 'Registro de hoy ✓' : '¿Cómo estás hoy?'}
                </h2>
                <p className="font-body text-muted text-sm">
                  {todayLogged ? 'Ver tu diario de síntomas' : 'Registrá cómo te sentís'}
                </p>
              </div>
            </div>
            <span className="text-muted-light group-hover:text-terracotta transition-colors duration-fast ease-standard text-lg" aria-hidden="true">→</span>
          </div>
          {lastBloating && (
            <div className="mt-3 flex items-center gap-4 font-body text-sm text-muted">
              <span>Último registro: AM <strong className="text-charcoal">{lastBloating.am}/10</strong></span>
              <span>PM <strong className="text-charcoal">{lastBloating.pm}/10</strong></span>
            </div>
          )}
        </Link>
      </motion.div>

      {/* Streak + Score row */}
      <motion.div variants={item} custom={ENTRANCE_DELAYS[4]} className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <Link
          href="/pwa/progreso"
          className="bg-terracotta-soft rounded-lg p-4 border border-terracotta/15 hover:border-terracotta/30 transition-colors duration-fast ease-standard"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center shadow-sm text-terracotta">
              {streak >= 3 ? <Icon name="streak" size="md" decorative /> : <span className="text-xl">✨</span>}
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-charcoal">{streak}</p>
              <p className="font-body text-muted text-xs">
                {streak === 1 ? 'día de racha' : 'días de racha'}
              </p>
            </div>
          </div>
        </Link>

        {/* Microbiota score */}
        <Link
          href="/pwa/calculadora"
          className="bg-warm-border rounded-lg p-4 border border-warm-border hover:border-terracotta/30 transition-colors duration-fast ease-standard"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warm flex items-center justify-center shadow-sm">
              <span className="text-xl">🧬</span>
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-charcoal">
                {microbiotaScore !== null ? microbiotaScore.toFixed(1) : '—'}
              </p>
              <p className="font-body text-muted text-xs">score microbiota</p>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Tus herramientas */}
      <motion.div variants={item} custom={ENTRANCE_DELAYS[5]}>
        <p className="font-body text-xs uppercase tracking-wider text-muted-light font-medium mb-3">
          Tus herramientas
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/pwa/guias/ritual"
            className="bg-gradient-to-br from-warm-border to-warm rounded-lg p-4 shadow-sm border border-warm-border flex flex-col items-center gap-2 text-center hover:border-terracotta/30 transition-colors duration-fast ease-standard"
          >
            <div className="w-10 h-10 rounded-md bg-terracotta-soft flex items-center justify-center">
              <span className="text-lg">🌅</span>
            </div>
            <span className="font-body text-xs font-medium text-charcoal">Ritual de mañana</span>
          </Link>
          <Link
            href="/pwa/guias/suplementacion"
            className="bg-gradient-to-br from-warm-border to-warm rounded-lg p-4 shadow-sm border border-warm-border flex flex-col items-center gap-2 text-center hover:border-terracotta/30 transition-colors duration-fast ease-standard"
          >
            <div className="w-10 h-10 rounded-md bg-terracotta-soft flex items-center justify-center">
              <span className="text-lg">💊</span>
            </div>
            <span className="font-body text-xs font-medium text-charcoal">Suplementación</span>
          </Link>
          <Link
            href="/pwa/guias/inflamatorios"
            className="bg-gradient-to-br from-warm-border to-warm rounded-lg p-4 shadow-sm border border-warm-border flex flex-col items-center gap-2 text-center hover:border-terracotta/30 transition-colors duration-fast ease-standard"
          >
            <div className="w-10 h-10 rounded-md bg-terracotta-soft flex items-center justify-center">
              <span className="text-lg">🚫</span>
            </div>
            <span className="font-body text-xs font-medium text-charcoal">Inflamatorios</span>
          </Link>
          <Link
            href="/pwa/guias/antiinflamatorios"
            className="bg-gradient-to-br from-warm-border to-warm rounded-lg p-4 shadow-sm border border-warm-border flex flex-col items-center gap-2 text-center hover:border-terracotta/30 transition-colors duration-fast ease-standard"
          >
            <div className="w-10 h-10 rounded-md bg-terracotta-soft flex items-center justify-center">
              <span className="text-lg">🌿</span>
            </div>
            <span className="font-body text-xs font-medium text-charcoal">Antiinflamatorios</span>
          </Link>
        </div>
      </motion.div>

      {/* Kit Express card */}
      <motion.div variants={item} custom={ENTRANCE_DELAYS[6]}>
        <Link
          href="/pwa/kit-express"
          className="block bg-gradient-to-r from-terracotta-soft to-warm rounded-lg p-5 shadow-md border border-terracotta/20 hover:border-terracotta/40 transition-colors duration-fast ease-standard group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-md bg-terracotta-soft flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <div>
                <h2 className="font-body font-semibold text-charcoal text-base">Kit Express</h2>
                <p className="font-body text-muted text-sm">
                  Menú SOS · Meal Prep · Swaps
                </p>
              </div>
            </div>
            <span className="text-muted-light group-hover:text-terracotta transition-colors duration-fast ease-standard text-lg" aria-hidden="true">→</span>
          </div>
        </Link>
      </motion.div>

      {/* Quick actions 2x2 */}
      <motion.div variants={item} custom={ENTRANCE_DELAYS[7]}>
        <p className="font-body text-xs uppercase tracking-wider text-muted-light font-medium mb-3">
          Accesos rápidos
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/pwa/plan"
            className="bg-warm rounded-lg p-4 shadow-sm border border-warm-border flex flex-col items-center gap-2 text-center hover:border-terracotta/30 transition-colors duration-fast ease-standard"
          >
            <div className="w-10 h-10 rounded-md bg-terracotta-soft flex items-center justify-center text-terracotta">
              <Icon name="plan" size="md" decorative />
            </div>
            <span className="font-body text-xs font-medium text-charcoal">Plan día a día</span>
          </Link>
          <Link
            href="/pwa/recetas"
            className="bg-warm rounded-lg p-4 shadow-sm border border-warm-border flex flex-col items-center gap-2 text-center hover:border-terracotta/30 transition-colors duration-fast ease-standard"
          >
            <div className="w-10 h-10 rounded-md bg-terracotta-soft flex items-center justify-center text-terracotta">
              <Icon name="recipes" size="md" decorative />
            </div>
            <span className="font-body text-xs font-medium text-charcoal">Recetas</span>
          </Link>
          <Link
            href="/pwa/lista-compras"
            className="bg-warm rounded-lg p-4 shadow-sm border border-warm-border flex flex-col items-center gap-2 text-center hover:border-terracotta/30 transition-colors duration-fast ease-standard"
          >
            <div className="w-10 h-10 rounded-md bg-warm-border flex items-center justify-center">
              <span className="text-lg">🛒</span>
            </div>
            <span className="font-body text-xs font-medium text-charcoal">Lista compras</span>
          </Link>
          <Link
            href="/pwa/progreso"
            className="bg-warm rounded-lg p-4 shadow-sm border border-warm-border flex flex-col items-center gap-2 text-center hover:border-terracotta/30 transition-colors duration-fast ease-standard"
          >
            <div className="w-10 h-10 rounded-md bg-terracotta-soft flex items-center justify-center">
              <span className="text-lg">🏆</span>
            </div>
            <span className="font-body text-xs font-medium text-charcoal">Progreso</span>
          </Link>
        </div>
      </motion.div>

      {/* Motivational tip */}
      <motion.div
        variants={item}
        custom={ENTRANCE_DELAYS[8]}
        className="bg-warm rounded-lg p-4 shadow-sm border border-warm-border"
      >
        <div className="flex items-start gap-3">
          <Icon name="info" size="md" decorative className="text-terracotta mt-0.5" />
          <div>
            <p className="font-body text-sm font-medium text-charcoal">Tip del día</p>
            <p className="font-body text-xs text-muted mt-1 leading-relaxed">
              Masticá cada bocado 20 veces. La digestión empieza en la boca y reduce la hinchazón hasta un 30%.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

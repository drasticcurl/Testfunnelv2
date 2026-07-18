'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import SymptomChart from '@/components/pwa/diario/SymptomChart';
import DiaryEntryCard from '@/components/pwa/diario/DiaryEntryCard';
import { Card } from '@/components/pwa/ui/Card';
import { LoadingState } from '@/components/pwa/ui/LoadingState';
import { EmptyState } from '@/components/pwa/ui/EmptyState';
import { computeStagger } from '@/lib/pwa/ui/motion';
import {
  SymptomLog,
  getLogsFromStorage,
} from '@/lib/pwa/diary-helpers';

export default function DiarioPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<SymptomLog[]>([]);
  const [period, setPeriod] = useState<14 | 30>(14);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Cargamos los registros reales del usuario.
    // No seedeamos fake data: si no registró nada, mostramos el empty state
    // (ver renderizado más abajo).
    setLogs(getLogsFromStorage());
    setIsLoaded(true);
  }, []);

  const recentLogs = logs.slice(0, 7);

  // Single consistent, capped inter-item entrance delay for the entries list.
  const entryDelays = computeStagger(recentLogs.length);

  if (!isLoaded) {
    // Loading_State styled with Design_System tokens, announced to assistive tech.
    return (
      <div className="space-y-4">
        <LoadingState message="Cargando tu diario…" rows={1} className="w-1/2" />
        <LoadingState rows={1} className="h-52" />
        <LoadingState rows={3} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header — page-title level (heading family, 30px, semibold). */}
      <div>
        <h1 className="font-heading font-semibold text-3xl text-charcoal">
          Diario de síntomas
        </h1>
        <p className="font-body text-sm text-muted mt-1">Registrá y seguí tu evolución</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod(14)}
          className={`font-body min-h-[44px] px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-fast ease-standard ${
            period === 14
              ? 'bg-terracotta text-warm shadow-sm'
              : 'bg-terracotta-soft text-muted hover:bg-terracotta/20'
          }`}
        >
          14 días
        </button>
        <button
          onClick={() => setPeriod(30)}
          className={`font-body min-h-[44px] px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-fast ease-standard ${
            period === 30
              ? 'bg-terracotta text-warm shadow-sm'
              : 'bg-terracotta-soft text-muted hover:bg-terracotta/20'
          }`}
        >
          30 días
        </button>
      </div>

      {/* Chart */}
      {logs.length > 0 ? (
        <Card className="shadow-sm">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 font-body text-xs text-muted">
              <span className="inline-block w-3 h-0.5 rounded bg-terracotta" />
              Hinchazón AM
            </div>
            <div className="flex items-center gap-1.5 font-body text-xs text-muted">
              <span className="inline-block w-3 h-0.5 rounded bg-terracotta-light" />
              Hinchazón PM
            </div>
          </div>
          <SymptomChart logs={logs} days={period} />
        </Card>
      ) : (
        // Empty_State: explanatory text + a focusable next-action control.
        <Card className="shadow-sm p-0">
          <EmptyState
            iconName="diary"
            message="Empezá a registrar tus síntomas para ver tu evolución acá."
            actionLabel="+ Nuevo registro"
            onAction={() => router.push('/pwa/diario/nuevo')}
          />
        </Card>
      )}

      {/* Recent Entries */}
      <div>
        <h2 className="font-heading text-xl font-medium text-charcoal mb-3">Últimos registros</h2>
        {recentLogs.length > 0 ? (
          <div className="space-y-2">
            {recentLogs.map((log, idx) => (
              <div
                key={log.id}
                className="animate-fade-in"
                style={{ animationDelay: `${entryDelays[idx]}ms` }}
              >
                <DiaryEntryCard log={log} />
              </div>
            ))}
          </div>
        ) : (
          <p className="font-body text-sm text-muted text-center py-4">
            Todavía no tenés registros
          </p>
        )}
      </div>

      {/* FAB - New Entry */}
      <Link
        href="/pwa/diario/nuevo"
        className="fixed bottom-20 right-4 z-40 bg-terracotta text-warm px-5 py-3 rounded-full font-body font-semibold text-sm shadow-lg hover:shadow-xl transition-transform duration-fast ease-standard hover:-translate-y-0.5 active:scale-95"
      >
        + Nuevo registro
      </Link>
    </motion.div>
  );
}

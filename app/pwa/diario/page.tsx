'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SymptomChart from '@/components/pwa/diario/SymptomChart';
import DiaryEntryCard from '@/components/pwa/diario/DiaryEntryCard';
import {
  SymptomLog,
  getLogsFromStorage,
} from '@/lib/pwa/diary-helpers';

export default function DiarioPage() {
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

  if (!isLoaded) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-sage-soft rounded w-1/2" />
        <div className="h-52 bg-sage-soft rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-sage-soft rounded-lg" />
          ))}
        </div>
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
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-charcoal">Diario de síntomas</h1>
        <p className="text-sm text-charcoal/60 mt-1">Registrá y seguí tu evolución</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod(14)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            period === 14
              ? 'bg-sage text-white shadow-sm'
              : 'bg-sage-soft text-charcoal/70 hover:bg-sage/20'
          }`}
        >
          14 días
        </button>
        <button
          onClick={() => setPeriod(30)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            period === 30
              ? 'bg-sage text-white shadow-sm'
              : 'bg-sage-soft text-charcoal/70 hover:bg-sage/20'
          }`}
        >
          30 días
        </button>
      </div>

      {/* Chart */}
      {logs.length > 0 ? (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-sage-soft/50">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-charcoal/70">
              <span className="inline-block w-3 h-0.5 rounded bg-sage" />
              Hinchazón AM
            </div>
            <div className="flex items-center gap-1.5 text-xs text-charcoal/70">
              <span className="inline-block w-3 h-0.5 rounded bg-coral" />
              Hinchazón PM
            </div>
          </div>
          <SymptomChart logs={logs} days={period} />
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 shadow-sm border border-sage-soft/50 text-center">
          <span className="text-3xl">📊</span>
          <p className="mt-3 text-sm text-charcoal/70">
            Empezá a registrar tus síntomas para ver tu evolución acá
          </p>
          <p className="text-xs text-charcoal/40 mt-1">
            Tocá <strong>+ Nuevo registro</strong> para empezar
          </p>
        </div>
      )}

      {/* Recent Entries */}
      <div>
        <h2 className="text-lg font-medium text-charcoal mb-3">Últimos registros</h2>
        {recentLogs.length > 0 ? (
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <DiaryEntryCard key={log.id} log={log} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-charcoal/50 text-center py-4">
            Todavía no tenés registros
          </p>
        )}
      </div>

      {/* FAB - New Entry */}
      <Link
        href="/pwa/diario/nuevo"
        className="fixed bottom-20 right-4 z-40 bg-coral text-white px-5 py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95"
      >
        + Nuevo registro
      </Link>
    </motion.div>
  );
}

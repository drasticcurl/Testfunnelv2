'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SleepDiary } from '@/lib/types';

export default function DiarioPage() {
  const [entries, setEntries] = useState<SleepDiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      try {
        const res = await fetch('/api/pwa/diary?limit=14');
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, []);

  const getQualityColor = (q: number) => {
    if (q >= 7) return 'text-pwa-success';
    if (q >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-pwa-accent">Diario de Sueño</h1>
          <p className="text-pwa-text-secondary text-sm mt-1">Tu registro noche a noche</p>
        </div>
        <Link
          href="/pwa/diario/nuevo"
          className="bg-pwa-accent text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nuevo
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-pwa-text-secondary text-sm">Cargando...</div>
      ) : entries.length === 0 ? (
        <div className="card-pwa text-center py-10">
          <span className="text-4xl block mb-3">📝</span>
          <p className="text-pwa-text font-medium mb-1">Todavía no tenés registros</p>
          <p className="text-pwa-text-secondary text-sm mb-4">
            Registrá cómo dormiste anoche para empezar a ver tu progreso
          </p>
          <Link
            href="/pwa/diario/nuevo"
            className="inline-block bg-pwa-accent text-white text-sm font-medium px-6 py-2.5 rounded-lg"
          >
            Registrar mi primera noche
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id || entry.date} className="card-pwa flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-pwa-text">{formatDate(entry.date)}</p>
                <p className="text-xs text-pwa-text-secondary">
                  Dormí {entry.hora_dormir} • {entry.despertares} despertar{entry.despertares !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="text-center flex-shrink-0">
                <div className={`text-lg font-bold ${getQualityColor(entry.calidad)}`}>
                  {entry.calidad}
                </div>
                <div className="text-[10px] text-pwa-text-secondary">calidad</div>
              </div>
              <div className="text-center flex-shrink-0">
                <div className={`text-lg font-bold ${getQualityColor(entry.energia_dia)}`}>
                  {entry.energia_dia}
                </div>
                <div className="text-[10px] text-pwa-text-secondary">energía</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

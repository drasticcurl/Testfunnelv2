'use client';

import { useEffect, useState } from 'react';
import { SleepDiary } from '@/lib/types';

export default function ProgresoPage() {
  const [entries, setEntries] = useState<SleepDiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/pwa/diary?limit=30');
        if (res.ok) {
          const data = await res.json();
          setEntries((data.entries || []).reverse()); // chronological order
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-pwa-text-secondary text-sm">Cargando...</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-serif text-2xl text-pwa-accent">Progreso</h1>
        <div className="card-pwa text-center py-10">
          <span className="text-4xl block mb-3">📊</span>
          <p className="text-pwa-text font-medium mb-1">Todavía no hay datos</p>
          <p className="text-pwa-text-secondary text-sm">
            Registrá al menos 2 noches en tu diario para ver tu evolución
          </p>
        </div>
      </div>
    );
  }

  // Calculations
  const last7 = entries.slice(-7);
  const avgQuality = Math.round(last7.reduce((s, e) => s + e.calidad, 0) / last7.length);
  const avgEnergy = Math.round(last7.reduce((s, e) => s + e.energia_dia, 0) / last7.length);
  const avgAwakenings = (last7.reduce((s, e) => s + e.despertares, 0) / last7.length).toFixed(1);

  // Trend
  const firstHalf = entries.slice(0, Math.ceil(entries.length / 2));
  const secondHalf = entries.slice(Math.ceil(entries.length / 2));
  const firstAvg = firstHalf.reduce((s, e) => s + e.calidad, 0) / firstHalf.length;
  const secondAvg = secondHalf.length > 0
    ? secondHalf.reduce((s, e) => s + e.calidad, 0) / secondHalf.length
    : firstAvg;
  const trend = secondAvg > firstAvg + 0.5 ? 'mejorando' : secondAvg < firstAvg - 0.5 ? 'empeorando' : 'estable';
  const trendEmoji = trend === 'mejorando' ? '📈' : trend === 'empeorando' ? '📉' : '➡️';
  const trendColor = trend === 'mejorando' ? 'text-pwa-success' : trend === 'empeorando' ? 'text-red-500' : 'text-yellow-500';

  // Best night
  const bestNight = [...entries].sort((a, b) => b.calidad - a.calidad)[0];
  const bestDate = new Date(bestNight.date + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-pwa-accent">Progreso</h1>
        <p className="text-pwa-text-secondary text-sm mt-1">Tu evolución de sueño</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card-pwa text-center">
          <div className="text-2xl font-bold text-pwa-accent">{avgQuality}/10</div>
          <div className="text-xs text-pwa-text-secondary">Calidad promedio</div>
        </div>
        <div className="card-pwa text-center">
          <div className="text-2xl font-bold text-pwa-highlight">{avgEnergy}/10</div>
          <div className="text-xs text-pwa-text-secondary">Energía promedio</div>
        </div>
        <div className="card-pwa text-center">
          <div className={`text-2xl font-bold ${trendColor}`}>{trendEmoji}</div>
          <div className="text-xs text-pwa-text-secondary capitalize">{trend}</div>
        </div>
        <div className="card-pwa text-center">
          <div className="text-2xl font-bold text-pwa-success">{avgAwakenings}</div>
          <div className="text-xs text-pwa-text-secondary">Despertares/noche</div>
        </div>
      </div>

      {/* Best night */}
      <div className="card-pwa bg-pwa-success/5 border-pwa-success/20 flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-sm font-medium text-pwa-text">Mejor noche: {bestDate}</p>
          <p className="text-xs text-pwa-text-secondary">Calidad {bestNight.calidad}/10, Energía {bestNight.energia_dia}/10</p>
        </div>
      </div>

      {/* Quality chart */}
      <div className="card-pwa">
        <h3 className="font-medium text-pwa-text text-sm mb-4">Calidad de sueño</h3>
        <div className="flex items-end gap-1 h-32">
          {last7.map((entry, i) => {
            const height = (entry.calidad / 10) * 100;
            const color = entry.calidad >= 7 ? 'bg-pwa-success' : entry.calidad >= 5 ? 'bg-yellow-400' : 'bg-red-400';
            const date = new Date(entry.date + 'T12:00:00');
            const day = date.toLocaleDateString('es-AR', { weekday: 'short' }).slice(0, 2);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-pwa-text-secondary">{entry.calidad}</span>
                <div className="w-full rounded-t-sm relative" style={{ height: '100px' }}>
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm ${color} transition-all`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] text-pwa-text-secondary">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy chart */}
      <div className="card-pwa">
        <h3 className="font-medium text-pwa-text text-sm mb-4">Energía diaria</h3>
        <div className="flex items-end gap-1 h-32">
          {last7.map((entry, i) => {
            const height = (entry.energia_dia / 10) * 100;
            const color = entry.energia_dia >= 7 ? 'bg-pwa-highlight' : entry.energia_dia >= 5 ? 'bg-yellow-400' : 'bg-red-400';
            const date = new Date(entry.date + 'T12:00:00');
            const day = date.toLocaleDateString('es-AR', { weekday: 'short' }).slice(0, 2);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-pwa-text-secondary">{entry.energia_dia}</span>
                <div className="w-full rounded-t-sm relative" style={{ height: '100px' }}>
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm ${color} transition-all`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] text-pwa-text-secondary">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Awakenings chart */}
      <div className="card-pwa">
        <h3 className="font-medium text-pwa-text text-sm mb-4">Despertares nocturnos</h3>
        <div className="flex items-end gap-1 h-24">
          {last7.map((entry, i) => {
            const maxAwakenings = 5;
            const height = Math.min(100, (entry.despertares / maxAwakenings) * 100);
            const color = entry.despertares <= 1 ? 'bg-pwa-success' : entry.despertares <= 2 ? 'bg-yellow-400' : 'bg-red-400';
            const date = new Date(entry.date + 'T12:00:00');
            const day = date.toLocaleDateString('es-AR', { weekday: 'short' }).slice(0, 2);
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-pwa-text-secondary">{entry.despertares}</span>
                <div className="w-full rounded-t-sm relative" style={{ height: '70px' }}>
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm ${color} transition-all`}
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[10px] text-pwa-text-secondary">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total entries */}
      <p className="text-center text-pwa-text-secondary text-xs">
        Total de registros: {entries.length} noches
      </p>
    </div>
  );
}

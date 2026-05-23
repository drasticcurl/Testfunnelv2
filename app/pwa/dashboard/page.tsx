'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SleepUser } from '@/lib/types';

interface DashboardData {
  user: SleepUser;
  currentDay: number;
  streak: number;
  avgQuality: number | null;
  completedNights: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Fetch user info
        const meRes = await fetch('/api/pwa/me');
        if (!meRes.ok) return;
        const { user } = await meRes.json();

        // Calculate current day (days since account creation, max 7)
        const createdAt = new Date(user.created_at);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        const currentDay = Math.min(7, Math.max(1, diffDays + 1));

        // Fetch diary entries for streak and quality
        let streak = 0;
        let avgQuality: number | null = null;
        try {
          const diaryRes = await fetch('/api/pwa/diary');
          if (diaryRes.ok) {
            const { entries } = await diaryRes.json();
            if (entries && entries.length > 0) {
              // Calculate streak (consecutive days with entries)
              const today = new Date().toISOString().split('T')[0];
              const dates = entries.map((e: { date: string }) => e.date).sort().reverse();
              let checkDate = today;
              for (const date of dates) {
                if (date === checkDate || date === getPrevDate(checkDate)) {
                  streak++;
                  checkDate = date;
                } else {
                  break;
                }
              }

              // Average quality of last 3 entries
              const recent = entries.slice(0, 3);
              const totalQuality = recent.reduce((sum: number, e: { calidad: number }) => sum + e.calidad, 0);
              avgQuality = Math.round(totalQuality / recent.length);
            }
          }
        } catch {
          // Diary API might not have entries yet
        }

        setData({
          user,
          currentDay,
          streak,
          avgQuality,
          completedNights: Math.min(currentDay - 1, 7),
        });
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-pwa-text-secondary text-sm">Cargando...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-pwa-text-secondary">Error al cargar el dashboard</p>
      </div>
    );
  }

  const { user, currentDay, streak, avgQuality, completedNights } = data;
  const isCompleted = currentDay > 7 || completedNights >= 7;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="font-serif text-2xl text-pwa-accent">
          Hola{user.nombre ? `, ${user.nombre}` : ''} 👋
        </h1>
        <p className="text-pwa-text-secondary text-sm mt-1">
          {isCompleted
            ? '¡Completaste tu protocolo de 7 noches!'
            : `Estás en la noche ${currentDay} de tu protocolo`}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-pwa text-center">
          <div className="text-2xl font-bold text-pwa-accent">{currentDay}</div>
          <div className="text-xs text-pwa-text-secondary mt-0.5">Día actual</div>
        </div>
        <div className="card-pwa text-center">
          <div className="text-2xl font-bold text-pwa-highlight">{streak}</div>
          <div className="text-xs text-pwa-text-secondary mt-0.5">Racha</div>
        </div>
        <div className="card-pwa text-center">
          <div className="text-2xl font-bold text-pwa-success">
            {avgQuality !== null ? `${avgQuality}/10` : '—'}
          </div>
          <div className="text-xs text-pwa-text-secondary mt-0.5">Calidad</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card-pwa">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-pwa-text">Progreso del protocolo</span>
          <span className="text-xs text-pwa-text-secondary">{completedNights}/7 noches</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pwa-accent to-pwa-highlight rounded-full transition-all duration-500"
            style={{ width: `${(completedNights / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="font-medium text-pwa-text text-sm">Accesos rápidos</h2>

        {!isCompleted && (
          <Link href={`/pwa/plan/${currentDay}`} className="card-pwa flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-pwa-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">🌙</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-pwa-text">Tu noche de hoy</p>
              <p className="text-xs text-pwa-text-secondary">Noche {currentDay} del protocolo</p>
            </div>
            <span className="text-pwa-accent">→</span>
          </Link>
        )}

        <Link href="/pwa/diario/nuevo" className="card-pwa flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-pwa-highlight/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📝</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-pwa-text">Registrar sueño</p>
            <p className="text-xs text-pwa-text-secondary">¿Cómo dormiste anoche?</p>
          </div>
          <span className="text-pwa-accent">→</span>
        </Link>

        <Link href="/pwa/progreso" className="card-pwa flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-pwa-success/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl">📊</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-pwa-text">Ver progreso</p>
            <p className="text-xs text-pwa-text-secondary">Tu evolución de sueño</p>
          </div>
          <span className="text-pwa-accent">→</span>
        </Link>
      </div>

      {/* Completed message */}
      {isCompleted && (
        <div className="card-pwa bg-pwa-success/5 border-pwa-success/20">
          <div className="text-center">
            <span className="text-3xl block mb-2">🎉</span>
            <h3 className="font-serif text-lg text-pwa-accent mb-1">¡Protocolo completado!</h3>
            <p className="text-sm text-pwa-text-secondary">
              Seguí registrando tu sueño y consultando las guías para mantener tus resultados.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getPrevDate(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

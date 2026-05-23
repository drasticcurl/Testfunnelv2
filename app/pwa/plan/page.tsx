'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PLAN_NIGHTS } from '@/lib/pwa/plan-content';

export default function PlanPage() {
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/pwa/me');
        if (res.ok) {
          const { user } = await res.json();
          const createdAt = new Date(user.created_at);
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          setCurrentDay(Math.min(7, Math.max(1, diffDays + 1)));
        }
      } catch {
        // fallback to day 1
      }
    }
    loadUser();
  }, []);

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-pwa-accent">Plan de 7 Noches</h1>
        <p className="text-pwa-text-secondary text-sm mt-1">
          Tu protocolo personalizado, noche a noche
        </p>
      </div>

      <div className="space-y-3">
        {PLAN_NIGHTS.map((night) => {
          const isUnlocked = night.number <= currentDay;
          const isCurrent = night.number === currentDay;
          const isCompleted = night.number < currentDay;

          return (
            <Link
              key={night.number}
              href={isUnlocked ? `/pwa/plan/${night.number}` : '#'}
              className={`card-pwa flex items-center gap-4 transition-all ${
                !isUnlocked ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
              } ${isCurrent ? 'ring-2 ring-pwa-accent/30' : ''}`}
              onClick={(e) => !isUnlocked && e.preventDefault()}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCompleted
                  ? 'bg-pwa-success/10'
                  : isCurrent
                  ? 'bg-pwa-accent/10'
                  : 'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <span className="text-pwa-success text-lg">✓</span>
                ) : (
                  <span className="text-lg">{night.emoji}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-pwa-text-secondary">
                    Noche {night.number}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] bg-pwa-accent text-white px-2 py-0.5 rounded-full">
                      HOY
                    </span>
                  )}
                </div>
                <p className="font-medium text-pwa-text text-sm truncate">{night.title}</p>
                <p className="text-xs text-pwa-text-secondary truncate">{night.subtitle}</p>
              </div>
              {isUnlocked && (
                <span className="text-pwa-accent text-sm flex-shrink-0">→</span>
              )}
              {!isUnlocked && (
                <span className="text-gray-400 text-sm flex-shrink-0">🔒</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

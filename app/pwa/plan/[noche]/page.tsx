'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getNightContent, getGenderTips } from '@/lib/pwa/plan-content';
import { Gender } from '@/lib/types';

export default function NightDetailPage() {
  const params = useParams();
  const nightNumber = parseInt(params.noche as string, 10);
  const [genero, setGenero] = useState<Gender>('hombre');

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/pwa/me');
        if (res.ok) {
          const { user } = await res.json();
          setGenero(user.genero || 'hombre');
        }
      } catch {
        // fallback
      }
    }
    loadUser();
  }, []);

  const night = getNightContent(nightNumber);

  if (!night) {
    return (
      <div className="text-center py-20">
        <p className="text-pwa-text-secondary">Noche no encontrada</p>
        <Link href="/pwa/plan" className="text-pwa-accent text-sm mt-2 inline-block">
          ← Volver al plan
        </Link>
      </div>
    );
  }

  const tips = getGenderTips(night, genero);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/pwa/plan" className="text-pwa-accent text-sm mb-3 inline-block">
          ← Volver al plan
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{night.emoji}</span>
          <div>
            <p className="text-xs text-pwa-text-secondary">Noche {night.number} de 7</p>
            <h1 className="font-serif text-xl text-pwa-accent">{night.title}</h1>
          </div>
        </div>
        <p className="text-pwa-text-secondary text-sm">{night.subtitle}</p>
      </div>

      {/* Intro */}
      <div className="card-pwa">
        <p className="text-pwa-text text-sm leading-relaxed">{night.intro}</p>
      </div>

      {/* Steps */}
      <div>
        <h2 className="font-medium text-pwa-text mb-3">Qué hacer esta noche</h2>
        <div className="space-y-3">
          {night.steps.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-pwa-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-pwa-accent text-xs font-bold">{i + 1}</span>
              </div>
              <p className="text-sm text-pwa-text leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gender-specific tips */}
      <div className="card-pwa bg-pwa-highlight/5 border-pwa-highlight/20">
        <h3 className="font-medium text-pwa-text mb-2 flex items-center gap-2">
          <span>💡</span> Tips para vos
        </h3>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <p key={i} className="text-sm text-pwa-text-secondary leading-relaxed">
              • {tip}
            </p>
          ))}
        </div>
      </div>

      {/* Challenge */}
      <div className="card-pwa bg-pwa-accent/5 border-pwa-accent/20">
        <h3 className="font-medium text-pwa-accent mb-2 flex items-center gap-2">
          <span>🎯</span> Desafío de esta noche
        </h3>
        <p className="text-sm text-pwa-text leading-relaxed">{night.challenge}</p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        {nightNumber > 1 && (
          <Link
            href={`/pwa/plan/${nightNumber - 1}`}
            className="flex-1 text-center py-3 border border-pwa-border rounded-lg text-sm text-pwa-text-secondary hover:border-pwa-accent transition-colors"
          >
            ← Noche {nightNumber - 1}
          </Link>
        )}
        {nightNumber < 7 && (
          <Link
            href={`/pwa/plan/${nightNumber + 1}`}
            className="flex-1 text-center py-3 bg-pwa-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Noche {nightNumber + 1} →
          </Link>
        )}
      </div>

      {/* Log CTA */}
      <Link
        href="/pwa/diario/nuevo"
        className="block text-center py-3 border border-pwa-highlight/30 rounded-lg text-sm text-pwa-highlight hover:bg-pwa-highlight/5 transition-colors"
      >
        📝 Registrar cómo dormí esta noche
      </Link>
    </div>
  );
}

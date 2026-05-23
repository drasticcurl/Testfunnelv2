'use client';

/**
 * SlideLoadingV3 — loading rápido de 6 segundos.
 * Sin testimonios rotando (la persona de Google no tiene paciencia).
 * Solo: spinner + checkmarks rápidos + barra de progreso.
 */

import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const DURATION_MS = 6_000;

const CHECKMARKS = [
  { text: 'Analizando tus síntomas', at: 20 },
  { text: 'Identificando tu tipo de hinchazón', at: 45 },
  { text: 'Calculando severidad', at: 70 },
  { text: 'Generando tu plan', at: 92 },
];

export function SlideLoadingV3({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    let completed = false;

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / DURATION_MS) * 100, 100);
      setProgress(percent);

      if (elapsed >= DURATION_MS && !completed) {
        completed = true;
        clearInterval(tick);
        onComplete();
      }
    }, 50);

    return () => clearInterval(tick);
  }, [onComplete]);

  return (
    <div className="text-center">
      <div className="inline-block mb-6">
        <div
          className="w-14 h-14 rounded-full border-4 border-sage-soft border-t-sage animate-spin"
          aria-hidden="true"
        />
      </div>

      <h2 className="font-serif text-2xl text-charcoal font-semibold">
        Analizando tu perfil…
      </h2>

      <div className="mt-6 max-w-sm mx-auto">
        <div className="h-2 bg-[#EFECE7] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage to-coral transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 font-sans text-xs text-[#9B9890]">{Math.round(progress)}%</p>
      </div>

      <ul className="mt-6 space-y-2 max-w-sm mx-auto text-left">
        {CHECKMARKS.map((c, i) => {
          const done = progress >= c.at;
          return (
            <li
              key={i}
              className={`flex items-center gap-3 font-sans text-sm transition-opacity duration-300 ${
                done ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${
                  done ? 'bg-sage text-white' : 'bg-[#EFECE7]'
                }`}
              >
                {done && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span className={done ? 'text-charcoal' : 'text-[#5C5852]'}>{c.text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

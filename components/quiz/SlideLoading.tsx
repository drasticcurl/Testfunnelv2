'use client';

/**
 * SlideLoading - pantalla de "analizando" 12 segundos.
 *
 * Investment-building al estilo BetterMe / Noom: mientras más tiempo
 * la persona "espera el cálculo", más percibe valor en el resultado.
 * Subido de 4s a 12s con:
 *   - Barra de progreso visible (0 → 100%)
 *   - 4 checkmarks que se van completando uno por uno
 *   - 3 testimonios que rotan (cada ~4s)
 *
 * A los 12000ms exactos llama a onComplete().
 */

import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

const DURATION_MS = 12_000;
const TICK_MS = 50;

// Checkmarks que se completan progresivamente. El `at` es el % al que se
// activa cada uno (espaciados para que el último termine antes del 100%).
const CHECKMARKS: { text: string; at: number }[] = [
  { text: 'Analizando tus 23 indicadores', at: 18 },
  { text: 'Cruzando con +1.200 perfiles similares', at: 42 },
  { text: 'Calculando tu nivel de severidad', at: 68 },
  { text: 'Generando tu plan personalizado', at: 92 },
];

// Testimonios rotando (cada ~4s). Pensados para mujer 35-50 LATAM.
const TESTIMONIOS: { quote: string; nombre: string }[] = [
  {
    quote: 'Al día 4 ya no me cerraba el jean. No lo podía creer.',
    nombre: 'Anabela, 41 años · Buenos Aires',
  },
  {
    quote: 'En 7 días entendí cuál era el alimento que me estaba inflamando hace años.',
    nombre: 'Lucía, 38 años · Córdoba',
  },
  {
    quote: 'Bajé 3 cm de panza sin hacer dieta ni pasar hambre.',
    nombre: 'Verónica, 51 años · Mendoza',
  },
];

const TESTIMONIO_DURATION = Math.floor(DURATION_MS / TESTIMONIOS.length);

export function SlideLoading({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [testimonioIdx, setTestimonioIdx] = useState(0);

  useEffect(() => {
    const start = Date.now();
    let completed = false;

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / DURATION_MS) * 100, 100);
      setProgress(percent);

      const idx = Math.min(
        Math.floor(elapsed / TESTIMONIO_DURATION),
        TESTIMONIOS.length - 1,
      );
      setTestimonioIdx(idx);

      if (elapsed >= DURATION_MS && !completed) {
        completed = true;
        clearInterval(tick);
        onComplete();
      }
    }, TICK_MS);

    return () => {
      clearInterval(tick);
    };
  }, [onComplete]);

  const currentTestimonio = TESTIMONIOS[testimonioIdx];

  return (
    <div className="text-center">
      {/* Spinner sutil */}
      <div className="inline-block mb-6">
        <div
          className="w-16 h-16 rounded-full border-4 border-sage-soft border-t-sage animate-spin"
          aria-hidden="true"
        />
      </div>

      <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-semibold">
        Analizando tu perfil…
      </h2>

      {/* Barra de progreso */}
      <div className="mt-6 max-w-md mx-auto">
        <div
          className="h-2 bg-[#EFECE7] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Generando tu resultado"
        >
          <div
            className="h-full bg-gradient-to-r from-sage to-coral transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1.5 font-sans text-xs text-[#9B9890]">
          {Math.round(progress)}%
        </p>
      </div>

      {/* Checkmarks que se van completando */}
      <ul className="mt-8 space-y-2.5 max-w-sm mx-auto text-left">
        {CHECKMARKS.map((c, i) => {
          const done = progress >= c.at;
          return (
            <li
              key={i}
              className={`flex items-center gap-3 font-sans text-sm md:text-base transition-opacity duration-300 ${
                done ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <span
                className={`flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 transition-all ${
                  done ? 'bg-sage text-white' : 'bg-[#EFECE7] text-[#9B9890]'
                }`}
                aria-hidden="true"
              >
                {done ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="block w-1.5 h-1.5 rounded-full bg-[#9B9890]" />
                )}
              </span>
              <span className={done ? 'text-charcoal' : 'text-[#5C5852]'}>
                {c.text}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Testimonio rotando — fade in/out con key */}
      <div
        key={testimonioIdx}
        className="mt-10 max-w-md mx-auto bg-sage-soft rounded-xl p-5 animate-[fadeIn_400ms_ease-in]"
        aria-live="polite"
      >
        <p className="font-serif text-base md:text-lg text-charcoal italic leading-relaxed">
          &ldquo;{currentTestimonio.quote}&rdquo;
        </p>
        <p className="mt-2 font-sans text-xs text-[#5C5852] font-medium">
          — {currentTestimonio.nombre}
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

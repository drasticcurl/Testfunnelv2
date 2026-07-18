'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (nombre: string) => void;
  defaultValue?: string;
}

/**
 * SlideNameCaptureLatam — fork neutro (español "tú") de SlideNameCaptureV3.
 * Misma estructura/estilo/props. El copy original ya era neutral; se mantiene.
 */
export function SlideNameCaptureLatam({ onSubmit, defaultValue = '' }: Props) {
  const [value, setValue] = useState(defaultValue);
  const isValid = value.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onSubmit(value.trim());
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2
        className="text-2xl md:text-3xl text-center leading-tight mb-2"
        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
      >
        Primero, ¿cómo te llamamos?
      </h2>
      <p
        className="text-sm text-center mb-8"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
      >
        Para personalizar tu diagnóstico
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ej. Carolina"
          autoFocus
          autoComplete="given-name"
          className="w-full px-4 py-4 text-base rounded-2xl border-2 outline-none transition-all"
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--charcoal)',
            borderColor: value.length > 0 ? 'var(--terracotta)' : 'var(--warm-border)',
            backgroundColor: '#fff',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--terracotta)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = value.length > 0 ? 'var(--terracotta)' : 'var(--warm-border)'; }}
        />

        <button
          type="submit"
          disabled={!isValid}
          className="btn-primary"
        >
          CONTINUAR →
        </button>
      </form>

      <p
        className="mt-4 text-center text-xs"
        style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}
      >
        🔒 Tu información es privada y segura
      </p>
    </div>
  );
}

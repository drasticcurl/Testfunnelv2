'use client';

/**
 * SlideEmailCaptureV3 — captura el email post-diagnóstico.
 *
 * Posición en el flow: justo después de `diagnosis_result` y antes de
 * `loading_steps`. El usuario ya vio sus 3 barras (alta inflamación, alto
 * riesgo, baja eficiencia) → momento de máximo compromiso → "para guardar
 * tu plan, dejá tu email".
 *
 * No tiene checkbox de consent (decisión del owner). Sí tiene un copy corto
 * de "tu información es privada".
 *
 * Validación: regex simple de email + mínimo 5 chars. El backend valida
 * formato real al recibir.
 */

import { useState } from 'react';

interface Props {
  onSubmit: (email: string) => void;
  defaultValue?: string;
  nombre?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SlideEmailCaptureV3({ onSubmit, defaultValue = '', nombre }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const trimmed = value.trim();
  const isValid = trimmed.length >= 5 && EMAIL_RE.test(trimmed);
  const showError = touched && !isValid && trimmed.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || submitting) return;
    setSubmitting(true);
    onSubmit(trimmed);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <h2
        className="text-2xl md:text-3xl text-center leading-tight mb-2"
        style={{ color: 'var(--charcoal)', fontFamily: 'var(--font-serif)' }}
      >
        {nombre ? `${nombre}, tu plan está listo` : 'Tu plan está listo'}
      </h2>
      <p
        className="text-sm text-center mb-6"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}
      >
        Dejá tu email para guardar tu diagnóstico y recibir tu plan personalizado del <strong>Método del Agua de Arroz</strong>.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div>
          <input
            type="email"
            inputMode="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="tucorreo@ejemplo.com"
            autoFocus
            autoComplete="email"
            aria-invalid={showError ? 'true' : 'false'}
            className="w-full px-4 py-4 text-base rounded-2xl border-2 outline-none transition-all"
            style={{
              fontFamily: 'var(--font-sans)',
              color: 'var(--charcoal)',
              borderColor: showError
                ? '#C25450'
                : value.length > 0
                  ? 'var(--terracotta)'
                  : 'var(--warm-border)',
              backgroundColor: '#fff',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--terracotta)'; }}
          />
          {showError && (
            <p
              className="mt-1.5 text-sm"
              style={{ color: '#C25450', fontFamily: 'var(--font-sans)' }}
              role="alert"
            >
              Revisá el email — parece que falta algo.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="btn-primary"
        >
          {submitting ? 'GUARDANDO…' : 'VER MI PLAN →'}
        </button>
      </form>

      <p
        className="mt-4 text-center text-xs"
        style={{ color: 'var(--muted-light)', fontFamily: 'var(--font-sans)' }}
      >
        🔒 Tu información es privada. No la compartimos con nadie.
      </p>
    </div>
  );
}

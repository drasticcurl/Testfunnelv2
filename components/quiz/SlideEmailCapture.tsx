'use client';

/**
 * SlideEmailCapture - slide 12 del quiz nuevo.
 *
 * Solo email, OBLIGATORIO. El nombre se pide en SlideNameCapture (slide 11).
 *
 * Form con react-hook-form + Zod:
 *   - email: required, formato válido
 *
 * Al submit -> onSubmit(email) -> el padre se ocupa de:
 *   1. Guardar en el store
 *   2. POST a /api/submit-quiz (que persiste en Supabase + dispara Resend)
 *   3. fbq('track', 'Lead') + fbq('trackCustom', 'QuizComplete')
 *   4. Avanzar al SlideLoading (12s)
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/ui/Button';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Ingresá tu email')
    .email('Ingresá un email válido'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  /** Nombre ya capturado en el slide anterior. Se muestra en el saludo. */
  nombre?: string;
  onSubmit: (email: string) => Promise<void>;
}

export function SlideEmailCapture({ nombre, onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit(async (data) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(data.email);
    } finally {
      // Si no se avanzó (ej. fallo de red), permitir reintento
      setSubmitting(false);
    }
  });

  return (
    <div>
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center leading-tight font-semibold">
        {nombre ? `${nombre}, tu plan personalizado está casi listo.` : 'Tu plan personalizado está casi listo.'}
      </h2>

      <p className="mt-6 font-sans text-[#5C5852] text-center max-w-lg mx-auto">
        Dejá tu mejor email y te enviamos:
      </p>

      <ul className="mt-6 space-y-2 max-w-md mx-auto font-sans text-charcoal">
        <li>✅ Tu diagnóstico personalizado</li>
        <li>✅ El protocolo de 7 días para tu tipo de hinchazón</li>
        <li>✅ Lista de alimentos inflamatorios ocultos</li>
      </ul>

      <form onSubmit={submit} className="mt-8 space-y-3 max-w-md mx-auto" noValidate>
        <div>
          <label htmlFor="quiz-email" className="sr-only">
            Email
          </label>
          <input
            id="quiz-email"
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="tu@email.com"
            aria-invalid={errors.email ? 'true' : 'false'}
            {...register('email')}
            className="w-full px-5 py-4 rounded-lg border-2 border-[#EFECE7] focus:border-sage focus:outline-none font-sans text-base bg-white transition-colors"
          />
          {errors.email && (
            <p className="mt-1.5 font-sans text-sm text-[#C25450]" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={submitting}
          loading={submitting}
        >
          {submitting ? 'PROCESANDO…' : 'VER MIS RESULTADOS →'}
        </Button>

        <p className="font-sans text-xs text-[#5C5852] text-center">
          🔒 No compartimos tu información. Cero spam.
        </p>
      </form>
    </div>
  );
}

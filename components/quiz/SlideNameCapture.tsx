'use client';

/**
 * SlideNameCapture - slide 11 del quiz nuevo.
 *
 * Pide el nombre como slide propio (antes era opcional al final del
 * email_capture). Razones:
 *   - low-friction (1 solo campo, validación mínima)
 *   - micro-compromiso emocional ("ya me presenté, sigo")
 *   - garantiza personalización en /resultados (saludo con nombre real)
 *
 * Validación:
 *   - mínimo 2 chars
 *   - máximo 40 chars
 *   - permite acentos, ñ, apóstrofes y guiones (nombres reales LATAM)
 */

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/ui/Button';

const schema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Tu nombre tiene que tener al menos 2 letras')
    .max(40, 'Demasiado largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'\-]+$/, 'Usá solo letras'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (nombre: string) => void;
  defaultValue?: string;
}

export function SlideNameCapture({ onSubmit, defaultValue }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: defaultValue ?? '' },
  });

  const submit = handleSubmit((data) => {
    onSubmit(data.nombre.trim());
  });

  return (
    <div>
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center leading-tight font-semibold">
        Antes de mostrarte tu plan…
      </h2>

      <p className="mt-4 font-sans text-base md:text-lg text-[#5C5852] text-center max-w-md mx-auto">
        ¿Cómo querés que te llamemos?
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3 max-w-md mx-auto" noValidate>
        <div>
          <label htmlFor="quiz-nombre" className="sr-only">
            Tu nombre
          </label>
          <input
            id="quiz-nombre"
            type="text"
            autoComplete="given-name"
            autoFocus
            placeholder="Ej. Carolina"
            aria-invalid={errors.nombre ? 'true' : 'false'}
            {...register('nombre')}
            className="w-full px-5 py-4 rounded-lg border-2 border-[#EFECE7] focus:border-sage focus:outline-none font-sans text-base bg-white transition-colors"
          />
          {errors.nombre && (
            <p className="mt-1.5 font-sans text-sm text-[#C25450]" role="alert">
              {errors.nombre.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          CONTINUAR →
        </Button>
      </form>
    </div>
  );
}

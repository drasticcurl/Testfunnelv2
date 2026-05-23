# 02 — AGENTE QUIZ

> **Rol:** construir el quiz de 16 slides (10 preguntas + 3 info cards + 3 slides especiales).

## Tu output

1. **`app/quiz/page.tsx`** — contenedor del quiz
2. **`components/quiz/*`** — todos los componentes del quiz
3. **`lib/quiz-data.ts`** — los 16 slides definidos (lo copiás de `_QUIZ-DATA.md`)
4. **`lib/quiz-store.ts`** — Zustand store
5. **`lib/quiz-types.ts`** — types compartidos (lo copiás de `_QUIZ-DATA.md`)
6. **`lib/tipos-hinchazon.ts`** — funciones `calcularTipo` y `calcularSeveridad` (de `_QUIZ-DATA.md`)

## Archivos que tocás (exclusivos tuyos)

- `app/quiz/page.tsx`
- `components/quiz/*` (todos)
- `lib/quiz-data.ts`
- `lib/quiz-store.ts`
- `lib/quiz-types.ts`
- `lib/tipos-hinchazon.ts`

**No toques:** `app/page.tsx`, `app/resultados/*`, `app/api/*`, `app/layout.tsx`, `tailwind.config.ts`, `globals.css`, `components/ui/*` (el agente 01 los hizo, los importás).

## Asumís que ya existen (creados por agente 01)

- Proyecto Next.js inicializado
- `components/ui/Button.tsx`
- `components/ui/Container.tsx`
- `lib/utils.ts` con `cn()`
- Tailwind y globals.css configurados

Si por algún motivo no están, pedile al humano que active el agente 01 primero. NO los rehagas vos.

---

## Estructura de archivos esperada

```
app/quiz/
└── page.tsx                          ← contenedor

components/quiz/
├── QuizContainer.tsx                 ← lógica principal
├── QuizProgress.tsx                  ← barra de progreso
├── SlideIntro.tsx                    ← slide 1
├── SlideQuestion.tsx                 ← genérico para preguntas
├── SlideInfoCard.tsx                 ← info cards
├── SlideEmailCapture.tsx             ← captura email
├── SlideLoading.tsx                  ← pantalla de carga
├── OptionCard.tsx                    ← opción de pregunta
└── ProgressBar.tsx

lib/
├── quiz-data.ts                      ← copiar de _QUIZ-DATA.md
├── quiz-store.ts
├── quiz-types.ts                     ← copiar de _QUIZ-DATA.md
└── tipos-hinchazon.ts                ← copiar de _QUIZ-DATA.md
```

---

## Implementación

### `lib/quiz-types.ts`

> **Copiar literal de `_QUIZ-DATA.md` sección "Tipos TypeScript canónicos".**

### `lib/quiz-data.ts`

> **Copiar literal de `_QUIZ-DATA.md` sección "Definición declarativa de slides".**

### `lib/tipos-hinchazon.ts`

> **Copiar literal de `_QUIZ-DATA.md` sección "Lógica de scoring" + "Construcción de la URL de redirect".**

### `lib/quiz-store.ts`

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuizAnswers, QuestionId } from './quiz-types';

interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  startedAt: number | null;

  start: () => void;
  setAnswer: (id: keyof QuizAnswers, value: string | string[]) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: {},
      startedAt: null,

      start: () => set({ startedAt: Date.now(), currentStep: 1 }),

      setAnswer: (id, value) =>
        set((state) => ({
          answers: { ...state.answers, [id]: value },
        })),

      next: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prev: () =>
        set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),

      reset: () => set({ currentStep: 0, answers: {}, startedAt: null }),
    }),
    { name: 'anti-hinchazon-quiz' },
  ),
);
```

### `app/quiz/page.tsx`

```tsx
import { QuizContainer } from '@/components/quiz/QuizContainer';

export default function QuizPage() {
  return <QuizContainer />;
}
```

### `components/quiz/QuizContainer.tsx`

Lógica principal: lee el step actual del store y renderiza el slide correcto.

```tsx
'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/lib/quiz-store';
import { slides } from '@/lib/quiz-data';
import { buildResultsUrl } from '@/lib/tipos-hinchazon';
import { SlideIntro } from './SlideIntro';
import { SlideQuestion } from './SlideQuestion';
import { SlideInfoCard } from './SlideInfoCard';
import { SlideEmailCapture } from './SlideEmailCapture';
import { SlideLoading } from './SlideLoading';
import { QuizProgress } from './QuizProgress';

export function QuizContainer() {
  const router = useRouter();
  const { currentStep, answers, start, next } = useQuizStore();

  // Inicializar
  useEffect(() => {
    if (currentStep === 0) {
      // No hacer nada, mostrar el intro
    }
  }, [currentStep]);

  const slide = slides[currentStep];

  if (!slide) {
    // Quiz terminado, redirect a resultados
    if (typeof window !== 'undefined') {
      router.replace(buildResultsUrl(answers));
    }
    return null;
  }

  const handleNext = () => next();

  const handleEmailSubmit = async (email: string, nombre?: string) => {
    // Persistir email + forward a webhook
    await fetch('/api/submit-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...answers, email, nombre }),
    });

    // Track Lead
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Lead');
      (window as any).fbq('trackCustom', 'QuizComplete');
    }

    next(); // Va al slide loading
  };

  const handleLoadingComplete = () => {
    router.push(buildResultsUrl({ ...answers }));
  };

  // Pregunta 3 → trackear
  useEffect(() => {
    if (slide?.type === 'question' && slide.id === 'tiempo_con_problema') {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('trackCustom', 'QuizQ3');
      }
    }
  }, [slide]);

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {slide.type !== 'intro' && slide.type !== 'loading' && (
        <QuizProgress currentSlide={currentStep} />
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full max-w-2xl"
          >
            {slide.type === 'intro' && (
              <SlideIntro onStart={() => { start(); }} />
            )}

            {slide.type === 'question' && (
              <SlideQuestion slide={slide} onNext={handleNext} />
            )}

            {slide.type === 'info_card' && (
              <SlideInfoCard slide={slide} onContinue={handleNext} />
            )}

            {slide.type === 'email_capture' && (
              <SlideEmailCapture onSubmit={handleEmailSubmit} />
            )}

            {slide.type === 'loading' && (
              <SlideLoading onComplete={handleLoadingComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
```

### `components/quiz/QuizProgress.tsx`

Barra de progreso sobre las **9 preguntas reales** (slides 2, 3, 4, 6, 7, 9, 10, 12, 13, 14 son preguntas, total 10 — mostrar progreso sobre 10).

> Nota: las info cards (slides 5, 8, 11) y la email capture (15) no se cuentan en el progreso.

```tsx
import { slides } from '@/lib/quiz-data';

interface Props { currentSlide: number; }

export function QuizProgress({ currentSlide }: Props) {
  // Cuántas preguntas hay antes (incluyendo la actual)
  const questionsTotal = slides.filter(s => s.type === 'question').length;
  const questionsPassed = slides
    .slice(0, currentSlide + 1)
    .filter(s => s.type === 'question').length;

  const percent = (questionsPassed / questionsTotal) * 100;

  return (
    <div className="px-6 pt-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Pregunta {Math.min(questionsPassed, questionsTotal)} de {questionsTotal}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage to-coral transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

### `components/quiz/SlideIntro.tsx`

```tsx
import { Button } from '@/components/ui/Button';

interface Props { onStart: () => void; }

export function SlideIntro({ onStart }: Props) {
  return (
    <div className="text-center">
      <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
        Test: descubrí cuál de los <span className="italic text-coral">4 tipos de hinchazón</span> estás sufriendo
      </h1>

      <p className="mt-6 text-lg text-gray-600 max-w-xl mx-auto">
        Más de 12.000 mujeres ya hicieron este test. Tarda 2 minutos y al final te llevás un diagnóstico personalizado.
      </p>

      <ul className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        <li>⏱️ 2 minutos</li>
        <li>🔒 100% anónimo</li>
        <li>✅ Resultado personalizado</li>
      </ul>

      <Button variant="primary" size="lg" className="mt-10" onClick={onStart}>
        EMPEZAR EL TEST →
      </Button>
    </div>
  );
}
```

### `components/quiz/SlideQuestion.tsx`

Renderiza pregunta single o multi.

```tsx
'use client';

import { useState } from 'react';
import { Slide, QuestionId } from '@/lib/quiz-types';
import { useQuizStore } from '@/lib/quiz-store';
import { OptionCard } from './OptionCard';
import { Button } from '@/components/ui/Button';

interface Props {
  slide: Extract<Slide, { type: 'question' }>;
  onNext: () => void;
}

export function SlideQuestion({ slide, onNext }: Props) {
  const setAnswer = useQuizStore(s => s.setAnswer);
  const currentValue = useQuizStore(s => s.answers[slide.id]);

  const [selected, setSelected] = useState<string[]>(
    Array.isArray(currentValue) ? currentValue : (currentValue ? [currentValue as string] : [])
  );

  const handleSingleClick = (value: string) => {
    setSelected([value]);
    setAnswer(slide.id as keyof typeof useQuizStore extends never ? any : QuestionId, value);
    setTimeout(() => onNext(), 250);
  };

  const handleMultiToggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    setSelected(next);
    setAnswer(slide.id as QuestionId, next);
  };

  const handleContinue = () => {
    if (selected.length > 0) onNext();
  };

  return (
    <div>
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center leading-tight">
        {slide.question}
      </h2>

      {slide.subtitle && (
        <p className="mt-3 text-gray-600 text-center">{slide.subtitle}</p>
      )}

      <div className="mt-10 grid gap-3 md:grid-cols-1">
        {slide.options.map(opt => (
          <OptionCard
            key={opt.value}
            label={opt.label}
            emoji={opt.emoji}
            selected={selected.includes(opt.value)}
            onClick={() =>
              slide.multiple
                ? handleMultiToggle(opt.value)
                : handleSingleClick(opt.value)
            }
          />
        ))}
      </div>

      {slide.multiple && (
        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="lg"
            disabled={selected.length === 0}
            onClick={handleContinue}
          >
            CONTINUAR →
          </Button>
        </div>
      )}
    </div>
  );
}
```

### `components/quiz/OptionCard.tsx`

```tsx
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  emoji?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionCard({ label, emoji, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected}
      className={cn(
        'w-full text-left bg-white border-2 border-gray-100 rounded-lg px-6 py-5 md:py-6',
        'font-sans text-base md:text-lg text-charcoal',
        'transition-all duration-200 hover:border-sage hover:bg-sage-soft',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-sage',
        selected && 'border-sage bg-sage-soft shadow-md',
      )}
    >
      <span className="flex items-center gap-3">
        {emoji && <span className="text-2xl">{emoji}</span>}
        <span>{label}</span>
      </span>
    </button>
  );
}
```

### `components/quiz/SlideInfoCard.tsx`

```tsx
import { Slide } from '@/lib/quiz-types';
import { Button } from '@/components/ui/Button';

interface Props {
  slide: Extract<Slide, { type: 'info_card' }>;
  onContinue: () => void;
}

export function SlideInfoCard({ slide, onContinue }: Props) {
  return (
    <div className="bg-sage-soft rounded-xl p-8 md:p-12 text-center">
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight">
        {slide.title}
      </h2>

      <p className="mt-6 text-base md:text-lg text-charcoal leading-relaxed">
        {slide.body}
      </p>

      {slide.source && (
        <p className="mt-4 text-sm text-gray-600 italic">— {slide.source}</p>
      )}

      <Button
        variant="secondary"
        size="lg"
        className="mt-10"
        onClick={onContinue}
      >
        {slide.ctaLabel || 'CONTINUAR'} →
      </Button>
    </div>
  );
}
```

### `components/quiz/SlideEmailCapture.tsx`

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Ingresá un email válido'),
  nombre: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (email: string, nombre?: string) => Promise<void>;
}

export function SlideEmailCapture({ onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const submit = handleSubmit(async (data) => {
    setSubmitting(true);
    await onSubmit(data.email, data.nombre);
  });

  return (
    <div>
      <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center leading-tight">
        ¡Listo! Tu plan personalizado está casi listo.
      </h2>

      <p className="mt-6 text-gray-600 text-center max-w-lg mx-auto">
        Ingresá tu mejor email para desbloquear:
      </p>

      <ul className="mt-6 space-y-2 max-w-md mx-auto text-charcoal">
        <li>✅ Tu diagnóstico personalizado</li>
        <li>✅ El protocolo de 7 días para tu tipo de hinchazón</li>
        <li>✅ Lista de alimentos inflamatorios ocultos</li>
      </ul>

      <form onSubmit={submit} className="mt-8 space-y-3 max-w-md mx-auto">
        <input
          type="email"
          placeholder="tu@email.com"
          {...register('email')}
          className="w-full px-5 py-4 rounded-lg border-2 border-gray-100 focus:border-sage focus:outline-none font-sans text-base"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}

        <input
          type="text"
          placeholder="Tu nombre (opcional)"
          {...register('nombre')}
          className="w-full px-5 py-4 rounded-lg border-2 border-gray-100 focus:border-sage focus:outline-none font-sans text-base"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? 'Procesando...' : 'VER MIS RESULTADOS →'}
        </Button>

        <p className="text-xs text-gray-600 text-center">
          🔒 No compartimos tu información. Cero spam.
        </p>
      </form>
    </div>
  );
}
```

### `components/quiz/SlideLoading.tsx`

Pantalla de carga 4 segundos exactos.

```tsx
'use client';

import { useEffect, useState } from 'react';

interface Props { onComplete: () => void; }

const MENSAJES = [
  { text: 'Analizando tus respuestas…', from: 0, to: 1500 },
  { text: 'Identificando tu tipo de hinchazón…', from: 1500, to: 3000 },
  { text: 'Generando tu plan personalizado…', from: 3000, to: 4000 },
];

export function SlideLoading({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [mensajeIdx, setMensajeIdx] = useState(0);

  useEffect(() => {
    const start = Date.now();

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const percent = Math.min((elapsed / 4000) * 100, 100);
      setProgress(percent);

      const idx = MENSAJES.findIndex(m => elapsed >= m.from && elapsed < m.to);
      if (idx !== -1) setMensajeIdx(idx);

      if (elapsed >= 4000) {
        clearInterval(tick);
        onComplete();
      }
    }, 50);

    return () => clearInterval(tick);
  }, [onComplete]);

  return (
    <div className="text-center">
      <div className="inline-block mb-8">
        <div className="w-20 h-20 rounded-full border-4 border-sage-soft border-t-sage animate-spin" />
      </div>

      <h2 className="font-serif text-2xl md:text-3xl text-charcoal">
        {MENSAJES[mensajeIdx].text}
      </h2>

      <div className="mt-8 max-w-md mx-auto">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage to-coral transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Comportamiento esperado

### Single choice (preguntas no-multi)
- Click en una opción → la marca como seleccionada → 250ms después auto-avanza al siguiente slide

### Multi choice (preguntas multi)
- Click toggle (agregar/quitar) → aparece botón "CONTINUAR" abajo
- El botón está deshabilitado si no hay nada seleccionado
- Click en "CONTINUAR" → avanza

### Animaciones
- Entrada de slide: fade + slide desde la derecha
- Salida de slide: fade + slide hacia la izquierda
- Duración: 350ms easeInOut

### Persistencia
- El store usa Zustand persist con localStorage key `anti-hinchazon-quiz`
- Si el usuario refresca, no pierde el progreso

### Resultado
- Al completar el slide 16 (loading), redirect a `/resultados?...` con todos los params

---

## Tracking que dispara este agente

| Evento | Dónde |
|---|---|
| `QuizQ3` | useEffect cuando llega a slide 4 (pregunta 3) |
| `Lead` | Submit del email |
| `QuizComplete` | Submit del email |

(El evento `QuizStart` lo dispara el agente 01 en la landing.)

---

## Dependencias adicionales

```bash
npm install @hookform/resolvers
```

(zod, react-hook-form, framer-motion, zustand ya los instaló el agente 01.)

---

## Checklist agente 02

- [ ] `lib/quiz-types.ts` con tipos de `_QUIZ-DATA.md`
- [ ] `lib/quiz-data.ts` con los 16 slides
- [ ] `lib/tipos-hinchazon.ts` con calcularTipo, calcularSeveridad, buildResultsUrl
- [ ] `lib/quiz-store.ts` con Zustand persist
- [ ] `app/quiz/page.tsx` que renderiza `QuizContainer`
- [ ] `components/quiz/QuizContainer.tsx` con lógica de avance
- [ ] `components/quiz/QuizProgress.tsx` con barra de progreso
- [ ] `components/quiz/SlideIntro.tsx`
- [ ] `components/quiz/SlideQuestion.tsx` (single + multi)
- [ ] `components/quiz/SlideInfoCard.tsx`
- [ ] `components/quiz/SlideEmailCapture.tsx` (con Zod)
- [ ] `components/quiz/SlideLoading.tsx` (4 segundos exactos)
- [ ] `components/quiz/OptionCard.tsx`
- [ ] Auto-avance en single choice (250ms delay)
- [ ] Botón "Continuar" en multi choice
- [ ] Animaciones Framer Motion fluidas
- [ ] Mobile responsive
- [ ] Persistencia en localStorage funciona
- [ ] Eventos de tracking disparan en los momentos correctos
- [ ] Redirect a /resultados con todos los params al final
- [ ] Sin errores en consola

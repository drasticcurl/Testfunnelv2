# 01 — AGENTE LANDING

> **Rol:** generar la landing pre-quiz (slide 1 del funnel) y el setup base del proyecto Next.js.

## Tu output

1. **Setup completo del proyecto Next.js** (compartido con agentes 02, 03, 04 — vos sos el primero, vos lo creás)
2. **`app/layout.tsx`** con providers, fonts y meta tags base
3. **`app/page.tsx`** con la landing pre-quiz
4. **`app/globals.css`** con tokens del design system
5. **`tailwind.config.ts`** según _DESIGN-SYSTEM.md
6. **Componentes en `components/landing/`**
7. **Componentes UI base en `components/ui/`** (compartidos): Button, Container

## Archivos que tocás (exclusivos tuyos)

- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `tailwind.config.ts`
- `package.json`
- `next.config.js`
- `tsconfig.json`
- `.env.example`
- `.gitignore`
- `components/landing/*` (todos)
- `components/ui/Button.tsx`
- `components/ui/Container.tsx`

**No toques:** `app/quiz/*`, `app/resultados/*`, `app/api/*`, `lib/quiz-*`.

## Setup inicial del proyecto

```bash
npx create-next-app@latest testfunnel-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir false \
  --import-alias "@/*"

cd testfunnel-app

npm install framer-motion zustand react-hook-form zod @phosphor-icons/react
npm install -D @types/node
```

Tus archivos esperados al final:

```
testfunnel-app/
├── app/
│   ├── layout.tsx          ← VOS
│   ├── page.tsx            ← VOS
│   └── globals.css         ← VOS
├── components/
│   ├── landing/
│   │   ├── Hero.tsx        ← VOS
│   │   ├── HowItWorks.tsx  ← VOS (opcional)
│   │   ├── SocialProof.tsx ← VOS (opcional)
│   │   └── CTAStart.tsx    ← VOS
│   └── ui/
│       ├── Button.tsx      ← VOS
│       └── Container.tsx   ← VOS
├── tailwind.config.ts      ← VOS
├── package.json            ← VOS
├── .env.example            ← VOS
├── .gitignore              ← VOS
└── README.md               ← VOS (un README chico)
```

---

## Especificación de la landing (`app/page.tsx`)

### Layout

Mobile-first. En desktop, dos columnas; en mobile, una columna stacked.

```
┌─────────────────────────────────────────────────┐
│   [marca/logo]                                  │
│                                                 │
│   ┌───────────────┐    ┌───────────────────┐    │
│   │   COPY HERO   │    │   IMAGEN/ILUSTR.  │    │
│   │               │    │                   │    │
│   │   H1 grande   │    │                   │    │
│   │   subtítulo   │    │                   │    │
│   │   microcopy   │    │                   │    │
│   │   CTA grande  │    │                   │    │
│   └───────────────┘    └───────────────────┘    │
│                                                 │
│   [opcional: bloque social proof / 3 pasos]     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Contenido

#### Header simple (sin nav)

```tsx
<header className="py-6 px-6 md:px-12">
  <div className="text-2xl font-serif font-semibold text-charcoal">
    [MARCA]
  </div>
</header>
```

#### Hero (componente principal)

**Headline (h1):**
> Test: Descubrí cuál de los 4 tipos de hinchazón estás sufriendo

**Subheadline:**
> Más de 12.000 mujeres ya hicieron este test para entender qué está inflamando su panza y cómo desinflamarla en solo 7 días.

**Microcopy con íconos:**
- ⏱️ 2 minutos
- 🔒 100% anónimo
- ✅ Resultado personalizado

**CTA principal:**
> EMPEZAR EL TEST →

Click → navega a `/quiz` (`router.push('/quiz')`).

#### (Opcional, abajo del hero) — Bloque "Cómo funciona"

3 íconos + 3 textos cortos (mobile en columna, desktop en fila):

1. **Hacé el test** — Respondé 10 preguntas simples sobre tu hinchazón
2. **Recibí tu diagnóstico** — Identificamos qué tipo tenés y por qué
3. **Empezá tu plan** — Te llevás un protocolo personalizado de 7 días

#### (Opcional) — Bloque social proof

Imagen de 3–5 fotos circulares + texto:
> "Más de 12.000 mujeres ya identificaron su tipo de hinchazón"

---

## Componentes a crear

### `components/landing/Hero.tsx`

```tsx
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export function Hero() {
  const router = useRouter();

  return (
    <section className="bg-cream py-12 md:py-24">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
              Test: descubrí cuál de los <span className="italic text-coral">4 tipos de hinchazón</span> estás sufriendo
            </h1>

            <p className="mt-6 text-lg text-gray-600">
              Más de 12.000 mujeres ya hicieron este test para entender qué está inflamando su panza y cómo desinflamarla en 7 días.
            </p>

            <ul className="mt-8 flex flex-wrap gap-4 text-sm text-gray-600">
              <li className="flex items-center gap-2">⏱️ 2 minutos</li>
              <li className="flex items-center gap-2">🔒 100% anónimo</li>
              <li className="flex items-center gap-2">✅ Resultado personalizado</li>
            </ul>

            <Button
              variant="primary"
              size="lg"
              className="mt-10 w-full md:w-auto"
              onClick={() => router.push('/quiz')}
            >
              EMPEZAR EL TEST →
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            className="hidden md:block"
          >
            {/* Imagen / ilustración */}
            <div className="aspect-[4/5] rounded-xl bg-sage-soft" />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
```

### `components/ui/Button.tsx`

```tsx
import { cn } from '@/lib/utils'; // simple clsx
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-coral text-white hover:shadow-lg hover:-translate-y-0.5',
      secondary: 'bg-sage text-white hover:shadow-lg hover:-translate-y-0.5',
      ghost: 'bg-transparent text-gray-600 underline hover:text-charcoal',
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-base font-semibold tracking-wide uppercase',
      xl: 'px-10 py-5 text-lg font-semibold tracking-wide uppercase',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-full font-sans transition-all duration-200 inline-flex items-center justify-center',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
```

### `components/ui/Container.tsx`

```tsx
import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mx-auto max-w-6xl px-6 md:px-12', className)}
      {...props}
    />
  );
}
```

### `lib/utils.ts`

```ts
export function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(' ');
}
```

---

## `app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Test: Tipo de Hinchazón Abdominal',
  description: 'Descubrí cuál de los 4 tipos de hinchazón estás sufriendo y cómo desinflamarte en 7 días.',
  openGraph: {
    title: 'Test: Tipo de Hinchazón Abdominal',
    description: 'Descubrí cuál de los 4 tipos de hinchazón estás sufriendo.',
    type: 'website',
    locale: 'es_AR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Meta Pixel — el agente 04 lo activa con el ID real */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID || 'PIXEL_ID_PLACEHOLDER'}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## `app/page.tsx`

```tsx
import { Hero } from '@/components/landing/Hero';

export default function HomePage() {
  return (
    <main>
      <header className="py-6 px-6 md:px-12">
        <div className="font-serif text-2xl font-semibold text-charcoal">
          [MARCA]
        </div>
      </header>

      <Hero />

      {/* Opcional: HowItWorks, SocialProof — agregar si tenés tiempo */}
    </main>
  );
}
```

---

## `.env.example`

```
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=
META_PIXEL_ID=
META_CAPI_TOKEN=
QUIZ_WEBHOOK_URL=
SYSTEME_API_KEY=
```

## `.gitignore`

```
node_modules
.next
out
.env*.local
.env
outputs/
```

---

## Tracking en la landing

Cuando el usuario hace click en "Empezar el test", disparar evento `QuizStart`:

```tsx
const handleClick = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'QuizStart');
  }
  router.push('/quiz');
};
```

(El agente 04 va a crear `lib/tracking.ts` para encapsular esto, pero vos podés hacerlo inline mientras tanto.)

---

## Checklist final agente 01

- [ ] Proyecto Next.js inicializado y corriendo en local
- [ ] tailwind.config.ts con tokens completos
- [ ] globals.css con fuentes y vars CSS
- [ ] `Button.tsx` y `Container.tsx` creados
- [ ] `Hero.tsx` creado con animaciones Framer Motion
- [ ] `app/page.tsx` renderiza el Hero
- [ ] `app/layout.tsx` con Meta Pixel placeholder
- [ ] `.env.example` documenta todas las vars
- [ ] Click en CTA navega a `/quiz` (aunque la ruta no exista todavía, no rompe el dev server)
- [ ] Lighthouse score >85 Performance, >90 Accessibility
- [ ] Mobile responsive (375px–1440px)
- [ ] Sin errores en consola
- [ ] `npm run dev` funciona

## Si necesitás algo del humano

Pone `[NEEDS_INPUT]` en el código y al final pedile:
- Nombre real de la marca (reemplaza `[MARCA]`)
- Imagen del hero (sino usa placeholder de sage-soft)
- Pixel ID real (sino queda placeholder)

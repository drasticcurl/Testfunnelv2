# 03 — AGENTE RESULTADOS

> **Rol:** construir la página `/resultados` — la carta de ventas dinámica que convierte el tráfico en compradores.

## Tu output

1. **`app/resultados/page.tsx`** — página (server component, parsea URL params)
2. **Componentes en `components/resultados/*`**
3. **`lib/parse-resultados.ts`** — parseo + diccionarios de personalización

## Archivos que tocás

- `app/resultados/page.tsx`
- `components/resultados/*` (todos)
- `lib/parse-resultados.ts`

**No toques:** nada del agente 01, 02 o 04.

## Asumís disponibles (creados por agentes 01 y 02)

- Setup Next.js corriendo
- `components/ui/Button.tsx`, `components/ui/Container.tsx`
- `lib/utils.ts` con `cn()`
- `lib/quiz-types.ts` con `QuizAnswers`, `TipoHinchazon`
- Tailwind y design system aplicados

---

## Decisión clave: SIN VSL

Esta página es **100% texto + diseño + prueba social**. NO hay video, NO hay grabación, NO hay voz tuya. La conversión sale de:
- Copy fuerte y dinámico (personalización percibida)
- Diseño limpio que respira (cream + sage + coral)
- Stack de valor claro
- Garantía visible
- Testimonios
- Escasez con timer real

---

## URL params que recibe

La URL tiene esta forma:

```
/resultados?nombre=Carolina&edad=35_44&momento=tarde_noche&tiempo=mas_5a&frecuencia=diaria&emocion=frustrada&sintomas=gases,pesadez,panza_marcada&probo=dietas,infusiones,sin_gluten&tipo=3&severidad=8
```

Todos los params son opcionales (la página tiene que funcionar igual si falta alguno).

---

## Estructura de archivos esperada

```
app/resultados/
└── page.tsx

components/resultados/
├── DiagnosticoHero.tsx
├── SeveridadGauge.tsx
├── ResumenRespuestas.tsx
├── PorQueFracaso.tsx
├── LasTresCausas.tsx
├── PresentacionProducto.tsx
├── ComoFunciona.tsx
├── Testimonios.tsx
├── Garantia.tsx
├── PrecioStack.tsx
├── Escasez.tsx
├── FAQ.tsx
├── CTAFinal.tsx
└── StickyCTA.tsx

lib/
└── parse-resultados.ts
```

---

## `lib/parse-resultados.ts`

```ts
import { TipoHinchazon } from './quiz-types';

export type ResultadosParams = {
  nombre?: string;
  edad?: '25_34' | '35_44' | '45_54' | '55_mas';
  momento?: 'manana' | 'almuerzo' | 'tarde_noche' | 'todo_el_dia';
  tiempo?: 'menos_6m' | '6m_2a' | '2a_5a' | 'mas_5a';
  frecuencia?: 'diaria' | '4_6_dias' | '2_3_dias' | 'comidas_especificas';
  emocion?: 'insegura' | 'frustrada' | 'avergonzada' | 'cansada' | 'todas';
  sintomas: string[];
  probo: string[];
  tipo: TipoHinchazon;
  severidad: number;
};

export function parseParams(searchParams: { [key: string]: string | string[] | undefined }): ResultadosParams {
  const get = (k: string) => {
    const v = searchParams[k];
    return typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined;
  };

  return {
    nombre: get('nombre'),
    edad: get('edad') as any,
    momento: get('momento') as any,
    tiempo: get('tiempo') as any,
    frecuencia: get('frecuencia') as any,
    emocion: get('emocion') as any,
    sintomas: (get('sintomas') || '').split(',').filter(Boolean),
    probo: (get('probo') || '').split(',').filter(Boolean),
    tipo: (Number(get('tipo')) || 3) as TipoHinchazon,
    severidad: Number(get('severidad')) || 7,
  };
}

// Diccionarios — copiar de _QUIZ-DATA.md
export const TIPOS_HINCHAZON = { /* ... */ };
export const EMOCIONES_TEXTO = { /* ... */ };
export const TIEMPO_TEXTO = { /* ... */ };
export const MOMENTO_TEXTO = { /* ... */ };
export const PROBO_TEXTO: Record<string, string> = { /* ... */ };
```

> **Importante:** copiar los diccionarios COMPLETOS desde `_QUIZ-DATA.md` sección "Diccionarios de personalización".

---

## `app/resultados/page.tsx`

```tsx
import { parseParams } from '@/lib/parse-resultados';
import { DiagnosticoHero } from '@/components/resultados/DiagnosticoHero';
import { ResumenRespuestas } from '@/components/resultados/ResumenRespuestas';
import { PorQueFracaso } from '@/components/resultados/PorQueFracaso';
import { LasTresCausas } from '@/components/resultados/LasTresCausas';
import { PresentacionProducto } from '@/components/resultados/PresentacionProducto';
import { ComoFunciona } from '@/components/resultados/ComoFunciona';
import { Testimonios } from '@/components/resultados/Testimonios';
import { Garantia } from '@/components/resultados/Garantia';
import { PrecioStack } from '@/components/resultados/PrecioStack';
import { Escasez } from '@/components/resultados/Escasez';
import { CTAFinal } from '@/components/resultados/CTAFinal';
import { FAQ } from '@/components/resultados/FAQ';
import { StickyCTA } from '@/components/resultados/StickyCTA';
import { ViewContentTracker } from '@/components/resultados/ViewContentTracker';

export default function ResultadosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = parseParams(searchParams);

  return (
    <main className="bg-cream">
      <ViewContentTracker tipo={params.tipo} />

      <DiagnosticoHero params={params} />
      <ResumenRespuestas params={params} />
      <PorQueFracaso params={params} />
      <LasTresCausas />
      <PresentacionProducto params={params} />
      <ComoFunciona />
      <Testimonios />
      <Garantia />
      <PrecioStack />
      <Escasez />
      <CTAFinal params={params} />
      <FAQ />

      <StickyCTA />
    </main>
  );
}
```

---

## Componentes — implementación detallada

### `DiagnosticoHero.tsx`

```tsx
import { ResultadosParams, TIPOS_HINCHAZON } from '@/lib/parse-resultados';
import { Container } from '@/components/ui/Container';
import { SeveridadGauge } from './SeveridadGauge';

interface Props { params: ResultadosParams; }

export function DiagnosticoHero({ params }: Props) {
  const tipo = TIPOS_HINCHAZON[params.tipo];
  const nombreParte = params.nombre ? `${params.nombre}, ` : '';

  return (
    <section className="bg-white py-16 md:py-24">
      <Container>
        <div className="text-center">
          <p className="text-sm font-sans tracking-widest uppercase text-sage mb-4">
            Tu diagnóstico personalizado
          </p>

          <h1 className="font-serif text-3xl md:text-5xl text-charcoal leading-tight">
            {nombreParte}tu diagnóstico es:
            <span className="block text-coral mt-2">{tipo.nombre}</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            {tipo.descripcion}
          </p>

          <div className="mt-10 max-w-md mx-auto">
            <SeveridadGauge value={params.severidad} max={10} />
            <p className="mt-3 text-sm text-gray-600">
              Tu nivel de inflamación
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

### `SeveridadGauge.tsx`

SVG semicircular. Color del arco varía según valor.

```tsx
interface Props { value: number; max: number; }

export function SeveridadGauge({ value, max }: Props) {
  const percent = value / max;

  // Color según severidad
  const color =
    value <= 4 ? '#5B8A60' :   // sage-dark (low)
    value <= 7 ? '#D9A441' :   // warning
                 '#E07856';     // coral (high)

  // SVG semicircular
  // Arco va de -180° a 0°
  const radius = 80;
  const cx = 100;
  const cy = 100;

  const startAngle = -180;
  const endAngle = startAngle + (180 * percent);

  const polarToCartesian = (angle: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;

  // Background arc (gris)
  const bgEnd = polarToCartesian(0);
  const bgPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${bgEnd.x} ${bgEnd.y}`;

  return (
    <svg viewBox="0 0 200 110" className="w-full max-w-xs mx-auto">
      <path d={bgPath} stroke="#EFECE7" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d={arcPath} stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />
      <text x="100" y="95" textAnchor="middle" className="font-serif text-4xl fill-charcoal font-bold">
        {value}/{max}
      </text>
    </svg>
  );
}
```

### `ResumenRespuestas.tsx`

```tsx
import { ResultadosParams, EMOCIONES_TEXTO, TIEMPO_TEXTO, MOMENTO_TEXTO, PROBO_TEXTO } from '@/lib/parse-resultados';
import { Container } from '@/components/ui/Container';

interface Props { params: ResultadosParams; }

export function ResumenRespuestas({ params }: Props) {
  const probaron = params.probo
    .map(p => PROBO_TEXTO[p])
    .filter(Boolean);

  return (
    <section className="bg-cream py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-8">
            Esto es lo que vimos en tus respuestas
          </h2>

          <ul className="space-y-4 text-lg text-charcoal leading-relaxed">
            {params.momento && (
              <li>🔹 Tu hinchazón aparece principalmente <b>{MOMENTO_TEXTO[params.momento]}</b>.</li>
            )}
            {params.tiempo && (
              <li>🔹 Convivís con esto <b>{TIEMPO_TEXTO[params.tiempo]}</b>.</li>
            )}
            {probaron.length > 0 && (
              <li>🔹 Ya probaste <b>{probaron.join(', ')}</b> sin éxito sostenido.</li>
            )}
            {params.emocion && (
              <li>🔹 Esto te hace sentir <b>{EMOCIONES_TEXTO[params.emocion]}</b>.</li>
            )}
          </ul>

          <p className="mt-8 text-base text-gray-600 italic">
            Y vamos a ser honestas: tu sensación tiene 100% sentido. Probaste cosas que prometían solucionarte el problema y ninguna te dio el resultado que buscabas.
          </p>

          <p className="mt-4 text-base text-gray-600 italic">
            Pero hay una razón concreta por la que nada funcionó. Y no, no es tu falta de voluntad.
          </p>
        </div>
      </Container>
    </section>
  );
}
```

### `PorQueFracaso.tsx`

Manejo de objeciones. Usa `params.probo` para personalizar.

```tsx
export function PorQueFracaso({ params }: Props) {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal mb-8">
            Por qué nada de lo que probaste funcionó
            <span className="block text-base text-gray-500 mt-2 font-sans">(y no es tu culpa)</span>
          </h2>

          <div className="space-y-6 text-charcoal text-lg leading-relaxed">
            <p>Mirá, esto te lo digo de frente:</p>

            <p><strong>Las dietas restrictivas</strong> (keto, ayuno, detox) reducen calorías. No tocan la inflamación intestinal. Por eso bajás 2 kg al principio y se te vuelve a marcar la panza al mes.</p>

            <p><strong>Las infusiones</strong> ayudan puntualmente. Pero no resuelven la causa raíz de la inflamación crónica.</p>

            <p><strong>Eliminar gluten o lactosa</strong> funciona si ese fuera el único problema. El tema es que hay otros 12 alimentos inflamatorios "ocultos" que probablemente seguís consumiendo todos los días sin saberlo.</p>

            <p className="text-xl font-semibold text-coral">
              El problema NO es lo que comés "de más". Es lo que comés "creyendo que es saludable" y en realidad está inflamando tu intestino.
            </p>

            <p>Y ahí está la oportunidad.</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

### `LasTresCausas.tsx`

Tres bloques con íconos.

```tsx
export function LasTresCausas() {
  const causas = [
    {
      num: 1,
      title: 'Disbiosis intestinal',
      body: 'Tu microbiota — las bacterias que viven en tu intestino — está desequilibrada. Las "malas" ganaron terreno. Eso genera gases, inflamación y mala digestión.',
    },
    {
      num: 2,
      title: 'Alimentos inflamatorios "ocultos"',
      body: 'Hay al menos 12 alimentos que la mayoría considera saludables y en realidad están inflamando tu intestino día tras día. El primer paso es identificarlos en tu dieta.',
    },
    {
      num: 3,
      title: 'Eje intestino-cerebro alterado',
      body: 'El estrés y la falta de descanso afectan directamente tu digestión. Por eso notás que la hinchazón empeora en épocas de mucho laburo o ansiedad.',
    },
  ];

  return (
    <section className="bg-cream-warm py-16">
      <Container>
        <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-12">
          ¿Por qué estás hinchada? — Las 3 causas reales
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {causas.map(c => (
            <div key={c.num} className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-sage text-white flex items-center justify-center font-serif text-xl font-bold mb-4">
                {c.num}
              </div>
              <h3 className="font-serif text-xl text-charcoal mb-3">{c.title}</h3>
              <p className="text-gray-600 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-lg font-serif italic text-coral">
          La buena noticia: las 3 se corrigen con un protocolo alimenticio específico de 7 días.
        </p>
      </Container>
    </section>
  );
}
```

### `PresentacionProducto.tsx`

```tsx
export function PresentacionProducto({ params }: Props) {
  const tipo = TIPOS_HINCHAZON[params.tipo];

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-sans tracking-widest uppercase text-sage mb-4">
            Te presento
          </p>

          <h2 className="font-serif text-4xl md:text-5xl text-charcoal leading-tight">
            PROTOCOLO ANTI-HINCHAZÓN
            <span className="block text-2xl md:text-3xl text-gray-500 mt-2 italic font-normal">
              Plan de 7 Días
            </span>
          </h2>

          <p className="mt-6 text-lg text-gray-600">
            Diseñado específicamente para tu tipo: <b>{tipo.nombre}</b>
          </p>

          {/* Mockup del producto */}
          <div className="mt-12 mb-12 mx-auto max-w-md aspect-[4/5] rounded-xl bg-sage-soft" />

          <h3 className="font-serif text-2xl text-charcoal mb-6">Qué incluye:</h3>

          <ul className="space-y-3 text-left max-w-2xl mx-auto text-charcoal">
            <li className="flex justify-between border-b border-gray-100 pb-3">
              <span>✅ Protocolo 7 días interactivo (app día a día)</span>
              <span className="text-gray-500">$47</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-3">
              <span>✅ Lista 14 alimentos inflamatorios</span>
              <span className="text-gray-500">$17</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-3">
              <span>✅ Lista 21 alimentos antiinflamatorios</span>
              <span className="text-gray-500">$17</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-3">
              <span>✅ 35 recetas antiinflamatorias</span>
              <span className="text-gray-500">$27</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-3">
              <span>✅ Guía de suplementación natural</span>
              <span className="text-gray-500">$22</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-3">
              <span>✅ Ritual de mañana 5 minutos</span>
              <span className="text-gray-500">$9</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-3">
              <span>✅ Diario de síntomas con gráficos</span>
              <span className="text-gray-500">$17</span>
            </li>
            <li className="flex justify-between border-b border-gray-100 pb-3">
              <span>✅ Calculadora de microbiota</span>
              <span className="text-gray-500">$12</span>
            </li>
          </ul>

          <p className="mt-6 text-2xl font-serif">
            Valor total: <span className="text-gray-500 line-through">$168</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
```

### `ComoFunciona.tsx`

3 pasos en grid o stacked en mobile.

```tsx
export function ComoFunciona() {
  const pasos = [
    { num: 1, title: 'Accedés al instante', body: 'Apenas pagás, te llega un email con acceso a tu app personalizada. Entrás con tu email, sin contraseña.' },
    { num: 2, title: 'Seguís el plan día a día', body: 'La app te dice exactamente qué comer hoy. Recetas de máximo 25 minutos con ingredientes accesibles. Tu diario trackea cómo te sentís.' },
    { num: 3, title: 'Ves resultados al día 3', body: 'La mayoría reporta menos pesadez y panza más plana al tercer día. El día 7 es donde se nota el cambio real — y tus gráficos lo confirman.' },
  ];

  return (
    <section className="bg-cream py-16">
      <Container>
        <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-12">
          Cómo funciona en 3 pasos
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pasos.map(p => (
            <div key={p.num}>
              <div className="font-serif text-6xl text-coral italic mb-4">{p.num}</div>
              <h3 className="font-serif text-xl text-charcoal mb-3">{p.title}</h3>
              <p className="text-gray-600 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

### `Testimonios.tsx`

3 testimonios placeholder (los reales se agregan en semana 2).

```tsx
const TESTIMONIOS = [
  {
    foto: '/images/testimonio-carolina.jpg',
    nombre: 'Carolina M.',
    edad: 42,
    ciudad: 'Buenos Aires',
    texto: 'En 7 días no podía creer la diferencia. Me bajó la panza visiblemente y dejé de sentirme pesada después de comer. Hace años que no me sentía así.',
  },
  {
    foto: '/images/testimonio-lucia.jpg',
    nombre: 'Lucía P.',
    edad: 38,
    ciudad: 'Rosario',
    texto: 'A los 4 días me probé un jean que no me entraba hace 8 meses. Y no era que había bajado de peso — era que se me había ido la inflamación.',
  },
  {
    foto: '/images/testimonio-veronica.jpg',
    nombre: 'Verónica T.',
    edad: 51,
    ciudad: 'Córdoba',
    texto: 'Probé keto, ayuno, detox, todo. Esto fue lo primero que me funcionó de verdad. Ya estoy recomendándolo a mis amigas.',
  },
];

export function Testimonios() {
  return (
    <section className="bg-cream-warm py-16">
      <Container>
        <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-12">
          Lo que dicen otras mujeres que lo hicieron
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TESTIMONIOS.map(t => (
            <div key={t.nombre} className="bg-white rounded-xl p-8 shadow-md">
              <p className="text-charcoal italic leading-relaxed mb-6">"{t.texto}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-sage-soft" />
                <div>
                  <div className="font-semibold text-charcoal">{t.nombre}</div>
                  <div className="text-sm text-gray-600">{t.edad} años · {t.ciudad}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
```

### `Garantia.tsx`

```tsx
export function Garantia() {
  return (
    <section className="bg-cream py-16">
      <Container>
        <div className="max-w-2xl mx-auto bg-sage-soft border-2 border-sage rounded-xl p-10 text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="font-serif text-3xl text-charcoal mb-4">
            Garantía Total 30 días sin preguntas
          </h2>
          <p className="text-charcoal leading-relaxed">
            Probás el protocolo durante 30 días completos. Si no notás cambios reales en cómo te sentís, te devolvemos el 100% de tu inversión. Sin preguntas, sin trámites, sin formularios largos.
          </p>
          <p className="mt-4 font-serif italic text-charcoal">
            Asumimos nosotros el riesgo. Tu palabra es suficiente.
          </p>
        </div>
      </Container>
    </section>
  );
}
```

### `PrecioStack.tsx`

```tsx
export function PrecioStack() {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="max-w-md mx-auto bg-cream-warm rounded-xl p-8 md:p-10">
          <h3 className="font-serif text-2xl text-charcoal text-center mb-6">
            Tu inversión hoy
          </h3>

          <div className="text-center">
            <p className="text-2xl text-gray-400 line-through font-serif">$39.90</p>
            <p className="text-6xl font-serif font-bold text-coral mt-2">$14.90</p>
            <p className="text-sm text-gray-600 mt-2">USD</p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 italic">
            Precio de lanzamiento — solo por las próximas 24hs
          </p>

          <p className="mt-4 text-center font-serif italic text-charcoal">
            Es menos que un café con medialunas.<br />
            Y te puede cambiar cómo te sentís todos los días.
          </p>
        </div>
      </Container>
    </section>
  );
}
```

### `Escasez.tsx`

Timer real (24hs desde la primera visita, persistido en localStorage).

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Container } from '@/components/ui/Container';

const KEY = 'oferta-expira';
const DURACION = 24 * 60 * 60 * 1000; // 24h

export function Escasez() {
  const [tiempo, setTiempo] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    let expira = Number(localStorage.getItem(KEY));
    if (!expira || expira < Date.now()) {
      expira = Date.now() + DURACION;
      localStorage.setItem(KEY, String(expira));
    }

    const tick = setInterval(() => {
      const diff = Math.max(expira - Date.now(), 0);
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTiempo({ h, m, s });

      if (diff === 0) clearInterval(tick);
    }, 1000);

    return () => clearInterval(tick);
  }, []);

  return (
    <section className="bg-cream py-12">
      <Container>
        <div className="text-center">
          <p className="text-sm tracking-widest uppercase text-coral mb-3">
            ⏱ Esta oferta expira en
          </p>
          <div className="font-serif text-5xl md:text-6xl text-charcoal tabular-nums">
            {String(tiempo.h).padStart(2, '0')} : {String(tiempo.m).padStart(2, '0')} : {String(tiempo.s).padStart(2, '0')}
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Cuando el contador llegue a cero, el precio vuelve a $39.90 USD.
          </p>
        </div>
      </Container>
    </section>
  );
}
```

### `CTAFinal.tsx`

```tsx
'use client';

import { ResultadosParams } from '@/lib/parse-resultados';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface Props { params: ResultadosParams; }

export function CTAFinal({ params }: Props) {
  const handleClick = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', { value: 14.90, currency: 'USD' });
    }

    // Forward al server-side tracking
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'InitiateCheckout', value: 14.90, currency: 'USD' }),
    }).catch(() => {});

    // Recoger UTMs de localStorage si existen
    let trackingParams: Record<string, string> = {};
    try {
      trackingParams = JSON.parse(localStorage.getItem('tracking_params') || '{}');
    } catch {}

    const baseUrl = process.env.NEXT_PUBLIC_HOTMART_CHECKOUT_URL || '#';
    const allParams = new URLSearchParams({
      ...trackingParams,
      tipo: String(params.tipo),
      severidad: String(params.severidad),
    });

    window.location.href = `${baseUrl}?${allParams.toString()}`;
  };

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <Button
            variant="primary"
            size="xl"
            onClick={handleClick}
            className="w-full md:w-auto"
          >
            QUIERO MI PROTOCOLO POR $14.90 →
          </Button>

          <p className="mt-4 text-sm text-gray-600">
            🔒 Pago 100% seguro · ✅ Acceso inmediato · 🛡️ Garantía 30 días
          </p>

          <div className="mt-6 flex justify-center items-center gap-3 opacity-60">
            <span className="text-xs">Visa</span>
            <span className="text-xs">·</span>
            <span className="text-xs">Mastercard</span>
            <span className="text-xs">·</span>
            <span className="text-xs">Mercado Pago</span>
            <span className="text-xs">·</span>
            <span className="text-xs">PayPal</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
```

### `FAQ.tsx`

Acordeón con 5 preguntas.

```tsx
'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/Container';

const FAQS = [
  {
    q: '¿Cómo recibo el producto?',
    a: 'Después de pagar, te llega un email con acceso instantáneo a la app. Entrás con tu email, sin crear contraseña. En menos de 30 segundos ya tenés todo disponible.',
  },
  {
    q: '¿Sirve si tengo intolerancias o restricciones?',
    a: 'Sí. El plan tiene alternativas para sin gluten, sin lactosa y vegetarianas. Si tenés una condición médica específica, consultá con tu médico antes de empezar.',
  },
  {
    q: '¿Funciona si trabajo todo el día y no tengo tiempo de cocinar?',
    a: 'Sí. Las recetas son todas de máximo 25 minutos. Hay opciones de meal prep para preparar todo el domingo y comer toda la semana.',
  },
  {
    q: '¿Cuánto tarda en hacer efecto?',
    a: 'La mayoría reporta menos hinchazón a partir del día 3. El cambio más significativo se ve al día 7.',
  },
  {
    q: '¿Sirve también para hombres?',
    a: 'Sí, funciona para cualquier persona con hinchazón crónica. Lo escribimos pensando en mujeres porque son nuestra audiencia principal, pero el contenido es universal.',
  },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section className="bg-cream py-16">
      <Container>
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-charcoal text-center mb-12">
            Preguntas frecuentes
          </h2>

          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left font-serif text-lg text-charcoal flex justify-between items-center"
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                >
                  <span>{f.q}</span>
                  <span className="text-coral text-2xl">{openIdx === i ? '−' : '+'}</span>
                </button>
                {openIdx === i && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
```

### `StickyCTA.tsx`

CTA fijo abajo en mobile, aparece después de scroll 30%.

```tsx
'use client';

import { useEffect, useState } from 'react';

export function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      setVisible(scrolled > 0.3);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-50 shadow-xl flex items-center justify-between gap-3">
      <div>
        <div className="text-xs text-gray-600">Tu Protocolo</div>
        <div className="font-serif font-bold text-coral">$14.90 USD</div>
      </div>
      <a
        href="#cta-final"
        className="bg-coral text-white px-5 py-3 rounded-full text-sm font-semibold uppercase tracking-wide"
      >
        ACCEDER AHORA →
      </a>
    </div>
  );
}
```

### `ViewContentTracker.tsx`

```tsx
'use client';

import { useEffect } from 'react';

export function ViewContentTracker({ tipo }: { tipo: number }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: `Resultados Tipo ${tipo}`,
        content_category: 'Quiz Anti-Hinchazón',
      });
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'ViewContent' }),
    }).catch(() => {});

    // Scroll 50% tracking
    const onScroll = () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled > 0.5) {
        (window as any).fbq?.('trackCustom', 'ScrollResultados50');
        window.removeEventListener('scroll', onScroll);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [tipo]);

  return null;
}
```

---

## Reglas de copy (no negociables)

1. **Personalización mínima 2 veces:** nombre + tipo aparecen en hero y al menos una vez más
2. **Voseo argentino neutralizado**
3. **Sin promesas médicas exageradas**
4. **Cero emojis decorativos en body** (solo bullets, microcopy y CTAs)
5. **Mobile-first siempre** — probá todo en 375px

---

## Tracking que dispara este agente

| Evento | Cuándo |
|---|---|
| `ViewContent` | Mount de la página |
| `ScrollResultados50` | Scroll 50% |
| `InitiateCheckout` | Click en CTA principal |

---

## Performance

- Lazy-load de imágenes con `next/image`
- Componentes que no necesitan ser client → server components
- Lighthouse target: Performance >85, LCP <2.5s

---

## Checklist agente 03

- [ ] `lib/parse-resultados.ts` con tipos + diccionarios completos
- [ ] `app/resultados/page.tsx` que parsea params y compone los componentes
- [ ] DiagnosticoHero con personalización dinámica
- [ ] SeveridadGauge SVG funcional
- [ ] ResumenRespuestas con todos los textos dinámicos
- [ ] PorQueFracaso (objection handling)
- [ ] LasTresCausas
- [ ] PresentacionProducto con value stack
- [ ] ComoFunciona (3 pasos)
- [ ] Testimonios (3 placeholders)
- [ ] Garantia
- [ ] PrecioStack
- [ ] Escasez con timer real (24h persistido)
- [ ] CTAFinal con redirect a Hotmart + UTMs preservados
- [ ] FAQ acordeón
- [ ] StickyCTA mobile
- [ ] ViewContentTracker
- [ ] Mobile responsive (375px–1440px)
- [ ] Funciona aunque falten params (defaults)
- [ ] Eventos de tracking disparan
- [ ] CTA con UTMs preservados
- [ ] Sin errores en consola

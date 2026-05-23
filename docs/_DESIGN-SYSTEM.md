# _DESIGN-SYSTEM.md — Sistema de diseño compartido

> **Compartido — usado por todos los agentes que generen UI o material visual.**

## Filosofía

- **Cálido, no clínico.** Nada de blanco hospital, azul farmacia o verde militar.
- **Premium accesible.** Que se vea cuidado pero no intimidante.
- **Mucho aire blanco / cream.** Densidad baja.
- **Tipografía con personalidad.** Mezcla serif editorial + sans-serif moderna.
- **Mobile-first absoluto.**

Inspiración: Olipop, Recess, Hims, Athletic Greens — wellness premium accesible, aplicado al voseo argentino.

---

## Paleta de colores

### Primarios

| Token | HEX | Tailwind | Uso |
|---|---|---|---|
| **Sage** | `#7A9B7E` | `sage` | Color institucional. Botones secundarios, íconos, acentos. |
| **Cream** | `#FAF7F2` | `cream` | Fondo principal de toda la app. |
| **Charcoal** | `#2D3A2E` | `charcoal` | Texto principal. Reemplaza al negro puro. |
| **Coral** | `#E07856` | `coral` | CTA primarios, alertas, urgencia. |

### Secundarios

| Token | HEX | Tailwind | Uso |
|---|---|---|---|
| **Sage soft** | `#E8EFE9` | `sage-soft` | Fondos de info cards, secciones de énfasis. |
| **Cream warm** | `#F4EFE6` | `cream-warm` | Variante más cálida del cream. |
| **Coral soft** | `#F5C7B6` | `coral-soft` | Hover de CTA, fondos sutiles. |
| **Sand** | `#D4C5A9` | `sand` | Decorativo, líneas divisorias. |

### Neutrales

| Token | HEX | Uso |
|---|---|---|
| **White** | `#FFFFFF` | Cards, modals. |
| **Gray 100** | `#EFECE7` | Bordes sutiles. |
| **Gray 400** | `#9B9890` | Texto secundario. |
| **Gray 600** | `#5C5852` | Texto descriptivo. |

### Estados

| Token | HEX | Uso |
|---|---|---|
| **Success** | `#5B8A60` | Confirmaciones, checkmarks. |
| **Warning** | `#D9A441` | Severidad media. |
| **Error** | `#C25450` | Errores de form, severidad alta. |

---

## Tipografía

### Headings: **Fraunces**

Serif moderna con personalidad. Free en Google Fonts. Pesos 500–700.

```css
font-family: 'Fraunces', 'Playfair Display', Georgia, serif;
letter-spacing: -0.02em;
line-height: 1.1; /* h1, h2 */
line-height: 1.3; /* h3 */
```

### Body: **Inter**

Sans-serif moderna. Pesos 400, 500, 600, 700.

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
line-height: 1.6; /* párrafos */
line-height: 1.4; /* UI */
```

### Escala tipográfica

```
text-xs    12px   microcopy
text-sm    14px   secondary text
text-base  16px   body
text-lg    18px   lead paragraph
text-xl    20px   small headings
text-2xl   24px   h3
text-3xl   30px   h2
text-4xl   40px   h1 mobile
text-5xl   56px   h1 desktop
text-6xl   72px   hero (raro)
```

---

## Spacing (múltiplos de 4px)

```
space-1   4px
space-2   8px
space-3   12px
space-4   16px
space-6   24px
space-8   32px
space-12  48px
space-16  64px
space-24  96px
```

---

## Border radius

```
rounded-sm    8px    badges, pills, inputs
rounded-md    12px   cards pequeños
rounded-lg    16px   cards de opciones del quiz
rounded-xl    24px   hero cards, modals
rounded-full  999px  botones primarios
```

**Regla**: botones primarios usan `rounded-full` (pill). Cards usan `rounded-lg`.

---

## Sombras

Suaves. Tinte verde-charcoal en lugar de negro puro.

```
shadow-sm   0 1px 2px rgba(45, 58, 46, 0.04)
shadow-md   0 4px 12px rgba(45, 58, 46, 0.08)
shadow-lg   0 8px 24px rgba(45, 58, 46, 0.12)
shadow-xl   0 20px 40px rgba(45, 58, 46, 0.16)
```

---

## Componentes base

### Button — Primary

```tsx
<Button variant="primary">QUIERO MI PROTOCOLO →</Button>
```

```css
background: var(--coral);
color: white;
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 1rem;
text-transform: uppercase;
letter-spacing: 0.04em;
padding: 1rem 2rem;
border-radius: 999px;
transition: transform 200ms, box-shadow 200ms;

&:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Button — Secondary

```css
background: var(--sage);
color: white;
/* mismo padding, radius, etc. */
```

### Button — Ghost

```css
background: transparent;
color: var(--gray-600);
text-decoration: underline;
font-weight: 400;
text-transform: none;
```

### OptionCard (opciones del quiz)

```tsx
<OptionCard
  selected={selected}
  onClick={handleClick}
  emoji="🌅"
  label="Apenas me levanto"
/>
```

```css
background: white;
border: 2px solid var(--gray-100);
border-radius: 16px;
padding: 1.5rem 2rem;
font-family: 'Inter', sans-serif;
font-size: 1.125rem;
color: var(--charcoal);
cursor: pointer;
transition: all 200ms ease;

&:hover {
  border-color: var(--sage);
  background: var(--sage-soft);
}

&[data-selected='true'] {
  border-color: var(--sage);
  background: var(--sage-soft);
  box-shadow: var(--shadow-md);
}
```

### ProgressBar

```tsx
<ProgressBar current={4} total={9} />
```

```css
.track {
  height: 6px;
  background: var(--gray-100);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: linear-gradient(to right, var(--sage), var(--coral));
  transition: width 400ms ease;
}
```

### InfoCard (info cards entre preguntas)

```css
background: var(--sage-soft);
border-radius: 24px;
padding: 3rem;
text-align: center;
max-width: 580px;
margin: 0 auto;
```

---

## Tailwind config (copiar tal cual)

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#7A9B7E',
          soft: '#E8EFE9',
          dark: '#5B8A60',
        },
        cream: {
          DEFAULT: '#FAF7F2',
          warm: '#F4EFE6',
        },
        coral: {
          DEFAULT: '#E07856',
          soft: '#F5C7B6',
        },
        charcoal: '#2D3A2E',
        sand: '#D4C5A9',
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '6xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        '5xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        '4xl': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        lg: '16px',
        xl: '24px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(45, 58, 46, 0.04)',
        md: '0 4px 12px rgba(45, 58, 46, 0.08)',
        lg: '0 8px 24px rgba(45, 58, 46, 0.12)',
        xl: '0 20px 40px rgba(45, 58, 46, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 400ms ease-out',
        'slide-up': 'slideUp 400ms ease-out',
        'scale-in': 'scaleIn 300ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

## globals.css (copiar tal cual)

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --sage: #7A9B7E;
  --sage-soft: #E8EFE9;
  --cream: #FAF7F2;
  --cream-warm: #F4EFE6;
  --charcoal: #2D3A2E;
  --coral: #E07856;
  --coral-soft: #F5C7B6;
}

html {
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

body {
  background: var(--cream);
  color: var(--charcoal);
  font-family: 'Inter', sans-serif;
}

h1, h2, h3 {
  font-family: 'Fraunces', serif;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Reglas de aplicación por contexto

### Landing pre-quiz (agente 01)
- Fondo cream
- Hero centrado, mucho espacio en blanco
- Imagen lifestyle a la derecha en desktop, arriba en mobile
- CTA grande coral

### Quiz (agente 02)
- Fondo cream
- Cards de opción: white con border gray-100 → sage al hover/seleccionado
- Botones de avance: coral
- Info cards: fondo sage-soft

### Página de resultados (agente 03)
- Fondo cream
- Hero: fondo blanco con accent decorativo en sand
- Bloques alternados: cream → cream-warm → cream
- CTA principal: coral con sombra lg
- Garantía: fondo sage-soft con border sage
- Testimonios: cards white con sombra md

### PDFs (agentes 05, 06, 07)
- Portada: combinación cream + sage + coral
- Body: cream con texto charcoal
- Headers de capítulo: sage con tipografía Fraunces
- Highlights/recuadros: fondo sage-soft

### Creativos para Meta (agentes 08, 09, 10)
- Fondo dominante: cream o blanco
- Texto en pantalla: charcoal (con stroke blanco si va sobre B-roll)
- Hooks impactantes: coral
- Acentos: sage

---

## Imágenes y fotografía

- **Estilo:** luz natural, cálida, tonos terrosos
- **Sujetos:** mujeres 30–55 (matchea avatar)
- **Sin sobreproducción.** Lifestyle real.

### Fuentes recomendadas
- **Pexels** (gratis, comercial OK) — primera opción
- **Unsplash** (gratis) — segunda
- **Storyblocks** (free trial) — para B-roll de creativos
- **Midjourney** — solo si tenés créditos y necesitás algo único

### Búsquedas que funcionan
- "woman wellness morning"
- "healthy breakfast bowl"
- "kitchen cooking natural light"
- "stomach bloating"
- "salad fresh ingredients"
- "yoga mat home"

---

## Iconografía

### Set: **Phosphor Icons**

Free, consistente, peso ajustable.

```bash
npm install @phosphor-icons/react
```

Uso preferido: peso `regular` o `bold`. Tamaño consistente: 20px en UI, 32px en bullets de página de resultados.

```tsx
import { Check, Clock, Lock, Shield } from '@phosphor-icons/react';
<Check size={24} weight="bold" />
```

### Emojis funcionales

Solo en:
- Microcopy: ⏱️ 🔒 ✅
- Bullets: 🎁 📕 📊 🎙️
- CTAs: → 👉
- Garantía: 🛡️

NO en titulares serios o párrafos de credibilidad.

---

## Accesibilidad

- Contraste mínimo AA (4.5:1) en todos los textos
- `:focus-visible` en todos los elementos interactivos
- Tap targets ≥ 44px en mobile
- `aria-label` en íconos sin texto
- Respeto a `prefers-reduced-motion`

---

## Animaciones

| Animación | Duración | Easing | Uso |
|---|---|---|---|
| `fade-in` | 400ms | ease-out | Entrada de slides nuevos |
| `slide-up` | 400ms | ease-out | Entrada de bloques |
| `scale-in` | 300ms | ease-out | Modals, info cards |
| Avance de slide | 350ms | ease-in-out | Transición entre slides del quiz |
| Hover de botón | 200ms | ease | Microinteracciones |

Todo via Framer Motion en el frontend.

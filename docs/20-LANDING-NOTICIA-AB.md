# Agente 20 — Landing "Mujer Hoy" Variant + A/B Test

> Crea una variante de la landing con look de portal de noticias estilo "Mujer Hoy", con imagen hero generada por IA y un testimonio existente convertido en titular de noticia. Expone ambas vía A/B test.

---

## Goal

Probar si una landing que parece **artículo editorial** (no ad) baja el CPM y sube CTR.

- **Control:** la landing actual (`app/page.tsx` con el hero quiz).
- **Noticia:** landing tipo portal "Mujer Hoy" con artículo aparente que termina en CTA al quiz.

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `components/landing/LandingControl.tsx` | NEW — copia del actual `app/page.tsx` |
| `components/landing/LandingNoticia.tsx` | NEW — variante noticia |
| `app/page.tsx` | MODIFY — server component que elige variante por cookie |
| `public/images/landing-noticia/hero.jpg` | NEW (humano provee) |

---

## Archivos read-only

- `lib/ab/index.ts` — para `getVariant`
- `lib/quiz-store.ts`
- `app/page.tsx` actual — copiar 1:1 a `LandingControl.tsx`

---

## Implementation outline

### 1. Mover landing actual a `LandingControl.tsx`

Copiar el contenido de `app/page.tsx` tal cual a `components/landing/LandingControl.tsx`. Que sea exactamente igual.

### 2. Crear `LandingNoticia.tsx`

Estructura:

```
┌─────────────────────────────────────────┐
│ [LOGO MUJER HOY]              SECCIONES │  ← header tipo portal
├─────────────────────────────────────────┤
│ SALUD · 14 NOV 2025 · 3 MIN LECTURA    │  ← meta del artículo
│                                          │
│ ## Carolina, 42 años, encontró el       │  ← headline de noticia
│    método que cambió su rutina:          │
│    "En 7 días no podía creer la         │
│    diferencia"                          │
│                                          │
│ Por la redacción de Mujer Hoy           │
│                                          │
│ ┌───────────────────────────────────┐  │
│ │   [IMAGEN HERO IA — mujer 40s,   │  │
│ │    cocina luminosa, sonriente]    │  │
│ └───────────────────────────────────┘  │
│ Foto: ilustrativa.                      │
│                                          │
│ Carolina pasó 3 años creyendo que       │
│ tenía "panza de mamá"... [body editorial]│
│                                          │
│ [3-4 párrafos contando la historia]     │
│                                          │
│ ### El test que reveló su tipo de      │
│     hinchazón                            │
│                                          │
│ Hace dos semanas conocimos a un equipo  │
│ de nutricionistas que diseñó un test... │
│                                          │
│ [CTA box destacado]                     │
│ ┌──────────────────────────────────┐   │
│ │ Hacé el test gratis (2 min)      │   │
│ │ → Ver mi tipo de hinchazón       │   │
│ └──────────────────────────────────┘   │
│                                          │
│ ### Otras mujeres que ya lo hicieron    │
│                                          │
│ [Lucía P., 38] [Verónica T., 51]       │  ← otros testimonios
│                                          │
│ [CTA final]                              │
│                                          │
│ Disclaimer pequeño                       │
└─────────────────────────────────────────┘
```

### 3. Estilo visual

**NO usar la paleta sage/cream del producto.** Usar paleta editorial:
- Fondo: `#FFFFFF`
- Texto: `#1A1A1A`
- Accent (links, CTA): un rojo o magenta tipo Mujer Hoy (ej `#D4145A`)
- Tipografía body: serif (Fraunces ya está en el proyecto)
- Headline: serif grande, 36-48px

Look feel: tipo nota de portal de salud para mujeres, NO landing de producto.

### 4. CTA dentro del artículo

El click del CTA va a `/quiz`, igual que el control. Pero antes:

```tsx
function handleQuizStart() {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', 'QuizStart', { variant: 'noticia' });
  }
  router.push('/quiz');
}
```

(El `experiments.exp_landing_format` se incluye automáticamente en CAPI vía Agente 13. Esto extra no hace daño y refuerza.)

### 5. Modificar `app/page.tsx`

```tsx
import { cookies } from 'next/headers';
import { getVariant } from '@/lib/ab';
import { LandingControl } from '@/components/landing/LandingControl';
import { LandingNoticia } from '@/components/landing/LandingNoticia';

export default function Page() {
  const variant = getVariant(cookies(), 'exp_landing_format');
  if (variant === 'noticia') return <LandingNoticia />;
  return <LandingControl />;
}
```

### 6. Imagen hero

El humano genera la imagen con IA. Ver sección "Human inputs needed" más abajo. Path destino: `public/images/landing-noticia/hero.jpg`.

---

## Acceptance criteria

- [ ] Con cookie `ab_exp_landing_format=control`, veo la landing actual sin cambios.
- [ ] Con cookie `=noticia`, veo el artículo editorial.
- [ ] El CTA "Hacer el test" en la noticia lleva a `/quiz` y dispara `QuizStart`.
- [ ] La imagen hero está en `public/images/landing-noticia/hero.jpg`.
- [ ] Mobile-first: el artículo se ve bien en 375px de ancho.
- [ ] El testimonio de Carolina (que era social proof en la actual) se convierte en HEADLINE de la noticia, no se duplica.
- [ ] Build de TypeScript pasa.

---

## Dependencies

- **13** (A/B Testing Infra) — necesita `getVariant` server-side.

---

## Human inputs needed

### 1. Imagen hero generada por IA

**Prompt sugerido para Midjourney / DALL-E / SDXL:**

```
Editorial photography for a women's health magazine article, soft natural light coming from a window on the left, a Latin Argentinian woman in her early 40s sitting at a wooden kitchen table with a cup of herbal tea, looking calmly happy and relaxed, wearing a beige knit sweater, a small plant and an open notebook on the table, a window with green plants visible behind her, warm golden hour lighting, shallow depth of field, photorealistic, magazine cover quality, candid lifestyle photography style, NO TEXT, NO LOGOS, --ar 16:9 --style raw
```

Variaciones aceptables:
- Mujer en ambiente luminoso de cocina o living
- Edad 38-45 años, fenotipo latino/argentino
- Expresión calma, no sonrisa exagerada
- Estilo lifestyle editorial, no comercial
- 16:9 ratio, > 1600px ancho
- SIN texto ni logos

Subir a `public/images/landing-noticia/hero.jpg`.

### 2. Decisión de qué testimonio convertir en headline

Hoy el copy tiene 3 testimonios. Sugerencia: usar el de Carolina como headline porque es el más concreto. Confirmar antes de implementar o el agente lo decide solo y avisa.

---

## Notes

- Esta variante NO debe parecer un anuncio. Si parece anuncio, fracasa.
- El CTA debe estar al menos a 50% del scroll, no arriba de todo. Eso es lo que diferencia un artículo de un ad.
- Disclaimer al final: "Este artículo describe una experiencia individual. Resultados pueden variar." — para cumplir buenas prácticas.

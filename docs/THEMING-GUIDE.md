# Guía de Theming — Cómo cambiar el estilo para otro nicho

> Este template está diseñado para que **cambiar de nicho = cambiar 1 archivo de config + reemplazar copy/imágenes**. La estructura, tracking, emails y admin se reusan sin tocar.

---

## Dónde vive el estilo

| Qué | Archivo | Qué cambiar |
|-----|---------|-------------|
| **Colores** | `tailwind.config.ts` → `theme.extend.colors` | Los 3 grupos de color (ver abajo) |
| **Tipografía** | `tailwind.config.ts` → `theme.extend.fontFamily` | Serif para headings, sans para body |
| **Font imports** | `app/layout.tsx` o `app/globals.css` | Google Fonts / next/font |
| **Radios, shadows** | `tailwind.config.ts` → `borderRadius`, `boxShadow` | Ajustar si querés un look más sharp o más soft |
| **CSS global** | `app/globals.css` | Variables CSS si usás alguna, scrollbar, selection color |

---

## El sistema de colores (3 roles)

El template usa **3 grupos funcionales** de color. No importa qué colores elijas, siempre tenés que cubrir estos 3 roles:

### 1. Color primario de marca (`sage` en el nicho actual)

**Rol:** confianza, autoridad, elementos positivos.

Se usa en:
- Barra de progreso del quiz
- Checkmarks ✓
- Badges de éxito
- Backgrounds suaves de secciones educativas
- Navigation activa (PWA)

```ts
// tailwind.config.ts
sage: {
  DEFAULT: '#7A9B7E',  // ← tu color primario
  soft: '#E8EFE9',     // ← versión muy clara (backgrounds)
  dark: '#5B8A60',     // ← versión hover/dark
}
```

**Ejemplos para otros nichos:**
| Nicho | Color | Hex |
|-------|-------|-----|
| Salud/bienestar (actual) | Verde sage | `#7A9B7E` |
| Finanzas personales | Azul navy | `#2E4057` |
| Fitness/deporte | Azul eléctrico | `#3B82F6` |
| Skincare/beauty | Rosa dusty | `#D4A5A5` |
| Productividad | Violeta | `#7C3AED` |
| Nutrición keto | Verde oscuro | `#065F46` |

### 2. Color de acción/CTA (`coral` en el nicho actual)

**Rol:** llamar la atención, urgencia, CTAs principales.

Se usa en:
- Botones "EMPEZAR MI PROTOCOLO"
- Precio destacado
- Badges de oferta
- Texto enfatizado en copy de venta
- Info cards destacados

```ts
coral: {
  DEFAULT: '#E07856',  // ← tu color de CTA
  soft: '#F5C7B6',     // ← versión suave para backgrounds de offers
}
```

**Ejemplos para otros nichos:**
| Nicho | Color | Hex |
|-------|-------|-----|
| Salud/bienestar (actual) | Coral terracota | `#E07856` |
| Finanzas | Dorado/amber | `#D97706` |
| Fitness | Naranja energético | `#EA580C` |
| Skincare | Rosa hot | `#DB2777` |
| Productividad | Naranja brillante | `#F97316` |
| General (safe) | Rojo suave | `#DC2626` |

### 3. Color de fondo/texto (`cream` + `charcoal` en el nicho actual)

**Rol:** legibilidad, confort visual, no fatiga.

```ts
cream: {
  DEFAULT: '#FAF7F2',  // ← fondo principal (NO blanco puro)
  warm: '#F4EFE6',     // ← fondo secundario (cards)
}
charcoal: '#2D3A2E',   // ← texto principal (NO negro puro)
```

**Regla universal:** NUNCA usar `#FFFFFF` de fondo ni `#000000` de texto. Los funnels de salud/wellness usan tonos cálidos (cream, ivory, off-white). Si tu nicho es tech/SaaS, podés ir más frío (slate, zinc).

---

## Cómo cambiar los colores en 5 minutos

### Paso 1: Elegir tu paleta (3 colores)

Herramientas recomendadas:
- [Coolors.co](https://coolors.co) — generador de paletas
- [Realtime Colors](https://www.realtimecolors.com) — preview en vivo en una landing
- [Huemint](https://huemint.com) — AI palette generator

Necesitás:
1. **Primario** (trust/positivo) + versión soft + versión dark
2. **CTA** (action/urgencia) + versión soft
3. **Background** (warm off-white) + versión warm
4. **Texto** (warm dark, not pure black)

### Paso 2: Reemplazar en `tailwind.config.ts`

```ts
// tailwind.config.ts → theme.extend.colors
colors: {
  sage: {           // ← renombrar si querés (ej: "navy", "violet")
    DEFAULT: '#TU_PRIMARIO',
    soft: '#TU_PRIMARIO_SOFT',
    dark: '#TU_PRIMARIO_DARK',
  },
  cream: {
    DEFAULT: '#TU_BACKGROUND',
    warm: '#TU_BACKGROUND_WARM',
  },
  coral: {          // ← renombrar si querés (ej: "accent", "cta")
    DEFAULT: '#TU_CTA',
    soft: '#TU_CTA_SOFT',
  },
  charcoal: '#TU_TEXTO_OSCURO',
  sand: '#TU_BORDE_SUAVE',      // borders, separadores
  'gray-100': '#TU_GRIS_CLARO', // inputs, dividers
  'gray-400': '#TU_GRIS_MEDIO', // texto secundario
  'gray-600': '#TU_GRIS_FUERTE', // texto body
}
```

### Paso 3: Verificar contraste

Chequeá que tu combinación pase WCAG AA:
- Texto body sobre fondo: ratio ≥ 4.5:1
- Botón CTA (texto blanco sobre color): ratio ≥ 3:1
- Tool: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Paso 4: Actualizar shadows (opcional)

Las shadows usan el charcoal como base del rgba. Si tu charcoal cambia mucho:

```ts
boxShadow: {
  sm: '0 1px 2px rgba(R, G, B, 0.04)',   // ← tu charcoal en RGB
  md: '0 4px 12px rgba(R, G, B, 0.08)',
  lg: '0 8px 24px rgba(R, G, B, 0.12)',
}
```

---

## Tipografía

### Actual (bienestar femenino)

```ts
fontFamily: {
  serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
}
```

- **Fraunces** (serif): elegante, femenina, premium. Para headings.
- **Inter** (sans): neutra, legible, mobile-optimized. Para body.

### Cómo cambiar para otro nicho

| Nicho | Serif (headings) | Sans (body) | Vibe |
|-------|-----------------|-------------|------|
| Salud/wellness femenino | Fraunces / Playfair | Inter | Elegante, cálido |
| Fitness masculino | Archivo / Montserrat Bold | Inter / DM Sans | Fuerte, directo |
| Finanzas | DM Serif Display / Libre Baskerville | DM Sans / Karla | Serio, confiable |
| Tech/SaaS | Cal Sans / Satoshi | Inter / Geist | Moderno, limpio |
| Comida/recetas | Recoleta / Fraunces | Nunito / Inter | Amigable, redondo |
| Premium/luxury | Cormorant Garamond | Jost / Inter | Refinado |

### Pasos para cambiar font:

1. Elegir fonts en [Google Fonts](https://fonts.google.com)
2. Agregar import en `app/layout.tsx` (usar `next/font/google` para performance)
3. Actualizar `tailwind.config.ts` → `fontFamily`
4. Verificar que no rompa layouts (fonts más anchas pueden desbordar botones)

---

## Archivos de estilo que podrías tocar

### `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Selection color — cambiar al primario */
::selection {
  background-color: #E8EFE9; /* sage-soft */
  color: #2D3A2E;           /* charcoal */
}

/* Scrollbar custom (webkit) */
::-webkit-scrollbar-thumb {
  background-color: #D4C5A9; /* sand */
}
```

### `components/ui/Button.tsx`

El componente Button usa variants (`primary`, `secondary`). Los colores están hardcodeados como clases de Tailwind. Si renombrás `coral`/`sage`, actualizar acá.

### Quiz loading animation colors

En `components/quiz/SlideLoading.tsx`:
```tsx
// Barra de progreso
className="bg-gradient-to-r from-sage to-coral"
// Checkmark completado
className="bg-sage text-white"
```

### Infografía SVG (donut chart)

En `components/quiz/SlideInfoCard.tsx` → `InflamacionVsGrasa`:
```tsx
stroke="#E07856"  // coral — segmento principal
stroke="#7A9B7E"  // sage — segmento secundario
```

---

## Checklist para re-skin completo

```
[ ] tailwind.config.ts — colores, fonts, shadows
[ ] app/layout.tsx — import de fonts
[ ] app/globals.css — selection, scrollbar
[ ] components/ui/Button.tsx — verificar variants
[ ] components/quiz/SlideLoading.tsx — gradient colors
[ ] components/quiz/SlideInfoCard.tsx — SVG stroke colors
[ ] components/resultados/SeveridadGauge.tsx — arc colors
[ ] components/resultados/StickyCTA.tsx — bg color
[ ] public/img/ — mockups, capturas (regenerar con nuevos colores)
[ ] app/pwa/ — nav colors, header (si el producto cambia de look)
[ ] Verificar contraste WCAG AA en todas las combinaciones
```

---

## Paletas pre-armadas (copiar y pegar)

### Fitness masculino (dark + electric blue)

```ts
colors: {
  sage: { DEFAULT: '#3B82F6', soft: '#DBEAFE', dark: '#1D4ED8' },
  cream: { DEFAULT: '#F8FAFC', warm: '#F1F5F9' },
  coral: { DEFAULT: '#F97316', soft: '#FED7AA' },
  charcoal: '#0F172A',
  sand: '#CBD5E1',
  'gray-100': '#E2E8F0',
  'gray-400': '#94A3B8',
  'gray-600': '#475569',
}
```

### Finanzas / dinero (navy + gold)

```ts
colors: {
  sage: { DEFAULT: '#2E4057', soft: '#E2E8F0', dark: '#1E293B' },
  cream: { DEFAULT: '#FAFAF9', warm: '#F5F5F4' },
  coral: { DEFAULT: '#D97706', soft: '#FDE68A' },
  charcoal: '#1C1917',
  sand: '#D6D3D1',
  'gray-100': '#E7E5E4',
  'gray-400': '#A8A29E',
  'gray-600': '#57534E',
}
```

### Skincare / beauty (blush + rose)

```ts
colors: {
  sage: { DEFAULT: '#D4A5A5', soft: '#FDF2F2', dark: '#B97A7A' },
  cream: { DEFAULT: '#FFFBF7', warm: '#FFF5EE' },
  coral: { DEFAULT: '#DB2777', soft: '#FBCFE8' },
  charcoal: '#3B1F2B',
  sand: '#E8D5D5',
  'gray-100': '#F3E8E8',
  'gray-400': '#B8A0A0',
  'gray-600': '#6B5656',
}
```

### Productividad / tech (violet + orange)

```ts
colors: {
  sage: { DEFAULT: '#7C3AED', soft: '#EDE9FE', dark: '#5B21B6' },
  cream: { DEFAULT: '#FAFAFA', warm: '#F5F3FF' },
  coral: { DEFAULT: '#F97316', soft: '#FED7AA' },
  charcoal: '#18181B',
  sand: '#D4D4D8',
  'gray-100': '#E4E4E7',
  'gray-400': '#A1A1AA',
  'gray-600': '#52525B',
}
```

---

## Tips finales

1. **No cambies los nombres de las clases** (`sage`, `coral`, `cream`, `charcoal`). Solo cambiá los hex values. Así no tenés que tocar 200+ archivos de componentes.

2. **El fondo NUNCA debería ser blanco puro `#FFFFFF`**. Siempre un off-white con un tinte del primario. Esto es lo que diferencia un funnel "premium" de uno "hecho con Canva".

3. **El CTA SIEMPRE debe contrastar fuerte** con el fondo y el primario. Si tu primario es azul y tu CTA es azul más oscuro, no funciona. Necesitás un color de otra familia (naranja, rojo, amarillo).

4. **Testear en mobile con sol**. La mayoría del tráfico es mobile en LATAM. Si los colores no se ven bien con brightness al máximo en el sol de la tarde, el funnel pierde conversión.

5. **Las Google Fonts se cachean en Vercel** vía `next/font`. Si cambiás la font, necesitás redeploy completo.

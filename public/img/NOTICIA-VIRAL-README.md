# Imágenes de "noticia viral" por país

El **slide 4** del quiz (`SlideViralNews`) muestra el **screenshot de una nota
de prensa viral** de un periódico local del país detectado del visitante.
Este es uno de los principales hooks de prueba social del funnel.

Hay que crear y subir **una imagen por país soportado** con el siguiente formato:

| Archivo | País | Periódico sugerido |
|---|---|---|
| `noticia-viral-cl.jpg` | 🇨🇱 Chile      | **BioBio Chile** o La Tercera |
| `noticia-viral-co.jpg` | 🇨🇴 Colombia   | **El Tiempo** o Semana |
| `noticia-viral-mx.jpg` | 🇲🇽 México     | **El Universal** o Milenio |
| `noticia-viral-pe.jpg` | 🇵🇪 Perú       | **El Comercio** o RPP |
| `noticia-viral-us.jpg` | 🇺🇸 EE.UU.     | **CNN en Español** o USA Today |

> El nombre del medio "fallback" (que se muestra si la imagen no existe) está
> en `lib/quiz-v2/localization.ts` → `SOCIAL_PROOF_OVERRIDES[CC].socialProofSource`.

## Especificaciones técnicas

- **Formato:** JPG (preferido) — también funciona PNG con la misma extensión.
- **Tamaño:** ~900 × 1342 px (vertical, proporción mobile).
- **Estilo:** screenshot fiel del medio. Logo + titular + bajada visibles. Sin
  recortes ni ediciones excesivas — la idea es que parezca una captura real.
- **Copy del titular** (sugerido, adaptable al periódico):
  > "Nutricionista revela por qué el agua de arroz en ayunas deshincha la panza
  > mejor que cualquier dieta"

## Comportamiento si la imagen NO está

El componente `SlideViralNews` tiene `onError` → si el archivo no existe,
muestra un fallback de texto con el nombre del medio (ver
`socialProofSource` por país). El quiz NO se rompe. Eso permite hacer deploy
de los cambios de localización ANTES de que el equipo creativo entregue las
imágenes.

## Para agregar un país nuevo

1. Sumá una entrada en `SOCIAL_PROOF_OVERRIDES` en
   `lib/quiz-v2/localization.ts` con:
   - `socialProofImage: '/img/noticia-viral-{cc}.jpg'` (cc = código en minúscula)
   - `socialProofSource: 'NombreDelMedio'`
2. Subí la imagen al path indicado.
3. Crear la ruta SEO `app/{slug}/page.tsx` (ver `app/chile/page.tsx`).
4. Sumá el código al CHECK del schema en `supabase/setup.sql`.

# Agente 19 — Quiz Slim Variant + A/B Test

> Reduce el quiz de 16 → 13 slides en una variante "slim", expone ambas vía A/B test usando la infraestructura del Agente 13.

---

## Goal

Probar si cortar fricción mejora la conversión:

- **Control (16 slides):** la versión actual.
- **Slim (13 slides):** mismo contenido pero eliminando 2 de las 3 yes-street y compactando.

Ambas variantes corren en paralelo, 50/50, durante el lanzamiento. La métrica clave es **% completion del quiz** y **% lead → venta**.

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `lib/quiz-data.ts` | MODIFY — exportar `slidesSlim` además de `slides` |
| `components/quiz/QuizContainer.tsx` | MODIFY — leer `useVariant('exp_quiz_length')` |
| `lib/tipos-hinchazon.ts` | READ-ONLY (debe seguir funcionando con menos respuestas) |

---

## Archivos read-only

- `lib/ab/index.ts` — para usar el hook
- `lib/quiz-types.ts` — tipos compartidos

---

## Implementation outline

### 1. Diseño del slim (13 slides)

| # | Slide | Status en slim |
|---|---|---|
| 1 | intro | ✅ |
| 2 | edad | ✅ |
| 3 | momento_del_dia | ✅ |
| 4 | tiempo_con_problema | ✅ |
| 5 | info_card 1 (sabías que…) | ✅ |
| 6 | sintomas (multi) | ✅ |
| 7 | ya_probo (multi) | ✅ |
| 8 | info_card 2 (testimonio) | ✅ |
| 9 | impacto_emocional | ✅ |
| 10 | frecuencia | ✅ |
| 11 | info_card 3 | ✅ |
| ~~12~~ | si_natural | ❌ ELIMINAR |
| ~~13~~ | si_plan_simple | ❌ ELIMINAR |
| 12 | si_ver_plan | ✅ (única yes-street que queda) |
| 13 | email_capture | ✅ |
| 14 | loading | ✅ |

(Mantener `si_ver_plan` porque es la transición más fuerte hacia el email.)

### 2. Modificar `lib/quiz-data.ts`

```ts
export const slides: Slide[] = [/* ... 16 slides actuales ... */];

export const slidesSlim: Slide[] = slides.filter(
  (s) =>
    !(s.type === 'question' && (s.id === 'si_natural' || s.id === 'si_plan_simple'))
);
```

### 3. Modificar `QuizContainer.tsx`

```tsx
import { useVariant } from '@/lib/ab/use-variant';
import { slides, slidesSlim } from '@/lib/quiz-data';

export function QuizContainer() {
  const variant = useVariant('exp_quiz_length');
  const activeSlides = variant === 'slim' ? slidesSlim : slides;
  // resto igual, pero usando activeSlides en lugar de slides
}
```

### 4. Tracking

El Agente 13 ya inyecta automáticamente `experiments.exp_quiz_length` en cada evento `/api/track`. NO hace falta tracking manual extra.

Verificar que el evento `QuizProgress` incluye también `total_slides` (que ya lo hace) y que ese número refleja el array activo.

### 5. Manejo del scoring con menos respuestas

`calcularSeveridad` ya tolera respuestas vacías (`tiempoMap[answers.tiempo_con_problema as string] || 0`). Verificar que sigue funcionando si las yes-streets eliminadas no están.

`calcularTipo` solo depende de `momento_del_dia`, que sigue presente. ✅

---

## Acceptance criteria

- [ ] En el navegador con cookie `ab_exp_quiz_length=slim`, el quiz muestra solo 13 slides (verificar contando el progress bar).
- [ ] Con cookie `=control`, el quiz muestra los 16 slides originales.
- [ ] El submit del email funciona en ambas variantes.
- [ ] La página de resultados se renderiza correctamente con los datos de ambas variantes.
- [ ] En `/admin/funnel` (Agente 14), se puede comparar conversión por variante.
- [ ] El TypeScript compila en strict mode.

---

## Dependencies

- **13** (A/B Testing Infra) — necesita `useVariant`.
- **14** (Dashboard) — para poder ver los resultados, pero no bloquea el deploy.

---

## Human inputs needed

Ninguno. Después del deploy, esperar 7-14 días con tráfico real para tener datos significativos.

---

## Notes

- Hipótesis del experimento: el slim convertirá más leads porque hay menos fricción, pero la calidad del lead puede ser ligeramente menor (menos preguntas = menos compromiso). La métrica final es VENTAS, no leads.
- Si después de 1.000 visitas no hay diferencia significativa (p > 0.05), elegir el slim por simplicidad.
- Si el control gana, tirar el slim — pero entonces analizar por qué.

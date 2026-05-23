# Agente 21 — Quiz Pre-fill desde Ad URL + A/B Test

> Permite que los ads lleven al quiz con la primera respuesta ya pre-llenada (ej: `/quiz?momento=tarde_noche`), saltando la primera pregunta. Trackea si convierte mejor que el quiz cold.

---

## Goal

Probar si un ad que pregunta "¿Te hinchás más a la noche?" → click → quiz **arrancando ya en la pregunta 2** convierte mejor que el quiz cold (que arranca en intro).

Hipótesis: la coherencia entre ad y quiz mejora completion rate y calidad del lead.

---

## Archivos owned

| Archivo | Acción |
|---|---|
| `app/quiz/page.tsx` | MODIFY — leer searchParams |
| `components/quiz/QuizContainer.tsx` | MODIFY — aceptar prefill props, saltear slides correspondientes |
| `lib/quiz-store.ts` | MODIFY — método `seedAnswers(partial)` |
| `lib/ab/experiments.ts` | MODIFY — agregar `exp_quiz_prefill` (opcional) |

---

## Archivos read-only

- `lib/quiz-data.ts`
- `lib/quiz-types.ts`

---

## Implementation outline

### 1. Definir qué params se aceptan

Solo permitir prefill de:
- `momento` → `momento_del_dia`
- `edad` → `edad`
- `tiempo` → `tiempo_con_problema`

(NO permitir prefill de slides multi como `sintomas` para evitar URLs largas.)

Solo se permite prefill **secuencial desde el inicio**. Si pasás `momento=...&edad=...`, el quiz arranca en la pregunta 4 (después de momento+edad). NO permite skipear a la mitad.

### 2. Validación de valores

Cada param debe coincidir EXACTAMENTE con un valor válido del slide. Si no coincide, se ignora ese param y los siguientes (corte de la cadena de prefill).

```ts
const VALID_VALUES: Record<string, Set<string>> = {
  edad: new Set(['25_34', '35_44', '45_54', '55_mas']),
  momento_del_dia: new Set(['manana', 'almuerzo', 'tarde_noche', 'todo_el_dia']),
  tiempo_con_problema: new Set(['menos_6m', '6m_2a', '2a_5a', 'mas_5a']),
};
```

### 3. `seedAnswers` en el store

```ts
// lib/quiz-store.ts
seedAnswers: (partial: Partial<QuizAnswers>) => {
  set((s) => ({ answers: { ...s.answers, ...partial } }));
}
```

### 4. En `app/quiz/page.tsx`

```tsx
export default function QuizPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const prefill = parsePrefill(searchParams); // valida + retorna partial QuizAnswers
  return <QuizContainer prefill={prefill} />;
}
```

### 5. En `QuizContainer`

Al montar, si hay prefill:
- Llamar `seedAnswers(prefill)`
- Calcular el primer slide al que saltar (después del último prefilled)
- Setear `currentStep` a ese slide
- Trackear evento `QuizStartPrefilled` con los valores

```tsx
useEffect(() => {
  if (prefill && Object.keys(prefill).length > 0) {
    seedAnswers(prefill);
    const firstUnansweredIndex = findFirstUnansweredSlide(activeSlides, prefill);
    setCurrentStep(firstUnansweredIndex);
    fetch('/api/track', {
      method: 'POST',
      body: JSON.stringify({
        event: 'QuizStartPrefilled',
        custom: { prefilled_keys: Object.keys(prefill) },
      }),
    });
  }
}, []);
```

### 6. (Opcional) Experimento explícito

Para comparar limpio:
- `exp_quiz_prefill`: `cold` vs `prefilled`
- Pero esto NO se asigna en middleware — se decide por la URL.
- Si tiene params válidos → variant `prefilled`. Sino → `cold`.

Esto se hace en /api/track manualmente:

```ts
const hadPrefill = body.custom?.had_prefill === true;
customData.experiments = {
  ...customData.experiments,
  exp_quiz_prefill: hadPrefill ? 'prefilled' : 'cold',
};
```

### 7. URLs para los ads

Documentar las URLs canónicas para que el equipo de ads las use:

```
/quiz?momento=manana                 → arranca en P3
/quiz?momento=almuerzo               → arranca en P3
/quiz?momento=tarde_noche            → arranca en P3
/quiz?momento=todo_el_dia            → arranca en P3
/quiz?edad=35_44&momento=tarde_noche → arranca en P4
```

Cada URL puede incluir UTMs en paralelo. Ejemplo completo:

```
/quiz?momento=tarde_noche&utm_source=fb&utm_campaign=hinchazon-feb&utm_content=ugly-noche-1
```

---

## Acceptance criteria

- [ ] Visitar `/quiz?momento=tarde_noche` arranca el quiz mostrando la pregunta 4 (`tiempo_con_problema`).
- [ ] La respuesta `tarde_noche` se ve seleccionada al volver atrás (botón "anterior" si existe).
- [ ] La página de resultados muestra "Tipo 3 — Vespertina" porque la respuesta se aplicó.
- [ ] Visitar `/quiz?momento=invalido` ignora el param y arranca normal.
- [ ] El evento `QuizStartPrefilled` aparece en CAPI con el array de keys prefilled.
- [ ] Los UTMs paralelos siguen capturándose en localStorage.
- [ ] `/quiz` sin params (cold) sigue funcionando exactamente igual que antes.

---

## Dependencies

Ninguna estricta. Idealmente DESPUÉS de 13 (A/B Infra) y 19 (Quiz Slim) para no pisarse en los archivos del quiz.

---

## Human inputs needed

- Después del deploy, generar **bank de URLs ad-quiz** (al menos 4 ads, una por valor de momento_del_dia).
- Diseñar los creativos para que cada uno hable del momento específico del día (ej: ad de mañana → "¿Te despertás con la panza ya hinchada?").

---

## Notes

- Si en el futuro queremos soporte para multi-prefill o respuestas multi (sintomas), eso es V2.
- El "salto" debe sentirse natural, NO mostrar la pregunta saltada en gris ni nada. Simplemente arrancás más adelante.
- Importante: el progress bar debe reflejar el progreso REAL incluyendo las preguntas saltadas (ej: ya estás en 3/13).

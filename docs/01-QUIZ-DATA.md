# Agent 01 — QUIZ-DATA

## Responsabilidad
Definir los datos del quiz (ambas versiones), tipos específicos, helpers de cálculo de resultado.

## Output
- lib/quiz/types.ts — tipos: Slide, QuizAnswer, QuizResult, InsomniaTipo, Gender
- lib/quiz/slides.ts — slides quiz corto (10-12)
- lib/quiz/slides-v2.ts — slides quiz largo (18-22)
- lib/quiz/calculate-result.ts — lógica de cálculo de tipo + severidad
- lib/quiz/store.ts — Zustand store del quiz

## Lógica de cálculo
- Pregunta de "problema principal" → tipo primario
- Duración del problema → severidad base
- Pantalla antes de dormir → +1 severidad
- Probó pastillas recetadas → +2 severidad
- Más de 2 años → +3 severidad
- Severidad final: clamp entre 1-10

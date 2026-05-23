# Agent 03 — QUIZ-CONTAINER

## Responsabilidad
Orquestadores que conectan slides + store + navegación. Pages de Next.js.

## Output
- components/quiz/QuizContainer.tsx — orquesta quiz corto
- components/quiz/QuizContainerV2.tsx — orquesta quiz largo
- app/quiz/page.tsx — monta QuizContainer
- app/quiz-v2/page.tsx — monta QuizContainerV2

## Lógica
- Lee slide actual del store
- Renderiza el componente correcto según slide.type
- Maneja navegación (next/prev)
- Slides condicionales por género
- Al completar → calcula resultado → muestra SlideResult → muestra SalesPage

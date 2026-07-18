# Requirements Document

## Introduction

Este documento deriva los requisitos del diseño aprobado `quiz-cleanup-and-latam-sync`. El alcance es una limpieza quirúrgica del funnel de quiz (Next.js App Router + TypeScript) en dos frentes ya acordados:

- **Frente B — Email en Argentina:** quitar el slide `email_capture` del flujo del quiz de Argentina, conservando intacto `/api/submit-quiz` y todas sus integraciones.
- **Frente C — Limpieza y sincronización:** colapsar la sales page A/B a la variante ganadora B y eliminar su infraestructura de test; sincronizar estructuralmente LATAM con AR mediante un test anti-drift (sin refactor de arquitectura); eliminar la cadena de código muerto de `localization`; y eliminar el cruft legacy v2/v3.

El principio rector es **borrar solo lo confirmado muerto, sin tocar lo que vive**, respetando el spec previo `funnel-quiz-tracking-toggle`. Cada requisito mantiene trazabilidad con las secciones del diseño y con las Correctness Properties (1–8).

**Fuera de alcance:** refactor de la arquitectura de LATAM, eliminación del test de entrada A/B/C, geo-routing/detección de país, y borrado de data histórica.

## Glossary

- **Quiz_AR**: Flujo del quiz de Argentina servido en `/quiz`, orquestado por `QuizContainerV2` sobre la lista de slides `slidesV3`.
- **Quiz_LATAM**: Flujo del quiz de LATAM servido en `/latam`, orquestado por `QuizContainerLatam` sobre la lista de slides `slidesV3Latam`.
- **Sales_Page**: Componente `SlideSalesPageV3.tsx` que renderiza la página de ventas dentro del flujo del quiz.
- **Track_API**: Endpoint `app/api/track/route.ts` que recibe eventos de tracking del cliente.
- **Submit_Quiz_API**: Endpoint `app/api/submit-quiz/route.ts` y sus integraciones (Supabase `clientes`, Systeme.io, Meta CAPI `Lead`).
- **Funnel_Store**: Módulo `lib/admin/store.ts` que computa `FunnelData` y expone tipos asociados.
- **Supabase_Store**: Módulo `lib/admin/supabase-store.ts` que construye `FunnelData` desde Supabase.
- **Funnel_Dashboard**: Componente `app/admin/funnel/FunnelView.tsx` que renderiza el embudo en el panel de administración.
- **Data_Sync_Test**: Test anti-drift `lib/quiz-v2/data-sync.test.ts` que compara la forma estructural de `slidesV3` vs `slidesV3Latam`.
- **Sales_AB_Infra**: Infraestructura del test A/B de la sales page: `lib/quiz-v2/abSales.ts`, la sales page vieja `components/quiz-v2/SlideSalesPage.tsx`, los eventos `sp_*` y el breakdown `salesVariantBreakdown`.
- **Entry_AB_Test**: Test A/B/C de entrada basado en `lib/quiz-v2/abEntry.ts` y su sección de dashboard "Test A/B/C — pantalla de entrada".
- **Localization_Chain**: Cadena de código muerto compuesta por `lib/quiz-v2/localization.ts`, `lib/quiz-v2/CountryContext.tsx`, `lib/quiz-v2/useCountryLocale.ts`, `components/quiz-v2/SlideLandingCover.tsx` y `components/quiz-v2/SlideSocialProof.tsx`.
- **Legacy_Cruft**: Aliases/legacy muertos: `slidesV2`, `ProgressSection`/`PROGRESS_SECTIONS`/`getProgressSection`, `TIPO_NOMBRES` y el componente `components/quiz-v2/QuizProgressV2.tsx`.
- **Structural_Shape**: Proyección de un slide a `{ id, type, optionValues }`, ignorando todo el texto visible.
- **FunnelData**: Tipo de datos retornado por `getFunnel(filters)` que describe las métricas del embudo.
- **Build_System**: El pipeline de validación estática y de tests: `tsc --noEmit` (typecheck), el build de Next.js y la suite de Vitest.

## Requirements

### Requirement 1: Quitar el slide de email del quiz de Argentina (Frente B)

**User Story:** Como dueño del producto, quiero remover el paso de captura de email del quiz de Argentina, para que AR quede con la misma estructura de slides que LATAM y se simplifique el flujo.

#### Acceptance Criteria

1. THE Quiz_AR SHALL exponer una lista `slidesV3` en la que ningún slide tiene `type` igual a `email_capture`.
2. THE Quiz_AR SHALL mantener un conjunto `SLIDES_WITHOUT_PROGRESS` que no contiene el valor `email_capture`.
3. WHEN el usuario avanza por el Quiz_AR, THE Quiz_AR SHALL transicionar desde el slide `diagnosis_result` directamente hacia el slide `loading_steps` sin presentar un slide de captura de email.
4. THE Quiz_AR SHALL conservar el estado `answers` y la función `setAnswer` para los slides que los requieren (por ejemplo `name_capture` y sliders).
5. THE Quiz_AR SHALL presentar una lista de exactamente 22 slides con índices del 0 al 21.

### Requirement 2: Conservar intacto el endpoint de captura de leads (Frente B)

**User Story:** Como responsable de marketing, quiero que el endpoint de captura de leads y sus integraciones permanezcan intactos, para no perder ninguna funcionalidad de captación que se use en otros contextos.

#### Acceptance Criteria

1. THE Submit_Quiz_API SHALL conservar su validación y su comportamiento de captura actuales sin modificaciones.
2. THE Submit_Quiz_API SHALL conservar sus integraciones con Supabase `clientes`, Systeme.io y Meta CAPI `Lead` sin modificaciones.
3. THE Quiz_AR SHALL dejar de invocar a Submit_Quiz_API durante el recorrido del quiz.
4. THE codebase SHALL conservar el componente `components/quiz-v2/SlideEmailCapture.tsx` sin que ningún módulo vivo lo importe.

### Requirement 3: Colapsar la Sales_Page a la variante ganadora B (Frente C.1)

**User Story:** Como dueño del producto, quiero que la página de ventas muestre siempre la variante ganadora B, para consolidar el resultado del test A/B y eliminar la lógica de variantes.

#### Acceptance Criteria

1. WHEN la Sales_Page se renderiza, THE Sales_Page SHALL omitir la barra de countdown flotante (sticky countdown bar).
2. WHEN la Sales_Page se renderiza, THE Sales_Page SHALL mostrar la sección extra de valor (timeline de transformación).
3. THE Sales_Page SHALL renderizar la variante B de forma permanente, independientemente de cualquier estado interno o parámetro de querystring.
4. THE Sales_Page SHALL conservar el countdown `timeLeft` (`COUNTDOWN_SECS`/`formatTime`) usado por el badge y la sección de precio.
5. THE Sales_Page SHALL conservar la integración del Entry_AB_Test (`peekEntryVariant`/`abEntryEventName` y `cartAttrs.ab_entry`).

### Requirement 4: Eliminar la emisión de eventos `sp_*` de la Sales_Page (Frente C.1)

**User Story:** Como ingeniero de datos, quiero que la página de ventas deje de emitir eventos del test de sales, para que el tracking no contenga datos del experimento ya concluido.

#### Acceptance Criteria

1. WHEN la Sales_Page se visualiza, THE Sales_Page SHALL abstenerse de enviar a Track_API cualquier evento cuyo nombre comience con el prefijo `sp_`.
2. WHEN el usuario inicia el checkout desde la Sales_Page, THE Sales_Page SHALL abstenerse de enviar a Track_API cualquier evento cuyo nombre comience con el prefijo `sp_`.
3. WHEN el usuario inicia el checkout desde la Sales_Page, THE Sales_Page SHALL excluir el campo `sp_variant` de los atributos `custom` y de `cartAttrs`.

### Requirement 5: Eliminar la infraestructura del test A/B de sales (Frente C.1)

**User Story:** Como mantenedor del código, quiero eliminar toda la infraestructura del test A/B de la sales page, para reducir cruft y evitar referencias muertas.

#### Acceptance Criteria

1. THE codebase SHALL no contener el módulo `lib/quiz-v2/abSales.ts`.
2. THE codebase SHALL no contener el componente `components/quiz-v2/SlideSalesPage.tsx`.
3. WHEN Track_API evalúa si un evento es interno, THE Track_API SHALL clasificarlo usando únicamente `isAbEntryEvent` sin invocar `isSalesEvent`.
4. THE Entry_AB_Test SHALL permanecer intacto en su lógica, eventos y sección de dashboard.
5. IF llegan a Track_API eventos `sp_*` residuales desde clientes con bundles cacheados, THEN THE Track_API SHALL contabilizarlos como un `event_name` cualquiera sin parsearlos ni mostrarlos.

### Requirement 6: Eliminar `salesVariantBreakdown` de FunnelData y del dashboard (Frente C.1)

**User Story:** Como mantenedor del panel de administración, quiero retirar el breakdown del test de sales del modelo de datos y del dashboard, para que el embudo no exponga métricas del experimento concluido.

#### Acceptance Criteria

1. THE Funnel_Store SHALL eliminar el tipo `SalesVariantBreakdownRow` y la función `buildSalesVariantBreakdown`.
2. THE Funnel_Store SHALL definir el tipo `FunnelData` sin el campo `salesVariantBreakdown`.
3. WHEN `getFunnel(filters)` se ejecuta sobre el Funnel_Store o sobre el Supabase_Store, THE FunnelData retornado SHALL conservar el campo `variantBreakdown` y todos los demás campos previos excepto `salesVariantBreakdown`.
4. THE Funnel_Dashboard SHALL no renderizar la sección "Test A/B — página de ventas".
5. THE Funnel_Dashboard SHALL conservar la sección "Test A/B/C — pantalla de entrada" con sus imports y el tipo `VariantBreakdownRow`.

### Requirement 7: Sincronizar estructuralmente LATAM con AR mediante test anti-drift (Frente C.2)

**User Story:** Como mantenedor del funnel, quiero garantizar que las listas de slides de AR y LATAM permanezcan estructuralmente idénticas, para que el dashboard unificado alinee ambas versiones 1:1 por posición.

#### Acceptance Criteria

1. THE Quiz_AR y THE Quiz_LATAM SHALL exponer listas `slidesV3` y `slidesV3Latam` de la misma longitud.
2. FOR ALL índices `i`, THE Structural_Shape de `slidesV3[i]` SHALL coincidir con la Structural_Shape de `slidesV3Latam[i]` en `id`, `type` y la secuencia de `value` de las opciones.
3. IF la verificación detecta divergencia de `id`, `type`, orden o `value` de opciones entre `slidesV3` y `slidesV3Latam`, THEN el mantenedor SHALL corregir `data-latam.ts` ajustando únicamente esos campos estructurales sin alterar el texto visible.
4. THE codebase SHALL incluir el Data_Sync_Test que compara la forma estructural de `slidesV3` y `slidesV3Latam` por índice.
5. WHEN las listas `slidesV3` y `slidesV3Latam` divergen estructuralmente, THE Data_Sync_Test SHALL fallar.
6. THE Quiz_LATAM SHALL mantener `SLIDES_WITHOUT_PROGRESS_LATAM` consistente con `SLIDES_WITHOUT_PROGRESS`, ambos sin `email_capture`.

### Requirement 8: Eliminar la cadena de código muerto de localization (Frente C.3)

**User Story:** Como mantenedor del código, quiero eliminar la cadena de localización confirmada como muerta, para reducir la superficie de mantenimiento y evitar confusión.

#### Acceptance Criteria

1. THE codebase SHALL no contener `lib/quiz-v2/localization.ts`.
2. THE codebase SHALL no contener `lib/quiz-v2/CountryContext.tsx`.
3. THE codebase SHALL no contener `lib/quiz-v2/useCountryLocale.ts`.
4. THE codebase SHALL no contener `components/quiz-v2/SlideLandingCover.tsx` ni `components/quiz-v2/SlideSocialProof.tsx`.
5. THE codebase SHALL conservar `lib/quiz-v2/config-latam.ts` sin modificaciones.

### Requirement 9: Eliminar el cruft legacy v2/v3 (Frente C.4)

**User Story:** Como mantenedor del código, quiero eliminar los aliases y componentes legacy v2/v3 sin consumidores vivos, para mantener una única fuente de verdad de slides y progreso.

#### Acceptance Criteria

1. THE Quiz_AR data module SHALL no exportar el alias `slidesV2`.
2. THE Quiz_AR data module SHALL no exportar el tipo `ProgressSection`, la constante `PROGRESS_SECTIONS` ni la función `getProgressSection`.
3. THE codebase SHALL no contener el componente `components/quiz-v2/QuizProgressV2.tsx`.
4. THE config module SHALL no exportar el alias `TIPO_NOMBRES`.
5. THE test `lib/admin/store.test.ts` SHALL importar únicamente `slidesV3` (sin `slidesV2`) y SHALL no contener la aserción `expect(slidesV2).toBe(slidesV3)`, conservando las aserciones válidas `selectSlides('latam') !== slidesV3` y `selectSlides('ar') !== slidesV3Latam`.

### Requirement 10: Garantizar calidad y no regresión tras la limpieza (Frente 6)

**User Story:** Como responsable de calidad, quiero que tras la limpieza no queden imports colgados y que el typecheck, el build y los tests pasen, para asegurar que la eliminación no introdujo regresiones.

#### Acceptance Criteria

1. THE codebase SHALL no contener ningún import vivo a `abSales`, `slidesV2`, `getProgressSection`, `PROGRESS_SECTIONS`, `TIPO_NOMBRES`, `localization`, `CountryContext` ni `useCountryLocale`.
2. WHEN se ejecuta `tsc --noEmit` sobre el repositorio completo, THE Build_System SHALL terminar sin errores.
3. WHEN se ejecuta el build de Next.js sobre el repositorio completo, THE Build_System SHALL terminar sin errores.
4. WHEN se ejecuta la suite de Vitest, THE Build_System SHALL completar todos los tests sin fallos.
5. THE spec previo `funnel-quiz-tracking-toggle` (toggle AR/LATAM/Unificado, `normalizeQuizVersion`, filtro por versión y migración 010) SHALL permanecer intacto, salvo la eliminación obligada de `salesVariantBreakdown`.
6. FOR ALL versiones `v` en `{'ar','latam'}`, THE `selectSlides(v)` SHALL devolver una lista cuya longitud y secuencia de `(id, type)` coincide con la de la otra versión.

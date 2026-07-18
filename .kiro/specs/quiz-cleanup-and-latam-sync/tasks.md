# Implementation Plan: quiz-cleanup-and-latam-sync

## Overview

Limpieza quirúrgica del funnel de quiz (Next.js App Router + TypeScript) en dos frentes (B: quitar email de AR; C: colapsar sales page a la variante B, eliminar infra del test de sales, sincronizar LATAM con AR y borrar código muerto). El plan respeta el **orden seguro de cambios** del diseño (eliminar consumidores antes que los módulos consumidos) para que el `tsc --noEmit` no se rompa en pasos intermedios. Lenguaje de implementación: **TypeScript**. Tests con Vitest + fast-check (ya presentes en el repo). No se introducen dependencias nuevas.

Convenciones:
- Las sub-tareas marcadas con `*` son de testing y son opcionales.
- Las tareas de implementación/eliminación nunca son opcionales.
- Cada tarea referencia los requisitos que satisface y, cuando aplica, la Correctness Property del diseño.

## Tasks

- [x] 1. Frente C.1 — Desconectar `sp_*` y `salesVariantBreakdown` antes de borrar `abSales`
  - [x] 1.1 Limpiar el dashboard de funnel (`app/admin/funnel/FunnelView.tsx`)
    - Quitar `SALES_VARIANT_LABEL, SALES_WINNER` del import de `@/lib/quiz-v2/abSales` (eliminar la línea de import completa).
    - Quitar `SalesVariantBreakdownRow` del import de tipos de `@/lib/admin/store`.
    - Eliminar el `useMemo` `bestSalesPageRate`.
    - Eliminar por completo la `SectionCard` "Test A/B — página de ventas" (bloque `{data.salesVariantBreakdown && ...}`).
    - Conservar intacta la sección "Test A/B/C — pantalla de entrada" y sus imports `ENTRY_VARIANT_LABEL`/`ENTRY_DISCARDED_VARIANTS` y el tipo `VariantBreakdownRow`.
    - _Requirements: 6.4, 6.5_

  - [x] 1.2 Quitar `isSalesEvent` del endpoint de tracking (`app/api/track/route.ts`)
    - Quitar `import { isSalesEvent } from '@/lib/quiz-v2/abSales';`.
    - Cambiar la guarda de eventos internos de `if (isAbEntryEvent(eventName) || isSalesEvent(eventName))` a `if (isAbEntryEvent(eventName))`.
    - No introducir tratamiento especial para nombres con prefijo `sp_`: cualquier evento residual `sp_*` se contabiliza como un `event_name` cualquiera.
    - _Requirements: 5.3, 5.5_

  - [x] 1.3 Quitar el uso de `buildSalesVariantBreakdown` del store de Supabase (`lib/admin/supabase-store.ts`)
    - Quitar `import { buildSalesVariantBreakdown } from './store';`.
    - Quitar `salesVariantBreakdown: buildSalesVariantBreakdown(filteredRows),` del objeto `FunnelData` retornado.
    - Conservar `variantBreakdown` y todos los demás campos.
    - _Requirements: 6.2, 6.3_

  - [x] 1.4 Reducir `FunnelData` en el store en memoria (`lib/admin/store.ts`)
    - Quitar `import { parseSalesEvent, type SalesVariant } from '@/lib/quiz-v2/abSales';`.
    - Eliminar el tipo `SalesVariantBreakdownRow` y la función `buildSalesVariantBreakdown(...)`.
    - Eliminar el campo `salesVariantBreakdown` del tipo `FunnelData`.
    - En `computeFunnel`: eliminar `const salesVariantBreakdown = buildSalesVariantBreakdown(filteredRows);` y el campo `salesVariantBreakdown` del objeto retornado.
    - Conservar el tipo `VariantBreakdownRow` y la función `buildVariantBreakdown` (test de entrada).
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.5 Colapsar la sales page a la variante ganadora B (`components/quiz-v2/SlideSalesPageV3.tsx`)
    - Quitar los imports de `abSales`: `getSalesVariant, peekSalesVariant, salesEventName, type SalesVariant`.
    - Quitar el estado `const [salesVariant] = useState<SalesVariant>(() => getSalesVariant());`.
    - Quitar el `fetch('/api/track', ...)` que emite `salesEventName(salesVariant, 'view')`.
    - En `handleCheckout`: quitar `peekSalesVariant()`, el `fetch` que emite `salesEventName(sVariant, 'checkout')`, el campo `sp_variant` de `custom` y `cartAttrs.sp_variant`.
    - Eliminar el bloque de la sticky countdown bar (`{salesVariant !== 'B' && (...)}`) para que nunca se muestre.
    - Desenvolver la sección "VALOR EXTRA (solo variante B)" quitando el guard `{salesVariant === 'B' && (...)}` para que se renderice siempre.
    - Conservar `timeLeft`/`COUNTDOWN_SECS`/`formatTime`, `peekEntryVariant`/`abEntryEventName` y `cartAttrs.ab_entry`.
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3_

  - [x] 1.6 Eliminar el módulo del test de sales (`lib/quiz-v2/abSales.ts`)
    - Borrar el archivo `lib/quiz-v2/abSales.ts` una vez removidos todos sus consumidores (1.1–1.5).
    - _Requirements: 5.1_

  - [x] 1.7 Eliminar la sales page vieja (`components/quiz-v2/SlideSalesPage.tsx`)
    - Borrar el archivo `components/quiz-v2/SlideSalesPage.tsx` (ningún contenedor vivo la importa; el flujo vivo usa `SlideSalesPageV3`).
    - _Requirements: 5.2_

  - [ ]* 1.8 Property test: `FunnelData` sin `salesVariantBreakdown` y con `variantBreakdown`
    - Crear/extender un test sobre `getFunnel` (store en memoria) que afirme que el objeto retornado NO expone `salesVariantBreakdown` y SÍ expone `variantBreakdown`.
    - **Property 8: Compatibilidad de `FunnelData` preservada salvo `salesVariantBreakdown`**
    - **Validates: Requirements 6.2, 6.3**

  - [ ]* 1.9 Asserts a nivel de código: la sales page renderiza siempre la variante B y no emite `sp_*`
    - Verificar mediante asserts de código/grep en `SlideSalesPageV3.tsx` la ausencia del bloque sticky countdown bar, la presencia incondicional de la sección de valor extra, y la ausencia de cualquier `salesEventName`/`sp_variant`/llamada a `abSales`. (Properties 2 y 4 se cubren con asserts de código según el diseño, sin forzar PBT.)
    - **Property 2: El quiz no emite eventos `sp_*`** y **Property 4: La sales page renderiza siempre la variante ganadora B**
    - **Validates: Requirements 3.1, 3.2, 3.3, 4.1, 4.2, 4.3**

- [x] 2. Frente B — Quitar el slide de email del quiz de Argentina
  - [x] 2.1 Quitar email del contenedor del quiz AR (`components/quiz-v2/QuizContainerV2.tsx`)
    - Quitar `import { SlideEmailCaptureV3 } from './SlideEmailCapture';`.
    - Quitar la función `handleEmailSubmit`.
    - Quitar `'email_capture'` del array literal de `isFullscreen`.
    - Quitar el bloque de render `{slide.type === 'email_capture' && (...)}`.
    - Conservar `answers`/`setAnswer` (los usan `name_capture`, sliders, etc.).
    - Resultado: el quiz AR deja de invocar a `/api/submit-quiz` durante el recorrido.
    - _Requirements: 1.3, 1.4, 2.3_

  - [x] 2.2 Quitar el slide `email` de la lista de slides AR (`lib/quiz-v2/data.ts`)
    - Quitar el slide `{ type: 'email_capture', id: 'email' }` (índice 20) del array `slidesV3`.
    - Quitar `'email_capture'` del set `SLIDES_WITHOUT_PROGRESS`.
    - Verificar que `slidesV3` queda con 22 slides (índices 0–21) y que `diagnosis_result` precede directamente a `loading_steps`.
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ]* 2.3 Property test: el flujo de AR no contiene `email_capture`
    - Crear un test que recorra `slidesV3` y `SLIDES_WITHOUT_PROGRESS` afirmando la ausencia de `email_capture`, y que `slidesV3.length === 22`.
    - **Property 1: El flujo de AR no contiene `email_capture`**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5**

  - [x] 2.4 Verificar la conservación del endpoint de leads y de `SlideEmailCapture`
    - Verificar estáticamente (grep) que `app/api/submit-quiz/route.ts` y sus integraciones (Supabase `clientes`, Systeme.io, Meta CAPI `Lead`) no fueron modificados.
    - Verificar que `components/quiz-v2/SlideEmailCapture.tsx` sigue existiendo y que ningún módulo vivo lo importa (no quedan imports colgados).
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 3. Frente C.4 — Eliminar el cruft legacy v2/v3
  - [x] 3.1 Actualizar el test del store para no depender de `slidesV2` (`lib/admin/store.test.ts`)
    - Cambiar `import { slidesV3, slidesV2 } from '@/lib/quiz-v2/data';` por `import { slidesV3 } from '@/lib/quiz-v2/data';`.
    - Eliminar la aserción `expect(slidesV2).toBe(slidesV3);` y ajustar el nombre/comentario del `it` que la contiene.
    - Conservar las aserciones válidas `selectSlides('latam') !== slidesV3` y `selectSlides('ar') !== slidesV3Latam`.
    - _Requirements: 9.5_

  - [x] 3.2 Eliminar el componente de progreso legacy (`components/quiz-v2/QuizProgressV2.tsx`)
    - Borrar el archivo (usa `slidesV2`/`getProgressSection`/`PROGRESS_SECTIONS`; el activo es `QuizProgressV3`). Debe borrarse antes de quitar esos símbolos de `data.ts`.
    - _Requirements: 9.3_

  - [x] 3.3 Eliminar aliases legacy de la data AR (`lib/quiz-v2/data.ts`)
    - Eliminar `export const slidesV2 = slidesV3;`, `export type ProgressSection`, `export const PROGRESS_SECTIONS` y `export function getProgressSection`.
    - _Requirements: 9.1, 9.2_

  - [x] 3.4 Eliminar el alias `TIPO_NOMBRES` del config (`lib/quiz-v2/config.ts`)
    - Eliminar `export const TIPO_NOMBRES = QUIZ_RESULT_TYPE_NAMES;` (sin consumidores vivos).
    - _Requirements: 9.4_

- [x] 4. Frente C.3 — Eliminar la cadena de código muerto de localization (hojas antes que la raíz)
  - [x] 4.1 Eliminar los slides muertos (`components/quiz-v2/SlideLandingCover.tsx`, `components/quiz-v2/SlideSocialProof.tsx`)
    - Borrar ambos archivos (no son importados por ninguna página ni contenedor vivo).
    - _Requirements: 8.4_

  - [x] 4.2 Eliminar el contexto de país (`lib/quiz-v2/CountryContext.tsx`)
    - Borrar el archivo (`CountryProvider`/`useCountry` no se montan en ningún lado).
    - _Requirements: 8.2_

  - [x] 4.3 Eliminar el hook de locale (`lib/quiz-v2/useCountryLocale.ts`)
    - Borrar el archivo (sin consumidores vivos).
    - _Requirements: 8.3_

  - [x] 4.4 Eliminar el módulo de localization (`lib/quiz-v2/localization.ts`)
    - Borrar el archivo (raíz de la cadena muerta), una vez removidas todas las hojas (4.1–4.3).
    - No tocar `lib/quiz-v2/config-latam.ts` (no forma parte de la cadena).
    - _Requirements: 8.1, 8.5_

- [x] 5. Frente C.2 — Sincronización estructural LATAM↔AR (sin refactor)
  - [x] 5.1 Verificar/ajustar la data de LATAM (`lib/quiz-v2/data-latam.ts`)
    - Verificar que `slidesV3Latam` es estructuralmente idéntico a `slidesV3` (mismos `id`/`type`/orden y mismos `value` de opciones), según la tabla del diseño (22 slides).
    - Si se detecta divergencia de `id`/`type`/orden o `value` de opciones, corregir SOLO esos campos estructurales sin alterar el texto visible ("tú"/"barriga/panza").
    - Verificar que `SLIDES_WITHOUT_PROGRESS_LATAM` es consistente con `SLIDES_WITHOUT_PROGRESS` (ambos sin `email_capture`).
    - _Requirements: 7.1, 7.2, 7.3, 7.6_

  - [ ]* 5.2 Property test anti-drift: `slidesV3` ≅ `slidesV3Latam` (`lib/quiz-v2/data-sync.test.ts`)
    - Crear el test (Vitest) con un helper `structuralShape(slide)` que proyecta a `{ id, type, optionValues }` ignorando el texto visible.
    - Afirmar: misma longitud; para cada índice `i`, mismo `id`, mismo `type` y misma secuencia de `value` de opciones; y que `selectSlides('ar')`/`selectSlides('latam')` coinciden en longitud y secuencia de `(id, type)`.
    - **Property 3: `slidesV3` y `slidesV3Latam` son estructuralmente isomorfos** y **Property 7: La paridad de slides AR/LATAM se preserva en el embudo**
    - **Validates: Requirements 7.1, 7.2, 7.4, 7.5, 7.6, 10.6**

- [x] 6. Checkpoint final — typecheck, build, tests y verificación de imports residuales
  - Ejecutar `grep` global confirmando que no quedan imports vivos a `abSales`, `slidesV2`, `getProgressSection`, `PROGRESS_SECTIONS`, `TIPO_NOMBRES`, `localization`, `CountryContext` ni `useCountryLocale`.
  - Ejecutar `tsc --noEmit` (typecheck) y el build de Next.js; ambos deben terminar sin errores.
  - Ejecutar la suite de Vitest completa; todos los tests deben pasar (incluyendo `route.test.ts` de `normalizeQuizVersion`, `store.test.ts` actualizado y `data-sync.test.ts`).
  - Confirmar que el spec previo `funnel-quiz-tracking-toggle` permanece intacto salvo la eliminación obligada de `salesVariantBreakdown`.
  - Ensure all tests pass, ask the user if questions arise.
  - **Property 5: No quedan imports colgados tras la limpieza** y **Property 6: El build y el typecheck pasan**
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

## Task Dependency Graph

El siguiente grafo agrupa las tareas en olas (waves) de ejecución. Regla aplicada: las tareas que editan el mismo archivo NUNCA están en la misma ola (p. ej. `data.ts` se edita en 2.2 (Frente B, wave 5) y en 3.3 (Frente C.4, wave 8); `lib/admin/store.ts` solo en 1.4; `lib/admin/store.test.ts` solo en 3.1). Además se respeta "consumidores antes que módulos".

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1.1", "1.2", "1.3"],
      "rationale": "Desconectar consumidores de abSales/store (FunnelView, track route, supabase-store). Archivos distintos, sin conflictos.",
      "dependsOn": []
    },
    {
      "wave": 2,
      "tasks": ["1.4", "1.5"],
      "rationale": "Reducir store.ts (FunnelData) tras quitar sus consumidores en wave 1, y colapsar SlideSalesPageV3 a B. store.ts solo se edita aquí.",
      "dependsOn": [1]
    },
    {
      "wave": 3,
      "tasks": ["1.6", "1.7"],
      "rationale": "Borrar abSales.ts y SlideSalesPage.tsx una vez removidos todos sus consumidores.",
      "dependsOn": [2]
    },
    {
      "wave": 4,
      "tasks": ["1.8", "1.9"],
      "rationale": "Tests (opcionales) del Frente C.1: getFunnel sin salesVariantBreakdown y asserts de la sales page.",
      "dependsOn": [3]
    },
    {
      "wave": 5,
      "tasks": ["2.1", "2.2"],
      "rationale": "Frente B: quitar email del contenedor y de data.ts. Primera edición de data.ts.",
      "dependsOn": [3]
    },
    {
      "wave": 6,
      "tasks": ["2.3", "2.4"],
      "rationale": "Test (opcional) de ausencia de email y verificación estática de submit-quiz/SlideEmailCapture.",
      "dependsOn": [5]
    },
    {
      "wave": 7,
      "tasks": ["3.1", "3.2"],
      "rationale": "Consumidores de slidesV2: actualizar store.test.ts y borrar QuizProgressV2.tsx ANTES de quitar los aliases de data.ts.",
      "dependsOn": [5]
    },
    {
      "wave": 8,
      "tasks": ["3.3", "3.4"],
      "rationale": "Segunda edición de data.ts (quitar aliases legacy) y config.ts (quitar TIPO_NOMBRES). Separada de wave 5 para no editar data.ts dos veces en la misma ola.",
      "dependsOn": [7]
    },
    {
      "wave": 9,
      "tasks": ["4.1"],
      "rationale": "Borrar hojas de la cadena de localization (SlideLandingCover, SlideSocialProof) antes que sus dependencias.",
      "dependsOn": [3]
    },
    {
      "wave": 10,
      "tasks": ["4.2", "4.3"],
      "rationale": "Borrar CountryContext y useCountryLocale tras eliminar las hojas que los usaban.",
      "dependsOn": [9]
    },
    {
      "wave": 11,
      "tasks": ["4.4"],
      "rationale": "Borrar localization.ts (raíz) al final de la cadena.",
      "dependsOn": [10]
    },
    {
      "wave": 12,
      "tasks": ["5.1"],
      "rationale": "Verificar/ajustar data-latam.ts una vez que slidesV3 quedó en su forma final (sin email).",
      "dependsOn": [5]
    },
    {
      "wave": 13,
      "tasks": ["5.2"],
      "rationale": "Test anti-drift data-sync.test.ts: depende de data.ts final (waves 5 y 8) y de data-latam.ts verificado (wave 12).",
      "dependsOn": [8, 12]
    },
    {
      "wave": 14,
      "tasks": ["6"],
      "rationale": "Checkpoint final: grep de imports residuales + tsc --noEmit + build + Vitest. Depende de todo lo anterior.",
      "dependsOn": [4, 6, 8, 11, 13]
    }
  ],
  "fileConflictNotes": [
    "lib/quiz-v2/data.ts: editado en 2.2 (wave 5) y 3.3 (wave 8) -> olas distintas.",
    "lib/admin/store.ts: editado solo en 1.4 (wave 2).",
    "lib/admin/store.test.ts: editado solo en 3.1 (wave 7); revalidado (no editado) en el checkpoint (wave 14).",
    "components/quiz-v2/SlideSalesPageV3.tsx: editado solo en 1.5 (wave 2).",
    "lib/quiz-v2/data-latam.ts: editado/verificado solo en 5.1 (wave 12)."
  ]
}
```

## Notes

- Las tareas marcadas con `*` son de testing y opcionales; pueden saltarse para un MVP más rápido. Las de implementación/eliminación nunca son opcionales.
- Cada tarea referencia los requisitos (Requirements 1–10) que satisface y, cuando aplica, la Correctness Property del diseño.
- El orden de olas respeta "eliminar consumidores antes que el módulo consumido" para no romper `tsc --noEmit` en pasos intermedios.
- Properties 2 y 4 se cubren con asserts a nivel de código (no se fuerza PBT sobre el componente React).
- Fuera de alcance (NO incluido): refactor de la arquitectura de LATAM, eliminación del test de entrada A/B/C, geo-routing, y borrado de data histórica `sp_*`/email. El spec previo `funnel-quiz-tracking-toggle` se respeta salvo la eliminación obligada de `salesVariantBreakdown`.

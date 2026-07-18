# Implementation Plan: funnel-quiz-tracking-toggle (Frente A)

## Overview

Plan de implementación incremental del **Frente A**: tracking limpio de versión
(`'ar'`/`'latam'`), compat con callers legacy (`'v3'`), aislamiento por versión en Supabase,
lectura filtrable del embudo, selección correcta de slides, toggle de 3 vistas en el dashboard
y migración de la data histórica.

El proyecto es **TypeScript / Next.js (App Router)**. Las pruebas usan **Vitest** como runner
y **fast-check** para las property-based tests (ambos se agregan en la tarea 1). Cada tarea
referencia los requisitos que satisface y, cuando aplica, la correctness property del diseño.

> **Bloqueo de merge documentado (design.md → Error Handling):** la migración 010 (tarea 7)
> debe correrse en Supabase antes de habilitar el toggle en producción; sin ella, AR y LATAM
> colisionan en el mismo contador y el filtro por versión es inexacto.

**Fuera de alcance (Frentes B/C, NO incluidos):** sacar el email de `/quiz`, limpiar el cruft
v2/v3 y la unificación total de `/latam`.

## Tasks

- [x] 1. Configurar la infraestructura de testing
  - Agregar `vitest` y `fast-check` como `devDependencies` en `package.json`
  - Crear `vitest.config.ts` con alias `@` → raíz del proyecto (alineado con `tsconfig.json`) y entorno `node`
  - Agregar scripts `"test": "vitest --run"` y `"test:watch": "vitest"` en `package.json`
  - _Requisitos previos para las sub-tareas de testing (no implementa requisitos de producto directamente)_

- [x] 2. Normalizar la etiqueta de versión en el Tracking_Endpoint
  - [x] 2.1 Implementar `normalizeQuizVersion()` en `app/api/track/route.ts`
    - Reemplazar el ternario roto (`... === 'v2' ? 'v2' : ... === 'v3' ? 'v3' : 'v1'`) por la función `normalizeQuizVersion(raw): 'ar' | 'latam'` que mapea `'latam' → 'latam'` y todo lo demás (`'ar'`, `'v3'`, `undefined`, cualquier otro) → `'ar'`
    - Exportar la función (named export) para poder testearla de forma aislada
    - Usar `quizVersion: normalizeQuizVersion(customData.quiz_version)` en la llamada a `getStore().track(...)`, sin introducir geo-IP/country para segmentar versión
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x]* 2.2 Escribir property test de `normalizeQuizVersion`
    - **Property 1: No más fuga a v1**
    - **Validates: Requirements 1.5, 1.6**
    - Con fast-check: ∀ string `s`, `normalizeQuizVersion(s) ∈ {'ar','latam'}` y nunca `'v1'/'v2'/'v3'`; además `s === 'latam' ⇔ resultado === 'latam'`

  - [x]* 2.3 Escribir unit tests de tabla para `normalizeQuizVersion`
    - Casos: `'latam'→'latam'`, `'ar'→'ar'`, `'v3'→'ar'`, `'v1'→'ar'`, `'v2'→'ar'`, `undefined→'ar'`, `'xyz'→'ar'`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Actualizar tipos del store y normalización de compat para callers legacy
  - [x] 3.1 Actualizar tipos y normalización en `lib/admin/store.ts`
    - Definir y exportar `QuizVersion = 'ar' | 'latam'`, `LegacyQuizVersion = 'v1' | 'v2' | 'v3'`, `StoredQuizVersion = QuizVersion | LegacyQuizVersion`
    - Cambiar `FunnelFilters.version` a `'ar' | 'latam'` (undefined = unificado)
    - Cambiar `TrackProps.quizVersion` a `'ar' | 'latam' | 'v1' | 'v2' | 'v3'` (acepta legacy por compat)
    - Tipar `CounterRow.quiz_version`, `makeKey()` y `parseKey()` con `StoredQuizVersion`
    - En `MemoryStore.track`, normalizar el valor recibido del caller: `quizVersion === 'latam' ? 'latam' : 'ar'` antes de armar la key (así los callers que mandan `'v3'` se guardan como `'ar'`)
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Actualizar tipos, normalización y `onConflict` en `lib/admin/supabase-store.ts`
    - Importar/usar los tipos nuevos (`StoredQuizVersion`, `FunnelFilters`, `TrackProps`) desde `store.ts`
    - En `SupabaseStore.track`, normalizar `props.quizVersion`: `=== 'latam' ? 'latam' : 'ar'` (escrituras nuevas ∈ `{'ar','latam'}`)
    - Incluir `,quiz_version` en el string `onConflict` de los dos upserts directos (fallback 3 con `day` y fallback 4 sin `day`)
    - Cambiar el tipo del parámetro `version` de `fetchAllRows` a `'ar' | 'latam'`
    - _Requirements: 3.1, 3.2, 3.3, 4.3, 4.4_

  - [x]* 3.3 Escribir test de compatibilidad de callers legacy
    - **Property 6: Compat preservada**
    - **Validates: Requirements 3.1, 3.2**
    - Verificar (sobre `MemoryStore`) que `track(evt, { quizVersion: 'v3' })` queda contabilizado como `'ar'` y `{ quizVersion: 'latam' }` como `'latam'`

- [x] 4. Selección de slides por versión en ambos backends
  - [x] 4.1 Implementar `selectSlides()` y usarlo en `computeFunnel` (memory) en `lib/admin/store.ts`
    - Crear `selectSlides(version)` que devuelve `slidesV3Latam` (import de `@/lib/quiz-v2/data-latam`) para `'latam'`, y `slidesV3` (import de `@/lib/quiz-v2/data`) para `'ar'` y unificado (`undefined`)
    - Reemplazar el `const activeSlides = slidesV2` por `selectSlides(filters.version)` (eliminar uso de `slidesV2` en este path)
    - Confirmar que el filtro por versión existente (`filters.version ? rows.filter(...)`) opera con valores `'ar'|'latam'`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 4.2 Usar `selectSlides()` en `computeFunnel` de `lib/admin/supabase-store.ts`
    - Reemplazar `const activeSlides = slidesV2` por `selectSlides(filters.version)` (reutilizar el helper exportado desde `store.ts`)
    - Mantener `fetchAllRows(..., version)` con `.eq('quiz_version', version)` para el filtro a nivel query
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x]* 4.3 Escribir property/unit test de `selectSlides`
    - **Property 5: Slides por vista**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
    - `'latam'→slidesV3Latam`; `'ar'` y `undefined→slidesV3`; nunca `slidesV2`

  - [x]* 4.4 Escribir property test del filtro por versión en `computeFunnel` (memory)
    - **Property 3: Filtro correcto**
    - **Validates: Requirements 5.1, 5.2**
    - ∀ multiset de filas AR/LATAM/v1: `getFunnel({version:v})` no incluye filas con `quiz_version ≠ v`

  - [x]* 4.5 Escribir property test de unificado = suma en `computeFunnel` (memory)
    - **Property 4: Unificado = suma**
    - **Validates: Requirements 5.3, 5.6**
    - ∀ multiset de filas: `totalStarts(unificado) = totalStarts(ar) + totalStarts(latam) + totalStarts(v1)`

- [x] 5. Checkpoint - Asegurar que la lógica de store/normalización pasa los tests
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Exponer el embudo filtrable por versión en la API
  - [x] 6.1 Parsear `?version` y pasarlo a `filters` en `app/api/admin/funnel-data/route.ts`
    - Leer `url.searchParams.get('version')`; aceptar solo `'ar'|'latam'`, cualquier otro valor o ausencia → `undefined` (unificado)
    - Incluir `version` en `filters` tanto en el branch de `range` como en el de `day` (combinable con day/range)
    - Cambiar el `backfill_purchase` del POST para usar `quizVersion: 'ar'` (en vez de `'v3'`)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 2.4_

  - [x]* 6.2 Escribir tests de integración para `funnel-data` filtrado por versión
    - **Property 2: Aislamiento de versión** y **Property 3: Filtro correcto**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**
    - Sembrar el `MemoryStore` con eventos AR/LATAM/v1 y verificar que `getFunnel({version:'ar'})`, `{version:'latam'}` y `{}` (unificado) devuelven datos aislados y que el unificado suma; verificar que `version` inválido se trata como unificado y que combina con `day`/`range`

- [x] 7. Crear la migración de data histórica de Supabase
  - [x] 7.1 Crear `supabase/migrations/010_relabel_v3_to_ar_and_version_unique.sql`
    - (A) `UPDATE funnel_counts SET quiz_version = 'ar' WHERE quiz_version = 'v3'`
    - (B) `DROP INDEX IF EXISTS` del índice único vigente y `CREATE UNIQUE INDEX IF NOT EXISTS` sobre `(event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day, quiz_version)`
    - (C) `CREATE OR REPLACE` de `increment_funnel_count_daily` e `increment_funnel_count` con `ON CONFLICT` que incluya `quiz_version` y default `p_quiz_version 'ar'`
    - Dejar `'v1'` intacto; estilo idempotente (corrible N veces) y comentado en español, siguiendo 007/009
    - **Property 7: Idempotencia de la migración** — garantizar vía `IF EXISTS`/`IF NOT EXISTS` y `CREATE OR REPLACE` (verificable por inspección del SQL: una 2ª corrida no cambia el estado)
    - _Requirements: 4.1, 4.2, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 8. Emitir las etiquetas correctas desde los quizzes
  - [x] 8.1 Cambiar `quiz_version: 'v3'` → `'ar'` en `components/quiz-v2/QuizContainerV2.tsx`
    - Reemplazar en todos los `custom` de los `fetch('/api/track', ...)`
    - _Requirements: 2.1_

  - [x] 8.2 Cambiar `quiz_version: 'v3'` → `'ar'` en `components/quiz-v2/SlideSalesPageV3.tsx`
    - Reemplazar en todos los eventos `ViewContent`/`sp_*` que emite la sales page
    - _Requirements: 2.2_

  - [x] 8.3 Verificar (y corregir si hace falta) que `components/quiz-v2/QuizContainerLatam.tsx` emite `quiz_version: 'latam'`
    - Confirmar que todos los `fetch('/api/track', ...)` mandan `'latam'`; ajustar cualquier emisor desalineado
    - _Requirements: 2.3_

- [x] 9. Agregar el toggle de 3 vistas al dashboard
  - [x] 9.1 Implementar el Version_Toggle en `app/admin/funnel/FunnelView.tsx`
    - Agregar estado `versionView: 'ar' | 'latam' | 'unified'` (default `'unified'`)
    - Renderizar 3 controles: **Argentina**, **LATAM**, **Unificado**
    - En `refetch`, agregar `&version=ar|latam` (omitir el query param para `unified`) y agregar `versionView` a las deps del `useCallback`/`useEffect` para re-fetchear al cambiar de vista (re-renderiza todas las secciones desde `data`)
    - Mostrar un banner informativo SOLO en la vista `unified` aclarando que el paso a paso usa los pasos de Argentina como referencia, que LATAM se alinea por posición y puede no coincidir 1:1, y que los totales sí suman
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 10. Checkpoint final - Asegurar que todo pasa
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales (tests) y pueden saltearse para un MVP más rápido; las tareas de implementación nunca están marcadas como opcionales.
- Cada tarea referencia sub-requisitos específicos para trazabilidad.
- Las property-based tests (fast-check) validan las Correctness Properties del diseño; los unit tests cubren casos puntuales y de borde.
- **Property 2** (aislamiento real en Supabase) y **Property 7** (idempotencia de la migración) dependen del SQL de la tarea 7 y deben verificarse contra una base de test al correr la migración; el test 6.2 cubre la lógica de filtrado a nivel de `computeFunnel`.
- La tarea 7 (migración 010) debe correrse en Supabase antes de habilitar el toggle en producción (bloqueo de merge documentado en el diseño).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1", "7.1", "8.1", "8.2", "8.3"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.2", "4.1"] },
    { "id": 2, "tasks": ["3.3", "4.2", "6.1"] },
    { "id": 3, "tasks": ["4.3", "4.4", "4.5", "6.2", "9.1"] }
  ]
}
```

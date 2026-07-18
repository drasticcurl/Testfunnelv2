# Requirements Document

## Introduction

El proyecto `testfunnel` corre dos quizzes en producción que comparten infraestructura de
tracking: `/quiz` (Argentina) y `/latam` (LATAM). Ambos emiten eventos a `POST /api/track`,
que los persiste en el funnel store (backend `memory` o `supabase`), y el dashboard
`/admin/funnel` los lee de forma agregada.

Hoy existen dos defectos centrales: (1) el mapeo de versión en `/api/track` cae a `'v1'` para
cualquier etiqueta distinta de `'v2'`/`'v3'`, por lo que LATAM (que manda `'latam'`) se guarda
mal como `'v1'`; y (2) el dashboard mezcla Argentina y LATAM en un único embudo porque ni la
API ni la UI usan el filtro de versión, agravado por que la clave única de `funnel_counts` en
Supabase no incluye `quiz_version` (AR y LATAM colisionan en el mismo contador).

Este documento de requisitos cubre exactamente el **Frente A**: tracking limpio de versión
(`'ar'`/`'latam'`), aislamiento por versión en Supabase, toggle de 3 vistas en el dashboard,
selección correcta de slides del embudo y migración de la data histórica. Quedan **fuera de
alcance** (Frentes B/C, no incluidos como requisitos): sacar el email de `/quiz`, limpiar el
cruft v2/v3 de los archivos y la unificación total de `/latam` con `/quiz`.

Los requisitos están derivados del documento de diseño aprobado
(`design.md`) y mantienen trazabilidad con sus secciones.

## Glossary

- **Tracking_Endpoint**: Punto único de entrada del tracking, `POST /api/track`
  (`app/api/track/route.ts`), que normaliza la etiqueta de versión antes de persistir.
- **Version_Normalizer**: Helper `normalizeQuizVersion(raw)` que mapea la etiqueta de versión
  cruda a `'ar'` o `'latam'`.
- **Funnel_Store**: Capa de almacenamiento `lib/admin/store.ts` (`getStore()`), con backends
  `MemoryStore` (`lib/admin/store.ts`) y `SupabaseStore` (`lib/admin/supabase-store.ts`).
- **Funnel_Counts_Table**: Tabla `funnel_counts` de Supabase que almacena los contadores
  agregados del embudo.
- **Funnel_Data_API**: Endpoint `GET /api/admin/funnel-data`
  (`app/api/admin/funnel-data/route.ts`) que expone el embudo filtrable por versión.
- **Funnel_Dashboard**: UI del dashboard `app/admin/funnel/FunnelView.tsx` que renderiza todas
  las secciones (KPIs, embudo, tabla paso a paso, atribución por campaña, desglose por país y
  los dos tests A/B).
- **Version_Toggle**: Control de tres vistas (Argentina / LATAM / Unificado) del
  Funnel_Dashboard.
- **AR_Quiz**: Quiz de Argentina servido en `/quiz`
  (`components/quiz-v2/QuizContainerV2.tsx`, slides `slidesV3`).
- **LATAM_Quiz**: Quiz de LATAM servido en `/latam`
  (`components/quiz-v2/QuizContainerLatam.tsx`, slides `slidesV3Latam`).
- **Sales_Page**: Componente `SlideSalesPageV3.tsx` que emite eventos `ViewContent`/`sp_*` del
  funnel de Argentina.
- **Server_Side_Caller**: Callers server-side que llaman a `getStore().track()` directamente sin
  pasar por el Tracking_Endpoint (`shopify-webhook`, `health`), que mandan `'v3'` por compat.
- **Quiz_Version**: Etiqueta de versión que se ESCRIBE de ahora en más, del conjunto
  `{'ar','latam'}`.
- **Legacy_Quiz_Version**: Etiquetas legacy que pueden existir en filas históricas (solo
  lectura): `{'v1','v2','v3'}`.
- **Funnel_Migration**: Migración de datos `010_relabel_v3_to_ar_and_version_unique.sql` que
  re-etiqueta el histórico de Argentina y ajusta la clave única.
- **Unified_View**: Vista del Version_Toggle sin filtro de versión, que suma todas las filas
  (incluido el bucket `'v1'` histórico).
- **Compute_Funnel**: Función `computeFunnel(rows, filters, backend)` que filtra filas por
  versión y día/rango y selecciona la lista de slides.
- **Slide_Selector**: Función `selectSlides(version)` que elige la lista de slides según la
  versión.

## Requirements

### Requirement 1: Normalización de la etiqueta de versión

**User Story:** Como responsable de analítica del funnel, quiero que cada evento entrante se
etiquete con una versión limpia (`'ar'` o `'latam'`), para que ningún evento se fugue al bucket
`'v1'` y Argentina y LATAM queden correctamente identificados.

_Deriva de: design.md → "Components and Interfaces §1", "Algorithmic Pseudocode A",
"Correctness Properties #1"._

#### Acceptance Criteria

1. WHEN the Tracking_Endpoint receives an event with `custom.quiz_version` equal to `'latam'`, THE Version_Normalizer SHALL return `'latam'`.
2. WHEN the Tracking_Endpoint receives an event with `custom.quiz_version` equal to `'ar'`, THE Version_Normalizer SHALL return `'ar'`.
3. WHEN the Tracking_Endpoint receives an event with `custom.quiz_version` equal to the legacy value `'v3'`, THE Version_Normalizer SHALL return `'ar'`.
4. IF the Tracking_Endpoint receives an event whose `custom.quiz_version` is missing, undefined, or any value other than `'latam'`, THEN THE Version_Normalizer SHALL return `'ar'`.
5. THE Version_Normalizer SHALL return a value within the set `{'ar','latam'}` for every input.
6. THE Version_Normalizer SHALL return `'ar'` or `'latam'` without producing any of the legacy values `'v1'`, `'v2'`, or `'v3'`.
7. THE Tracking_Endpoint SHALL determine the persisted version from the version label alone, without using geo-IP or country to segment the version.

### Requirement 2: Emisión de etiquetas correctas desde los quizzes

**User Story:** Como responsable de analítica del funnel, quiero que el AR_Quiz y la Sales_Page
emitan la etiqueta `'ar'` y el LATAM_Quiz emita `'latam'`, para que el origen de cada evento
quede registrado correctamente desde la fuente.

_Deriva de: design.md → "Components and Interfaces §5", "Version Labeling Model"._

#### Acceptance Criteria

1. WHEN the AR_Quiz sends a tracking request to the Tracking_Endpoint, THE AR_Quiz SHALL set `custom.quiz_version` to `'ar'`.
2. WHEN the Sales_Page sends a tracking request to the Tracking_Endpoint, THE Sales_Page SHALL set `custom.quiz_version` to `'ar'`.
3. WHEN the LATAM_Quiz sends a tracking request to the Tracking_Endpoint, THE LATAM_Quiz SHALL set `custom.quiz_version` to `'latam'`.
4. WHERE the manual `backfill_purchase` action is invoked via the Funnel_Data_API, THE Funnel_Data_API SHALL record the purchase with version `'ar'`.

### Requirement 3: Compatibilidad con callers server-side legacy

**User Story:** Como mantenedor del sistema, quiero que los callers server-side que siguen
mandando `'v3'` se contabilicen como Argentina, para no tener que modificarlos y preservar la
continuidad de los datos.

_Deriva de: design.md → "Version Labeling Model", "Example Usage" (nota), "Correctness
Properties #6"._

#### Acceptance Criteria

1. WHEN a Server_Side_Caller invokes `getStore().track()` with `quizVersion` equal to `'v3'`, THE Funnel_Store SHALL record the event with version `'ar'`.
2. WHEN a Server_Side_Caller invokes `getStore().track()` with `quizVersion` equal to `'latam'`, THE Funnel_Store SHALL record the event with version `'latam'`.
3. THE Funnel_Store SHALL accept the legacy version values `'v1'`, `'v2'`, and `'v3'` as input from callers for backward compatibility.

### Requirement 4: Aislamiento por versión en Supabase

**User Story:** Como responsable de analítica del funnel, quiero que Argentina y LATAM no
colisionen en el mismo contador en Supabase, para que el filtro por versión sea exacto y
estructuralmente posible.

_Deriva de: design.md → "Hallazgo crítico de almacenamiento", "Components and Interfaces §3",
"Data Models", "Correctness Properties #2"._

#### Acceptance Criteria

1. THE Funnel_Counts_Table SHALL enforce a unique key composed of `(event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day, quiz_version)`.
2. WHEN two events share the same `(event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day)` but differ in `quiz_version`, THE Funnel_Counts_Table SHALL store them in separate counter rows.
3. WHEN the SupabaseStore upserts or increments a counter, THE SupabaseStore SHALL include `quiz_version` in every `ON CONFLICT` clause of its RPCs and direct upserts.
4. THE SupabaseStore SHALL store new writes with a `quiz_version` value within the set `{'ar','latam'}`.

### Requirement 5: Lectura del embudo filtrada por versión

**User Story:** Como administrador, quiero pedir el embudo filtrado por versión a través de la
API, para obtener datos aislados de Argentina, de LATAM o la suma unificada.

_Deriva de: design.md → "Components and Interfaces §2 y §4", "Algorithmic Pseudocode B",
"Version Labeling Model", "Correctness Properties #3 y #4"._

#### Acceptance Criteria

1. WHEN the Funnel_Data_API receives a request with `?version=ar`, THE Funnel_Data_API SHALL return funnel data computed only from rows whose `quiz_version` equals `'ar'`.
2. WHEN the Funnel_Data_API receives a request with `?version=latam`, THE Funnel_Data_API SHALL return funnel data computed only from rows whose `quiz_version` equals `'latam'`.
3. WHEN the Funnel_Data_API receives a request without a `version` query parameter, THE Funnel_Data_API SHALL return funnel data computed from all rows across all versions.
4. IF the Funnel_Data_API receives a `version` query parameter whose value is neither `'ar'` nor `'latam'`, THEN THE Funnel_Data_API SHALL treat the request as unified, computing funnel data from all rows.
5. WHEN the Funnel_Data_API receives both a `version` parameter and a `day` or `range` parameter, THE Funnel_Data_API SHALL apply the version filter combined with the day or range filter.
6. WHEN Compute_Funnel produces unified funnel data, THE Compute_Funnel SHALL produce a total starts count equal to the sum of the AR starts, the LATAM starts, and the historical `'v1'` starts.

### Requirement 6: Selección de slides por vista

**User Story:** Como administrador, quiero que el embudo paso a paso use el set de slides
correcto según la vista, para que la tabla del embudo refleje el quiz que estoy mirando.

_Deriva de: design.md → "Algorithmic Pseudocode B (selectSlides)", "Estrategia de alineación
para Unificado", "Correctness Properties #5"._

#### Acceptance Criteria

1. WHEN the requested version is `'latam'`, THE Slide_Selector SHALL select the `slidesV3Latam` slide list.
2. WHEN the requested version is `'ar'`, THE Slide_Selector SHALL select the `slidesV3` slide list.
3. WHEN the requested version is unified (no version filter), THE Slide_Selector SHALL select the `slidesV3` slide list as the reference scaffold.
4. THE Slide_Selector SHALL select either `slidesV3` or `slidesV3Latam` and SHALL NOT select `slidesV2`.

### Requirement 7: Toggle de 3 vistas en el dashboard

**User Story:** Como administrador, quiero un toggle de tres vistas (Argentina / LATAM /
Unificado) en `/admin/funnel`, para alternar entre los datos de cada quiz y la suma sin recargar
manualmente.

_Deriva de: design.md → "Components and Interfaces §6", "Flujo de datos — lectura"._

#### Acceptance Criteria

1. THE Funnel_Dashboard SHALL display three view controls labeled Argentina, LATAM, and Unificado.
2. WHEN the administrator selects the Argentina view, THE Funnel_Dashboard SHALL request funnel data from the Funnel_Data_API with `version=ar`.
3. WHEN the administrator selects the LATAM view, THE Funnel_Dashboard SHALL request funnel data from the Funnel_Data_API with `version=latam`.
4. WHEN the administrator selects the Unificado view, THE Funnel_Dashboard SHALL request funnel data from the Funnel_Data_API without a `version` query parameter.
5. WHEN the administrator changes the selected view, THE Funnel_Dashboard SHALL re-fetch funnel data and re-render all sections, including KPIs, the funnel, the step-by-step table, campaign attribution, the per-country breakdown, and both A/B tests.
6. WHILE the Unificado view is active, THE Funnel_Dashboard SHALL display an informational banner explaining that the step-by-step funnel uses the Argentina steps as reference, that LATAM is aligned by position and may not match one-to-one, and that the macro totals do sum correctly.

### Requirement 8: Migración de la data histórica

**User Story:** Como mantenedor del sistema, quiero re-etiquetar el histórico de Argentina de
`'v3'` a `'ar'` con una migración idempotente, para alinear los datos antiguos con el nuevo
esquema de etiquetas sin riesgo de corromperlos al re-correrla.

_Deriva de: design.md → "Migration: Data Histórica", "Algorithmic Pseudocode C", "Correctness
Properties #7", "Limitación reconocida"._

#### Acceptance Criteria

1. WHEN the Funnel_Migration runs, THE Funnel_Migration SHALL update every `funnel_counts` row whose `quiz_version` equals `'v3'` to `'ar'`.
2. WHEN the Funnel_Migration runs, THE Funnel_Migration SHALL recreate the unique index of `funnel_counts` to include `quiz_version`.
3. WHEN the Funnel_Migration runs, THE Funnel_Migration SHALL recreate the `increment_*` RPCs with an `ON CONFLICT` clause that includes `quiz_version`.
4. WHEN the Funnel_Migration is run more than once, THE Funnel_Migration SHALL leave the database in the same final state as a single run.
5. THE Funnel_Migration SHALL leave rows whose `quiz_version` equals `'v1'` unchanged.
6. WHERE historical LATAM data was stored as `'v1'`, THE Unified_View SHALL be the only view that includes that historical data, and the system SHALL NOT attempt to separate it into the LATAM view.

# AB Test Tracking Fix — Bugfix Design

## Overview

Este bugfix corrige el tracking y la configuración de los dos tests que conviven
en el funnel de Argentina (`quiz_version === 'ar'`), atacando dos defectos
independientes con una sola release coordinada:

1. **Desactivación total del test A/B/C de ENTRADA.** Hoy la entrada del quiz
   (slide 0 / `landing_hook`) todavía randomiza/asigna variantes (`A` directo,
   `B` hook actual, `C` hook liviano). Con el test full-funnel activo la
   randomización queda "pausada" de forma condicional (fijada a
   `AB_ENTRY_PINNED_DEFAULT='B'`), lo que produce un split roto (~329 en B vs ~1
   en C) y deja la variante A —ya descartada— visible en el dashboard. La
   decisión de negocio es **desactivar el test de entrada por completo**: la
   entrada queda fija e incondicional en el hook normal (variante B /
   `SlideLandingHook`), se deja de asignar/randomizar y se oculta toda la sección
   del test de entrada en el admin.

2. **Atribución incompleta del Funnel A (control) en el test full-funnel.** El
   Funnel A renderiza `SlideSalesPageV3`, que —a diferencia de `SlideSalesPageV3B`
   (Funnel B)— NO emite `af_A_salespage_view` ni `af_A_checkout`, ni propaga
   `funnel_variant='A'` para atribuir `af_A_purchase`. Resultado: el dashboard
   muestra 0 en "% venta", "% click" y "% compró" para el control, haciendo la
   comparación A vs B incompleta. El fix hace que `SlideSalesPageV3` sea espejo
   de `SlideSalesPageV3B` en su capa de tracking: emite los eventos `af_A_*` y
   propaga `funnel_variant='A'` por el MISMO puente por email/cart attribute que
   ya usa el Funnel B.

La estrategia es **quirúrgica y aditiva sobre la capa de tracking/entrada**, sin
tocar el contenido comercial de la sales page de control, sin tocar el Funnel B,
sin tocar los totales generales ni Meta CAPI, y preservando el parseo de la data
histórica `ab_entry_A_*`.

## Glossary

- **Bug_Condition (C)**: El conjunto de entradas que disparan alguno de los dos
  defectos: (a) tráfico nuevo en la entrada del quiz de AR que hoy sería
  randomizado/asignado en lugar de fijado incondicionalmente al hook normal; y
  (b) un visitante del Funnel A (control, AR, con el experimento full-funnel ON)
  que ve la sales page / clickea comprar / compra, cuyos pasos del embudo NO se
  registran ni atribuyen.
- **Property (P)**: El comportamiento correcto esperado — entrada SIEMPRE en el
  hook normal (variante B, sin randomizar) + el Funnel A emitiendo
  `af_A_salespage_view`, `af_A_checkout` y atribuyendo `af_A_purchase` igual que
  el Funnel B.
- **Preservation (¬C)**: Todo lo que NO cae en la condición de bug y debe quedar
  byte-idéntico: Funnel B completo, LATAM, experimento OFF, totales generales,
  Meta CAPI y el parseo de eventos históricos `ab_entry_A_*`.
- **Test A/B/C de entrada (`ab_entry_*`)**: Experimento de la pantalla de entrada
  del quiz definido en `lib/quiz-v2/abEntry.ts`. Variantes A/B/C.
- **Test full-funnel (`af_*`)**: Experimento de funnel entero A (control) vs B
  (rebrand "mujer") definido en `lib/quiz-v2/funnelVariant.ts`, SOLO para AR y
  gateado por el kill switch `NEXT_PUBLIC_AB_FUNNEL_ENABLED`.
- **`getEntryVariant()` / `peekEntryVariant()`**: Asigna / lee la variante del
  test de entrada (`lib/quiz-v2/abEntry.ts`).
- **`peekFunnelVariant()`**: Lee (sin asignar) la variante full-funnel del
  navegador (`lib/quiz-v2/funnelVariant.ts`).
- **`fireFunnelEvent(step)`**: Helper de `QuizContainerV2` que emite `af_<V>_<step>`
  gateado por `isFunnelExperimentEnabled()`.
- **Puente por email (email bridge)**: Mecanismo por el cual la compra del front
  (que llega con el email pero sin identificadores del funnel) recupera
  `funnel_variant`/fbc/fbp/UTMs del lead por email en `/api/track` (Purchase),
  para atribuir `af_<V>_purchase`. Complementado por el cart attribute
  `funnel_variant` leído por `/api/shopify-webhook`.
- **`SlideSalesPageV3`**: Sales page del Funnel A (control) — la que hoy NO
  emite `af_A_*`.
- **`SlideSalesPageV3B`**: Sales page del Funnel B (rebrand) — la referencia
  correcta que SÍ emite `af_B_*` y propaga `funnel_variant='B'`.

## Bug Details

### Bug Condition

El bug se manifiesta en dos superficies independientes del funnel de Argentina:

1. **Entrada randomizada en lugar de fija.** Cuando llega tráfico nuevo al quiz
   de AR, `QuizContainerV2` todavía ejecuta la lógica de asignación del test de
   entrada (`getEntryVariant()` o el pin condicional a `AB_ENTRY_PINNED_DEFAULT`),
   por lo que la entrada NO está desactivada de forma incondicional y la variante
   A sigue existiendo como concepto activo en el admin.
2. **Funnel A no emite/atribuye los pasos de venta.** Cuando un visitante del
   Funnel A (AR, experimento ON) llega a `SlideSalesPageV3`, clickea el CTA de
   compra o completa la compra, NO se emiten `af_A_salespage_view` /
   `af_A_checkout` ni se atribuye `af_A_purchase`, porque `SlideSalesPageV3` no
   lee `peekFunnelVariant()` ni emite eventos `af_*` ni adjunta
   `funnel_variant='A'` como cart attribute (a diferencia de `SlideSalesPageV3B`).

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type FunnelInteraction
         { surface: 'entry' | 'salespage_view' | 'checkout' | 'purchase',
           quizVersion: 'ar' | 'latam',
           funnelExperimentEnabled: boolean,
           funnelVariant: 'A' | 'B' | null }
  OUTPUT: boolean

  // (a) Entrada del quiz de AR que HOY sería asignada/randomizada
  //     en lugar de estar fija e incondicional en el hook normal (B).
  IF input.surface == 'entry' AND input.quizVersion == 'ar' THEN
    RETURN entryIsAssignedOrRandomized(input)   // debería ser SIEMPRE 'B' fijo
  END IF

  // (b) Paso de venta del Funnel A (control) que NO se registra/atribuye.
  IF input.surface IN ['salespage_view', 'checkout', 'purchase']
     AND input.quizVersion == 'ar'
     AND input.funnelExperimentEnabled == true
     AND input.funnelVariant == 'A' THEN
    RETURN NOT funnelEventEmittedOrAttributed('A', input.surface)
  END IF

  RETURN false
END FUNCTION
```

### Examples

- **Entrada randomizada (1.1/1.3):** un visitante nuevo de AR llega al quiz; hoy
  el código evalúa `getEntryVariant()` / pin condicional. Esperado: entrada fija
  en `SlideLandingHook` (B) sin asignación alguna.
- **Variante A fantasma en el admin (1.2):** el dashboard sigue mostrando la fila
  "A · Directo (sin hook) · Descartada" en la tabla del test de entrada.
  Esperado: la sección completa del test de entrada no se muestra.
- **`af_A_salespage_view` ausente (1.4):** con el flag ON, un usuario del Funnel A
  ve `SlideSalesPageV3`; el dashboard muestra "% vio venta" = 0 para A, mientras
  B sí lo cuenta.
- **`af_A_checkout` ausente (1.5):** el usuario A clickea "QUIERO MI PLAN"; no se
  emite `af_A_checkout`; "% click" = 0 para A.
- **`af_A_purchase` ausente (1.6):** el usuario A compra; como el flujo del
  control nunca propagó `funnel_variant='A'`, el puente por email no atribuye
  `af_A_purchase`; "% compró" = 0 para A (la compra sí quedó en los totales
  generales).
- **Edge — flag OFF (¬C):** con `NEXT_PUBLIC_AB_FUNNEL_ENABLED` != 'true', el
  Funnel A NO debe emitir ningún `af_*` (comportamiento actual preservado).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- El Funnel B (mujer) sigue emitiendo `af_B_salespage_view`, `af_B_checkout` y
  `af_B_purchase` exactamente como hoy (Req 3.1).
- Ambas variantes siguen contando `af_<V>_quiz_start` y `af_<V>_quiz_complete`
  como hoy (Req 3.2).
- Con el kill switch OFF, o para tráfico LATAM (`quiz_version !== 'ar'`), el
  sistema sirve Funnel A y se comporta EXACTAMENTE como hoy, sin emitir `af_*`
  (Req 3.3).
- Los totales generales del embudo (`QuizProgress`, `ViewContent`,
  `InitiateCheckout`, `Purchase`) y los eventos de Meta CAPI se registran y
  reenvían sin cambios (Req 3.4).
- Los demás desgloses del admin (embudo por slide, UTM/campaña, país, y la
  comparación full-funnel A vs B) se muestran como hoy (Req 3.5).
- Los eventos históricos `ab_entry_A_*` en el store se siguen parseando sin
  romper (se preservan el tipo, los labels y `parseAbEntryEvent`), aunque la
  variante A ya no se muestre como variante activa (Req 3.6).

**Scope:**
Toda entrada que NO involucre (a) la asignación de entrada del quiz de AR ni
(b) un paso de venta del Funnel A con el experimento ON debe quedar totalmente
inalterada. Esto incluye:
- Funnel B de punta a punta (branding, sales page, eventos, cart attribute).
- Tráfico LATAM y cualquier tráfico con el kill switch OFF.
- Totales generales del embudo y todo el pipeline de Meta CAPI.
- El parseo de la data histórica `ab_entry_*` en el funnel store.

**Nota:** El comportamiento correcto positivo (entrada fija en B + Funnel A
emitiendo/atribuyendo todos los pasos) se define en la sección Correctness
Properties (Property 1–3). Esta sección enumera lo que NO debe cambiar.

## Hypothesized Root Cause

Basado en el análisis del código, las causas más probables son:

1. **Entrada nunca desactivada de forma incondicional.** En `QuizContainerV2`
   la variante de entrada se resuelve siempre — `getEntryVariant()` cuando el
   flag full-funnel está OFF, o `peekEntryVariant() ?? AB_ENTRY_PINNED_DEFAULT`
   cuando está ON. El "pin" es condicional al experimento full-funnel, no una
   desactivación real; por eso hay asignaciones nuevas y la variante A persiste
   conceptualmente. Además el render de `landing_hook` sigue ramificando por
   `variant === 'A' | 'B' | 'C'`.

2. **`SlideSalesPageV3` no está instrumentada para el test full-funnel.** A
   diferencia de `SlideSalesPageV3B`, la sales page de control:
   - no importa `peekFunnelVariant` / `funnelEventName`,
   - no emite `af_<V>_salespage_view` al montar,
   - no emite `af_<V>_checkout` en `handleCheckout`,
   - adjunta el cart attribute `ab_entry` (del test de entrada) en vez de
     `funnel_variant`, por lo que la compra del control nunca llega con
     `funnel_variant='A'` al webhook/puente por email.

3. **Atribución de compra dependiente de un dato que el control no propaga.**
   `/api/track` (Purchase) ya sabe atribuir `af_<V>_purchase` para `V ∈ {A, B}`
   leyendo `clientes.funnel_variant` por email, y `/api/shopify-webhook` ya
   parsea `funnel_variant` de `note_attributes`/`landing_site` para A y B — pero
   el flujo del control nunca deja ese dato porque `SlideSalesPageV3` no propaga
   `funnel_variant='A'`. La infraestructura de atribución YA soporta 'A'; lo que
   falta es que el control lo emita.

4. **Admin sigue renderizando la sección del test de entrada.** `FunnelView`
   renderiza incondicionalmente la `SectionCard` "Test A/B/C — pantalla de
   entrada" cuando `data.variantBreakdown.length > 0`, incluyendo la fila de la
   variante A (con badge "Descartada"), en vez de ocultar toda la sección.

## Correctness Properties

Property 1: Bug Condition - Entrada fija e incondicional en el hook normal (B)

_For any_ visitante del quiz de Argentina (`quiz_version === 'ar'`),
independientemente del estado del kill switch full-funnel o de cualquier valor
previo en `localStorage`, la entrada (slide `landing_hook`) SHALL renderizar
SIEMPRE el hook normal (`SlideLandingHook`, variante B) sin asignar ni
randomizar ninguna variante de entrada, y sin emitir eventos `ab_entry_*` para
tráfico nuevo.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Bug Condition - Funnel A emite los pasos de venta del embudo

_For any_ visitante del Funnel A (control) en AR con el experimento full-funnel
ON (`NEXT_PUBLIC_AB_FUNNEL_ENABLED === 'true'`), cuando ve la sales page
(`SlideSalesPageV3`) el sistema SHALL emitir `af_A_salespage_view`, y cuando
clickea el CTA de compra SHALL emitir `af_A_checkout`, de modo espejo a cómo el
Funnel A ya emite `af_A_quiz_start`/`af_A_quiz_complete` y a cómo el Funnel B
emite sus `af_B_*`.

**Validates: Requirements 2.4, 2.5**

Property 3: Bug Condition - Funnel A atribuye la compra vía el puente por email

_For any_ compra de un visitante del Funnel A cuyo flujo propagó
`funnel_variant='A'` por el mismo puente que usa el Funnel B (cart attribute
`funnel_variant` y/o `clientes.funnel_variant` leído por email en `/api/track`),
el sistema SHALL atribuir `af_A_purchase`, contando "% compró" para el control.

**Validates: Requirements 2.6**

Property 4: Preservation - El Funnel B queda inalterado

_For any_ input donde la condición de bug NO se cumple y que corresponde al
Funnel B (branding, sales page `SlideSalesPageV3B`, eventos `af_B_*`, cart
attribute `funnel_variant='B'`) o a los pasos `af_<V>_quiz_start`/`quiz_complete`
de ambas variantes, el sistema SHALL producir el mismo resultado que el código
original, preservando por completo el comportamiento del Funnel B y del conteo
de inicios/completes.

**Validates: Requirements 3.1, 3.2**

Property 5: Preservation - Kill switch OFF, LATAM, totales generales y Meta CAPI

_For any_ input con el kill switch full-funnel OFF, o con tráfico LATAM
(`quiz_version !== 'ar'`), o que corresponda a los totales generales del embudo
(`QuizProgress`, `ViewContent`, `InitiateCheckout`, `Purchase`) o al pipeline de
Meta CAPI, el sistema SHALL producir exactamente el mismo resultado que el
código original: Funnel A servido sin eventos `af_*`, totales y CAPI sin cambios,
y los demás desgloses del admin intactos.

**Validates: Requirements 3.3, 3.4, 3.5**

Property 6: Preservation - La data histórica `ab_entry_A_*` sigue parseando

_For any_ evento histórico `ab_entry_A_*` (o `ab_entry_B_*` / `ab_entry_C_*`)
presente en el funnel store, el sistema SHALL seguir parseándolo con
`parseAbEntryEvent` sin lanzar ni romper (se preservan el tipo `EntryVariant`,
`ENTRY_VARIANT_LABEL` y `buildVariantBreakdown`), aunque la sección del test de
entrada ya no se muestre en el admin.

**Validates: Requirements 3.6**

## Fix Implementation

### Changes Required

Asumiendo que el análisis de causa raíz es correcto, los cambios son quirúrgicos
y se concentran en cuatro archivos (más limpieza de imports).

**Cambio 1 — Desactivar la entrada de forma incondicional**

**Archivo**: `components/quiz-v2/QuizContainerV2.tsx`

**Cambios específicos**:
1. **Fijar la entrada a B sin asignar.** Eliminar el estado/refs de la variante
   de entrada y la lógica de asignación del `useEffect` de init: quitar
   `getEntryVariant()` y el pin condicional `peekEntryVariant() ?? AB_ENTRY_PINNED_DEFAULT`.
   La entrada queda fija en el hook normal.
2. **Render de `landing_hook`.** Reemplazar la ramificación
   `variant === 'A' ? SlideLandingDirect : variant === 'C' ? SlideLandingHookLite : SlideLandingHook`
   por render directo e incondicional de `<SlideLandingHook onNext={next} />`.
3. **Dejar de emitir `ab_entry_*` para tráfico nuevo.** Eliminar `fireAbEntry` y
   sus invocaciones (`landing`, `start`, `complete`). El test de entrada queda
   desactivado; ya no se generan eventos nuevos (la data histórica se preserva en
   el store).
4. **Limpiar el `ab_variant` de los payloads de `QuizProgress`.** Quitar
   `ab_variant` del `custom` de los eventos `QuizProgress` (ya no hay variante de
   entrada). Los totales generales se preservan.
5. **Imports.** Quitar los imports no usados de `abEntry` (`getEntryVariant`,
   `peekEntryVariant`, `abEntryEventName`, `EntryVariant`, `EntryStep`) y
   `AB_ENTRY_PINNED_DEFAULT`. Conservar todo lo del test full-funnel intacto.

_Nota de preservación_: NO se toca la resolución del test full-funnel
(`getFunnelVariant('ar')`, `fireFunnelEvent`, `chooseRender`, `FunnelBTheme`), ni
el render de la sales page A vs B.

**Cambio 2 — Instrumentar `SlideSalesPageV3` como espejo de `SlideSalesPageV3B`**

**Archivo**: `components/quiz-v2/SlideSalesPageV3.tsx`

**Función**: `SlideSalesPageV3` (montaje + `handleCheckout`)

**Cambios específicos**:
1. **Imports.** Reemplazar `import { peekEntryVariant, abEntryEventName } from '@/lib/quiz-v2/abEntry'`
   por `import { peekFunnelVariant, funnelEventName } from '@/lib/quiz-v2/funnelVariant'`.
2. **`af_A_salespage_view` al montar.** En el `useEffect` de tracking (que hoy
   dispara `ViewContent`), leer `const variant = peekFunnelVariant()` y, si hay
   variante, emitir `funnelEventName(variant, 'salespage_view')` a `/api/track`
   (mismo patrón que `SlideSalesPageV3B`), incluyendo `funnel_variant` en el
   `custom` del `ViewContent` y del evento `af_*`.
3. **`af_A_checkout` en el click.** En `handleCheckout`, reemplazar la lógica de
   `peekEntryVariant()` + `abEntryEventName(variant, 'checkout')` por
   `peekFunnelVariant()` + `funnelEventName(variant, 'checkout')`. Incluir
   `funnel_variant` en el `custom` del `InitiateCheckout`.
4. **Propagar `funnel_variant='A'` como cart attribute.** Reemplazar el cart
   attribute `ab_entry` por `funnel_variant` (espejo exacto de `SlideSalesPageV3B`):
   `if (variant) cartAttrs.funnel_variant = variant;`. Así la compra del control
   llega con `funnel_variant='A'` al webhook y/o al puente por email, y se
   atribuye `af_A_purchase`.
5. **Gating por experimento.** Como `peekFunnelVariant()` devuelve la variante
   solo cuando fue asignada (experimento ON, AR) y `null` en otro caso, los
   eventos `af_A_*` y el cart attribute se emiten SOLO cuando corresponde; con el
   flag OFF / LATAM la variante es `null` y no se emite ningún `af_*` (preserva
   Req 3.3). Mantener `src: 'quiz_v3'` en la atribución del checkout.

_Nota de preservación_: NO se cambia ningún contenido comercial, copy, precios,
estructura visual ni el `ViewContent`/`InitiateCheckout` genéricos de la página;
solo se sustituye la capa de eventos internos del test (de `ab_entry` a `af_`).

**Cambio 3 — Ocultar la sección del test de entrada en el admin**

**Archivo**: `app/admin/funnel/FunnelView.tsx`

**Cambios específicos**:
1. **Eliminar la `SectionCard` "Test A/B/C — pantalla de entrada"** por completo
   (todo el bloque `{data.variantBreakdown && data.variantBreakdown.length > 0 && (...)}`),
   incluyendo la tabla por variante y su nota al pie. No se muestra ninguna fila
   (ni A, ni B, ni C).
2. **Quitar los valores derivados que solo alimentaban esa sección**:
   `bestStartRate`, `bestCompletionRate`, `bestSalesRate` (el `useMemo` sobre
   `data.variantBreakdown`).
3. **Limpiar imports no usados**: `ENTRY_VARIANT_LABEL` y
   `ENTRY_DISCARDED_VARIANTS` de `@/lib/quiz-v2/abEntry`, y el tipo
   `VariantBreakdownRow` si queda sin referencias.
4. **Conservar intacta** la sección "Test full-funnel — Argentina (A vs B)" y
   todos los demás desgloses (Req 3.5).

**Cambio 4 — Preservar el parseo histórico (sin cambios funcionales)**

**Archivos**: `lib/quiz-v2/abEntry.ts`, `lib/admin/store.ts`

**Cambios específicos**:
1. **No eliminar** `EntryVariant`, `ENTRY_VARIANT_LABEL`, `parseAbEntryEvent`,
   `isAbEntryEvent`, `buildVariantBreakdown` ni el campo `variantBreakdown` de
   `FunnelData`: se conservan para que la data histórica `ab_entry_*` siga
   parseándose sin romper (Req 3.6). Simplemente el admin deja de renderizar esa
   sección. `/api/track` sigue tratando los `ab_entry_*` entrantes (si llegaran
   de bundles cacheados) como eventos internos que no van a Meta CAPI.

_Sin cambios necesarios_ en `/api/track` (Purchase bridge) ni en
`/api/shopify-webhook`: ambos ya atribuyen `af_<V>_purchase` para `V ∈ {A, B}`;
el fix se limita a que el control propague `funnel_variant='A'`.

## Testing Strategy

### Validation Approach

La estrategia sigue dos fases: primero, exponer contraejemplos que demuestren los
bugs sobre el código SIN corregir (Funnel A sin `af_A_*`, entrada randomizada,
variante A visible en el admin); luego, verificar que el fix funciona y que
preserva el comportamiento del Funnel B, LATAM, flag OFF, totales generales,
Meta CAPI y el parseo histórico.

### Exploratory Bug Condition Checking

**Goal**: Exponer contraejemplos que demuestren los bugs ANTES de implementar el
fix. Confirmar o refutar el análisis de causa raíz. Si se refuta, re-hipotetizar.

**Test Plan**: Renderizar `SlideSalesPageV3` (Funnel A) con el experimento ON y
una variante 'A' asignada, y observar que NO se disparan `af_A_salespage_view` /
`af_A_checkout` ni se adjunta `funnel_variant` al checkout. Para la entrada,
montar `QuizContainerV2` en AR y observar que la variante de entrada se asigna/
randomiza (o se fija condicionalmente) en vez de ser B incondicional. Para el
admin, construir `variantBreakdown` con eventos históricos y observar que la
sección (con fila A "Descartada") se renderiza. Ejecutar sobre el código SIN
corregir para observar las fallas.

**Test Cases**:
1. **Funnel A sales page view (Req 1.4)**: montar `SlideSalesPageV3` con variante
   'A' ⇒ no hay `af_A_salespage_view` (falla en código sin corregir).
2. **Funnel A checkout (Req 1.5)**: click en el CTA ⇒ no hay `af_A_checkout` ni
   cart attribute `funnel_variant` (falla en código sin corregir).
3. **Funnel A purchase attribution (Req 1.6)**: simular Purchase con lead sin
   `funnel_variant='A'` propagado ⇒ no se atribuye `af_A_purchase` (falla).
4. **Entrada randomizada (Req 1.1/1.3)**: montar `QuizContainerV2` en AR ⇒ la
   variante de entrada no es B incondicional (falla/asignación observable).
5. **Variante A fantasma en admin (Req 1.2)**: `variantBreakdown` no vacío ⇒ la
   `SectionCard` del test de entrada se renderiza con la fila A (falla).

**Expected Counterexamples**:
- `SlideSalesPageV3` no emite ningún evento `af_*` ni cart attribute
  `funnel_variant`.
- Causas probables: la sales page de control usa el vocabulario `ab_entry` en
  vez de `af_`, y no lee `peekFunnelVariant()`.

### Fix Checking

**Goal**: Verificar que para todas las entradas donde la condición de bug se
cumple, el código corregido produce el comportamiento esperado.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedFunction(input)
  ASSERT expectedBehavior(result)
END FOR
```

Concretamente:
- Entrada de AR ⇒ SIEMPRE `SlideLandingHook` (B), sin asignación ni `ab_entry_*`.
- Funnel A + flag ON ⇒ `af_A_salespage_view` al montar, `af_A_checkout` al click,
  y `funnel_variant='A'` como cart attribute ⇒ `af_A_purchase` atribuible.

### Preservation Checking

**Goal**: Verificar que para todas las entradas donde la condición de bug NO se
cumple, el código corregido produce el mismo resultado que el original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Testing Approach**: Se recomienda property-based testing para la preservación
porque genera muchas entradas a lo largo del dominio (variante B, LATAM, flag
OFF, distintas combinaciones de pasos y eventos históricos) y atrapa edge cases
que un unit test manual podría perder, dando una garantía fuerte de que el
comportamiento no cambió para las entradas no-bug.

**Test Plan**: Observar el comportamiento sobre el código SIN corregir para
Funnel B, LATAM, flag OFF, totales generales/CAPI y parseo histórico, y luego
escribir tests que capturen ese comportamiento y verifiquen que se mantiene tras
el fix.

**Test Cases**:
1. **Funnel B intacto (Req 3.1)**: `SlideSalesPageV3B` sigue emitiendo
   `af_B_salespage_view`/`af_B_checkout` y adjuntando `funnel_variant='B'`.
2. **quiz_start/quiz_complete (Req 3.2)**: ambas variantes siguen contando
   inicios y completes.
3. **Flag OFF / LATAM (Req 3.3)**: con el flag OFF o `quiz_version='latam'`,
   `SlideSalesPageV3` no emite ningún `af_*` (la variante es `null`).
4. **Totales generales + CAPI (Req 3.4)**: `ViewContent`, `InitiateCheckout`,
   `Purchase`, `QuizProgress` y el reenvío a Meta CAPI no cambian.
5. **Otros desgloses del admin (Req 3.5)**: la sección full-funnel A vs B y el
   resto del dashboard se muestran igual.
6. **Parseo histórico (Req 3.6)**: `parseAbEntryEvent('ab_entry_A_landing')` y
   `buildVariantBreakdown` sobre data histórica no lanzan y devuelven lo esperado.

### Unit Tests

- `SlideSalesPageV3`: emite `af_A_salespage_view` al montar (variante A, flag ON);
  emite `af_A_checkout` y adjunta `funnel_variant=A` al checkout; NO emite `af_*`
  cuando `peekFunnelVariant()` es `null` (flag OFF / LATAM).
- `QuizContainerV2`: la entrada renderiza `SlideLandingHook` de forma
  incondicional; no se emiten `ab_entry_*`.
- `FunnelView`: no renderiza la sección "Test A/B/C — pantalla de entrada" ni la
  fila de la variante A; sí renderiza la sección full-funnel A vs B.
- `parseAbEntryEvent` / `buildVariantBreakdown`: siguen parseando la data
  histórica sin romper.

### Property-Based Tests

- **P (Funnel A emite pasos):** para cualquier secuencia de montaje/click en
  `SlideSalesPageV3` con variante 'A' y flag ON, siempre se emiten los `af_A_*`
  correspondientes con `funnel_variant='A'`.
- **P (Preservación Funnel B):** para cualquier interacción con Funnel B, la
  salida (eventos + cart attribute) es idéntica a la del código original.
- **P (Preservación flag OFF/LATAM):** para cualquier input con flag OFF o
  `quiz_version !== 'ar'`, no se emite ningún `af_*` (variante `null`).
- **P (Parseo histórico total):** para cualquier `ab_entry_{A,B,C}_{step}`,
  `parseAbEntryEvent` devuelve un resultado válido y `buildVariantBreakdown` no
  lanza.

### Integration Tests

- Recorrido completo del Funnel A (AR, flag ON) desde el inicio del quiz hasta la
  sales page y el click de compra, verificando la secuencia
  `af_A_quiz_start → af_A_quiz_complete → af_A_salespage_view → af_A_checkout` y,
  vía el puente por email/cart attribute, `af_A_purchase`.
- Recorrido completo del Funnel B para confirmar que sigue idéntico.
- Cambio de contexto flag ON/OFF y AR/LATAM para confirmar el gating de `af_*`.
- Render del dashboard `/admin/funnel` confirmando que la sección de entrada
  desapareció y que la comparación A vs B muestra ahora "% venta", "% click" y
  "% compró" para el control.

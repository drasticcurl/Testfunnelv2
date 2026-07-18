# Documento de Requisitos del Bugfix

## Introducción

Este bugfix corrige el tracking y la configuración de los DOS tests que conviven
hoy en el funnel de Argentina, que están dando datos incorrectos o incompletos
en el dashboard `/admin/funnel`:

1. **Test A/B/C de entrada** (`ab_entry_*`, pantalla de entrada — variantes
   A=Directo, B=Hook actual, C=Hook liviano): el reparto entre variantes está
   roto (en las estadísticas B muestra ~329 personas y C solo 1, muy lejos de un
   split ~50/50 entre las variantes asignables B y C), y la variante A —ya
   descartada de la asignación (`ENTRY_DISCARDED_VARIANTS=['A']`,
   `ASSIGNABLE=['B','C']`)— sigue apareciendo en el desglose del admin. La
   **decisión final del negocio es DESACTIVAR por completo el test de entrada**
   por ahora: el funnel debe usar SIEMPRE la entrada normal (el hook actual =
   variante B) y correr únicamente el test de dos funnels (Control vs Mujer).

2. **Test full-funnel de Argentina** (`af_*`, Control 'A' = funnel actual vs
   'B' = funnel "mujer"/rebrand): el Control (Funnel A) SÍ cuenta inicios
   (`quiz_start`) y completos (`quiz_complete`), pero NO cuenta **% venta**
   (sales page vista), **% click** (checkout) ni **% compró** (compra). La
   variante Mujer (B) SÍ cuenta esas métricas. La causa es que el funnel de
   control renderiza la sales page original `SlideSalesPageV3`, que NO dispara
   los eventos `af_A_salespage_view` / `af_A_checkout`, mientras que el funnel
   mujer renderiza `SlideSalesPageV3B`, que SÍ dispara los `af_B_*`. Además la
   atribución de `af_A_purchase` depende de que se persista/propague la variante
   `funnel_variant='A'`, cosa que el flujo del control no hace.

El objetivo es: (a) desactivar totalmente el test de entrada dejando la entrada
fija en el hook normal y sacando la variante A del dashboard, y (b) hacer que el
Funnel A (control) emita y atribuya todos los eventos del embudo (`salespage_view`,
`checkout`, `purchase`) igual que el Funnel B, para que la comparación A vs B sea
completa y honesta.

## Análisis del Bug

### Comportamiento Actual (Defecto)

Lo que pasa hoy cuando se disparan los bugs.

**Test A/B/C de entrada**

1.1 WHEN hay tráfico nuevo en el funnel de Argentina (con el test full-funnel
activo, que fija `ab_entry` a `AB_ENTRY_PINNED_DEFAULT='B'`) THEN el reparto de
variantes de entrada queda sesgado a 'B' y 'C' casi no recibe tráfico
(estadísticas ~329 en B vs ~1 en C), rompiendo el split ~50/50 entre las
variantes asignables.

1.2 WHEN el admin muestra el desglose del test de entrada (`buildVariantBreakdown`
devuelve siempre filas para A, B y C) THEN la variante A —ya descartada de la
asignación— sigue apareciendo en las estadísticas del dashboard.

1.3 WHEN el negocio ya decidió correr solo el test de dos funnels THEN el código
sigue manteniendo activa la lógica de asignación/randomización del test de
entrada (aunque pausada/fijada de forma condicional), en vez de estar desactivado
de forma explícita e incondicional.

**Test full-funnel de Argentina (Control = Funnel A)**

1.4 WHEN un visitante recorre el Funnel A (control) y llega a la sales page
(`SlideSalesPageV3`) THEN el sistema NO emite `af_A_salespage_view`, por lo que
el dashboard muestra 0 / sin dato en "% venta" (página vista) para el control.

1.5 WHEN un visitante del Funnel A clickea el CTA de compra en `SlideSalesPageV3`
THEN el sistema NO emite `af_A_checkout`, por lo que el dashboard muestra 0 / sin
dato en "% click" (checkout) para el control.

1.6 WHEN un visitante del Funnel A completa una compra THEN el sistema NO atribuye
`af_A_purchase` (no cuenta "% compró" para el control), porque el flujo del
control no persiste/propaga `funnel_variant='A'` (la sales page de control no lee
`peekFunnelVariant()` ni adjunta `funnel_variant` como cart attribute, a
diferencia de `SlideSalesPageV3B`).

### Comportamiento Esperado (Correcto)

Lo que debería pasar en su lugar.

**Test A/B/C de entrada**

2.1 WHEN un visitante entra al funnel de Argentina THEN el sistema SHALL usar
SIEMPRE la entrada normal (el hook actual = variante 'B' / `SlideLandingHook`),
sin randomizar ni asignar las variantes A o C.

2.2 WHEN el test full-funnel corre THEN la única variable experimental SHALL ser
Funnel A vs Funnel B, con la pantalla de entrada fija en el hook normal para
ambas variantes.

2.3 WHEN el admin muestra las estadísticas THEN el sistema SHALL excluir la
variante A del desglose del test de entrada (y, dado que el test de entrada
queda desactivado, no debe presentar la variante A como una variante activa del
experimento).

**Test full-funnel de Argentina (Control = Funnel A)**

2.4 WHEN un visitante recorre el Funnel A (control) y ve la sales page THEN el
sistema SHALL emitir `af_A_salespage_view` (igual que el Funnel B emite
`af_B_salespage_view`), de modo que el dashboard cuente "% venta" para el control.

2.5 WHEN un visitante del Funnel A clickea el CTA de compra THEN el sistema SHALL
emitir `af_A_checkout`, de modo que el dashboard cuente "% click" para el control.

2.6 WHEN un visitante del Funnel A completa una compra THEN el sistema SHALL
atribuir `af_A_purchase` (persistiendo/propagando `funnel_variant='A'` por el
mismo puente por email que usa el Funnel B), de modo que el dashboard cuente
"% compró" para el control.

### Comportamiento Sin Cambios (Prevención de Regresiones)

Comportamiento existente que debe preservarse.

3.1 WHEN un visitante recorre el Funnel B (mujer) THEN el sistema SHALL CONTINUE
emitiendo `af_B_salespage_view`, `af_B_checkout` y `af_B_purchase` exactamente
como hoy.

3.2 WHEN cualquier visitante del test full-funnel avanza por el quiz THEN el
sistema SHALL CONTINUE contando `af_<V>_quiz_start` y `af_<V>_quiz_complete` para
ambas variantes como hoy.

3.3 WHEN el kill switch `NEXT_PUBLIC_AB_FUNNEL_ENABLED` está OFF, o el tráfico es
de LATAM (`quiz_version !== 'ar'`) THEN el sistema SHALL CONTINUE sirviendo el
Funnel A y comportándose EXACTAMENTE como hoy (sin emitir eventos `af_*`).

3.4 WHEN se registran los totales generales del embudo (`QuizProgress`,
`ViewContent`, `InitiateCheckout`, `Purchase`) y los eventos de Meta CAPI THEN el
sistema SHALL CONTINUE registrándolos y reenviándolos sin cambios.

3.5 WHEN el admin muestra los demás desgloses (embudo por slide, UTM/campaña,
país, y la comparación full-funnel A vs B) THEN el sistema SHALL CONTINUE
mostrándolos como hoy.

3.6 WHEN existen eventos históricos `ab_entry_A_*` en el almacén de contadores
THEN el sistema SHALL CONTINUE parseándolos sin romper (se preserva el tipo/labels
y el parseo de la data histórica), aunque la variante A ya no se muestre como
variante activa.

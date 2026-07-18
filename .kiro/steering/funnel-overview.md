# Funnel Overview — estado y decisiones del proyecto

> Runbook para futuras sesiones de Kiro. Resume la arquitectura de los **dos
> embudos** (Argentina y LATAM), el tracking, los webhooks, la sección VIP y los
> aprendizajes operativos de esta sesión. Léelo antes de tocar pagos, tracking o
> el dashboard de admin.

---

## Arquitectura de los dos embudos

El proyecto corre **dos embudos paralelos e independientes** que comparten la
infraestructura genérica del quiz pero NO el código de venta.

### Argentina (`/quiz`) — ARS

- El **front cobra por Shopify** (Mercado Pago, ARS): el CTA hace un **GET** a un
  permalink de carrito de Shopify (`NEXT_PUBLIC_CHECKOUT_URL`). Los UTMs y la
  variante A/B/C viajan como **cart attributes** (`note_attributes`), que el
  webhook lee para atribuir la venta.
- El **upsell (`/upsell`)** y el **downsell (`/downsell`)** también están en
  **Shopify**. Los **tres pasos del front AR usan Shopify** (Tienda Nube quedó
  retirado).
- Tracking: `quiz_version: 'ar'`.

### LATAM (`/latam`) — USD vía Hotmart, español neutro

Cadena completa de la oferta:

| Paso | Ruta | Precio | Nota |
|---|---|---|---|
| Front | `/latam` | US$5.90 | Quiz + sales page |
| Upsell | `/upsell-latam` | US$13.90 | Programa 30 días TURBO |
| Downsell | `/downsell-latam` | US$9.90 | Si rechaza el upsell |
| **Upsell 2** | `/upsell2-latam` | **US$27** | **Acceso VIP de por vida**, TSL |
| **Downsell 2** | `/downsell2-latam` | **US$17** | Mismo producto VIP, más barato |
| → PWA | registro PWA | — | Cierre del funnel |

- Cobra en **USD vía Hotmart**, en **español neutro** (trata de "tú").
- Tracking: `quiz_version: 'latam'`.

### Quiz compartido

- AR y LATAM comparten estructura de slides (`slidesV3` / `slidesV3Latam`),
  mantenidos **sincronizados** por un test anti-drift (`data-sync.test.ts`).
- **Ninguno de los dos captura email** en el quiz. El registro lo hace la **PWA**
  con su propio flujo (Supabase Auth). El comprador escribe su email directo en
  el checkout (Shopify / Hotmart).

---

## Tracking / funnel store

- **`/api/track`** normaliza la versión con `normalizeQuizVersion()`:
  `'latam'` → `'latam'`; **todo lo demás** (incluido el legacy `'v3'`, `undefined`
  o cualquier otro valor) → `'ar'`. **Nunca** devuelve `'v1'` para escrituras
  nuevas (eso era el bug que guardaba LATAM como `'v1'`).
- **`/admin/funnel`** tiene un **toggle Argentina / LATAM / Unificado**
  (`?version=ar|latam`; sin param = unificado).
- El evento **`Purchase` real** se dispara **server-side** desde los **webhooks**:
  Shopify (front + upsell/downsell AR) y Hotmart (LATAM). **Nunca** desde el
  cliente sin dedup (el Pixel y el CAPI comparten `eventID = shopify_<order.id>`).
- A **Meta CAPI** se reporta un **valor FIJO en EUR** (`META_PURCHASE_VALUE = 4.4`
  / `META_PURCHASE_CURRENCY = 'EUR'` en `lib/quiz-v2/config.ts`) para tener un
  ROAS comparable entre monedas. El **monto real** (ARS/USD) se guarda en
  Supabase (`purchases`) y en el funnel store.
- **NO activar el pixel nativo** de Hotmart / Mercado Pago para `Purchase`: la
  **CAPI server-side es la fuente única** (el pixel nativo duplicaría
  conversiones).
- **Migración Supabase 010** (`supabase/migrations/010_relabel_v3_to_ar_and_version_unique.sql`):
  re-etiqueta `'v3' → 'ar'` e **incluye `quiz_version` en la clave única** de
  `funnel_counts`. **Debe correrse en Supabase** (SQL Editor) para que el toggle
  funcione; si no se corre, AR y LATAM **colisionan** en la misma fila contador y
  el filtro por versión es imposible. La migración es idempotente.

---

## Venta del front AR (Shopify) — webhook server-side

El cobro del front AR es un **GET** a un permalink de carrito de Shopify
(`NEXT_PUBLIC_CHECKOUT_URL`). La venta la captura el **webhook de Shopify**, igual
que el upsell/downsell:

- Shopify cobra (Mercado Pago, ARS) y dispara **`orders/paid`** →
  **`/api/shopify-webhook`**.
- El webhook valida el **HMAC** (`SHOPIFY_WEBHOOK_SECRETS`), escribe
  `status='approved'` en Supabase (`purchases`, con `hotmart_transaction =
  shopify_<order.id>` → habilita el acceso a la PWA) y dispara el `Purchase` a
  **Meta CAPI** (dedup por `eventID`).
- **Atribución por campaña:** el webhook lee los UTMs y la variante
  (`ab_entry` / `funnel_variant`) desde `note_attributes` / `landing_site` de la
  orden, que el front manda como **cart attributes** vía
  `withCheckoutAttribution`. Así la venta no cae en "(directo)".
- **NO activar el pixel nativo de Meta** en Shopify (el `Purchase` lo mandamos
  nosotros, Pixel + CAPI deduplicados por `eventID`).

> Antes el front AR cobraba por **Tienda Nube** (POST a `/comprar/` + un código de
> conversión manual en `/success/`). Eso quedó **retirado**: el front volvió a
> Shopify, no se usa más Tienda Nube ni su código de conversión.

---

## Sección VIP (`/pwa/vip`)

- Candado por **código estático** `VIPLATAM` (env `NEXT_PUBLIC_VIP_CODE_LATAM`;
  default `'VIPLATAM'` si no se setea). Validado **client-side**
  (`lib/pwa/vip-access.ts`) y persistido en **`localStorage`**.
- **SIN base de datos ni autenticación**: no es seguridad fuerte (el código es
  compartible), es **exclusividad percibida**.
- El código se entrega por el **email nativo de Hotmart** post-compra. El **mismo
  código** desbloquea tanto si compraron el upsell 2 (US$27) como el downsell 2
  (US$17): es el mismo producto VIP.
- 9 módulos **placeholder** (B.1–B.9); el contenido literal (recetas, PDFs,
  masterclasses) está pendiente de autoría, fuera de alcance del spec.

---

## Atajo de QA

- **`/quiz?test=true`** salta directo a la sales page, para probar el botón de
  pago sin recorrer todo el quiz.

---

## Aprendizaje operativo CRÍTICO: PRs apilados

En esta sesión los PRs se crearon **apilados** (cada uno con base en la rama del
anterior). Al mergearlos, **cada uno fue a su rama padre y NO a `main`** → `main`
quedó atrasado y las features nuevas no aparecían en producción (404).

**Regla para el futuro:**

- **Basar los PRs en `main`** salvo que exista una dependencia real entre ellos.
- **Verificar la base** del PR **antes de mergear**.
- Si quedan apilados, **consolidar con un PR final a `main`** (como el #167).

---

## Estado de PRs al cierre de esta sesión (pendientes de merge a `main`)

| PR | Cambio | Base |
|---|---|---|
| **#167** | `feature/upsell2-latam-vip` → `main` (trae specs #164/#165/#166) | `main` |
| **#168** | Fix de contraste de `/upsell2-latam` | `feature/upsell2-latam-vip` |
| **#169** | Atajo `?test=true` | `feature/upsell2-latam-vip` |

**Orden de merge:** primero **#168** y **#169** a `feature/upsell2-latam-vip`,
luego **#167** a `main`.

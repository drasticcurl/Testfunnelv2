# Cobro con Shopify — Decisiones y arquitectura

> Contexto persistido de la migración del cobro de **Hotmart → Shopify**.
> Target: mujeres argentinas. Moneda: **ARS**. Gateway: **Mercado Pago**
> (+ transferencia vía un proveedor local que se conecta a Shopify como un
> método de pago más). Plan Shopify: **Basic**.

## Principio clave

Lo ÚNICO que habilita el acceso a la PWA es una fila `status='approved'` en la
tabla `purchases` de Supabase. No importa quién la escriba. Antes la escribía el
webhook de Hotmart; ahora la escribe `/api/shopify-webhook`. El login de la PWA
(`/api/pwa/auth/login`) NO se toca: busca por email + status approved.

## Qué cambia vs Hotmart (solo 2 "contratos" externos)

1. **Link de checkout**: ahora es un permalink de carrito de Shopify
   `https://TIENDA/cart/{VARIANT_ID}:1`. Se setea por env var.
2. **Webhook de compra**: nuevo `/api/shopify-webhook` que valida el HMAC de
   Shopify (`X-Shopify-Hmac-Sha256` = base64 HMAC-SHA256 del **raw body** con el
   secret del webhook) y escribe en `purchases`.

Todo lo demás (Supabase, login PWA, Meta CAPI, quiz) se mantiene.

## Mercado Pago: implicancias decididas

- **Shopify Payments NO existe en Argentina** → se usa Mercado Pago Checkout Pro
  (off-site / redirige a MP y vuelve).
- **El upsell de 1 clic nativo de Shopify NO funciona con Mercado Pago** (las
  páginas post-purchase de Shopify solo andan con gateways tipo Shopify
  Payments/PayPal). Por eso NO usamos apps tipo AfterSell/ReConvert post-purchase.
- En consecuencia: **el upsell es un SEGUNDO checkout** (el cliente vuelve a
  pasar por MP). Es lo normal en AR. Reusamos las páginas propias `/upsell`
  y `/downsell` del Next.js app (el CTA del upsell redirige directo al checkout).
- La transferencia es otro método de pago en MP/Shopify; no requiere lógica extra
  (dispara `orders/paid` igual cuando queda pagada).

## Modelo del competidor (referencia) — por qué multi-store

El competidor: front en tienda A → post-pago redirige a la **home de la tienda A**
(que es la página de upsell con VSL) → el upsell se compra en una **tienda B
separada** → post-pago redirige a la home de B (instrucciones de uso).

Por qué lo hacen así:
1. **El redirect post-checkout es 1 solo por tienda** (setting global). Con 2
   tiendas, cada una tiene su propio destino post-pago sin pisarse. (En Shopify
   Basic no se puede cambiar libremente la URL final del checkout; se usa botón
   en la thank-you page o app.)
2. **Cada tienda = checkout limpio de 1 producto** → evita el límite del upsell
   post-purchase (que con MP no anda igual).
3. **Distribución de riesgo/volumen** entre varias cuentas MP/Shopify: si una se
   congela, la otra sigue vendiendo.

Decisión para nosotros: NO obligamos a 2 tiendas porque YA tenemos las páginas
`/upsell` propias. Pero el webhook soporta **varias tiendas** (varios secrets
separados por coma en `SHOPIFY_WEBHOOK_SECRETS`) por si se adopta el modelo
multi-store más adelante.

## Redirect post-compra → PWA / upsell

- En Shopify Basic no hay redirect final nativo configurable. Se conecta vía:
  - botón "⚠️ Falta 1 paso" en la thank-you page (app gratuita de thank-you page,
    ej. ReConvert tier free) que linkea a `chauhinchazon.hilvanapp.com/upsell`, y/o
  - el **email de confirmación nativo de Shopify** (buena entregabilidad) con el
    botón "Acceder a mi protocolo" → `/pwa/login`.
- El scarcity ("⚠️ mirá este video", "progreso 70%") va en NUESTRA `/upsell`, que
  controlamos 100%.

## Email / CRM

- **Systeme.io**: NO se usa (nunca se usó). Se quita del webhook nuevo.
- **Resend**: NO se usa para post-compra (cae en spam). El link de acceso se manda
  por el **email de confirmación nativo de Shopify**.
- **Abandono de carrito**: lo maneja Shopify nativo.

## vTurb (VSL) — pendiente de implementar

Se va a usar **vTurb** para las VSL (sales page del quiz y/o VSL del upsell).
Razones (por qué lo usan los marketers):
- **Smart autoplay** (arranca en mute, al activar sonido reinicia → más watch time).
- **Botón con delay sincronizado al video**: el CTA aparece solo en el minuto del
  pitch; vTurb tiene guía específica para sincronizar botones de upsell.
- **Barra de progreso "inteligente"** (avanza rápido y se frena → menos abandono).
- **Analytics de retención / mapas de calor** para ajustar el guion.

Implementación: dejar preparado el lugar del embed (placeholder) en `/upsell`
(y opcionalmente en la sales page). El `<script>` de vTurb va por video.

## Acceso PWA: SIN tiers

El PWA es el mismo paguen 1 semana o 1 mes (si pagan poco, se regala igual).
`getUserTier` devuelve acceso completo ante **cualquier** compra aprobada. No se
mapean product IDs a tiers.

## Precios (fuente única: lib/quiz-v2/config.ts → PRICING, en ARS)

- Front: **$6.000**
- Upsell: **$19.900**
- Downsell: **$12.900** (mismo producto que el upsell, $7.000 menos)

## Variables de entorno (provider-neutral + fallback)

- `NEXT_PUBLIC_CHECKOUT_URL` (front) — fallback a `NEXT_PUBLIC_HOTMART_CHECKOUT_URL`
- `NEXT_PUBLIC_UPSELL_CHECKOUT_URL` — fallback a `NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL`
- `NEXT_PUBLIC_DOWNSELL_CHECKOUT_URL` — fallback a `NEXT_PUBLIC_HOTMART_DOWNSELL_CHECKOUT_URL`
- `SHOPIFY_WEBHOOK_SECRETS` — uno o varios secrets separados por coma (multi-store)
- (se mantienen) `META_PIXEL_ID`, `META_CAPI_TOKEN`, Supabase, `PWA_SESSION_SECRET`

## Checklist de configuración en Shopify (operativo)

1. Plan Basic + Mercado Pago Checkout Pro (Settings → Payments).
2. Producto digital: destildar "This is a physical product" (sin envío). El
   "delivery" es el acceso a la PWA (no hace falta app de Digital Downloads).
3. Anotar el **Variant ID** de cada producto → armar permalinks
   `https://TIENDA/cart/{VARIANT_ID}:1`.
4. Branding del checkout: subir **logo "Chau Hinchazón"** + **imagen del producto**
   cuadrada (mockup del protocolo/app).
5. Webhook `orders/paid` → `https://chauhinchazon.hilvanapp.com/api/shopify-webhook`.
   Copiar el secret a `SHOPIFY_WEBHOOK_SECRETS`.
6. Personalizar el email de confirmación con botón → `/pwa/login`.
7. Thank-you page: botón → `/upsell` (o redirect del modelo multi-store).

# Método del Agua de Arroz — Quiz Funnel

Quiz funnel para vender un protocolo digital de deshinchado y baja de peso basado en el **Método del Agua de Arroz**. Target: mujeres 25-55 (Argentina + LATAM). El motor del quiz está diseñado para ser **reutilizable**: el contenido (temática, precios, textos) vive centralizado en `lib/quiz-v2/config*.ts` y el resto es infraestructura genérica.

## Qué se vende

**Producto:** "Protocolo Chau Hinchazón" — un **producto digital** (no físico, sin
envío) basado en el **Método del Agua de Arroz**. Es un plan antiinflamatorio para
**deshinchar la panza y bajar de peso** en mujeres, presentado por la
**Lic. Natalia Reyes** (nutricionista) como autoridad de marca.

El "Método del Agua de Arroz" es el ángulo del producto: tomar agua de arroz (rica
en almidón resistente, un prebiótico natural) como hábito diario para alimentar la
microbiota, reducir la inflamación intestinal y la retención de líquidos. Es el
gancho educativo del funnel — no se venden suplementos ni productos físicos, se
vende **el acceso a la app/PWA** con el plan, las recetas y las guías.

**Entrega:** al pagar, el acceso se habilita por email; el usuario entra a la
**PWA** (`/pwa/login`) con su email. No se descarga nada de la tienda de apps (es
una web app instalable). El registro de la PWA es **abierto** (Supabase Auth), así
que estar logueado ya implica acceso completo.

> **El acceso a la PWA es el mismo pague lo que pague** (no hay tiers): cualquier
> compra aprobada habilita todo. El precio mayor del Programa 30 Días / VIP es por
> el **contenido extra** (recetas, guías, masterclasses), no por desbloquear
> features de la app.

> Garantía ofrecida: 7 días (y por ley de consumidor en AR, 10 días de
> arrepentimiento). Ver políticas en `app/legal/`.

## Stack

- **Framework:** Next.js 14 (App Router) · React 18 · TypeScript
- **Styling:** Tailwind CSS + CSS custom properties
- **State:** Zustand (persistido en localStorage)
- **Animaciones:** Framer Motion
- **DB / Auth:** Supabase (`clientes`, `purchases`, funnel store, PWA Supabase Auth)
- **Emails:** email nativo de Shopify (AR) · email nativo de Hotmart + Resend (LATAM)
- **Hosting:** Vercel (deploy en push a `main`)
- **Tests:** Vitest + Testing Library + fast-check (property-based)
- **Checkout AR:** **Shopify** (Mercado Pago, ARS) en front, upsell, downsell y upsell 2.
- **Checkout LATAM:** **Hotmart** (USD) en los 5 pasos.
- **Tracking:**
  - **Meta** Pixel (client) + Conversions API (server), deduplicados por `eventID`.
  - **TikTok** Pixel base (client, solo `PageView`) — aditivo y aislado de Meta,
    se inyecta solo si `NEXT_PUBLIC_TIKTOK_PIXEL_ID` está seteada. (Las env vars
    del Events API server-side existen pero **aún no están cableadas** en el código.)
  - **UTMify** — captura global de UTMs + pixel en la sales page.
  - El `Purchase` real se dispara **server-side desde el webhook** (Shopify o
    Hotmart), nunca desde el pixel nativo del checkout (evita doble conteo).

## Los dos embudos

El proyecto corre **dos embudos paralelos e independientes** que comparten la
infraestructura genérica del quiz pero **no** el código de venta:

| | **Argentina** | **LATAM** |
|---|---|---|
| Rutas | `/quiz`, `/upsell`, `/downsell`, `/upsell2`, `/oferta` | `/latam`, `/upsell-latam`, `/downsell-latam`, `/upsell2-latam`, `/downsell2-latam` |
| Checkout | Shopify (Mercado Pago) | Hotmart |
| Moneda | ARS | USD |
| Idioma | Español AR (voseo) | Español neutro (tú) |
| Webhook de compra | `/api/shopify-webhook` | `/api/hotmart-webhook` |
| Config (fuente de verdad) | `lib/quiz-v2/config.ts` | `lib/quiz-v2/config-latam.ts` |

---

## Funnel Argentina (Shopify · ARS)

Cobra por **Shopify** (gateway **Mercado Pago**, ARS) en sus **cuatro pasos**. Todos
disparan el `Purchase` real **server-side** desde el webhook de Shopify.

### Embudo y precios (fuente única: `lib/quiz-v2/config.ts` → `PRICING`)

| Paso | Ruta | Qué es | Precio (ancla) | Checkout (env var) |
|---|---|---|---|---|
| **Front** | `/quiz` | Plan 7 días + app | **$7.790** ($18.000) | `NEXT_PUBLIC_CHECKOUT_URL` |
| **Upsell** | `/upsell` | Programa 30 Días TURBO (VSL) | **$14.900** ($39.990) | `NEXT_PUBLIC_UPSELL_CHECKOUT_URL` |
| **Downsell** | `/downsell` | Mismo Programa 30 Días, más barato | **$9.900** | `NEXT_PUBLIC_DOWNSELL_CHECKOUT_URL` |
| **Upsell 2** | `/upsell2` | Acceso VIP de por vida (TSL, pago único) | **$19.990** ($49.990) | `NEXT_PUBLIC_UPSELL2_CHECKOUT_URL` |
| **Nurture** | `/oferta` | 20% OFF para leads que hicieron el quiz y no compraron | — | `noindex`, se envía por email de Shopify |

Flujo post-compra: `/upsell` → "SÍ" **redirige al checkout de Shopify** · "no" →
`/downsell`. Después, `/upsell2` → "SÍ" checkout VIP · "no gracias" →
`/pwa/registro` (sin downsell en AR). El checkout de Shopify **no se puede
embeber** (X-Frame-Options), por eso las páginas de oferta **redirigen** al
permalink en vez de usar iframe.

### Cómo entra la venta (Shopify → webhook)

1. La sales page abre un **permalink de carrito** de Shopify. Antes de salir se
   dispara `InitiateCheckout` (Pixel + CAPI). Los UTMs y la variante A/B
   (`ab_entry` / `funnel_variant`) viajan como **cart attributes** vía
   `withCheckoutAttribution` (`lib/cookies.ts`).
2. Shopify cobra y dispara el webhook `orders/paid` → **`/api/shopify-webhook`**.
3. El webhook valida el HMAC (`SHOPIFY_WEBHOOK_SECRETS`), escribe
   `status='approved'` en Supabase (`purchases`, con `hotmart_transaction =
   shopify_<order.id>`) y dispara `Purchase` a Meta CAPI (dedup por `eventID`
   con el pixel client-side).
4. **Atribución por campaña:** el webhook lee los UTMs y la variante desde
   `note_attributes` / `landing_site` de la orden (lo que el front mandó como cart
   attributes), así la venta no cae en "(directo)".
5. **Acceso a la PWA:** el usuario entra por `/pwa/login` (Supabase Auth).

> **No se usa el pixel nativo de Meta/TikTok de Shopify** — el `Purchase` lo
> mandamos nosotros server-side (Pixel/CAPI deduplicados por `eventID`).

### Una sola tienda + banners condicionales (thank-you page)

Se usa **una sola tienda** Shopify. La app de thank-you page (Upsell.com /
ReConvert) muestra **banners condicionales** según el producto del pedido:

- compró el **front** → banner "⚠️ Falta 1 paso" → `/upsell`;
- compró el **30 días** (upsell/downsell) → "Acceder a mi protocolo" → `/pwa/login`.

El **email de confirmación nativo de Shopify** es la red de seguridad del acceso:
lleva un botón condicional (mismo criterio) al `/upsell` o al `/pwa/login`.

> **Atribución de UTMs al upsell:** tanto el botón de la thank-you page como el
> email deben llevar los UTMs en la query. Los UTMs ya viajan en los
> `note_attributes` de la orden, así que se leen con Liquid y se anexan al link:
> en la thank-you page como `{{ order.attributes.utm_source }}` y en el **email
> nativo de Shopify** como `{{ attributes.utm_source }}` (sin el prefijo `order`,
> y siempre con `| url_encode`). Al aterrizar en `/upsell`, `captureUTMs()`
> re-hidrata los UTMs desde la URL y `withCheckoutAttribution` los reinyecta al
> checkout del upsell. Para el fallback por cookie cross-subdominio, setear
> `NEXT_PUBLIC_COOKIE_DOMAIN=.hilvanapp.com`.

> Decisiones de arquitectura, límites de Shopify Basic + Mercado Pago y checklist
> de configuración: ver **`.kiro/steering/`**.

> Nota: hay un único quiz en `/quiz`. Las rutas legacy `/quiz-v2` y `/quiz-v3`
> redirigen a `/quiz` (middleware). El folder `components/quiz-v2/` contiene el
> quiz actual (su contenido es "V3 — agua de arroz").

---

## Funnel LATAM (Hotmart · USD)

Embudo **paralelo** al argentino, en **español neutro** (trata de "tú"), que cobra
en **USD vía Hotmart**. El funnel AR queda **intacto e independiente**.

### Rutas y precios (fuente única: `lib/quiz-v2/config-latam.ts` → `PRICING_LATAM`)

| Ruta | Qué es | Precio (ancla) |
|---|---|---|
| **`/latam`** | Quiz + sales page (front) | **US$14.90** (US$39.90) |
| **`/upsell-latam`** | Upsell (Programa 30 Días TURBO) | **US$19.90** (US$49.90) |
| **`/downsell-latam`** | Downsell (mismo 30 días) | **US$12.90** (US$19.90) |
| **`/upsell2-latam`** | Upsell 2 — Acceso VIP de por vida (pago único) | **US$27** (US$97) |
| **`/downsell2-latam`** | Downsell 2 — mismo producto VIP, más barato | **US$17** (US$97) |
| **`/pwa/vip`** | Sección VIP de la PWA (candado por código `VIPLATAM`) | — |

El **upsell 2** y el **downsell 2** son el **mismo producto VIP** a distinto
precio. Tras el downsell 2, el funnel cierra en el registro de la PWA. El quiz
LATAM (`lib/quiz-v2/data-latam.ts`) **no captura email** (la PWA tiene registro
abierto; el comprador escribe su email directamente en Hotmart).

> ⚠️ Los precios mostrados salen de `config-latam.ts` (fuente de verdad). Los
> comentarios de `.env.local.example` traen valores viejos (US$5.90 / 13.90 /
> 9.90) que quedaron desactualizados — el precio real de cobro se configura en
> **Hotmart**, no en las env vars.

#### Sección VIP — `/pwa/vip`

Candado por **código estático** `VIPLATAM` (env `NEXT_PUBLIC_VIP_CODE_LATAM`),
validado **client-side** y persistido en `localStorage`. **Sin base de datos ni
autenticación** (es exclusividad percibida, no seguridad fuerte). El código se
entrega por el **email nativo de Hotmart** post-compra (mismo código para upsell 2
y downsell 2).

### Compra LATAM (Hotmart → webhook)

- `lib/cookies.ts → withHotmartCheckout()` arma los links de Hotmart con tracking
  `src` / `sck` / UTM. **No pasa email ni PII.**
- `app/api/hotmart-webhook/route.ts` registra en `purchases`, dispara `Purchase` a
  Meta CAPI en la moneda del payload, agrega tag de **Systeme.io** y envía el
  **email de bienvenida (Resend)**. La detección de plan es por
  `HOTMART_PRODUCT_ID_*` (no por precio).
- **No activar** la integración nativa de Meta Pixel de Hotmart (doble conteo).
- **Ads:** targetear LATAM **excluyendo AR y BR** (BR está geo-bloqueado por el
  middleware).

---

## Tracking (detalle)

Todo el tracking client-side se inyecta en `app/layout.tsx`:

- **Meta Pixel** (`fbq`) — solo si `NEXT_PUBLIC_META_PIXEL_ID` está seteada.
  `Purchase` server-side vía CAPI (`lib/tracking.ts → sendCapiEvent`), dedup por
  `eventID`. Valor reportado a Meta **fijo en EUR** (`META_PURCHASE_VALUE = 4.4`,
  `META_PURCHASE_CURRENCY = 'EUR'` en `config.ts`) para que el ROAS sea comparable
  con el gasto en EUR — el monto real (ARS/USD) se guarda intacto en Supabase.
- **TikTok Pixel** (`ttq`) — base code + `ttq.page()` (`PageView`), solo si
  `NEXT_PUBLIC_TIKTOK_PIXEL_ID` está seteada. Es aditivo y aislado de Meta. Nota:
  los eventos custom y la Events API server-side (`TIKTOK_ACCESS_TOKEN`) están
  previstos en `.env.local.example` pero **todavía no implementados** en el código
  (hoy TikTok solo trackea PageView).
- **UTMify** — dos scripts: captura **global** de UTMs
  (`cdn.utmify.com.br/scripts/utms/latest.js`, en todas las páginas) y el
  **pixel** de UTMify (`components/UtmifyPixel.tsx`), montado solo en la sales page.
- **Verificación de dominio de Meta** vía `<meta name="facebook-domain-verification">`.

La captura y persistencia de UTMs propia del funnel vive en `lib/cookies.ts`
(cookie cross-subdominio `.hilvanapp.com` + localStorage). El hash de PII y los
helpers de CAPI están en `lib/tracking.ts` (server-only, importa `crypto`).

---

## Estructura del proyecto

```
app/
├── quiz/            → Quiz funnel AR (sales page embebida). Atajo QA: ?test=true
├── upsell/          → Upsell AR (Programa 30 días, VSL VTURB; CTA → Shopify)
├── downsell/        → Downsell AR (mismo 30 días, más barato)
├── upsell2/         → Upsell 2 AR (Acceso VIP de por vida, TSL, $19.990)
├── oferta/          → Nurture 20% OFF para leads (noindex; link por email Shopify)
├── latam/           → Quiz + sales page LATAM (USD, Hotmart)
├── upsell-latam/ · downsell-latam/ · upsell2-latam/ · downsell2-latam/  → embudo LATAM
├── pwa/             → PWA post-compra (Supabase Auth)
│   ├── login · registro · recuperar · reset   → auth (rutas públicas)
│   ├── dashboard · plan · recetas · guias · diario · progreso · calculadora ...
│   └── vip/         → Sección VIP (candado por código estático VIPLATAM)
├── admin/           → Dashboard admin (embudo, leads, ventas, overview)
│   └── funnel/      → Embudo con toggle Argentina / LATAM / Unificado
├── api/
│   ├── track/                → CAPI Meta + TikTok + funnel store + eventos internos (AB)
│   ├── submit-quiz/          → Lead al completar el quiz (Meta + Supabase clientes + UTMs)
│   ├── shopify-webhook/      → Webhook de compra AR (front/upsell/downsell/upsell2)
│   ├── hotmart-webhook/      → Webhook de compra LATAM (+ legacy AR)
│   ├── test-email/           → Endpoint de prueba de emails (dev)
│   ├── pwa/                  → auth/logout, me, debug, webhook/hotmart (PWA)
│   └── admin/                → funnel-data, health, leads-export, leads-stats, revenue-stats
└── legal/           → Privacidad y términos

components/
├── quiz-v2/         → Componentes del quiz V3 (agua de arroz) — AR y LATAM
├── pwa/             → Componentes de la PWA
├── ui/              → Button, Slider, ProgressBar, OptionCard
├── upsell/          → Páginas de upsell/downsell (VSL, ofertas, tracker)
├── admin/           → Componentes del dashboard admin
├── quiz/            → Componentes V1 (referencia, no se usan)
└── UtmifyPixel.tsx  → Pixel de UTMify (solo sales page)

lib/
├── constants.ts     → ⭐ Constantes transversales (claves de localStorage)
├── quiz-v2/
│   ├── config.ts        → ⭐ Config del funnel AR: producto, precios ARS, checkout URLs
│   ├── config-latam.ts  → ⭐ Config del funnel LATAM: precios USD, checkout Hotmart
│   ├── localization.ts  → Precios y textos por país (AR, CO, PE, MX, CL)
│   ├── data.ts / data-latam.ts → Slides del quiz (AR con captura de email; LATAM sin)
│   ├── types.ts · store.ts · helpers.ts · funnelVariant.ts
│   └── CountryContext.tsx / useCountryLocale.ts → Localización por país
├── pwa/             → Data de plan, recetas, foods, sesión, acceso, Supabase Auth
├── admin/           → Auth + store del admin (memory / supabase)
├── email/           → Resend (diagnóstico + bienvenida) y follow-up
├── cookies.ts       → Cookies, captura de UTMs y helpers de checkout (browser-safe)
├── supabase.ts      → Cliente Supabase server-side
└── tracking.ts      → CAPI Meta + Systeme.io + hash PII (server-side)
```

> Migraciones de Supabase en `supabase/migrations/` (`001`–`011`). La `003`
> crea `purchases` (habilita el acceso/registro de ventas).

## ⭐ Fuente única de verdad (single source of truth)

El objetivo es que **cambiar algo se haga en UN solo lugar**.

| Qué querés cambiar | Dónde se cambia (único lugar) |
|---|---|
| Precios AR / nombres de producto / checkout URLs | `lib/quiz-v2/config.ts` (`PRICING`, `PRODUCT_NAME`, `*_CHECKOUT_URL`) |
| Precios LATAM / checkout Hotmart | `lib/quiz-v2/config-latam.ts` (`PRICING_LATAM`, `LATAM_*_CHECKOUT_URL`) |
| Valor reportado a Meta (Purchase) | `lib/quiz-v2/config.ts` (`META_PURCHASE_VALUE`, `META_PURCHASE_CURRENCY`) |
| Experta / autoridad | `config.ts` → `EXPERT_NAME`, `EXPERT_TITLE`, `EXPERT_IMAGE` |
| Nombres de los 4 tipos de resultado | `config.ts` → `QUIZ_RESULT_TYPE_NAMES` |
| Bullets / value stack / bonus por tipo | `config.ts` → `REFRAME_BULLETS`, `EXTRA_VALUE_ITEMS`, `getBonusTitle/Desc` |
| Banners estacionales por país | `config.ts` → `SEASON_BANNER`, `SEASON_DISCOUNT` |
| Precios y textos por país | `lib/quiz-v2/localization.ts` |
| Preguntas del quiz | `lib/quiz-v2/data.ts` (AR) / `data-latam.ts` (LATAM) |
| Claves de localStorage | `lib/constants.ts` → `STORAGE_KEYS` |
| Lógica de diagnóstico / IMC | `lib/quiz-v2/helpers.ts` |

> Para reutilizar el funnel con otro nicho, los archivos que definen la temática
> son `config.ts` + `localization.ts` + `data.ts`. El resto es infraestructura.

## Convenciones de nombres

- **Componentes y tipos:** `PascalCase` (`SlideSalesPage`, `QuizAnswers`).
- **Variables y funciones:** `camelCase` (`calcularDiagnostico`, `secondsLeft`).
- **Constantes exportadas / config:** `UPPER_SNAKE_CASE` (`QUIZ_RESULT_TYPE_NAMES`, `PRICING`, `STORAGE_KEYS`).
- **Identificadores genéricos sobre específicos del nicho:** el código usa nombres
  genéricos de quiz (`QUIZ_RESULT_TYPE_NAMES`) en vez de nombres atados a la
  temática. Cambiar el nicho solo cambia **valores** en la config.
- **El texto que ve el usuario** (copy, FAQ, testimonios) vive como **datos** en
  `config.ts` / `localization.ts`, no hardcodeado en los componentes.

## Quiz funnel — flujo de slides (AR)

```
0.  Landing hook (método del agua de arroz + autoridad)
1.  Edad (slider)
2.  Tipo de cuerpo (grid 2x2)
3.  Dónde acumula grasa (single)
4.  Noticia viral (mockup Infobae)
5.  Nombre
6.  Cómo afecta la panza (personalizado con nombre)
7.  Probaste antes sin resultado
8.  Qué te impide (multi)
9.  "No es tu culpa" (validación emocional)
10. Qué querés lograr (multi)
11. Peso actual (slider)
12. Altura (slider)
13. Peso ideal (slider con límites dinámicos: default = actual−10, min = actual−30, max = actual)
14. Embarazos
15. Rutina diaria
16. Horas de sueño
17. Agua por día
18. Expert bridge ("Tu diagnóstico personalizado" — Lic. Natalia Reyes + credenciales)
19. Diagnóstico (3 barras con descripción + pill de riesgo + burbuja de urgencia)
20. Captura de email (post-diagnóstico → /api/submit-quiz: lead + fbc/fbp + UTMs en `clientes`)
21. Loading (pasos con checks animados)
22. Sales page (informe personalizado + proyección de peso + precio, countdown 15 min, garantía)
```

### Detalles de slides clave

- **13 · Peso ideal** (`SlideNumberSlider`): límites según el peso actual —
  `max = actual`, `min = actual − 30` (piso 40), `default = actual − 10`. Muestra
  _"Querés bajar X kg — ¡Es totalmente alcanzable con tu plan personalizado!"_.
- **18 · Expert bridge** (`SlideExpertBridge`): encabezado "Tu diagnóstico
  personalizado", atribuye el plan a la Lic. Natalia Reyes + credenciales.
- **19 · Diagnóstico** (`SlideDiagnosisResult`): pill "⚠️ Diagnóstico Finalizado",
  descripción debajo de cada barra y una única burbuja de urgencia antes del CTA.
- **21 · Sales page** (`SlideSalesPageV3`): informe personalizado (diagnóstico +
  recomendaciones dinámicas + cierre firmado por la Lic.) y proyección de peso
  (imagen before-after, sin bloque de IMC). Countdown de **15 minutos**.

## Diagnóstico

3 métricas calculadas dinámicamente en `lib/quiz-v2/helpers.ts`:
- **Nivel de Inflamación** (62-97%) — tipo cuerpo, zona, obstáculos, sueño, agua
- **Riesgo de Acumulación** (55-95%) — rutina, embarazos, tipo cuerpo
- **Eficiencia Metabólica** (8-35%) — sueño, agua, rutina, tipo cuerpo

Siempre genera valores "dramáticos" para cualquier respuesta realista del target.
Cada barra muestra una descripción personalizada (`getBarDescriptions`) y el slide
cierra con una burbuja de urgencia (`getDiagnosisUrgency`). El informe de la sales
page se arma con `getInformeResumen` + `getRecomendaciones`. Los 4 tipos de
resultado (`QUIZ_RESULT_TYPE_NAMES`) se derivan del nivel de inflamación.

## Estética

- **Paleta:** Terracota (#C0553A) + peach (#FFF5F0) + blanco cálido (#FFFAF7)
- **Fonts:** DM Serif Display (headlines) + Plus Jakarta Sans (body)
- **Vibe:** Femenino, cálido, cercano, salud accesible

## Integraciones externas (no se renombran)

Estos identificadores son contratos con servicios externos. Cambiarlos rompe el
matching/reporting, así que **se mantienen tal cual** aunque mencionen la temática:

- **Meta / TikTok:** nombres de eventos, `content_name`, `content_category`.
- **Supabase:** tablas (`clientes`, `purchases`) y columnas (incl. `tipo_hinchazon`
  y `hotmart_transaction`, que para Shopify guarda `shopify_<order.id>`).
- **Shopify:** firma de webhooks (`X-Shopify-Hmac-Sha256`), topic `orders/paid`,
  campos del payload y el secret de firma.
- **Hotmart:** campos de los webhooks (`hottok`, `product_id`, etc.).
- **UTMify:** el `pixelId` del snippet.
- **Variables de entorno:** los nombres de las env vars.

## Variables de entorno

Fuente de verdad: **`.env.local.example`** (lista completa y comentada). Resumen por
área (`NEXT_PUBLIC_*` se exponen al browser; el resto es server-only):

```env
# ── Tracking (UTMs / cookies) ──
NEXT_PUBLIC_COOKIE_DOMAIN=          # .hilvanapp.com en prod (cookie UTM cross-subdominio); vacío en local

# ── AR · Checkout Shopify (Mercado Pago, ARS) ──
NEXT_PUBLIC_CHECKOUT_URL=           # Permalink carrito Shopify (front, $7.790)
NEXT_PUBLIC_UPSELL_CHECKOUT_URL=    # Upsell ($14.900)
NEXT_PUBLIC_DOWNSELL_CHECKOUT_URL=  # Downsell ($9.900)
NEXT_PUBLIC_UPSELL2_CHECKOUT_URL=   # Upsell 2 / VIP ($19.990)
SHOPIFY_WEBHOOK_SECRETS=            # Secret(s) HMAC del webhook orders/paid (coma-separados = multi-tienda)
# Legacy fallback: NEXT_PUBLIC_HOTMART_CHECKOUT_URL / _UPSELL_ / _DOWNSELL_

# ── VSL del upsell (VTURB) ──
NEXT_PUBLIC_VTURB_PLAYER_ID=        # id del <vturb-smartplayer>
NEXT_PUBLIC_VTURB_SCRIPT_URL=       # URL del player.js
NEXT_PUBLIC_VSL_OFFER_DELAY_SEC=700 # segundos hasta mostrar la oferta
NEXT_PUBLIC_VSL_COUNTDOWN_SEC=467   # contador de escasez

# ── LATAM · Checkout Hotmart (USD) ──
NEXT_PUBLIC_LATAM_CHECKOUT_URL=          # Front
NEXT_PUBLIC_LATAM_UPSELL_CHECKOUT_URL=   # Upsell
NEXT_PUBLIC_LATAM_DOWNSELL_CHECKOUT_URL= # Downsell
NEXT_PUBLIC_LATAM_UPSELL2_CHECKOUT_URL=  # Upsell 2 / VIP
NEXT_PUBLIC_LATAM_DOWNSELL2_CHECKOUT_URL=# Downsell 2
NEXT_PUBLIC_VIP_CODE_LATAM=              # Código sección VIP /pwa/vip (default 'VIPLATAM')
HOTMART_HOTTOK=                          # Token del webhook Hotmart (LATAM + legacy AR)
HOTMART_PRODUCT_ID_FRONT=                # Product ID → detección de plan ('1sem')
HOTMART_PRODUCT_ID_UPSELL=               # Product ID → detección de plan ('4sem')

# ── Meta (Pixel + CAPI) ──
NEXT_PUBLIC_META_PIXEL_ID=          # client-side
META_PIXEL_ID=                      # server-side (sin NEXT_PUBLIC)
META_CAPI_TOKEN=                    # CAPI access token

# ── TikTok — aditivo, opcional (hoy solo el pixel client-side está cableado) ──
NEXT_PUBLIC_TIKTOK_PIXEL_ID=        # client-side (PageView) — único que se usa hoy
TIKTOK_PIXEL_ID=                    # server-side (Events API, aún sin cablear)
TIKTOK_ACCESS_TOKEN=                # Events API token (aún sin cablear)

# ── Otras integraciones ──
SYSTEME_API_KEY=                    # Systeme.io (tag de contactos; usado en LATAM)
QUIZ_WEBHOOK_URL=                   # Make.com/Zapier (opcional)
BLOCKED_COUNTRIES=BR                # Geo-block (ISO, coma-separados). Default: BR

# ── Funnel store / Admin ──
FUNNEL_STORE=supabase               # memory | supabase
ADMIN_PASSWORD=                     # Password del panel /admin (>= 24 chars recomendado)
NEXT_PUBLIC_AB_FUNNEL_ENABLED=      # Kill switch del test A/B (solo 'true' lo activa)

# ── Supabase (PWA Auth + funnel store + purchases) ──
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # REQUERIDO: login/registro PWA corren client-side
SUPABASE_URL=                       # Misma URL, server-only
SUPABASE_SERVICE_ROLE_KEY=

# ── PWA ──
NEXT_PUBLIC_PWA_BASE_URL=           # Base de la PWA
NEXT_PUBLIC_PWA_TEST_MODE=true      # true = sin Supabase (dev). Desactivar en prod.
PWA_SESSION_SECRET=                 # [DEPRECADO] la PWA migró a Supabase Auth

# ── Emails (Resend) ──
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

## Emails

- **AR (Shopify):** el acceso y los links al upsell/oferta los entrega el **email
  de confirmación nativo de Shopify**. No pasa por Resend ni Systeme.
- **LATAM (Hotmart):** el código VIP lo entrega el **email nativo de Hotmart**;
  además `hotmart-webhook` envía un **email de bienvenida por Resend**
  (`sendBienvenidaEmail`) y agrega un tag en **Systeme.io**.
- `submit-quiz` **no** envía email post-quiz (Resend está desactivado en ese
  flujo; solo se colecta el lead). `sendDiagnosticoEmail` existe en `lib/email/`
  pero no se dispara desde el quiz.

## Dashboard de embudo

- **`/admin`** (protegido por `ADMIN_PASSWORD`) con vistas de embudo, leads,
  ventas (revenue) y overview.
- **`/admin/funnel`** tiene un **toggle Argentina / LATAM / Unificado**
  (`?version=ar|latam`; sin param = Unificado). `/api/track` normaliza la versión
  con `normalizeQuizVersion()`: `'latam'` queda `'latam'` y todo lo demás (incl.
  legacy `'v3'`) cae en `'ar'`.
- Requiere la **migración 010**
  (`010_relabel_v3_to_ar_and_version_unique.sql`) en el SQL Editor de Supabase:
  re-etiqueta `'v3' → 'ar'` e incluye `quiz_version` en la clave única de
  `funnel_counts`. Es idempotente.

## Test full-funnel A/B — Argentina (Funnel A vs Funnel B)

Test **solo de AR** que compara el funnel ACTUAL (**Funnel A / control**) contra
una variante rebrandeada con sales page v2 (**Funnel B**). Mismo quiz; cambian
branding y sales page. Módulo aislado: `lib/quiz-v2/funnelVariant.ts`.

- **Kill switch (`NEXT_PUBLIC_AB_FUNNEL_ENABLED`)**: el experimento corre **solo**
  con el valor exactamente `'true'`. OFF → todo el tráfico AR ve Funnel A (idéntico
  a hoy); ON → 50/50 A|B por navegador (estable en `localStorage` `ab_funnel_v1`).
- Con el flag ON, la randomización de `ab_entry` se **pausa**. LATAM nunca participa.
- **QA:** forzá una variante con `?af=A` (o `?af=B`) en la URL del quiz.
- **Eventos internos** `af_<V>_quiz_start|quiz_complete|salespage_view|checkout|purchase`
  viajan por los contadores agregados (**no** se reenvían a Meta). La comparación
  aparece en `/admin/funnel`. KPI estrella: **CVR total = compras / inicios**.
- **Migración 011** (`011_add_funnel_variant_to_clientes.sql`): agrega la columna
  aditiva/nullable `clientes.funnel_variant`. El submit-quiz tolera la ausencia.
- **Atribución de la compra por variante:** vía el cart attribute `funnel_variant`
  (o `ab_entry`) que el front manda con `withCheckoutAttribution`; Shopify lo
  guarda en `note_attributes` y `/api/shopify-webhook` lo lee al confirmar el
  `Purchase` (registra `af_<V>_purchase`).

## Atajo de QA

- **`/quiz?test=true`** salta directo a la sales page (probar el pago sin recorrer
  todo el quiz).

## Imágenes necesarias

Todas en `/public/img/`:

| Archivo | Qué es |
|---|---|
| `natalia-reyes.jpg` | Foto nutricionista (800×800, cuadrado) |
| `noticia-viral.jpg` | Screenshot real de Infobae, vertical (completo, sin recortar) |
| `landing-hook.jpg` | Hero infográfica agua de arroz + beneficios (800×500) |
| `before-after.png` | Antes/después (hinchada → panza plana), en la proyección de la sales page |
| `body-en-forma.png` · `body-unos-kilos.png` · `body-sobrepeso.png` · `body-plus-size.png` | Tipos de cuerpo (emoji 3D femenino, mismo personaje, 1:1 — slide 2) |

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local  # completar variables
npm run dev      # servidor de desarrollo
npm run build    # build de producción (incluye type-check)
npm start        # servir el build
npm test         # tests (vitest --run)
npm run test:watch
```

> `npm run lint` es interactivo porque no hay un `.eslintrc` commiteado.
> El type-check de `next build` valida los tipos y es la fuente de verdad de CI.

## Setup / Deploy

Despliegue: push a `main` → **Vercel autodeploy**.

1. **Shopify (AR):** crear los productos (front, upsell, downsell, upsell 2) con
   Mercado Pago (ARS). Pegar los **permalinks de carrito** en las env vars
   `NEXT_PUBLIC_*_CHECKOUT_URL`. Configurar el webhook **Order payment**
   (`orders/paid`) → `https://<dominio>/api/shopify-webhook` y setear
   `SHOPIFY_WEBHOOK_SECRETS`. **No** activar el pixel nativo de Meta/TikTok en
   Shopify. Configurar la thank-you page (ReConvert) y el email de confirmación
   con los banners/links condicionales al `/upsell` o `/pwa/login` (con UTMs).
2. **Hotmart (LATAM):** checkouts de los 5 productos, webhook →
   `/api/hotmart-webhook` con `HOTMART_HOTTOK` y los `HOTMART_PRODUCT_ID_*`. **No**
   activar el pixel nativo de Meta en Hotmart. Thank-you pages externas:
   front → `/upsell-latam`, upsell → `/downsell-latam`, etc.
3. **Supabase:** correr las migraciones `001`–`011` en el SQL Editor (idempotentes).
   La `010` es necesaria para el toggle del dashboard; la `011` para el test A/B.
   Configurar SMTP propio para recuperación de contraseña y desactivar
   "Confirm email" en Authentication → Providers → Email.
4. **Meta / TikTok / UTMify:** setear los pixel IDs y tokens de CAPI/Events API.
5. **Vercel:** setear **todas** las env vars (Project → Settings → Environment
   Variables) y re-deploy.

> Decisiones de arquitectura, límites de Shopify Basic + Mercado Pago y estado de
> los dos embudos: ver **`.kiro/steering/`**.

## Changelog

### Migración a Shopify + segundo upsell + TikTok (actual)

- **Cobro AR por Shopify** (Mercado Pago, ARS) en front, upsell, downsell y
  **upsell 2 (Acceso VIP de por vida, $19.990)**. `/api/shopify-webhook` valida
  HMAC, escribe `purchases` y dispara `Purchase` a Meta CAPI.
- **Env vars provider-neutral** (`NEXT_PUBLIC_CHECKOUT_URL`, etc.) con fallback
  legacy a las `NEXT_PUBLIC_HOTMART_*`.
- **TikTok Pixel base** (client-side, PageView) agregado como espejo aditivo de
  Meta. La Events API server-side quedó prevista en env pero aún sin cablear.
- **UTMify** para captura de UTMs (global) + pixel en la sales page.
- **`/oferta`** — landing de nurture (20% OFF) para leads que hicieron el quiz y no
  compraron, enviada por el email de Shopify.
- **`/upsell` y `/downsell`** ya no usan iframe: **redirigen** al checkout de
  Shopify (no permite embed).
- **PWA con Supabase Auth** (login/registro abiertos); acceso completo sin tiers
  (`lib/pwa/access.ts`). El `PWA_SESSION_SECRET` quedó deprecado.
- **AR sin Resend/Systeme en el post-compra** (el acceso lo entrega el email nativo
  de Shopify). LATAM (Hotmart) **sí** sigue usando Resend (bienvenida) + Systeme.
- **Geo-block** de Brasil por middleware (`BLOCKED_COUNTRIES`).

### Refactor de mantenibilidad (previo)

Centralizó el contenido del funnel para que un cambio de temática no obligue a
tocar muchos archivos:

- **`lib/constants.ts`** — `STORAGE_KEYS` como fuente única de las claves de
  localStorage (se conservan los valores string históricos para no invalidar
  estado ya persistido).
- **`lib/quiz-v2/config.ts`** — `QUIZ_RESULT_TYPE_NAMES` como única definición de
  los 4 tipos (`TIPO_NOMBRES` queda como alias `@deprecated`).
- De-duplicación del mapa de tipos que estaba copiado en 4 lugares.

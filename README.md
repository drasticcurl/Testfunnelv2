# Método del Agua de Arroz — Quiz Funnel

Quiz funnel de 22 slides para vender un protocolo de deshinchado y baja de peso basado en agua de arroz. Target: mujeres argentinas 25-55. El motor del quiz está diseñado para ser **reutilizable**: el contenido (temática, precios, textos) vive centralizado y el resto es infraestructura genérica.

## Qué se vende

**Producto:** "Protocolo Chau Hinchazón" — un **producto digital** (no físico, sin
envío) basado en el **Método del Agua de Arroz**. Es un plan antiinflamatorio para
**deshinchar la panza y bajar de peso** en mujeres, presentado por la
**Lic. Natalia Reyes (MN 9283)** como autoridad de marca.

El "Método del Agua de Arroz" es el ángulo del producto: tomar agua de arroz (rica
en almidón resistente, un prebiótico natural) como hábito diario para alimentar la
microbiota, reducir la inflamación intestinal y la retención de líquidos. Es el
gancho educativo del funnel — no se venden suplementos ni productos físicos, se
vende **el acceso a la app/PWA** con el plan, las recetas y las guías.

**Entrega:** al pagar, el acceso se habilita por email; el usuario entra a la
**PWA** (`/pwa/login`) con el email de compra. No se descarga nada de la tienda de
apps (es una web app instalable).

### Oferta (embudo de 3 pasos, todo en ARS)

| Paso | Qué es | Precio | Qué incluye |
|---|---|---|---|
| **Front** | Plan 7 días + app | **$6.000** | Guía del Método Agua de Arroz, protocolo de 7 días personalizado, 21 recetas antiinflamatorias, Kit Express, acceso a la app |
| **Upsell** | Programa 30 días completo | **$19.900** | Todo lo del front + plan 30 días, +60 recetas, recetario de postres, listas de compras, test de reintroducción de alimentos, seguimiento y meal prep |
| **Downsell** | El mismo Programa 30 días, más barato | **$12.900** | Igual que el upsell ($7.000 menos), si rechazan la oferta anterior |

> El **acceso a la PWA es el mismo** pague lo que pague (no hay tiers): cualquier
> compra aprobada habilita todo. El precio mayor del Programa 30 días es por el
> **contenido extra** (recetas/guías), no por desbloquear features de la app.

> Garantía ofrecida: 7 días (y por ley de consumidor en AR, 10 días de
> arrepentimiento). Ver políticas en `app/legal/`.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + CSS custom properties
- **State:** Zustand (persistido en localStorage)
- **Animaciones:** Framer Motion
- **Tracking:** Meta Pixel + CAPI server-side
- **Hosting:** Vercel
- **DB:** Supabase (clientes, compras, acceso PWA)
- **Checkout:** Shopify (Mercado Pago, ARS). Configurable via `NEXT_PUBLIC_CHECKOUT_URL` (fallback legacy: `NEXT_PUBLIC_HOTMART_CHECKOUT_URL`)
- **Emails:** email de confirmación nativo de Shopify post-compra (mejor entregabilidad). Resend queda solo para flujos opcionales.

## Cobro con Shopify

El cobro se hace con **Shopify** (gateway **Mercado Pago**, moneda ARS). El flujo:

1. Sales page (`/quiz`) → CTA → checkout de Shopify (permalink de carrito).
2. Shopify cobra y dispara el webhook `orders/paid` → **`/api/shopify-webhook`**.
3. El webhook valida el HMAC, escribe `status='approved'` en Supabase (`purchases`)
   y dispara `Purchase` a Meta CAPI.
4. Acceso a la PWA: `/pwa/login` busca esa compra aprobada por email y firma la sesión.

### Embudo y precios (ARS — fuente única: `lib/quiz-v2/config.ts` → `PRICING`)

| Producto | Precio | Checkout (env var) |
|---|---|---|
| **Front** — Plan 7 días | **$6.000** | `NEXT_PUBLIC_CHECKOUT_URL` |
| **Upsell** — Programa 30 días | **$19.900** | `NEXT_PUBLIC_UPSELL_CHECKOUT_URL` |
| **Downsell** — mismo Programa 30 días ($7.000 menos) | **$12.900** | `NEXT_PUBLIC_DOWNSELL_CHECKOUT_URL` (mismo producto + código `SEGUNDA`) |

Flujo post-compra del front: `/upsell` (oferta + VSL) → "SÍ" **redirige directo al
checkout de Shopify** · "no" → `/downsell`. El "no gracias" final va a `/pwa/login`.
El checkout de Shopify **no se puede embeber** (X-Frame-Options), por eso `/upsell`
y `/downsell` **redirigen** al permalink en vez de usar iframe.

### Una sola tienda + banners condicionales

Se usa **una sola tienda** Shopify. La app de thank-you page (Upsell.com / ReConvert)
muestra **banners condicionales** según el producto del pedido:
- compró el **front** → banner "⚠️ Falta 1 paso" → `/upsell`;
- compró el **30 días** (upsell o downsell) → banner "Acceder a mi protocolo" → `/pwa/login`.

El **email de confirmación de Shopify** es la red de seguridad del acceso: lleva un
botón condicional (mismo criterio) al `/upsell` o al `/pwa/login`.

> Decisiones de arquitectura, límites de Shopify Basic + Mercado Pago, modelo del
> competidor, vTurb y checklist de configuración: ver **`.kiro/steering/shopify-checkout.md`**.

> Nota: hay un único quiz en `/quiz`. Las rutas legacy `/quiz-v2` y `/quiz-v3`
> redirigen a `/quiz` (middleware). El folder `components/quiz-v2/` contiene el
> quiz actual (su contenido es "V3 — agua de arroz").

## Estructura del proyecto

```
app/
├── quiz/            → Quiz funnel (22 slides con sales page embebida)
├── pwa/             → PWA post-compra (plan 30 días, recetas, guías, progreso)
├── admin/           → Dashboard admin (embudo, métricas)
├── api/
│   ├── track/                → CAPI Meta + eventos internos
│   ├── submit-quiz/          → Lead al completar el quiz (Meta + Supabase)
│   ├── shopify-webhook/      → Webhook de compra (Shopify) → activa acceso PWA
│   ├── hotmart-webhook/      → Webhook de compra (Hotmart, legacy)
│   ├── pwa/auth/             → Login PWA con HMAC
│   ├── pwa/webhook/hotmart/  → Webhook PWA legacy (proxy)
│   └── admin/funnel-data/    → Datos del dashboard admin
├── upsell/          → Página post-compra (oferta del Programa 30 días; CTA redirige a Shopify)
└── legal/           → Privacidad y términos

components/
├── quiz-v2/         → Componentes del quiz V3 (agua de arroz)
├── pwa/             → Componentes de la PWA
├── ui/              → Button, Slider, ProgressBar, OptionCard
├── upsell/          → Componentes de las páginas de upsell
└── quiz/            → Componentes V1 (referencia, no se usan)

lib/
├── constants.ts     → ⭐ Constantes transversales (claves de localStorage). SINGLE SOURCE OF TRUTH
├── quiz-v2/
│   ├── config.ts        → ⭐ Contenido del funnel: producto, experta, tipos de resultado, bonus
│   ├── localization.ts  → ⭐ Precios y textos por país (AR, CO, PE, MX, CL)
│   ├── data.ts          → Las 22 slides (preguntas)
│   ├── types.ts         → Tipos de TypeScript del quiz
│   ├── store.ts         → Estado del quiz (Zustand + persist)
│   ├── helpers.ts       → Cálculo de diagnóstico, IMC, proyección de peso
│   ├── CountryContext.tsx / useCountryLocale.ts → Localización por país
│   └── index.ts         → Barrel export del módulo
├── pwa/             → Data de plan, recetas, ritual, foods, sesión, acceso, etc.
├── admin/           → Auth + store del admin (memory / supabase)
├── email/           → Resend + emails de follow-up (opcional; el acceso lo manda el email de Shopify)
├── cookies.ts       → Lectura de cookies y captura de UTMs (browser-safe)
├── supabase.ts      → Cliente Supabase server-side
└── tracking.ts      → CAPI Meta (server-side)
```

> Migraciones de Supabase en `supabase/migrations/` (incluye `003_create_purchases.sql`,
> la tabla que habilita el acceso a la PWA).

## ⭐ Fuente única de verdad (single source of truth)

El objetivo de la última refactorización es que **cambiar algo se haga en UN solo lugar** y no haya que perseguir strings duplicados por todos los componentes.

| Qué querés cambiar | Dónde se cambia (único lugar) |
|---|---|
| Nombre del producto / marca | `lib/quiz-v2/config.ts` → `PRODUCT_NAME`, `PRODUCT_SHORT_NAME` |
| Experta / autoridad | `lib/quiz-v2/config.ts` → `EXPERT_NAME`, `EXPERT_TITLE`, `EXPERT_IMAGE` |
| URL de checkout | `lib/quiz-v2/config.ts` → `CHECKOUT_URL` (lee env var) |
| Nombres de los 4 tipos de resultado | `lib/quiz-v2/config.ts` → `QUIZ_RESULT_TYPE_NAMES` |
| Bullets / value stack / bonus por tipo | `lib/quiz-v2/config.ts` → `REFRAME_BULLETS`, `EXTRA_VALUE_ITEMS`, `getBonusTitle/Desc` |
| Banners estacionales por país | `lib/quiz-v2/config.ts` → `SEASON_BANNER`, `SEASON_DISCOUNT` |
| Precios y textos por país | `lib/quiz-v2/localization.ts` |
| Preguntas del quiz | `lib/quiz-v2/data.ts` |
| Claves de localStorage | `lib/constants.ts` → `STORAGE_KEYS` |
| Lógica de diagnóstico / IMC | `lib/quiz-v2/helpers.ts` |

> Para reutilizar el funnel con otro nicho, los 3 archivos que definen la temática son
> `config.ts` + `localization.ts` + `data.ts`. El resto es infraestructura genérica.

## Convenciones de nombres

Para mantener el código consistente y reutilizable:

- **Componentes y tipos:** `PascalCase` (ej: `SlideSalesPage`, `QuizAnswers`, `DiagnosisResult`).
- **Variables y funciones:** `camelCase` (ej: `calcularDiagnostico`, `secondsLeft`).
- **Constantes exportadas / config:** `UPPER_SNAKE_CASE` (ej: `QUIZ_RESULT_TYPE_NAMES`, `CHECKOUT_URL`, `STORAGE_KEYS`).
- **Identificadores genéricos sobre específicos del nicho:** las constantes y tipos del código usan nombres genéricos de quiz (ej: `QUIZ_RESULT_TYPE_NAMES`) en vez de nombres atados a la temática. Así, cambiar el nicho no obliga a renombrar identificadores en todo el repo — sólo se cambian los **valores** en la config.
- **El texto que ve el usuario** (copy de la sales page, FAQ, testimonios) sí menciona la temática real del producto y vive como **datos** en `config.ts` / `localization.ts`, no hardcodeado en los componentes.

## Quiz funnel — flujo de slides

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
13. Peso ideal (slider con límites dinámicos: default = actual−10, min = actual−30, max = actual; muestra "Querés bajar X kg")
14. Embarazos
15. Rutina diaria
16. Horas de sueño
17. Agua por día
18. Expert bridge ("Tu diagnóstico personalizado" — Lic. Natalia Reyes MN 9283 + credenciales)
19. Diagnóstico (3 barras con descripción + pill de riesgo + burbuja de urgencia)
20. Loading (pasos con checks animados)
21. Sales page (informe personalizado + proyección de peso + precio $6.000 ARS, countdown 15 min, garantía)
```

### Detalles de slides clave

- **13 · Peso ideal** (`SlideNumberSlider`): los límites se calculan según el peso
  actual ya ingresado — `max = peso actual`, `min = peso actual − 30` (piso 40),
  `default = peso actual − 10`. Debajo del número muestra _"Querés bajar X kg —
  ¡Es totalmente alcanzable con tu plan personalizado!"_.
- **18 · Expert bridge** (`SlideExpertBridge`): encabezado "Tu diagnóstico
  personalizado", atribuye el plan a la Lic. Natalia Reyes (creadora del Método
  del Agua de Arroz) e incluye credenciales académicas (UBA / SAN / posgrado
  Barcelona, como copy de marca). CTA: "Generar mi diagnóstico personalizado".
- **19 · Diagnóstico** (`SlideDiagnosisResult`): pill "⚠️ Diagnóstico Finalizado",
  **descripción debajo de cada barra** (qué significa cada %) y **una única
  burbuja de urgencia** ("estado de emergencia… 100% reversible") antes del CTA.
- **21 · Sales page** (`SlideSalesPageV3`): debajo de "Basado en tu perfil
  digestivo" va el **Informe personalizado** (diagnóstico inicial en bullets +
  recomendaciones dinámicas + cierre firmado por la Lic.), y después la
  **proyección de peso** (imagen before-after arriba del peso, sin bloque de IMC).
  El countdown es de **15 minutos**.

## Diagnóstico

3 métricas calculadas dinámicamente en `lib/quiz-v2/helpers.ts`:
- **Nivel de Inflamación** (62-97%) — basado en tipo cuerpo, zona, obstáculos, sueño, agua
- **Riesgo de Acumulación** (55-95%) — basado en rutina, embarazos, tipo cuerpo
- **Eficiencia Metabólica** (8-35%) — basado en sueño, agua, rutina, tipo cuerpo

Siempre genera valores "dramáticos" para cualquier respuesta realista del target.
Cada barra muestra una **descripción** personalizada (helper `getBarDescriptions`)
y el slide cierra con una **burbuja de urgencia** (`getDiagnosisUrgency`).

El **informe personalizado** de la sales page se arma con `getInformeResumen`
(diagnóstico inicial en bullets) y `getRecomendaciones` (recomendaciones dinámicas
según objetivo, sueño, tiempo y agua).

Los 4 **tipos de resultado** (`QUIZ_RESULT_TYPE_NAMES` en `config.ts`) se derivan del nivel de inflamación.

## Estética

- **Paleta:** Terracota (#C0553A) + peach (#FFF5F0) + blanco cálido (#FFFAF7)
- **Fonts:** DM Serif Display (headlines) + Plus Jakarta Sans (body)
- **Vibe:** Femenino, cálido, cercano, salud accesible

## Integraciones externas (no se renombran)

Estos identificadores son contratos con servicios externos. Cambiarlos rompe el matching/reporting, así que **se mantienen tal cual** aunque mencionen la temática:

- **Meta (Pixel + CAPI):** nombres de eventos, `content_name`, `content_category`. Definidos en los componentes y en `lib/tracking.ts`.
- **Supabase:** nombres de tablas (`clientes`, `purchases`) y columnas (incluida `tipo_hinchazon` y `hotmart_transaction`, que para Shopify guarda `shopify_<order.id>`).
- **Shopify:** firma de los webhooks (`X-Shopify-Hmac-Sha256`), topic `orders/paid`, campos del payload (`email`, `line_items`, `total_price`) y el secret de firma.
- **Hotmart (legacy):** campos de los webhooks (`hottok`, `product_id`, etc.).
- **Variables de entorno:** los nombres de las env vars (`NEXT_PUBLIC_*`, etc.).

## Variables de entorno

Ver `.env.local.example` para la lista completa y comentada. Las principales:

```env
# Tracking
NEXT_PUBLIC_META_PIXEL_ID=          # Meta Pixel ID (client-side)
META_PIXEL_ID=                      # Meta Pixel ID (server-side, sin NEXT_PUBLIC)
META_CAPI_TOKEN=                    # Meta CAPI access token

# Checkout / funnel (Shopify)
NEXT_PUBLIC_CHECKOUT_URL=                # Permalink de carrito Shopify (front)
NEXT_PUBLIC_UPSELL_CHECKOUT_URL=         # Permalink de carrito Shopify (upsell)
NEXT_PUBLIC_DOWNSELL_CHECKOUT_URL=       # Permalink de carrito Shopify (downsell)
NEXT_PUBLIC_PWA_BASE_URL=                # Base de la PWA (a donde va el "no gracias")
SHOPIFY_WEBHOOK_SECRETS=                 # Secret(s) HMAC del webhook (coma-separados = multi-tienda)
# Legacy (fallback): NEXT_PUBLIC_HOTMART_CHECKOUT_URL, NEXT_PUBLIC_HOTMART_UPSELL_CHECKOUT_URL,
#                    NEXT_PUBLIC_HOTMART_DOWNSELL_CHECKOUT_URL, HOTMART_HOTTOK

# Admin
ADMIN_PASSWORD=                     # Password panel admin
FUNNEL_STORE=supabase               # memory | supabase

# PWA
NEXT_PUBLIC_PWA_TEST_MODE=true      # true = sin Supabase (dev)
PWA_SESSION_SECRET=                 # HMAC de la sesión PWA (prod)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Emails (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_SITE_URL=
```

## Imágenes necesarias

Todas en `/public/img/`:

| Archivo | Qué es |
|---|---|
| `natalia-reyes.jpg` | Foto nutricionista (800×800, cuadrado) |
| `noticia-viral.jpg` | Screenshot real de Infobae, vertical (se muestra completo, sin recortar) |
| `landing-hook.jpg` | Hero infográfica agua de arroz + beneficios (800×500) |
| `before-after.png` | Antes/después (hinchada → panza plana). Se muestra en la proyección de la sales page |
| `body-en-forma.png` | Tipo de cuerpo — emoji 3D femenino, mismo personaje, 1:1 (slide 2) |
| `body-unos-kilos.png` | Tipo de cuerpo — emoji 3D femenino, mismo personaje, 1:1 (slide 2) |
| `body-sobrepeso.png` | Tipo de cuerpo — emoji 3D femenino, mismo personaje, 1:1 (slide 2) |
| `body-plus-size.png` | Tipo de cuerpo — emoji 3D femenino, mismo personaje, 1:1 (slide 2) |

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local  # completar variables
npm run dev      # servidor de desarrollo
npm run build    # build de producción (incluye type-check)
npm start        # servir el build
```

> Nota: `npm run lint` es interactivo porque no hay un `.eslintrc` commiteado.
> El type-check de `next build` valida los tipos y es la fuente de verdad de CI.

## Deploy

Push a `main` → Vercel autodeploy.

## Changelog

### Migración a Shopify + mejoras del quiz (actual)

- **Cobro Hotmart → Shopify** (Mercado Pago, ARS). Nuevo `app/api/shopify-webhook`
  (valida HMAC `X-Shopify-Hmac-Sha256`, escribe `purchases`, dispara `Purchase` a
  Meta CAPI). Las env vars de checkout pasan a ser provider-neutral
  (`NEXT_PUBLIC_CHECKOUT_URL`, etc.) con fallback legacy a las `NEXT_PUBLIC_HOTMART_*`.
- **Precios:** upsell **$19.900**, downsell **$12.900** (front $6.000).
- **`/upsell` y `/downsell`** ya no usan iframe: **redirigen** al checkout de
  Shopify (no permite embed).
- **Acceso PWA sin tiers:** cualquier compra aprobada habilita acceso completo
  (`lib/pwa/access.ts`).
- **Migración `supabase/migrations/003_create_purchases.sql`** (idempotente).
- Se quitaron Systeme.io y Resend del flujo post-compra (el acceso lo entrega el
  email nativo de Shopify).

**Ajustes del quiz**
- `viral_news`: muestra el **screenshot real de Infobae** completo (antes lo
  recortaba y reconstruía la nota).
- Slide **peso ideal** con límites dinámicos (default actual−10, min actual−30,
  max actual) + texto "Querés bajar X kg".
- **Expert bridge** con encabezado "Tu diagnóstico personalizado" + credenciales.
- **Diagnóstico** con pill de riesgo, descripción por barra y burbuja de urgencia
  (una sola).
- **Sales page**: informe personalizado (bullets + recomendaciones dinámicas +
  cierre firmado) debajo de "Basado en tu perfil"; proyección con imagen
  before-after arriba del peso y **sin bloque de IMC**; countdown **15 min**;
  fix de copy ("analicé").
- Fixes menores: emoji de "Espalda" en `donde_acumula`, y se quitó el ✅
  redundante del loading.

### Refactor de mantenibilidad (previo)

Centralizó el contenido del funnel y eliminó duplicación, para que un cambio de
temática/marca no obligue a tocar muchos archivos:

- **`lib/constants.ts`** — `STORAGE_KEYS` como fuente única de las claves de
  localStorage (`quizState`, `utm`). Se conservan los valores de string históricos
  para no invalidar el estado ya persistido en navegadores reales.
- **`lib/quiz-v2/config.ts`** — `QUIZ_RESULT_TYPE_NAMES` como única definición de
  los 4 tipos de resultado (`TIPO_NOMBRES` queda como alias `@deprecated`).
- **De-duplicación** del mapa de tipos que estaba copiado en 4 lugares.
- **Claves de localStorage centralizadas** en `cookies.ts`, `store.ts` y las sales pages.

| Antes (identificador en código) | Ahora |
|---|---|
| `TIPO_NOMBRES` (definido 4 veces) | `QUIZ_RESULT_TYPE_NAMES` (1 sola definición; `TIPO_NOMBRES` = alias deprecado) |
| `TIPOS_HINCHAZON` (código muerto) | eliminado |
| `'agua-arroz-quiz-v3'` (hardcodeado) | `STORAGE_KEYS.quizState` |
| `'anti-hinchazon-utms'` (hardcodeado en 3 lugares) | `STORAGE_KEYS.utm` |

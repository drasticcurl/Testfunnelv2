# Método del Agua de Arroz — Quiz Funnel multi-país

Quiz funnel de 22 slides para vender un protocolo de deshinchado y baja de
peso basado en agua de arroz. **Hispanohablantes en Chile, Colombia, México,
Perú y EE.UU.** El motor del quiz está diseñado para ser **reutilizable**: el
contenido (temática, precios, textos) vive centralizado y el resto es
infraestructura genérica.

> **Argentina y Brasil están fuera de esta versión.** AR no se vende desde
> este proyecto y BR queda bloqueado a nivel middleware.

## Qué se vende

**Producto:** "Protocolo Chau Hinchazón" — un **producto digital** (no físico,
sin envío) basado en el **Método del Agua de Arroz**. Es un plan
antiinflamatorio para **deshinchar la panza y bajar de peso** en mujeres,
presentado por la **Lic. Natalia Reyes (MN 9283)** como autoridad de marca.

**Entrega:** al pagar, el acceso se habilita por email; el usuario entra a la
**PWA** (`/pwa/login`) con el email de compra. No se descarga nada de la tienda
de apps (es una web app instalable).

### Embudo (todo en USD, un solo producto Hotmart para los 5 países)

| Paso | Qué es | Precio |
|---|---|---|
| **Front** | Plan 7 días + acceso a la app | **US$19** |
| **Upsell** | Programa 30 días TURBO completo | **US$39** |
| **Downsell** | Mismo Programa 30 días, US$10 menos | **US$29** |

> Hotmart hace la conversión de moneda en su checkout: el comprador chileno ve
> precios en CLP, el mexicano en MXN, etc.; tu cuenta cobra USD.

> El **acceso a la PWA es el mismo** pague lo que pague (no hay tiers): cualquier
> compra aprobada habilita todo. El precio mayor del Programa 30 días es por el
> **contenido extra** (recetas/guías), no por desbloquear features de la app.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + CSS custom properties
- **State:** Zustand (persistido en localStorage)
- **Animaciones:** Framer Motion
- **Tracking:** Meta Pixel + Conversions API server-side
- **Hosting:** Vercel
- **DB:** Supabase (`clientes`, `purchases`, `funnel_counts`)
- **Checkout:** Hotmart (un solo producto en USD para los 5 países)


## ⚡ Quick start

```bash
# 1. Clonar e instalar
git clone https://github.com/...
cd Testfunnelv2
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local
# (editar .env.local con tus valores reales)

# 3. Crear las tablas en Supabase
#    Abrir Supabase Dashboard → SQL Editor → New query
#    Pegar el contenido entero de `supabase/setup.sql` y ejecutarlo.
#    (idempotente: tarda <5s, no rompe si ya hay tablas)

# 4. Levantar el dev server
npm run dev      # http://localhost:3000
```

> El **único SQL que necesitás correr** es `supabase/setup.sql`. Las
> migraciones individuales en `supabase/migrations/*.sql` son referencia
> histórica del proyecto anterior — `setup.sql` ya las consolida.


## 🌎 Países soportados y rutas SEO

| Código | País | Ruta del ad | Modismo | Método de pago listado |
|---|---|---|---|---|
| `CL` | 🇨🇱 Chile      | `/chile`    | "guata"    | Webpay |
| `CO` | 🇨🇴 Colombia   | `/colombia` | "barriga"  | PSE |
| `MX` | 🇲🇽 México     | `/mexico`   | "pancita"  | OXXO |
| `PE` | 🇵🇪 Perú       | `/peru`     | "barriga"  | Yape |
| `US` | 🇺🇸 EE.UU.     | `/usa`      | "abdomen"  | PayPal · Amex |

**Cada ruta SEO fuerza el país** en el CountryContext → precios, modismos,
imagen del periódico y método de pago aparecen correctos desde el primer
render (sin flicker mientras se resuelve la geo-IP).

**Tráfico orgánico** (alguien que entra a `/` o a `/quiz` directo): el quiz
auto-detecta el país por **(1)** `?country=XX` en la URL → **(2)** localStorage
de visita previa → **(3)** geo-IP via ip-api.com → **(4)** fallback CL.

### Cómo agregar un país

1. Sumar el código al type `CountryCode` en `lib/quiz-v2/localization.ts`.
2. Agregar entrada en `TEXTS_BY_COUNTRY`, `QUIZ_OVERRIDES` y
   `SOCIAL_PROOF_OVERRIDES`. Copiá uno parecido y ajustá el modismo.
3. Sumar el código al `CHECK` de `country` en `supabase/setup.sql` (3 lugares).
4. Crear `app/{slug}/page.tsx` (copiar `app/chile/page.tsx`).
5. Subir la imagen del periódico a `public/img/noticia-viral-{cc}.jpg`
   (ver `public/img/NOTICIA-VIRAL-README.md` para sugerencias y specs).

### Cómo cambiar la imagen del periódico de un país

Reemplazar el archivo `public/img/noticia-viral-{cc}.jpg`. Las dimensiones
recomendadas son 900×1342 px (vertical). Si el archivo no existe, el slide
muestra un fallback de texto con el nombre del medio sugerido (en
`SOCIAL_PROOF_OVERRIDES[CC].socialProofSource`).


## 💳 Cobro con Hotmart

Hotmart cobra **un único producto en USD** para los 5 países. El flujo:

1. Usuario completa el quiz en `/chile` (o `/colombia`, etc.).
2. Click en "OBTENER MI PLAN" → checkout de Hotmart con la atribución
   codificada en `?xcod=country=CL&utm_source=facebook&utm_campaign=...`.
   Ver `lib/cookies.ts → withCheckoutAttribution`.
3. Hotmart cobra y dispara el webhook `PURCHASE_APPROVED` →
   **`/api/hotmart-webhook`**.
4. El webhook valida el `hottok`, parsea `xcod` para extraer UTMs + país,
   inserta en `purchases` (status='approved'), dispara `Purchase` a Meta CAPI
   y registra la venta en `funnel_counts` (visible en `/admin/funnel`).
5. Acceso a la PWA: `/pwa/login` busca esa compra aprobada por email y firma
   la sesión.

### Configurar el webhook en Hotmart

En Hotmart Admin → **Tools → Webhooks**:

- **URL:** `https://TU-DOMINIO/api/hotmart-webhook`
- **Eventos:** `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_REFUNDED`,
  `PURCHASE_CHARGEBACK`, `PURCHASE_CANCELED`.
- **HOTTOK:** copialo y pegalo en `HOTMART_HOTTOK` en tu `.env.local` /
  Vercel env vars. Sin esto cualquiera puede mandar compras falsas.

### Cómo se atribuye la venta a un país

El frontend, antes de redirigir al checkout de Hotmart, codifica
`country=CL&utm_source=facebook&...` dentro de `?xcod=...`. Hotmart preserva
el `xcod` y lo devuelve en el webhook (`purchase.tracking.source` o
`purchase.origin.xcod`). El webhook lo parsea con `URLSearchParams` y guarda
los campos en `purchases.country`, `purchases.utm_*`, etc.

**Fallbacks de país** (orden de confiabilidad):
1. `xcod.country` (lo más confiable: lo set la ruta SEO)
2. `purchase.checkout_country.iso` (geo-IP del checkout de Hotmart)
3. `buyer.address.country_iso` / `buyer.address.country`
4. `buyer.country`
5. NULL (la compra queda sin país)

> Si la compra es un upsell/downsell sin UTMs/país (porque el usuario volvió
> después y se perdió el localStorage), el webhook **hereda** la atribución de
> la compra previa del mismo email.


## 📊 Admin (`/admin`)

Password-gate con `ADMIN_PASSWORD` (HMAC-firmed cookie, rate-limit por IP).

| Vista | URL | Qué ves |
|---|---|---|
| Resumen | `/admin` | KPIs hero (revenue, ventas, leads), embudo de hoy, top campañas |
| Embudo | `/admin/funnel` | Drop-off slide-by-slide, **filtro por día y por país**, atribución por campaña, **breakdown por país** |
| Leads | `/admin/leads` | KPIs de captura + export CSV (con columna `Country`, **filtro por país opcional**) |
| Ventas | `/admin/ventas` | Revenue real desde `purchases`, **filtro multi-select por campaña/fuente/país**, **breakdown por país** |

Backend del funnel: `FUNNEL_STORE=supabase` (default recomendado) usa la
tabla `funnel_counts`. `FUNNEL_STORE=memory` solo persiste durante el proceso
(útil para dev local sin DB).


## 📁 Estructura del proyecto

```
app/
├── chile/, colombia/, mexico/, peru/, usa/  → Rutas SEO por país (forzan el locale)
├── quiz/                                    → Quiz con auto-detect de país (fallback)
├── pwa/                                     → PWA post-compra
├── admin/                                   → Dashboard admin
├── api/
│   ├── track/                → CAPI Meta + eventos al funnel store
│   ├── submit-quiz/          → Lead al completar el quiz (CAPI + Supabase + país)
│   ├── hotmart-webhook/      → Webhook único de Hotmart (compras + UTMs + país)
│   ├── pwa/auth/             → Login PWA con HMAC
│   ├── pwa/webhook/hotmart/  → Proxy deprecated → /api/hotmart-webhook
│   └── admin/                → Endpoints del dashboard
├── upsell/                   → Página VSL post-compra del front
├── downsell/                 → Página de "última oportunidad"
└── legal/                    → Privacidad y términos

components/
├── quiz-v2/         → Componentes del quiz V3 (agua de arroz)
│   ├── QuizContainerV2.tsx     → Orquesta los 22 slides
│   ├── CountryQuizPage.tsx     → Wrapper que envuelve con CountryProvider
│   └── Slide*.tsx              → Cada slide individual
├── pwa/             → Componentes de la PWA
├── upsell/          → Componentes del upsell/downsell
├── ui/              → Button, Slider, ProgressBar, OptionCard
└── admin/           → ui.tsx, FunnelShape, etc.

lib/
├── quiz-v2/
│   ├── config.ts               → ⭐ Producto, experta, checkout URLs, PRICING (USD)
│   ├── localization.ts         → ⭐ Precios y textos por país (CL/CO/MX/PE/US)
│   ├── data.ts                 → Las 22 slides
│   ├── store.ts                → Estado del quiz (Zustand + persist)
│   ├── helpers.ts              → Cálculo de diagnóstico, IMC, proyección
│   ├── CountryContext.tsx      → React Context con `forced` opcional
│   └── useCountryLocale.ts     → Hook con detección URL/localStorage/IP
├── admin/           → Auth + store del admin (memory / supabase)
├── pwa/             → Sesión PWA, acceso, datos del plan/recetas
├── cookies.ts       → UTMs + atribución Hotmart (xcod)
├── constants.ts     → STORAGE_KEYS (country, utm, quizState)
├── supabase.ts      → Cliente Supabase server-side
└── tracking.ts      → CAPI Meta server-side
```


## ⭐ Fuente única de verdad (single source of truth)

El objetivo de la arquitectura es que **cambiar algo se haga en UN solo lugar**:

| Qué querés cambiar | Dónde se cambia |
|---|---|
| Nombre del producto | `lib/quiz-v2/config.ts` → `PRODUCT_NAME` |
| Experta / autoridad | `lib/quiz-v2/config.ts` → `EXPERT_NAME`, `EXPERT_TITLE`, `EXPERT_IMAGE` |
| URL de checkout (Hotmart) | env `NEXT_PUBLIC_HOTMART_CHECKOUT_URL` (front) y sus pares |
| Precios USD del embudo | `lib/quiz-v2/config.ts` → `PRICING` |
| Precios mostrados al usuario | `lib/quiz-v2/localization.ts` → `PRICING_BY_COUNTRY` (todos los países apuntan al mismo `USD_PRICING`) |
| Banner estacional por país | `lib/quiz-v2/config.ts` → `SEASON_BANNER`, `SEASON_DISCOUNT` |
| Modismos / textos / FAQ por país | `lib/quiz-v2/localization.ts` → `TEXTS_BY_COUNTRY` |
| Imagen del periódico por país | `public/img/noticia-viral-{cc}.jpg` (config en `SOCIAL_PROOF_OVERRIDES`) |
| Preguntas del quiz | `lib/quiz-v2/data.ts` |
| Bullets/value stack/bonus por tipo | `lib/quiz-v2/config.ts` → `REFRAME_BULLETS`, `EXTRA_VALUE_ITEMS`, `getBonusTitle/Desc` |
| Países bloqueados | env `BLOCKED_COUNTRIES=BR,VE` |
| Claves de localStorage | `lib/constants.ts` → `STORAGE_KEYS` |


## 🎨 Imágenes necesarias

Todas en `/public/img/`:

| Archivo | Qué es |
|---|---|
| `natalia-reyes.jpg` | Foto nutricionista (800×800 cuadrado) |
| `noticia-viral-{cl,co,mx,pe,us}.jpg` | Screenshot del periódico local por país (900×1342 vertical). Ver `public/img/NOTICIA-VIRAL-README.md` |
| `landing-cover.png` | Hero del slide 0 |
| `landing-hook.jpg` | Hero infográfica agua de arroz |
| `before-after.png` | Antes/después (sales page) |
| `body-en-forma.png`, `body-unos-kilos.png`, `body-sobrepeso.png`, `body-plus-size.png` | Tipos de cuerpo (slide 2) |


## 🛠️ Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción (incluye type-check)
npm start        # Servir el build
```

> El type-check de `next build` valida los tipos y es la fuente de verdad de CI.


## 🚀 Deploy

Push a `main` → Vercel autodeploy.

**Antes del primer deploy en producción:**

1. Crear el proyecto en Supabase y correr `supabase/setup.sql` en su SQL Editor.
2. Crear el producto, upsell y downsell en Hotmart. Copiar las 3 URLs.
3. Configurar el webhook en Hotmart apuntando a `/api/hotmart-webhook` y
   copiar el `HOTTOK`.
4. Configurar el Pixel de Meta y generar el token de CAPI.
5. Cargar todas las env vars de `.env.local.example` en Vercel.
6. (Opcional) Subir las imágenes de noticia viral por país.

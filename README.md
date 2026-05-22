# Quiz Funnel Template — Low-Ticket Health/Wellness

> **Proyecto base reutilizable** para quiz funnels de low-ticket ($7-$27 USD) en nichos de salud/bienestar. Cambiar nicho = cambiar copy + imágenes + producto en Hotmart. La arquitectura, tracking, emails y admin se reusan tal cual.

**Instancia actual:** Protocolo Anti-Hinchazón 7 días · $9.990 ARS · Mujeres 30-55 Argentina/LATAM

---

## Por qué cada decisión existe

### Referentes y frameworks usados

| Referente | Qué tomamos | Link |
|-----------|-------------|------|
| **Alen Sultanic** (Automatic Clients) | "Hidden Architecture": el quiz NO busca gente lista para comprar, sino que TRANSFORMA el problem-state en solution-state via preguntas funcionales | [LeadsHook](https://www.leadshook.com/alen-hidden-architecture-of-quiz-funnels/) |
| **Ryan Levesque** (ASK Method) | Diagnose → Recommend → Convert. Segmentar por respuestas y prescribir la solución | [MemberSherpa](https://www.membersherpa.com/the-ask-method-complete-overview-for-membership-websites/) |
| **Noom / BetterMe** | Marathon onboarding (50+ preguntas), loading screen largo con investment-building, paywall post-commitment | [RevenueCat](https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel) |
| **Maria Wendt** | Low-ticket como self-liquidating offer: el fee financia el ad spend | [Blog](https://www.mariawendt.com/low-ticket-offer-funnel/) |
| **Dr. Kellyann** | Quiz + longform LP en nicho digestivo/hinchazón. Promesas con número + tiempo | [Quiz](https://drkellyann.com/pages/dka-bb-three-reasons-quiz-v2) |
| **Funnel of the Week** | 26-step MIFGE quiz, múltiples quiz funnels por producto | [Blog](https://blog.funneloftheweek.com/) |
| **Emma Relief** | Quiz de "30 seconds" para digestión → VSL → supplement | [Quiz](https://emmarelief.com/pages/digestionquiz) |

### Decisiones de diseño del quiz (y por qué)

| Decisión | Razón | Alternativa descartada |
|----------|-------|----------------------|
| Primera pregunta = emocional ("qué te trajo") | Abre problem-state (Sultanic). Valida que estás en el lugar correcto | Pregunta de edad (fría, demográfica, no genera engagement) |
| Nombre en slide propio después de info_3 | Se siente como "1 pregunta más", no como form. Permite personalizar slides posteriores | Nombre opcional al final del email (bajo fill-rate, no personaliza) |
| Header "Carolina, ya casi tenemos tu plan" post-nombre | Refuerza personalización, reduce abandon | Sin header (genérico) |
| Testimonio pre-email (info_card antes del email gate) | Social proof justo antes de pedir dato sensible. Reduce ~15% abandon | Pedir email sin contexto |
| Loading 12s con checkmarks + testimonios | Investment-building (BetterMe/Noom). Más largo = más valor percibido. Sunk-cost psychology | Loading 4s (muy corto, no construye expectativa) |
| Sin yes-set questions (eliminados los 3 "sí/sí/sí") | Se sienten manipuladores. Mujeres 30-55 LATAM detectan yes-ladders | 3 yes-sets en fila (patrón 2019, quemado) |
| Preguntas "objetivo" + "compromiso" en su lugar | Datos reales + compromiso temporal sin forzar un "sí" | Yes-ladder |
| Info card #1 = infografía SVG hardcoded (73%/27%) | No depende de Cloudinary (falla en 3G LATAM), siempre carga | Imagen Cloudinary (falla en conexiones lentas) |
| Info card #2 = educacional con fuente (Cleveland Clinic) | No usar claims numéricos sin fuente (riesgo compliance Meta) | "86% reportaron..." sin fuente |
| Síntomas reducidos a 6 | Cabe sin scroll en mobile. Las 2 eliminadas eran vagas ("mala digestión") | 8 opciones (scroll obligatorio) |

### Decisiones de la página de resultados

| Decisión | Razón |
|----------|-------|
| DiagnosticoHero con percentil + media | "Tu severidad 7/10 está por encima del 78%" genera wow-effect |
| ResumenRespuestas con síntomas reales (no template) | "gases, pesadez, panza marcada" > "3 síntomas y otros" |
| PorQueFracaso con branch para "nada todavía" | Copy distinto para quien no probó nada (positivo vs reframe) |
| PresentacionProducto fondo sage-soft (no dark) | Legibilidad en sol/mobile LATAM. Mujeres 40+ con poco contraste |
| Bullets reducidos a 6 | Sin "Calculadora de microbiota" (vago/no demostrable) |
| PrecioStack con bonus sumados ($44.930 total) | Anclaje de valor más alto = precio se percibe más barato |
| CTAMid sin "primeras 500" | Scarcity no verificable = riesgo credibilidad |
| Garantía 30 días (no 7) | Estándar industria. Reduce friction. Costo de refund bajo en low-ticket |
| BioCreadora entre Producto y Testimonios | En salud, cara visible = +10-20% conversión |
| FAQ con SOP/hipotiroidismo/endo | Objeciones reales del target (condiciones comórbidas) |

---

## Flujo completo (de punta a punta)

```
[Meta/Google Ad con UTMs]
   ↓
[/quiz]                      15 slides interactivos (2 min)
   ├── 0  Apertura (emocional)
   ├── 1  Momento del día
   ├── 2  Tiempo con problema
   ├── 3  Infografía 73%/27%
   ├── 4  Síntomas (multi, 6 opts)
   ├── 5  Qué probó (multi)
   ├── 6  Info educacional (intestino)
   ├── 7  Impacto emocional
   ├── 8  Info 3 causas
   ├── 9  NOMBRE (obligatorio)
   ├── 10 Objetivo
   ├── 11 Compromiso
   ├── 12 Testimonio pre-email
   ├── 13 EMAIL (obligatorio)
   └── 14 Loading (12s, checkmarks + testimonios)
   ↓
[/resultados?params...]      Carta de venta dinámica personalizada
   ├── DiagnosticoHero (tipo + severidad + percentil)
   ├── ResumenRespuestas (mirror effect)
   ├── PorQueFracaso (reframe)
   ├── LasTresCausas (educación)
   ├── MicroSocialProof (+1.847 test-takers)
   ├── PresentacionProducto (6 bullets + mockups)
   ├── BioCreadora (nutricionista)
   ├── CTAMid
   ├── TablaComparativa (nutricionista vs dietas vs protocolo)
   ├── ComoFunciona (3 pasos)
   ├── Testimonios (WhatsApp + cards)
   ├── ParaQuienNoEs (disqualification)
   ├── PrecioStack ($44.930 → $9.990)
   ├── Garantia (30 días)
   ├── CTAFinal (Pixel InitiateCheckout 9990 ARS)
   ├── FAQ (12 preguntas)
   └── StickyCTA (aparece al 30% scroll)
   ↓
[Hotmart Checkout]           pay.hotmart.com con UTMs pasados
   ↓
[Webhook /api/hotmart-webhook]
   ├── Supabase: purchases table
   ├── Meta CAPI: Purchase event
   └── Systeme.io: tag "comprador"
   ↓
[/pwa/login → /pwa/dashboard]  Producto entregado (PWA interactiva)
```

---

## Stack técnico

| Capa | Tecnología | Para qué |
|------|-----------|----------|
| Framework | Next.js 14 (App Router) | SSR + API routes + ISR |
| Lenguaje | TypeScript strict | Type safety |
| Estilos | Tailwind CSS 3.4 | Utility-first, mobile-first |
| Animaciones | Framer Motion 11 | Quiz transitions |
| State client | Zustand 4 | Quiz store (persiste en localStorage) |
| Forms | react-hook-form + Zod | Validación email/nombre |
| DB | Supabase Postgres | Leads, purchases, funnel events |
| Emails | Resend | Transaccional post-quiz |
| Pagos | Hotmart | Checkout + webhooks |
| Tracking | Meta Pixel + CAPI | Client + server dedup |
| CRM | Systeme.io | Tags segmentados |
| Hosting | Vercel | Edge + serverless |
| Dominio | Cloudflare → hilvanapp.com | DNS + proxy |
| Admin | Custom (/admin/funnel) | Embudo SVG + UTM breakdown |

---

## Base de datos (Supabase)

### Tabla `clientes` — leads del quiz

```sql
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,              -- email capturado en el quiz
  nombre TEXT,                      -- nombre (slide 9)
  apertura TEXT,                    -- qué le trajo
  momento TEXT,                     -- momento del día
  tiempo TEXT,                      -- hace cuánto
  sintomas TEXT[],                  -- array de síntomas seleccionados
  ya_probo TEXT[],                  -- array de cosas que probó
  impacto_emocional TEXT,           -- cómo se siente
  objetivo TEXT,                    -- qué quiere lograr
  compromiso TEXT,                  -- cuánto tiempo puede dedicar
  tipo_hinchazon SMALLINT,          -- 1-4 (calculado por el quiz)
  severidad SMALLINT,               -- 0-10 (calculado por el quiz)
  fbc TEXT,                         -- Meta click ID
  fbp TEXT,                         -- Meta browser ID
  email_enviado BOOLEAN DEFAULT FALSE,  -- si Resend envió el email 1
  compro BOOLEAN DEFAULT FALSE,     -- si completó la compra (webhook)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX clientes_email_idx ON public.clientes (email);
```

**Cómo se llena:** `/api/submit-quiz` hace upsert automáticamente cuando alguien completa el quiz.

**Cómo se usa:**
- Email 1 (Resend): lee tipo + severidad + nombre para personalizar
- Email 2/3 (futuro): filtra `WHERE compro = false AND email_enviado = true`
- Admin: queries de cohortes

### Tabla `funnel_events` — tracking del embudo

```sql
CREATE TABLE public.funnel_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,         -- QuizProgress, ViewContent, CheckoutClick, Purchase
  slide INTEGER,                    -- slide index (1-indexed)
  question_id TEXT,                 -- id del slide (ej: "apertura", "email")
  experiments JSONB DEFAULT '{}',   -- variantes A/B asignadas
  utms JSONB DEFAULT '{}',          -- {utm_source, utm_medium, utm_campaign, utm_content}
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Cómo se llena:** `/api/track` inserta 1 row por cada evento.

**Cómo se usa:** El admin panel agrega y muestra embudo + UTM breakdown.

### Tabla `purchases` — compras confirmadas

Se llena vía `/api/hotmart-webhook` cuando Hotmart manda `PURCHASE_APPROVED`.

---

## Tracking (cómo fluyen los datos)

```
[Browser]
   ├── Meta Pixel (client): PageView, QuizStart, QuizQ3, Lead, QuizComplete, ViewContent, InitiateCheckout
   ├── /api/track (server): duplica a Meta CAPI + escribe funnel_events
   └── /api/submit-quiz (server): Supabase clientes + Resend + Systeme + CAPI Lead

[Hotmart Webhook → /api/hotmart-webhook]
   ├── Supabase: purchases
   ├── Meta CAPI: Purchase event
   └── Systeme: tag "comprador" + remove "no_comprador"

[Admin /admin/funnel]
   └── Lee funnel_events → agrega → muestra embudo + UTMs
```

### UTMs — atribución

Los UTMs se capturan en la landing (localStorage) y se pasan en CADA evento de tracking al backend. El admin los agrega por combinación source/medium/campaign/content.

**Links de ejemplo:**
```
# Meta Ads
https://chauhinchazon.hilvanapp.com/quiz?utm_source=facebook&utm_medium=cpc&utm_campaign=anti-hinchazon&utm_content={{ad.id}}

# Google Ads
https://chauhinchazon.hilvanapp.com/quiz?utm_source=google&utm_medium=cpc&utm_campaign=anti-hinchazon&utm_content={creative}
```

---

## Emails transaccionales (Resend)

### Email 1 — "Tu diagnóstico está listo" (inmediato post-quiz)

Se dispara automáticamente desde `/api/submit-quiz`. Personalizado con nombre, tipo, severidad, link a /resultados.

**Si no está configurado:** no envía, el funnel sigue funcionando normal.

### Email 2 — Story + 10% off (24h) — TODO
### Email 3 — Last-call (48-72h) — TODO

---

## Panel admin (`/admin/funnel`)

**Acceso:** `/admin` → `ADMIN_PASSWORD` → `/admin/funnel`

**Muestra:**
1. KPIs: Starts, Completes, Clicks, Mayor abandono
2. Embudo SVG horizontal
3. Tabla detalle por slide
4. **Tabla UTM** (source/medium/campaign/content → starts/completes/clicks/compras/CVR%)

---

## Cómo reusar para otro nicho

1. **Copy:** `lib/quiz-data.ts`, `lib/tipos-hinchazon.ts`, `lib/parse-resultados.ts`, `components/resultados/*.tsx`
2. **Estilo:** Ver [`docs/THEMING-GUIDE.md`](docs/THEMING-GUIDE.md) — colores, fonts, paletas pre-armadas
3. **Producto:** Crear en Hotmart, configurar `NEXT_PUBLIC_HOTMART_CHECKOUT_URL`
4. **Tracking:** Pixel + CAPI tokens
5. **Email:** Resend API key + dominio verificado
6. **DB:** Supabase + correr migrations
7. **Deploy:** Push a GitHub → Vercel

---

## Benchmarks (low-ticket health, tráfico Meta frío)

| Métrica | Pobre | Aceptable | Bueno | Excelente |
|---------|-------|-----------|-------|-----------|
| Quiz Start → Complete (email) | <40% | 40-55% | 55-70% | >70% |
| Resultados → Checkout Click | <8% | 8-15% | 15-25% | >25% |
| End-to-end (start → click) | <1.5% | 1.5-3% | 3-5% | >5% |

---

## Variables de entorno

Ver `.env.local.example` para lista completa.

**Críticas:** `NEXT_PUBLIC_HOTMART_CHECKOUT_URL`, `NEXT_PUBLIC_META_PIXEL_ID`, `ADMIN_PASSWORD`

**Opcionales (degradación graceful):** `RESEND_API_KEY`, `SUPABASE_URL`, `META_CAPI_TOKEN`, `SYSTEME_API_KEY`

---

## Comandos

```bash
npm install          # instalar deps
npm run dev          # dev server (localhost:3000)
npm run build        # build producción
npx tsc --noEmit     # typecheck
```

---

## Estructura de archivos (key files)

```
├── app/
│   ├── quiz/page.tsx              → Monta QuizContainer
│   ├── resultados/page.tsx        → Server component, compone secciones
│   ├── admin/funnel/FunnelView.tsx → Embudo + UTMs
│   └── api/
│       ├── track/route.ts         → CAPI + funnel store
│       ├── submit-quiz/route.ts   → Supabase + Resend + Systeme + CAPI
│       └── hotmart-webhook/       → Purchase confirmation
├── components/
│   ├── quiz/                      → QuizContainer, slides, infografías
│   └── resultados/                → Secciones de la carta de venta
├── lib/
│   ├── quiz-data.ts               → Slides declarativos
│   ├── tipos-hinchazon.ts         → Scoring
│   ├── supabase.ts                → Cliente DB
│   ├── email/resend.ts            → Email templates
│   └── admin/store.ts             → FunnelStore + UTM breakdown
├── docs/
│   └── THEMING-GUIDE.md           → Cómo cambiar colores/fonts para otro nicho
└── supabase/migrations/           → SQL para crear tablas
```

---

## Licencia

Privado. No distribuir.

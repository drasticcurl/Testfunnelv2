# AGENTS.md — Sistema multi-chat paralelo

> **Esto es el cerebro del proyecto.** Todos los chats que abras tienen que leer este archivo primero. Define qué hace cada chat, qué archivos comparten y qué archivo es la "fuente de verdad" exclusiva de cada uno.

---

## Qué estamos construyendo

Un quiz funnel low-ticket de un infoproducto digital ("Protocolo Anti-Hinchazón"). El producto es una **PWA interactiva** (no PDFs). Precios: front $9.990 ARS (~$7 USD), upsell $19.990 ARS (~$14 USD). El código cubre desde el ad de Meta hasta el checkout, más la PWA post-compra y un dashboard admin con embudo de analytics en `/admin/funnel`.

```
[Meta Ad]
    ↓
[NUESTRO CÓDIGO — Next.js en Vercel]
   /            → Landing (trackea LandingView)
   /quiz        → 14 slides interactivos
   /resultados  → Carta de ventas dinámica ($9.990)
    ↓
[Click en CTA → trackea CheckoutClick]
    ↓
[HOTMART — checkout]
   Paga $9.990 ARS
    ↓
[/upsell]       → Oferta 30 días por $19.990
[/upsell2]      → Checkout embed del upsell
    ↓
[/pwa/login]    → Acceso al producto (PWA interactiva)
    ↓
[/admin/funnel] → Dashboard con embudo de analytics (protegido)
```

---

## Cómo usar este repo con 12 chats en paralelo

Abrí **12 ventanas/chats** distintos del LLM. A cada uno le pegás:

1. **El contenido completo de `AGENTS.md`** (este archivo)
2. **El contenido de los archivos `_*.md`** que están en la raíz de `/docs` (son referencias compartidas)
3. **El contenido del archivo `NN-XXX.md` que le toca a ese chat**

Después le decís al chat: *"Sos el AGENTE NN. Ejecutá tu tarea según tu doc."*

Listo. Los 12 trabajan en paralelo sin pisarse.

---

## Archivos compartidos (todos los chats los necesitan)

| Archivo | Qué tiene | Quién lo lee |
|---|---|---|
| `docs/_OVERVIEW.md` | Mapa general del funnel y producto | Todos |
| `docs/_AVATAR.md` | Definición del avatar (mujer 32–55, problema, dolor, lenguaje) | Todos los que generen copy |
| `docs/_BRAND-VOICE.md` | Tono, voseo, reglas de copy | Todos los que escriban texto |
| `docs/_DESIGN-SYSTEM.md` | Paleta, tipografía, componentes, tokens | Agentes 01, 02, 03, 04 (frontend) y los de PDFs |
| `docs/_PRODUCT-DATA.md` | Precios, nombres, bullets, valor del stack | Todos |
| `docs/_QUIZ-DATA.md` | Las 10 preguntas del quiz, tipos, severidad, params | Agentes 02, 03, 04 |
| `docs/_METRICAS.md` | Benchmarks y diagnóstico | Agentes 04, 12 |
| `docs/_CHECKLIST.md` | Cronograma del día y minimum viable | Tu (humano), referencia |

---

## Los 12 agentes y qué hace cada uno

| Agente | Doc | Output | Depende de | Bloquea a |
|---|---|---|---|---|
| **01 — LANDING** | `01-LANDING.md` | `/page.tsx` con la landing pre-quiz (slide 1) | Design System, Brand Voice | — |
| **02 — QUIZ** | `02-QUIZ.md` | `/quiz/page.tsx` + componentes + store + slides | Design System, Quiz Data | — |
| **03 — RESULTADOS** | `03-RESULTADOS.md` | `/resultados/page.tsx` con copy completo + dinámica | Design System, Quiz Data, Product Data, Brand Voice | — |
| **04 — API + TRACKING** | `04-API-TRACKING.md` | `/api/submit-quiz` + `/api/track` + Pixel + CAPI | Quiz Data | — |
| **05 — PDF PRINCIPAL** | `05-PDF-PRINCIPAL.md` | `protocolo-anti-hinchazon-7-dias.pdf` | Design System (paleta), Avatar, Brand Voice | 11 (Hotmart) |
| **06 — PDF RECETARIO** | `06-PDF-RECETARIO.md` | `recetario-anti-inflamatorio.pdf` | Design System (paleta) | 11 (Hotmart) |
| **07 — PDF 30 DÍAS** | `07-PDF-30-DIAS.md` | Materiales del upsell 1 (PDF + audios + sheets) | Design System, Avatar | 11 (Hotmart) |
| **08 — CREATIVO 1** | `08-CREATIVO-1.md` | `creativo-1-curiosidad.mp4` | Brand Voice | 12 (Lanzamiento) |
| **09 — CREATIVO 2** | `09-CREATIVO-2.md` | `creativo-2-disrupcion.mp4` | Brand Voice | 12 (Lanzamiento) |
| **10 — CREATIVO 3** | `10-CREATIVO-3.md` | `creativo-3-frustracion.mp4` | Brand Voice | 12 (Lanzamiento) |
| **11 — HOTMART** | `11-HOTMART-SETUP.md` | Productos creados, checkout URL, postback configurado | PDFs (5, 6, 7) listos | 03 (necesita la URL) y 12 |
| **12 — EMAILS + LANZAMIENTO** | `12-EMAILS-Y-LANZAMIENTO.md` | Secuencias en Systeme.io + campaña Meta lanzada | TODO listo | — |

---

## Secuencia óptima de ejecución

```
T+0h  ──┬── 01 LANDING       ┐
        ├── 02 QUIZ           │  Frontend
        ├── 03 RESULTADOS     │  (corren juntos)
        ├── 04 API+TRACKING   ┘
        │
        ├── 05 PDF PRINCIPAL  ┐
        ├── 06 PDF RECETARIO  │  Productos
        ├── 07 PDF 30 DÍAS    ┘  (corren juntos)
        │
        ├── 08 CREATIVO 1     ┐
        ├── 09 CREATIVO 2     │  Ads
        └── 10 CREATIVO 3     ┘  (corren juntos)

T+4h  ── 11 HOTMART (necesita PDFs de 5, 6, 7 listos)

T+5h  ── 12 EMAILS + LANZAMIENTO (necesita 11 listo + frontend deployado + creativos listos)
```

Aproximadamente **5 horas reales** si paralelizás bien (vs. 9 horas en serie).

---

## Reglas globales para todos los agentes

### 1. NO hay VSL en este proyecto

Cero grabación, cero cámara, cero voz tuya. Los 3 creativos usan **voz IA (ElevenLabs) + B-roll + texto**. La página de resultados es 100% texto + diseño + prueba social. Si en algún archivo aparece la palabra "VSL", es un error y hay que ignorarla.

### 2. Idioma y tono

- Voseo argentino neutralizado: "podés", "te llevás", "notás"
- Sin jerga local fuerte
- Hablamos a mujeres 32–55 hispanohablantes
- Ver `_BRAND-VOICE.md` para detalle

### 3. Marca

- Nombre de la marca: **Chau-Hinchazón** (hilvanapp.com)
- Producto principal: "Protocolo Anti-Hinchazón: Plan de 7 Días" ($9.990 ARS)
- Upsell: "Programa Anti-Hinchazón 30 Días" ($19.990 ARS)

### 4. Stack frontend (innegociable)

- Next.js 14+ con App Router
- TypeScript estricto
- Tailwind CSS
- Framer Motion para animaciones
- Zustand para state
- React Hook Form + Zod para forms
- Deploy: Vercel
- Sin backend pesado: APIs en `/api/*` de Next.js

### 5. Variables de entorno comunes

```
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=https://pay.hotmart.com/...
META_PIXEL_ID=
META_CAPI_TOKEN=
QUIZ_WEBHOOK_URL=https://hook.us1.make.com/...
SYSTEME_API_KEY=
ADMIN_PASSWORD=                        # min 24 chars, para /admin
FUNNEL_STORE=supabase                  # 'memory' o 'supabase'
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Cada agente que necesite una env var, la asume disponible. NO hardcodear nada.

### 6. Estructura de archivos (target final)

Cuando los 12 agentes terminan, el repo se ve así:

```
testfunnel/
├── AGENTS.md
├── README.md
├── docs/                              ← lo que ya está
│   ├── _AVATAR.md
│   ├── _BRAND-VOICE.md
│   ├── _CHECKLIST.md
│   ├── _DESIGN-SYSTEM.md
│   ├── _METRICAS.md
│   ├── _OVERVIEW.md
│   ├── _PRODUCT-DATA.md
│   ├── _QUIZ-DATA.md
│   ├── 01-LANDING.md
│   ├── 02-QUIZ.md
│   ├── 03-RESULTADOS.md
│   ├── 04-API-TRACKING.md
│   ├── 05-PDF-PRINCIPAL.md
│   ├── 06-PDF-RECETARIO.md
│   ├── 07-PDF-30-DIAS.md
│   ├── 08-CREATIVO-1.md
│   ├── 09-CREATIVO-2.md
│   ├── 10-CREATIVO-3.md
│   ├── 11-HOTMART-SETUP.md
│   └── 12-EMAILS-Y-LANZAMIENTO.md
├── app/                               ← agentes 01, 02, 03, 04
│   ├── layout.tsx
│   ├── page.tsx                       ← agente 01 (trackea LandingView)
│   ├── globals.css
│   ├── admin/
│   │   ├── page.tsx                   ← login admin (ADMIN_PASSWORD)
│   │   └── funnel/                    ← embudo SVG + KPIs + reset
│   ├── quiz/
│   │   └── page.tsx                   ← agente 02
│   ├── resultados/
│   │   └── page.tsx                   ← agente 03
│   └── api/
│       ├── admin/funnel-data/route.ts ← GET embudo + DELETE reset
│       ├── submit-quiz/route.ts       ← agente 04
│       ├── track/route.ts             ← agente 04 (LandingView, QuizProgress, CheckoutClick, etc)
│       └── hotmart-webhook/route.ts   ← agente 04
├── components/                        ← agentes 01, 02, 03
│   ├── quiz/...
│   ├── resultados/...
│   ├── landing/...
│   └── ui/...
├── lib/                               ← agentes 02, 03, 04
│   ├── admin/
│   │   ├── auth.ts                    Admin auth (HMAC + rate limit)
│   │   ├── store.ts                   FunnelStore interface + memory backend
│   │   └── supabase-store.ts          Supabase persistent backend
│   ├── quiz-data.ts
│   ├── quiz-store.ts
│   ├── quiz-types.ts
│   ├── tipos-hinchazon.ts
│   └── tracking.ts
├── public/
│   └── images/
├── tailwind.config.ts                 ← agente 02 (primer setup) o 01
├── package.json
└── outputs/                           ← entregables NO-CODE (no se commitean)
    ├── pdfs/
    │   ├── protocolo-anti-hinchazon-7-dias.pdf   ← agente 05
    │   ├── recetario-anti-inflamatorio.pdf       ← agente 06
    │   └── programa-30-dias-semana-1.pdf         ← agente 07
    ├── creativos/
    │   ├── creativo-1-curiosidad.mp4             ← agente 08
    │   ├── creativo-2-disrupcion.mp4             ← agente 09
    │   └── creativo-3-frustracion.mp4            ← agente 10
    └── audios/
        └── audioguia-dia-1.mp3                   ← agente 07
```

> **`outputs/` está en `.gitignore`.** Los PDFs y videos se suben a Hotmart / Meta, no se commitean.

### 7. Política de "no asumir"

Si un agente necesita un dato que no está en su doc ni en los compartidos: **NO INVENTAR**. Tiene que preguntarle al humano (a vos) explícitamente. Especialmente:

- URLs reales de Hotmart (las consigue el agente 11)
- Pixel ID real
- Webhook URL real
- Nombres de marca / dominio

Mientras tanto usar el placeholder `[NEEDS_INPUT]` en el código y avisarte al final.

### 8. Cómo entregan su trabajo los agentes de código (01, 02, 03, 04)

Cada uno crea/modifica los archivos que le tocan dentro de `app/`, `components/`, `lib/`. Como son chats separados, **van a generar el código sin ver lo que el otro hizo**. Para evitar conflictos de merge:

- **Carriles claros**: cada agente solo toca SUS archivos (definidos en su doc).
- **Cada agente exporta interfaces TypeScript** que los otros pueden importar (los tipos compartidos están en `lib/quiz-types.ts` que crea el agente 04 primero, y los demás lo asumen disponible).
- **Naming convention única**: `kebab-case.tsx` para archivos, `PascalCase` para componentes, `camelCase` para funciones.

### 9. Política de mobile-first

Todo lo del frontend (01, 02, 03) se diseña primero para mobile (375–414px) y después se adapta a desktop. Si un componente se ve mal en mobile, se rechaza aunque se vea bien en desktop.

### 10. Cero referencias a VSL

Si en cualquier doc encontrás "VSL", "video sales letter" o similar: ignoralo. La conversión es 100% por copy + diseño + prueba social.

---

## Orden recomendado para abrir los chats

Abrí en este orden las 12 ventanas. Pegale a cada una el setup de prompt de abajo. Vas a tener todo en paralelo en menos de 5 minutos.

### Prompt de inicialización (mismo para todos)

```
Sos el AGENTE [NN]. Tu tarea está definida en docs/[NN-XXX.md].

Te paso ahora 4 cosas en este orden:
1. AGENTS.md (las reglas globales del proyecto)
2. Los archivos compartidos que tu agente necesita (_DESIGN-SYSTEM.md, _AVATAR.md, etc.)
3. Tu archivo de instrucción específico (docs/NN-XXX.md)
4. Cualquier contexto adicional

Cuando termines de leer todo, decime "Listo, agente NN preparado para
ejecutar [su tarea]" y esperá mi confirmación antes de arrancar.

NO ejecutes hasta que te confirme. Y NO toques archivos fuera de los
que tu doc te asigna.
```

### Setup específico por agente

| Agente | Pegale estos archivos |
|---|---|
| 01 LANDING | AGENTS.md + _OVERVIEW.md + _AVATAR.md + _BRAND-VOICE.md + _DESIGN-SYSTEM.md + _PRODUCT-DATA.md + 01-LANDING.md |
| 02 QUIZ | AGENTS.md + _OVERVIEW.md + _DESIGN-SYSTEM.md + _BRAND-VOICE.md + _QUIZ-DATA.md + 02-QUIZ.md |
| 03 RESULTADOS | AGENTS.md + _OVERVIEW.md + _AVATAR.md + _BRAND-VOICE.md + _DESIGN-SYSTEM.md + _PRODUCT-DATA.md + _QUIZ-DATA.md + 03-RESULTADOS.md |
| 04 API+TRACKING | AGENTS.md + _OVERVIEW.md + _QUIZ-DATA.md + _METRICAS.md + 04-API-TRACKING.md |
| 05 PDF PRINCIPAL | AGENTS.md + _AVATAR.md + _BRAND-VOICE.md + _DESIGN-SYSTEM.md + _PRODUCT-DATA.md + 05-PDF-PRINCIPAL.md |
| 06 PDF RECETARIO | AGENTS.md + _DESIGN-SYSTEM.md + _PRODUCT-DATA.md + 06-PDF-RECETARIO.md |
| 07 PDF 30 DÍAS | AGENTS.md + _AVATAR.md + _BRAND-VOICE.md + _DESIGN-SYSTEM.md + _PRODUCT-DATA.md + 07-PDF-30-DIAS.md |
| 08 CREATIVO 1 | AGENTS.md + _AVATAR.md + _BRAND-VOICE.md + _DESIGN-SYSTEM.md + 08-CREATIVO-1.md |
| 09 CREATIVO 2 | AGENTS.md + _AVATAR.md + _BRAND-VOICE.md + _DESIGN-SYSTEM.md + 09-CREATIVO-2.md |
| 10 CREATIVO 3 | AGENTS.md + _AVATAR.md + _BRAND-VOICE.md + _DESIGN-SYSTEM.md + 10-CREATIVO-3.md |
| 11 HOTMART | AGENTS.md + _OVERVIEW.md + _PRODUCT-DATA.md + 11-HOTMART-SETUP.md |
| 12 EMAILS + LANZAMIENTO | AGENTS.md + _OVERVIEW.md + _AVATAR.md + _BRAND-VOICE.md + _PRODUCT-DATA.md + _QUIZ-DATA.md + _METRICAS.md + 12-EMAILS-Y-LANZAMIENTO.md |

---

## Qué hacés vos (humano) mientras los agentes trabajan

1. Mientras los 4 agentes de código (01–04) codean, **vos**:
   - Creás cuenta en Vercel
   - Creás cuenta en Hotmart (puede tardar en aprobar el CUIT)
   - Creás cuenta en ElevenLabs
   - Creás cuenta en Systeme.io
   - Creás el Pixel de Meta y copiás el ID

2. Mientras los agentes 05–07 generan los PDFs:
   - Vos los descargás y los reformateás un poco en Canva si hace falta

3. Mientras los agentes 08–10 generan los creativos:
   - Vos los revisás y aprobás antes de subirlos

4. Antes de que arranque el agente 11:
   - Vos tenés que tener los 3 PDFs listos (output de 05, 06, 07)

5. Antes de que arranque el agente 12:
   - Vos tenés que tener:
     - Frontend deployado a Vercel (output de 01–04)
     - URL de checkout de Hotmart (output de 11)
     - Los 3 creativos listos (output de 08–10)

---

## Si algo falla

- **Conflicto de archivos**: agente 02 quiere modificar algo de agente 04. Solución: el dueño es siempre quien tiene el archivo en su doc. Si no está claro, gana 04 (la API es más crítica).
- **Falta info**: agente pone `[NEEDS_INPUT]` en el código y al final pide al humano.
- **Tiempo se va**: usá el plan B del `_CHECKLIST.md` (mínimos viables).

---

## Glosario rápido

- **AOV**: average order value (valor promedio del pedido)
- **CBO**: campaign budget optimization (Meta)
- **CAPI**: Conversions API de Meta (server-side)
- **CPA**: cost per acquisition
- **CPM**: cost per mille (1000 impresiones)
- **CTR**: click through rate
- **Order bump**: producto agregado en el checkout
- **Upsell**: producto ofrecido después de la compra
- **Downsell**: alternativa más barata si rechazó el upsell
- **Pixel**: tracking del navegador (Meta)
- **ROAS**: return on ad spend
- **UTM**: parámetros de tracking en la URL

---

Listo. Con esto cualquier persona (humana o LLM) puede entender el proyecto en 10 minutos y arrancar.

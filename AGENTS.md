# DormíBien — Agent Map

## Proyecto
Quiz Funnel de Sueño + PWA post-compra "DormíBien"

## Documentación compartida
| Archivo | Contenido |
|---------|-----------|
| docs/_OVERVIEW.md | Visión general del proyecto |
| docs/_AVATAR.md | Avatar del cliente, segmentos |
| docs/_BRAND-VOICE.md | Tono, reglas de copy, idioma |
| docs/_DESIGN-SYSTEM.md | Paletas, tipografía, componentes |
| docs/_PRODUCT-DATA.md | Producto, precios, contenido |
| docs/_QUIZ-DATA.md | Datos del quiz, cálculos, mapeos |

## Agentes de ejecución

| # | Agente | Docs | Output | Dependencias |
|---|--------|------|--------|--------------|
| 00 | SETUP | docs/00-SETUP.md | package.json, tailwind.config, globals.css, layout.tsx, types, supabase schema | — |
| 01 | QUIZ-DATA | docs/01-QUIZ-DATA.md | lib/quiz/* (types, slides, slides-v2, calculate-result, store) | 00 |
| 02 | QUIZ-UI | docs/02-QUIZ-UI.md | components/quiz/* (todos los slide components) | 00, 01 |
| 03 | QUIZ-CONTAINER | docs/03-QUIZ-CONTAINER.md | components/quiz/QuizContainer[V2].tsx, app/quiz/*, app/quiz-v2/* | 01, 02 |
| 04 | SALES-PAGE | docs/04-SALES-PAGE.md | components/quiz/SlideSalesPage.tsx | 01, 02 |
| 05 | API-TRACKING | docs/05-API-TRACKING.md | app/api/*, lib/tracking.ts, components/MetaPixel.tsx | 00 |
| 06 | PWA-LAYOUT | docs/06-PWA-LAYOUT.md | app/pwa/layout.tsx, components/pwa/*, middleware.ts, manifest, sw | 00 |
| 07 | PWA-AUTH | docs/07-PWA-AUTH.md | app/pwa/login/*, app/api/pwa/auth/*, app/api/pwa/me/* | 06 |
| 08 | PWA-DASHBOARD | docs/08-PWA-DASHBOARD.md | app/pwa/dashboard/* | 06, 07 |
| 09 | PWA-PLAN | docs/09-PWA-PLAN.md | app/pwa/plan/*, lib/pwa/plan-content.ts | 06, 07 |
| 10 | PWA-DIARIO | docs/10-PWA-DIARIO.md | app/pwa/diario/*, app/api/pwa/diary/* | 06, 07 |
| 11 | PWA-GUIAS | docs/11-PWA-GUIAS.md | app/pwa/guias/* | 06 |
| 12 | PWA-PROGRESO | docs/12-PWA-PROGRESO.md | app/pwa/progreso/* | 06, 10 |

## Orden de ejecución
```
00-SETUP → 01-QUIZ-DATA → 02-QUIZ-UI → 03-QUIZ-CONTAINER → 04-SALES-PAGE → 05-API-TRACKING → 06-PWA-LAYOUT → 07-PWA-AUTH → 08-PWA-DASHBOARD → 09-PWA-PLAN → 10-PWA-DIARIO → 11-PWA-GUIAS → 12-PWA-PROGRESO
```

## Stack técnico
- Next.js 14+ App Router
- TypeScript estricto
- Tailwind CSS
- Framer Motion
- Zustand
- Supabase
- Hotmart (checkout externo)
- PWA (manifest + service worker)

## Variables de entorno
```
NEXT_PUBLIC_META_PIXEL_ID=[NEEDS_INPUT]
NEXT_PUBLIC_HOTMART_CHECKOUT_URL=[NEEDS_INPUT]
NEXT_PUBLIC_SUPABASE_URL=[NEEDS_INPUT]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEEDS_INPUT]
SUPABASE_SERVICE_ROLE_KEY=[NEEDS_INPUT]
META_PIXEL_ID=[NEEDS_INPUT]
META_CAPI_TOKEN=[NEEDS_INPUT]
ADMIN_PASSWORD=[NEEDS_INPUT]
```

## Rutas principales
```
/quiz          → Quiz corto (Google Ads)
/quiz-v2       → Quiz largo (Facebook Ads)
/pwa/login     → Login por email
/pwa/dashboard → Dashboard principal
/pwa/plan      → Plan 7 noches (lista)
/pwa/plan/[n]  → Detalle noche N
/pwa/diario    → Historial diario
/pwa/diario/nuevo → Nueva entrada
/pwa/guias     → Índice de guías
/pwa/progreso  → Gráficos de progreso
```

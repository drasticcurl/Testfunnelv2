# PWA-AGENTS.md — Prompts corregidos para la estructura actual

> **Cómo usar:** Abrí un chat nuevo, pegá el prompt de la fase que toca.
> Cada prompt le dice al agente qué archivos leer y qué hacer.
> Branch: **main**
> La PWA vive dentro del mismo Next.js: `app/pwa/*`, `app/api/pwa/*`, `lib/pwa/*`, `components/pwa/*`

---

## Estructura actual (ya existe en main)

```
testfunnel/
├── app/pwa/
│   ├── layout.tsx          (layout con BottomNav + AppHeader)
│   ├── login/page.tsx      (login form)
│   └── dashboard/page.tsx  (dashboard placeholder)
├── app/api/pwa/
│   └── auth/login/route.ts (verifica compra o test mode → responde OK)
├── lib/pwa/
│   ├── access.ts           (getUserTier → {hasFront, hasBump, hasUpsell})
│   ├── supabase.ts         (createPwaServiceClient con service_role)
│   └── test-mode.ts        (isTestMode — auto-true si no hay Supabase)
├── components/pwa/
│   ├── AppHeader.tsx       ("Hola, María 👋")
│   └── BottomNav.tsx       (5 tabs fixed bottom)
└── docs/
    ├── _PWA-PLAN.md        (arquitectura, schema, decisiones)
    ├── _DESIGN-SYSTEM.md   (paleta, tipografía)
    └── _BRAND-VOICE.md     (tono, voseo)
```

---


## AGENTE PWA-02 — Webhook Hotmart → Supabase

```
Sos el AGENTE PWA-02. Tu tarea es crear el endpoint webhook de Hotmart que escribe compras en Supabase.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (schema SQL de la tabla purchases, decisiones, mapeo de productos)
2. lib/pwa/supabase.ts (createPwaServiceClient — client con service_role)
3. lib/pwa/test-mode.ts (isTestMode — si es true, no escribir a DB)
4. app/api/hotmart-webhook/route.ts (webhook EXISTENTE del funnel — referencia del payload de Hotmart)

CONTEXTO:
La PWA está integrada en el mismo proyecto Next.js del funnel. Rutas PWA en app/pwa/*, APIs en app/api/pwa/*, libs en lib/pwa/. La Fase 1 ya está completa (login, dashboard shell, test mode).

TU TAREA:

1. CREAR app/api/pwa/webhook/hotmart/route.ts:

   GET handler:
   - Responde 200 {ok: true, service: 'pwa-hotmart-webhook'}

   POST handler:
   - Si isTestMode() → logear evento y responder 200 {ok: true, testMode: true} sin escribir DB
   - Validar header x-hotmart-hottok contra env HOTMART_HOTTOK (si está configurado)
   - Parse del body JSON
   - Extraer: event, buyer.email, buyer.name, purchase.transaction, purchase.price.value, purchase.price.currency_value, product.id, product.name, purchase.approved_date

   Routing por evento:
   - PURCHASE_APPROVED / PURCHASE_COMPLETE:
     → INSERT en purchases: email, hotmart_transaction, product_id, product_name, amount, currency, status='approved', purchased_at
     → ON CONFLICT hotmart_transaction DO NOTHING (idempotente)
   
   - PURCHASE_REFUNDED:
     → UPDATE purchases SET status='refunded' WHERE hotmart_transaction = X
   
   - CHARGEBACK:
     → UPDATE purchases SET status='chargeback' WHERE hotmart_transaction = X

   - Otros: responder 200 {ok: true, ignored: event}

2. Usar createPwaServiceClient() de '@/lib/pwa/supabase'
3. Importar isTestMode de '@/lib/pwa/test-mode'
4. Respuesta siempre 200 (para que Hotmart no reintente)
5. Edge cases: email vacío → 200 ignored, body malformado → 400, duplicado → ignore

REGLAS:
- TypeScript estricto, sin any
- runtime = 'nodejs'
- Tipos del payload de Hotmart locales en el archivo
- NO tocar archivos fuera de app/api/pwa/ y lib/pwa/
- Commitear en main

CUANDO TERMINES:
- Verificá que compila (npx next build)
- Mostrá curl de ejemplo
- Commiteá y pusheá a main
```

---


## AGENTE PWA-03 — Onboarding + Layout mejorado

```
Sos el AGENTE PWA-03. Tu tarea es crear el flujo de onboarding y mejorar el layout de la PWA.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (decisiones de onboarding, estructura)
2. docs/_DESIGN-SYSTEM.md (paleta, tipografía)
3. docs/_BRAND-VOICE.md (tono, voseo argentino)
4. app/pwa/layout.tsx (layout actual con BottomNav + AppHeader)
5. app/pwa/dashboard/page.tsx (dashboard placeholder actual)
6. components/pwa/BottomNav.tsx
7. components/pwa/AppHeader.tsx
8. lib/pwa/test-mode.ts (TEST_USER con quiz_data de ejemplo)

CONTEXTO:
La PWA está integrada en el mismo Next.js (app/pwa/*). Fases 1-2 completas. El onboarding se muestra SOLO la primera vez. En test mode, el onboarding usa datos de TEST_USER. Layout con bottom nav de 5 tabs ya existe.

TU TAREA:

1. CREAR app/pwa/onboarding/page.tsx — Wizard de 3 pasos:
   
   PASO 1 — "Tu diagnóstico"
   - "Bienvenida, María" (o nombre de TEST_USER)
   - Muestra tipo de hinchazón (Tipo 3: Hinchazón Inflamatoria Vespertina)
   - Barra visual de severidad (7/10)
   - "Tu plan personalizado está listo. Empezamos mañana."
   - Botón "Siguiente →"

   PASO 2 — "Personalizá tu experiencia"
   - "¿Qué síntoma querés mejorar primero?" — radio buttons:
     Hinchazón visible / Gases / Pesadez post-comida / Energía baja / Tránsito irregular
   - "¿A qué hora querés tu recordatorio?" — selector hora
   - Botón "Siguiente →"

   PASO 3 — "Tu app, por dentro" (tour)
   - 4 cards grid 2x2:
     📋 Plan día a día — "Tu protocolo paso a paso"
     📊 Diario — "Registrá cómo te sentís"
     🍽️ Recetas — "60 recetas antiinflamatorias"
     🧮 Calculadora — "Tu score de microbiota"
   - Botón "¡Empezar!" → redirect /pwa/dashboard

   UI: Progress dots (● ● ○), framer-motion slides, mobile-first centrado

2. MEJORAR app/pwa/dashboard/page.tsx:
   - Que funcione como home real (ya tiene cards, mejorar diseño si hace falta)

3. LÓGICA: En test mode, no guardar en DB. Solo navegar entre pasos client-side.

REGLAS:
- Framer Motion para transiciones
- Mobile-first (max-w-md mx-auto)
- Colores: sage primario, cream fondo, charcoal texto, coral accent
- Voseo: "¿Qué síntoma querés mejorar?"
- NO tocar archivos fuera de app/pwa/, components/pwa/, lib/pwa/
- Commitear en main

CUANDO TERMINES:
- Verificá que compila
- Flow: /pwa/login → /pwa/onboarding (3 pasos) → /pwa/dashboard
- Commiteá y pusheá a main
```

---


## AGENTE PWA-04 — Plan día a día

```
Sos el AGENTE PWA-04. Tu tarea es crear el sistema de plan día a día (el core de la PWA).

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (schema day_progress, mapeo de tiers)
2. docs/_DESIGN-SYSTEM.md
3. outputs/pdfs/protocolo-7-dias-content.md (contenido COMPLETO días 1-7)
4. outputs/pdfs/programa-30-dias-semana-2.md (contenido días 8-14)
5. lib/pwa/access.ts (getUserTier)
6. lib/pwa/test-mode.ts (isTestMode)
7. app/pwa/layout.tsx

CONTEXTO:
PWA integrada en el mismo Next.js (app/pwa/*). Fases 1-3 completas. El plan es el corazón de la PWA. Días 1-7 para Front ($14.90). Días 8-30 para Upsell ($37). En test mode, acceso completo a los 30 días. Desbloqueo progresivo: día N disponible si N-1 completado.

TU TAREA:

1. CREAR lib/pwa/plan-data.ts:
   - export const PLAN_DATA: DayPlan[] — 30 días
   - Type DayPlan: {day, title, subtitle, meals[{moment, emoji, name, time, description, ingredients?}], tip, requiresUpsell}
   - Días 1-7: EXTRAER de outputs/pdfs/protocolo-7-dias-content.md (PÁGINAS 7-13, contenido real completo)
   - Días 8-14: EXTRAER de outputs/pdfs/programa-30-dias-semana-2.md
   - Días 15-30: GENERAR contenido coherente (semana 3: optimización, semana 4: mantenimiento). Usar los 15 alimentos antiinflamatorios. Variar recetas. Mismo formato.

2. CREAR app/pwa/plan/page.tsx:
   - Grid de cards (1 col mobile, 2 desktop)
   - Estados visuales: ✅ Completado (sage-soft), 🔓 Disponible (white, border sage), 🔒 Bloqueado progreso (gray-100), 🔒 Bloqueado tier (gray-100 + "Desbloquear con Programa 30 días")
   - En test mode: usar localStorage para simular day_progress
   - Click disponible → /pwa/plan/[day]

3. CREAR app/pwa/plan/[day]/page.tsx:
   - Header "Día {N}" grande + título
   - 5 comidas como cards expandibles (framer-motion)
   - Tip del día en recuadro coral-soft
   - Botón fijo bottom "✓ Completar este día"
   - En test mode: guardar en localStorage

4. COMPONENTES: components/pwa/plan/DayCard.tsx, MealCard.tsx, DayCompleteBanner.tsx

REGLAS:
- Contenido de los 30 días REAL y COMPLETO (no placeholders)
- Mobile-first, cards radius 16px
- Framer Motion para expandir meals
- Voseo en tips: "Sí o sí: vaso de agua tibia..."
- En test mode, usar localStorage en vez de Supabase
- NO tocar archivos fuera de app/pwa/, components/pwa/, lib/pwa/
- Commitear en main

CUANDO TERMINES:
- 30 días con contenido real
- Compila OK
- Commiteá y pusheá a main
```

---


## AGENTE PWA-05 — Diario de síntomas + gráficos

```
Sos el AGENTE PWA-05. Tu tarea es crear el diario de síntomas con gráficos de evolución.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (schema symptom_logs)
2. docs/_DESIGN-SYSTEM.md
3. outputs/pdfs/estructura-calculadora-microbiota.md (sección DIARIO DIARIO — columnas y validaciones)
4. lib/pwa/test-mode.ts (isTestMode)
5. app/pwa/layout.tsx

CONTEXTO:
PWA integrada en app/pwa/*. Fases 1-4 completas. El diario reemplaza el Google Sheet. 1 registro por día. En test mode, guardar en localStorage y mostrar datos de ejemplo.

TU TAREA:

1. CREAR app/pwa/diario/page.tsx:
   - GRÁFICO (recharts LineChart, responsive):
     - Hinchazón AM (sage #7A9B7E) + PM (coral #E07856), últimos 14/30 días
     - Tooltip con fecha + valores
     - Empty state si no hay data: "Empezá tu primer registro"
   - Lista entradas recientes (últimas 7): fecha + emoji + bloating AM/PM
   - BOTÓN flotante "+ Nuevo registro" → /pwa/diario/nuevo
   - Selector período: "14 días" / "30 días"
   - En test mode: generar 7 días de data fake para que se vea el gráfico

2. CREAR app/pwa/diario/nuevo/page.tsx:
   - Formulario: sliders 1-10 (bloating AM/PM, energía, estrés, sueño), select movimiento intestinal, chips síntomas (Gases/Dolor/Distensión/Acidez/Náuseas/Pesadez/Ruidos), select adherencia plan, counter agua, textarea notas
   - En test mode: guardar en localStorage
   - Post-save → redirect /pwa/diario

3. COMPONENTES: components/pwa/diario/SymptomChart.tsx, DiaryEntryCard.tsx, SliderField.tsx, SymptomChips.tsx

REGLAS:
- Recharts con ResponsiveContainer
- Sliders estilizados Tailwind (thumb sage)
- Mobile-first scrolleable
- Framer-motion para chips
- Voseo: "¿Cómo te sentiste hoy?", "¿Cumpliste el plan?"
- En test mode: localStorage + data fake para preview
- NO tocar fuera de app/pwa/, components/pwa/, lib/pwa/
- Commitear en main

CUANDO TERMINES:
- Gráfico renderiza con data (fake en test mode)
- Formulario funciona
- Compila OK
- Commiteá y pusheá a main
```

---


## AGENTE PWA-06 — Recetas (bento 2x2)

```
Sos el AGENTE PWA-06. Tu tarea es crear el sistema de recetas con grid bento 2x2.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (schema recipe_favorites, tiers)
2. docs/_DESIGN-SYSTEM.md
3. outputs/pdfs/recetario-content.md (25 recetas del bump — contenido real)
4. outputs/pdfs/protocolo-7-dias-content.md (35 recetas del plan días 1-7 — extraer de cada día)
5. lib/pwa/access.ts (getUserTier)
6. lib/pwa/test-mode.ts (isTestMode — en test mode acceso total)

CONTEXTO:
PWA integrada en app/pwa/*. Fases 1-5 completas. 60 recetas: 35 básicas (Front) + 25 extra (Bump). En test mode, todas desbloqueadas + favoritos en localStorage.

TU TAREA:

1. CREAR lib/pwa/recipes-data.ts:
   - 60 recetas tipo Recipe: {id, name, moment, time, difficulty, ingredients[], steps[], tip, isExtra, imageSlot}
   - EXTRAER de protocolo-7-dias (35 recetas de los días 1-7) + recetario-content.md (25 extra)
   - Contenido REAL, no placeholder

2. CREAR app/pwa/recetas/page.tsx:
   - Filtros pills: Todas/Desayuno/Almuerzo/Cena/Snack (scroll horizontal)
   - Grid 2×2 mobile (grid-cols-2), 3 en desktop
   - Cards: div sage-soft + emoji + nombre + badge tiempo
   - Cards extra (isExtra=true): overlay candado en modo prod sin bump (en test mode todas abiertas)
   - Cargar por lotes de 8

3. CREAR app/pwa/recetas/[id]/page.tsx:
   - Hero placeholder (aspect-video, bg sage-soft, emoji grande)
   - Badges: tiempo + dificultad + momento
   - Ingredientes (lista), Preparación (pasos numerados), Tip (recuadro coral-soft)
   - Botón favorito (corazón toggle). En test mode: localStorage

4. COMPONENTES: components/pwa/recetas/RecipeCard.tsx, MomentFilter.tsx, LockedOverlay.tsx

REGLAS:
- Grid 2×2 mobile exacto
- Cards aspect-square, radius 16px, shadow-sm
- Placeholder imagen: div sage-soft + emoji (🥗🍳🥘🍵)
- 60 recetas con contenido REAL extraído de PDFs
- Voseo: "Tus recetas", "Guardar en favoritos"
- En test mode: localStorage para favoritos, todas desbloqueadas
- NO tocar fuera de app/pwa/, components/pwa/, lib/pwa/
- Commitear en main

CUANDO TERMINES:
- 60 recetas reales en recipes-data.ts
- Grid + filtros + detalle + favoritos
- Compila OK
- Commiteá y pusheá a main
```

---


## AGENTE PWA-07 — Lista de compras

```
Sos el AGENTE PWA-07. Tu tarea es crear la lista de compras interactiva.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (schema shopping_list_items, tiers)
2. docs/_DESIGN-SYSTEM.md
3. outputs/pdfs/protocolo-7-dias-content.md (PÁGINA 14 — lista de compras semana 1 completa)
4. outputs/pdfs/programa-30-dias-semana-2.md (ingredientes semana 2)
5. lib/pwa/access.ts (getUserTier)
6. lib/pwa/test-mode.ts

CONTEXTO:
PWA integrada en app/pwa/*. Fases 1-6 completas. Lista de compras reemplaza PDF imprimible. Semana 1 para todos, semanas 2-4 requieren Upsell. En test mode, todo desbloqueado + checks en localStorage.

TU TAREA:

1. CREAR lib/pwa/shopping-data.ts:
   - 4 semanas. Semana 1 EXACTA del PDF (PÁGINA 14). Semana 2 deducida de recetas semana 2. Semanas 3-4 coherentes.
   - Tipo: WeekShopping{week, requiresUpsell, categories[{name, emoji, items[]}]}

2. CREAR app/pwa/lista-compras/page.tsx:
   - Tabs: Semana 1/2/3/4 (2-4 locked sin upsell, desbloqueadas en test mode)
   - Categorías colapsables accordion: emoji + nombre + "3/12 items"
   - Checkboxes con persist (localStorage en test mode)
   - Animación tachado al marcar
   - Progreso "12 de 47 ✓"
   - Botón "Reiniciar" con confirmación

3. COMPONENTES: components/pwa/lista-compras/WeekTabs.tsx, CategoryAccordion.tsx, ShoppingItem.tsx

REGLAS:
- Items semana 1 TEXTUALES del PDF
- Mobile-first, accordion fácil
- Checkbox sage cuando checked
- Framer-motion al marcar
- En test mode: localStorage
- NO tocar fuera de app/pwa/, components/pwa/, lib/pwa/
- Commitear en main

CUANDO TERMINES:
- 4 semanas datos reales
- Checks persisten (localStorage)
- Compila OK
- Commiteá y pusheá a main
```

---


## AGENTE PWA-08 — Calculadora de microbiota

```
Sos el AGENTE PWA-08. Tu tarea es crear la calculadora de microbiota interactiva.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (schema microbiota_assessments)
2. docs/_DESIGN-SYSTEM.md
3. outputs/pdfs/estructura-calculadora-microbiota.md (LEER COMPLETO — 20 síntomas, scoring, fórmulas)
4. lib/pwa/test-mode.ts

TAMBIÉN investigá online: "GSRS Gastrointestinal Symptom Rating Scale" o "MSQ Metabolic Screening Questionnaire" para validar los 20 síntomas.

CONTEXTO:
PWA integrada en app/pwa/*. Fases 1-7 completas. 20 preguntas (0-4), score 0-10, interpretación, breakdown por categoría. Re-evaluable cada 7 días. En test mode: localStorage + resultado inmediato.

TU TAREA:

1. CREAR lib/pwa/microbiota-symptoms.ts:
   - 20 síntomas por categoría (digestión, tránsito, energía, cerebro, piel, inmunidad, tolerancia)
   - Scoring: score = 10 - (total/80)*10
   - Interpretación: 8-10 saludable (verde), 6-7.9 recuperación, 4-5.9 moderado (amarillo), 0-3.9 significativo (rojo)

2. CREAR app/pwa/calculadora/page.tsx:
   - 20 preguntas con sliders 0-4 (labels: Nunca/Raramente/Frecuentemente/Casi siempre/Siempre)
   - Agrupadas por categoría
   - Progress bar "12 de 20"
   - Botón "Ver resultado" → calcula → guarda localStorage → /pwa/calculadora/resultado

3. CREAR app/pwa/calculadora/resultado/page.tsx:
   - Score gauge SVG semicircular animado (framer-motion)
   - Interpretación con color
   - Breakdown por categoría (bars horizontales)
   - Comparación con anterior si existe (localStorage)
   - Botón "Volver a evaluar"

4. COMPONENTES: components/pwa/calculadora/SymptomSlider.tsx, ScoreGauge.tsx, CategoryBreakdown.tsx, ComparisonCard.tsx

REGLAS:
- Gauge SVG semicircular con animación framer-motion
- 20 síntomas del doc + validados con investigación
- Mobile-first
- Colores gauge: sage=verde, #F5C7B6=amarillo, coral=rojo
- Voseo: "¿Con qué frecuencia sentís...?"
- En test mode: localStorage
- NO tocar fuera de app/pwa/, components/pwa/, lib/pwa/
- Commitear en main

CUANDO TERMINES:
- 20 síntomas basados en evidencia
- Scoring + gauge + comparación funcional
- Compila OK
- Commiteá y pusheá a main
```

---


## AGENTE PWA-09 — Dashboard + progreso + gamificación

```
Sos el AGENTE PWA-09. Tu tarea es crear el dashboard real y la página de progreso con gamificación.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (tablas day_progress, symptom_logs, microbiota_assessments)
2. docs/_DESIGN-SYSTEM.md
3. app/pwa/dashboard/page.tsx (placeholder actual — reemplazarlo)
4. app/pwa/plan/page.tsx (si existe)
5. app/pwa/diario/page.tsx (si existe)
6. lib/pwa/test-mode.ts

CONTEXTO:
PWA integrada en app/pwa/*. Fases 1-8 completas. Dashboard es la home. En test mode, mostrar datos fake/localStorage para que se vea completo.

TU TAREA:

1. REEMPLAZAR app/pwa/dashboard/page.tsx:
   - "Hola, María" + fecha actual
   - Card "Tu día": siguiente día disponible del plan + botón "Ir al Día X →"
   - Card "¿Cómo estás hoy?": si registró → mini resumen, si no → botón "Registrar"
   - Card "Tu racha" 🔥 X días consecutivos
   - Quick actions 2x2: Plan/Diario/Recetas/Calculadora
   - Mini card score microbiota si existe
   - En test mode: mostrar datos fake (streak=3, día=4, etc)

2. CREAR app/pwa/progreso/page.tsx:
   - % plan completado (ProgressRing circular)
   - Streak actual + mejor streak
   - Gráficos evolución (recharts): score microbiota + promedio hinchazón
   - 10 BADGES:
     🌱 Primer paso (Día 1), 🔥 Racha de 3, 💪 Una semana (7 días),
     📊 Auto-conocimiento (1ra evaluación), ⭐ Mejora real (score +2),
     🏆 Dos semanas (14 días), 👑 Protocolo completo (30 días),
     ❤️ Favorita (1ra receta fav), 📝 Constante (7 registros diario),
     🎯 Perfecta (100% adherencia 7 días)
   - Badges unlocked: color sage. Locked: grayscale opacity 0.5
   - En test mode: 4 badges unlocked con datos fake

3. COMPONENTES: components/pwa/progreso/StreakCounter.tsx, BadgeCard.tsx, BadgeGrid.tsx, ProgressRing.tsx

REGLAS:
- Dashboard denso pero claro
- Streak 🔥 número grande
- Badges como medallas con emojis
- Recharts sage/coral
- Framer Motion animaciones
- Voseo: "Tu racha", "Tus logros"
- En test mode: datos fake para que se vea bonito
- NO tocar fuera de app/pwa/, components/pwa/, lib/pwa/
- Commitear en main

CUANDO TERMINES:
- Dashboard completo con data fake
- Progreso con badges atractivos
- Compila OK
- Commiteá y pusheá a main
```

---


## AGENTE PWA-10 — PWA polish (instalable + offline)

```
Sos el AGENTE PWA-10. Tu tarea es hacer la PWA instalable y offline-capable.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (manifest, service worker)
2. docs/_DESIGN-SYSTEM.md
3. app/layout.tsx (root layout del proyecto — NO el de pwa)
4. app/pwa/layout.tsx
5. next.config.mjs

CONTEXTO:
PWA integrada en app/pwa/*. Fases 1-9 completas (toda la app funcional). Necesita ser instalable en iOS/Android y funcionar offline para contenido ya cargado.

TU TAREA:

1. CREAR public/pwa-manifest.json:
   - name, short_name, description, start_url: "/pwa/dashboard", display: standalone
   - theme_color: #7A9B7E, background_color: #FAF7F2
   - icons: 192, 512, maskable
   - scope: "/pwa"

2. CREAR public/pwa-sw.js:
   - Cache-first estáticos, network-first API
   - Precache plan-data y recipes-data
   - Offline fallback
   - Solo cachear rutas /pwa/*

3. CREAR components/pwa/InstallPrompt.tsx:
   - Detecta beforeinstallprompt
   - Banner bottom: "Instalá la app" + dismiss (7 días localStorage)
   - iOS: instrucciones manuales

4. ACTUALIZAR app/pwa/layout.tsx:
   - Agregar link al manifest
   - Apple meta tags
   - Registrar service worker (solo en prod)

5. CREAR public/icons/pwa-icon-192.png y pwa-icon-512.png (o instrucciones claras de cómo generarlos)

6. ACTUALIZAR next.config.mjs: headers para sw.js y manifest

REGLAS:
- SW solo activo en production
- No cachear /api/pwa/auth/*
- Scope limitado a /pwa/
- NO romper el funnel existente (/, /quiz, /resultados)
- Commitear en main

CUANDO TERMINES:
- Manifest válido
- SW con caching
- Install prompt
- Compila OK
- Commiteá y pusheá a main
```

---


## AGENTE PWA-11 — Hotmart inline en resultados

```
Sos el AGENTE PWA-11. Tu tarea es integrar el checkout inline de Hotmart en la página de resultados y configurar redirect post-pago a la PWA.

ANTES DE HACER NADA, leé estos archivos del repositorio (drasticcurl/testfunnel, branch main):
1. docs/_PWA-PLAN.md (flujo end-to-end)
2. docs/03-RESULTADOS.md (spec página resultados)
3. app/resultados/page.tsx (página actual)
4. components/resultados/CTAFinal.tsx (CTA actual)
5. components/resultados/StickyCTA.tsx
6. lib/parse-resultados.ts (buildCheckoutUrl)

TAMBIÉN investigá online: documentación Hotmart Pay Inline / checkout embebido. Cómo pasar email prefilled, detectar compra exitosa.

CONTEXTO:
Este agente SÍ toca el funnel existente (app/resultados/, components/resultados/, lib/). Actualmente el CTA redirige a pay.hotmart.com. Queremos agregar iframe de Hotmart embebido + redirect post-pago a /pwa/login?email=X.

TU TAREA:

1. INVESTIGAR Hotmart Pay Inline: ¿iframe? ¿email prefill? ¿detección compra?

2. CREAR components/resultados/HotmartInlineCheckout.tsx:
   - Client component, props: {email, checkoutUrl}
   - iframe responsive (min 600px mobile)
   - Loading state
   - On success: redirect a /pwa/login?email={email}

3. MODIFICAR CTAFinal.tsx o resultados/page.tsx:
   - Mantener botón original como fallback
   - Agregar sección iframe debajo

4. ACTUALIZAR lib/parse-resultados.ts:
   - buildCheckoutUrl() acepta email para prefill

5. POST-PAGO: sección "¡Compra exitosa!" con botón "Acceder a mi protocolo →" → /pwa/login?email=X

REGLAS:
- Este agente SÍ toca el funnel (app/resultados/, components/resultados/, lib/)
- NO romper funcionalidad existente
- Si Hotmart inline no funciona, documentar plan B
- Mobile-first
- Commitear en main

CUANDO TERMINES:
- Iframe funcional o plan B documentado
- Email pasa al checkout
- Post-pago redirect a PWA
- Compila OK
- Commiteá y pusheá a main
```

---

## Secuencia de ejecución

```
PWA-02  (Webhook)        ← backend, no visual
PWA-03  (Onboarding)     ← primer flow visual completo
PWA-04  (Plan día a día) ← contenido core, el más impactante
PWA-05  (Diario)         ← gráficos
PWA-09  (Dashboard)      ← home completa
═══════ MVP LISTO ═══════
PWA-06  (Recetas)        ← post-MVP
PWA-07  (Lista compras)  ← post-MVP
PWA-08  (Calculadora)    ← post-MVP
PWA-10  (PWA polish)     ← post-MVP
PWA-11  (Hotmart inline) ← independiente
```

## Prompt de recuperación (si perdés contexto)

```
Necesito retomar la FASE [N] de la PWA del proyecto drasticcurl/testfunnel (branch main).

Leé estos archivos:
1. docs/_PWA-PLAN.md — plan maestro
2. docs/PWA-AGENTS.md — prompts de cada agente (buscá AGENTE PWA-[NN])
3. docs/_DESIGN-SYSTEM.md — paleta

La PWA está integrada en el mismo Next.js:
- Páginas: app/pwa/*
- APIs: app/api/pwa/*
- Libs: lib/pwa/*
- Componentes: components/pwa/*
- Test mode: si no hay Supabase, todo funciona con localStorage

Ejecutá la tarea del AGENTE PWA-[NN].
```

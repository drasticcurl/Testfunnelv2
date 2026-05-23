# _PWA-PLAN.md — Plan Maestro de la PWA

> **Este documento es la fuente de verdad para la PWA del Protocolo Anti-Hinchazón.**
> Si se cae internet o se pierde contexto, retomá desde la fase en la que estabas.
> Cada fase es autocontenida y tiene su propio prompt de agente en `docs/PWA-AGENTS.md`.

---

## Decisiones congeladas

| # | Decisión |
|---|---|
| 1 | La PWA **reemplaza todos los entregables PDF**. Se elimina Upsell 2 (membresía 12m) y Order Bump. Quedan: Front $14.90, Upsell 1 $9.90 (Programa 30 Días) |
| 2 | Acceso escalonado: cada producto Hotmart desbloquea features dentro de la PWA |
| 3 | Hotmart checkout inline (iframe) al final de `/resultados` — se implementa al final |
| 4 | Auth solo con email. Sin password. Cuando pagan se asocia automáticamente |
| 5 | Onboarding: resumen diagnóstico del quiz + wizard corto + tour de features |
| 6 | MVP features: diario de síntomas con gráficos, plan día a día, recetas bento 2x2, calculadora microbiota, lista de compras, progreso/gamificación |
| 7 | App **separada** en carpeta `/pwa/` del mismo repo. Se deploya independiente |
| 8 | Supabase como backend (PostgreSQL + Auth magic link + Storage) |
| 9 | Webhook Hotmart guarda email + product_id en tabla `purchases`. Email = identidad |
| 10 | Sin audioguías. Sin membresía 12 meses |

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14+ App Router |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS |
| Animaciones | Framer Motion |
| State | Zustand (client) |
| DB + Auth | Supabase (PostgreSQL + Auth magic link) |
| Gráficos | Recharts |
| Fechas | date-fns |
| PWA | next-pwa (service worker + manifest) |
| Deploy | Vercel (dominio genérico para testear, después custom) |

---

## Flujo end-to-end

```
[Meta Ad] → [Landing /] → [Quiz /quiz] → [Resultados /resultados]
                                                    ↓
                                    [Hotmart iframe checkout inline]
                                                    ↓
                              Hotmart webhook → Supabase: purchases{email, product_id, status, amount}
                                                    ↓
                              Hotmart redirect post-pago → PWA /login?email=xxx
                                                    ↓
                        PWA /login → check purchases → signInWithOtp (magic link)
                                                    ↓ (click en email)
                        PWA /auth/callback → set session → /onboarding (1ra vez) ó /dashboard
```

---

## Mapeo producto → features desbloqueadas

| Producto Hotmart | Precio | env var | Desbloquea en la PWA |
|---|---|---|---|
| Protocolo 7 Días (Front) | $14.90 | `HOTMART_PRODUCT_ID_FRONT` | Plan días 1-7, diario síntomas, 35 recetas básicas, shopping list semana 1, calculadora microbiota, kit express (Menú Emergencia SOS + Meal Prep Dominical + Tabla de Swaps) |
| Programa 30 Días Completo (Upsell 1) | $9.90 | `HOTMART_PRODUCT_ID_UPSELL` | Plan días 8-30, shopping list semanas 2-4, guía suplementación, test de tolerancia, +25 recetas adicionales |

---

## Modelo de datos (Supabase)

```sql
-- ═══════════════════════════════════════════════════════════
-- Auth: manejado por Supabase en schema auth.users (id, email)
-- ═══════════════════════════════════════════════════════════

-- COMPRAS (escritas por webhook de Hotmart)
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  hotmart_transaction TEXT UNIQUE,
  product_id TEXT,
  product_name TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'approved', -- 'approved' | 'refunded' | 'chargeback'
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_purchases_email_status ON purchases(email, status);

-- PERFIL DEL USUARIO (1:1 con auth.users)
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  reminder_time TIME,
  quiz_data JSONB, -- snapshot: {tipo, severidad, sintomas[], nombre, edad}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIARIO DE SÍNTOMAS (1 entrada por día)
CREATE TABLE symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  bloating_am INT CHECK (bloating_am BETWEEN 1 AND 10),
  bloating_pm INT CHECK (bloating_pm BETWEEN 1 AND 10),
  energy INT CHECK (energy BETWEEN 1 AND 10),
  stress INT CHECK (stress BETWEEN 1 AND 10),
  sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 10),
  bowel_movement TEXT,
  symptoms TEXT[],
  notes TEXT,
  water_glasses INT DEFAULT 0,
  plan_adherence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- PROGRESO POR DÍA DEL PLAN
CREATE TABLE day_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 30),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, day_number)
);

-- LISTA DE COMPRAS
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INT NOT NULL CHECK (week_number BETWEEN 1 AND 4),
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  checked BOOLEAN DEFAULT FALSE
);

-- EVALUACIONES DE MICROBIOTA
CREATE TABLE microbiota_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC(4,1) CHECK (score BETWEEN 0 AND 10),
  total_points INT,
  responses JSONB NOT NULL, -- {symptom_id: score} para los 20 síntomas
  interpretation TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEST DE TOLERANCIA (semana 2)
CREATE TABLE tolerance_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INT,
  food_name TEXT NOT NULL,
  category TEXT,
  portion TEXT,
  symptoms_3h TEXT,
  symptoms_24h TEXT,
  intensity INT CHECK (intensity BETWEEN 0 AND 3),
  tolerance_color TEXT, -- 'green' | 'yellow' | 'red'
  notes TEXT,
  tested_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAVORITOS DE RECETAS
CREATE TABLE recipe_favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (todas las tablas)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE microbiota_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tolerance_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;

-- Política: usuario solo ve/edita sus datos
CREATE POLICY "Users own data" ON profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON symptom_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON day_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON shopping_list_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON microbiota_assessments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON tolerance_tests FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON recipe_favorites FOR ALL USING (auth.uid() = user_id);

-- purchases: solo lectura server-side (service_role), no RLS para usuarios
-- El webhook escribe con service_role key
```

---

## Estructura de archivos de la PWA

```
testfunnel/
├── pwa/                                    ← APP SEPARADA
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── .env.local.example
│   ├── middleware.ts                       ← auth gate para toda la app (excepto /login, /auth/*)
│   │
│   ├── app/
│   │   ├── layout.tsx                      ← root layout con manifest + meta PWA
│   │   ├── page.tsx                        ← redirect a /dashboard
│   │   ├── globals.css
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx                    ← form email + verifica compra + envía magic link
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts               ← callback de Supabase magic link
│   │   │
│   │   ├── onboarding/
│   │   │   └── page.tsx                    ← wizard 3 pasos (solo 1ra vez)
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx                    ← home: card día actual + último bloating + streak
│   │   │
│   │   ├── plan/
│   │   │   ├── page.tsx                    ← overview días (7 ó 30 según tier)
│   │   │   └── [day]/
│   │   │       └── page.tsx               ← contenido del día + marcar completo
│   │   │
│   │   ├── diario/
│   │   │   ├── page.tsx                    ← gráfico 14/30 días + lista entradas
│   │   │   └── nuevo/
│   │   │       └── page.tsx               ← formulario nuevo registro
│   │   │
│   │   ├── recetas/
│   │   │   ├── page.tsx                    ← bento grid 2x2 con scroll
│   │   │   └── [id]/
│   │   │       └── page.tsx               ← detalle receta
│   │   │
│   │   ├── lista-compras/
│   │   │   └── page.tsx                    ← checkboxes por categoría + semana
│   │   │
│   │   ├── calculadora/
│   │   │   ├── page.tsx                    ← cuestionario 20 síntomas
│   │   │   └── resultado/
│   │   │       └── page.tsx               ← score + interpretación + histórico
│   │   │
│   │   ├── progreso/
│   │   │   └── page.tsx                    ← % completado, streak, evolución
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts          ← verifica compra + signInWithOtp
│   │       │   └── callback/route.ts       ← exchange code for session
│   │       └── webhook/
│   │           └── hotmart/route.ts        ← webhook receiver (escribe purchases)
│   │
│   ├── components/
│   │   ├── ui/                             ← botones, cards, inputs, progress bars
│   │   ├── layout/                         ← nav bottom, header, sidebar
│   │   ├── onboarding/                     ← steps del wizard
│   │   ├── plan/                           ← day card, day content
│   │   ├── diario/                         ← chart, form, symptom chips
│   │   ├── recetas/                        ← recipe card, recipe detail, filters
│   │   ├── calculadora/                    ← symptom slider, score gauge
│   │   └── progreso/                       ← streak counter, achievements
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                   ← createBrowserClient
│   │   │   ├── server.ts                   ← createServerClient
│   │   │   └── middleware.ts               ← updateSession helper
│   │   ├── access.ts                       ← getUserTier(email) → {hasFront, hasUpsell}
│   │   ├── plan-data.ts                    ← contenido días 1-30 (extraído de PDFs)
│   │   ├── recipes-data.ts                 ← 60 recetas con metadata
│   │   ├── shopping-data.ts                ← items por semana/categoría
│   │   ├── microbiota-symptoms.ts          ← 20 síntomas + scoring
│   │   └── types.ts                        ← tipos compartidos
│   │
│   ├── public/
│   │   ├── manifest.json
│   │   ├── sw.js                           ← service worker
│   │   ├── icons/
│   │   │   ├── icon-192.png
│   │   │   ├── icon-512.png
│   │   │   └── icon-maskable.png
│   │   └── recetas/                        ← placeholder images (luego IA)
│   │       └── placeholder.jpg
│   │
│   └── supabase/
│       └── migrations/
│           └── 0001_initial.sql            ← el SQL de arriba
│
├── app/                                    ← FUNNEL EXISTENTE (sin cambios)
│   ├── api/hotmart-webhook/route.ts        ← MODIFICAR: agregar escritura a Supabase
│   └── ...
└── docs/
    ├── _PWA-PLAN.md                        ← ESTE ARCHIVO
    └── PWA-AGENTS.md                       ← prompts de cada fase
```

---

## Variables de entorno de la PWA

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Hotmart product IDs (para mapear webhook → feature tier)
HOTMART_PRODUCT_ID_FRONT=xxxxxxx
HOTMART_PRODUCT_ID_UPSELL=xxxxxxx
HOTMART_HOTTOK=tu_hottok_secreto

# App
NEXT_PUBLIC_APP_URL=https://app.tudominio.com
NEXT_PUBLIC_FUNNEL_URL=https://tudominio.com
```

---

## Fases de implementación

Cada fase es un commit atómico. Si se cae internet, retomás desde la fase siguiente.

### FASE 1 — Scaffolding + Supabase + Auth
**Qué hace:**
- Inicializa `/pwa/` con Next.js 14 + TypeScript + Tailwind
- Instala dependencias (supabase, recharts, framer-motion, zustand, date-fns, next-pwa)
- Crea `lib/supabase/{client,server,middleware}.ts`
- Crea `supabase/migrations/0001_initial.sql`
- Crea `middleware.ts` (auth gate)
- Crea `/login` page + `/auth/callback` route
- Crea `/api/auth/login` route (verifica compra → envía magic link)
- Crea `lib/access.ts` (getUserTier)
- Crea `public/manifest.json` + `sw.js` básico
- `.env.local.example`

**Checkpoint:** Compilar sin errores. Flow: email con compra → magic link → sesión activa.

---

### FASE 2 — Webhook Hotmart → Supabase
**Qué hace:**
- Crea `/pwa/app/api/webhook/hotmart/route.ts`
- Recibe payload de Hotmart, valida hottok, escribe en tabla `purchases`
- Maneja PURCHASE_APPROVED, PURCHASE_COMPLETE, PURCHASE_REFUNDED, CHARGEBACK
- Actualiza status en refund/chargeback

**Checkpoint:** `curl` simulando webhook → fila en DB con email + product_id + amount.

---

### FASE 3 — Onboarding + Layout base
**Qué hace:**
- Root layout con nav inferior (mobile-first): Dashboard / Plan / Diario / Recetas / Más
- Header con nombre del usuario
- `/onboarding` wizard de 3 pasos:
  1. Bienvenida + recap diagnóstico (tipo hinchazón, severidad)
  2. ¿Qué síntoma querés trackear más? + horario recordatorio
  3. Tour visual de 4 cards (Plan / Diario / Recetas / Calculadora)
- Marca `onboarding_completed = true`
- Redirect logic: sin onboarding → /onboarding. Con onboarding → /dashboard

**Checkpoint:** Login → onboarding completo → dashboard. 2do login → directo a dashboard.

---

### FASE 4 — Plan día a día
**Qué hace:**
- `lib/plan-data.ts`: contenido de 30 días (extraído de protocolo-7-dias + programa-30-dias-semana-2)
- `/plan` page: grid de días con estado (locked/available/completed) según tier
- `/plan/[day]` page: contenido completo del día (5 comidas + tip + reglas)
- Botón "Completar día" → escribe `day_progress`
- Desbloqueo progresivo: día N+1 disponible si N completado
- Días 8-30 locked si no tiene upsell

**Checkpoint:** Ver plan, completar día 1, día 2 se desbloquea.

---

### FASE 5 — Diario de síntomas + gráficos
**Qué hace:**
- `/diario` page: gráfico de línea (recharts) con bloating_am/pm últimos 14/30 días
- `/diario/nuevo` page: formulario completo (sliders, checkboxes, notas)
- 1 entrada por día (upsert)
- Visualización de tendencia y mejora

**Checkpoint:** Registrar 3 días, gráfico muestra tendencia descendente.

---

### FASE 6 — Recetas (bento 2x2)
**Qué hace:**
- `lib/recipes-data.ts`: 60 recetas con metadata (nombre, tiempo, dificultad, momento, ingredientes, pasos, tip)
- `/recetas` page: bento grid 2x2 con imagen placeholder + nombre + tiempo
- Scroll infinito / cargar más
- Filtro por momento (desayuno/almuerzo/cena/snack)
- `/recetas/[id]` page: detalle completo + botón favorito
- Recetas 36-60 locked si no tiene bump
- Favoritos guardados en DB

**Checkpoint:** Ver grid, filtrar, abrir detalle, marcar favorito.

---

### FASE 7 — Lista de compras
**Qué hace:**
- `lib/shopping-data.ts`: items por semana (1-4), agrupados por categoría
- `/lista-compras` page: selector de semana + categorías colapsables + checkboxes
- Persist de checks en DB
- Semanas 2-4 locked si no tiene upsell

**Checkpoint:** Marcar items, refrescar, persisten. Cambiar semana.

---

### FASE 8 — Calculadora de microbiota
**Qué hace:**
- `lib/microbiota-symptoms.ts`: 20 síntomas con categorías (extraído de estructura-calculadora-microbiota.md)
- `/calculadora` page: formulario con los 20 síntomas (slider 0-4 cada uno)
- Scoring: score = 10 - (total/80)*10
- Interpretación automática (saludable/recuperación/moderado/significativo)
- `/calculadora/resultado` page: score gauge visual + breakdown por categoría + comparación con evaluación anterior
- Guardar en `microbiota_assessments`
- Permite re-tomar cada 7 días

**Checkpoint:** Completar 20 preguntas → ver score con gauge + interpretación.

---

### FASE 9 — Dashboard + progreso + gamificación
**Qué hace:**
- `/dashboard` page: card del día actual + último bloating + streak + accesos rápidos
- `/progreso` page: % plan completado, días consecutivos (streak), evolución microbiota (si hay 2+ evaluaciones), badges (7 días, 14 días, 30 días, primera receta fav, etc.)
- Streak se calcula desde day_progress + symptom_logs

**Checkpoint:** Dashboard refleja estado real. Progreso muestra métricas.

---

### FASE 10 — PWA polish (instalable + offline)
**Qué hace:**
- Service worker con cache-first para assets estáticos + plan-data
- Manifest completo con todos los campos
- Iconos reales (generados)
- Theme color + background color
- Splash screen config
- Banner "Instalar app" en mobile
- Lighthouse PWA score >90

**Checkpoint:** Instalable en móvil, funciona offline para contenido ya visto.

---

### FASE 11 — Hotmart inline en resultados (funnel existente)
**Qué hace:**
- Modifica el funnel existente (`app/resultados/`)
- Reemplaza/complementa el botón CTA con iframe de Hotmart Pay Inline
- Pasa email del quiz como param al iframe (prefill)
- Post-pago: redirect a `/pwa/login?email=xxx`

**Checkpoint:** Compra en sandbox Hotmart → redirect a PWA → magic link → acceso.

---

## Scope MVP vs Post-MVP

### MVP (sale a producción para correr ads)
**FASES 1 → 5 + 2 + 9 (parcial)**
- Auth + login + webhook
- Onboarding
- Plan día a día (7 días front, 30 con upsell)
- Diario de síntomas con gráficos
- Dashboard básico

### Post-MVP (si convierte)
- Fase 6: Recetas bento
- Fase 7: Lista de compras
- Fase 8: Calculadora microbiota
- Fase 9 completa: Gamificación
- Fase 10: PWA polish
- Fase 11: Hotmart inline

---

## Secuencia óptima de ejecución

```
FASE 1  ─── Scaffolding + Auth ──────────── (requisito para todo)
  ↓
FASE 2  ─── Webhook Hotmart ─────────────── (puede ir en paralelo con 3)
  ↓
FASE 3  ─── Onboarding + Layout ─────────── (base visual)
  ↓
FASE 4  ─── Plan día a día ──────────────── (core value)
  ↓
FASE 5  ─── Diario + gráficos ──────────── (core value)
  ↓
FASE 9  ─── Dashboard (parcial) ─────────── (MVP completo)
  ↓
── MVP LISTO PARA ADS ──
  ↓
FASE 6  ─── Recetas ─────────────────────── (post-MVP)
FASE 7  ─── Lista compras ──────────────── (post-MVP)
FASE 8  ─── Calculadora ────────────────── (post-MVP)
FASE 10 ─── PWA polish ─────────────────── (post-MVP)
FASE 11 ─── Hotmart inline ─────────────── (post-MVP)
```

---

## Design system de la PWA

Heredado del funnel con adaptaciones para app:

| Token | Valor | Uso |
|-------|-------|-----|
| `--sage` | `#7A9B7E` | Primary, botones, progreso |
| `--sage-soft` | `#E8EFE9` | Fondos de cards, highlights |
| `--cream` | `#FAF7F2` | Background principal |
| `--cream-warm` | `#F4EFE6` | Background alternativo |
| `--charcoal` | `#2D3A2E` | Texto principal |
| `--coral` | `#E07856` | Accent, alertas, CTAs secundarios |
| `--coral-soft` | `#F5C7B6` | Tips, recuadros especiales |
| `--sand` | `#D4C5A9` | Bordes, separadores |

**Tipografía:**
- Headings: Fraunces (serif, variable weight)
- Body: Inter (sans, 400/500/600)

**Componentes mobile-first:**
- Bottom nav con 5 tabs (iconos Phosphor)
- Cards con radius 16px, shadow-sm
- Sliders para puntuaciones 1-10
- Progress bars sage con animación
- Toast notifications
- Pull to refresh
- Skeleton loading states

---

*Última actualización: Mayo 2026*
*Siguiente paso: ejecutar FASE 1 usando el prompt del Agente PWA-01 en `docs/PWA-AGENTS.md`*

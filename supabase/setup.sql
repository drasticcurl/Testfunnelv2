-- ============================================================================
-- supabase/setup.sql — Schema completo para una DB Supabase NUEVA.
--
-- USO: copiar este archivo entero, pegarlo en
--      Supabase Dashboard → SQL Editor → New query → Run.
--      Tarda <5s. No requiere correr nada más para que el proyecto arranque.
--
-- Diseñado para una BASE NUEVA (proyecto Supabase recién creado, vacío).
-- Si querés correrlo sobre una DB que ya tiene datos: es idempotente
-- (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS), no destruye nada,
-- pero solo crea lo que falta.
--
-- Reemplaza a TODAS las migraciones individuales en supabase/migrations/*.sql
-- (esas se mantienen como referencia histórica de cómo evolucionó el schema
-- en el proyecto anterior, pero NO hace falta correrlas).
--
-- Tablas que crea:
--   1. clientes        → leads del quiz (1 row por persona que dejó email).
--   2. purchases       → ventas aprobadas (1 row por compra de Hotmart).
--   3. funnel_counts   → contadores agregados del embudo del quiz.
--
-- Países soportados (columna `country`): CL, CO, MX, PE, US.
-- Argentina (AR) y Brasil (BR) NO están en el set: esta versión del proyecto
-- vende fuera de AR y bloquea BR a nivel middleware.
-- ============================================================================


-- ─── 0) Extensiones ────────────────────────────────────────────────────────
-- gen_random_uuid() vive acá. Supabase ya viene con pgcrypto pre-creada en la
-- mayoría de los proyectos, pero lo ponemos por seguridad en proyectos viejos.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ─── 1) Helper: trigger genérico para updated_at ───────────────────────────
-- Reemplaza el valor de updated_at por NOW() en cada UPDATE. Lo usamos en
-- clientes; si después agregás más tablas con updated_at, podés reusar el
-- mismo trigger.

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- 2) Tabla `clientes` — leads del quiz funnel
-- ============================================================================
-- Cada row = 1 persona que completó el quiz y dejó su email.
-- La escribe `/api/submit-quiz` (upsert por email).
-- La leen los endpoints de admin (`/api/admin/leads-stats`, `/api/admin/leads-export`).

CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidad
  email TEXT NOT NULL,
  nombre TEXT,

  -- País de origen del lead (ISO 3166-1 alpha-2). Detectado en el cliente:
  -- (1) URL ?country=XX, (2) ruta /chile|/colombia|/..., (3) localStorage,
  -- (4) geo-IP. Default 'CL' (default histórico del funnel).
  country TEXT NOT NULL DEFAULT 'CL'
    CHECK (country IN ('CL','CO','MX','PE','US')),

  -- Datos del quiz (para segmentación de remarketing)
  apertura TEXT,
  momento TEXT,
  tiempo TEXT,
  sintomas TEXT[],
  ya_probo TEXT[],
  impacto_emocional TEXT,
  objetivo TEXT,
  compromiso TEXT,
  tipo_hinchazon SMALLINT,   -- 1..4 (calculado por calcularTipoV2)
  severidad SMALLINT,        -- 0..10 (entero — el código redondea decimales)

  -- Meta attribution (Pixel + CAPI)
  fbc TEXT,
  fbp TEXT,

  -- Estado
  email_enviado BOOLEAN NOT NULL DEFAULT FALSE,
  compro BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotencia del upsert por email (mismo lead que vuelve = update, no row nueva).
CREATE UNIQUE INDEX IF NOT EXISTS clientes_email_idx
  ON public.clientes (email);

-- Listados ordenados por fecha en /admin/leads.
CREATE INDEX IF NOT EXISTS clientes_created_idx
  ON public.clientes (created_at DESC);

-- Filtros por país en el admin (futuros).
CREATE INDEX IF NOT EXISTS clientes_country_idx
  ON public.clientes (country);

-- Trigger updated_at
DROP TRIGGER IF EXISTS clientes_updated_at ON public.clientes;
CREATE TRIGGER clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- RLS off — backend usa service_role key.
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 3) Tabla `purchases` — compras aprobadas (acceso a la PWA)
-- ============================================================================
-- Cada row = 1 transacción aprobada de Hotmart.
-- La escribe `/api/hotmart-webhook` con upsert por `hotmart_transaction`
-- (idempotente ante reintentos del webhook).
-- La lee `/api/pwa/auth/login` para autorizar acceso a la PWA y
-- `/api/admin/revenue-stats` para los KPIs de ventas.
--
-- IMPORTANTE: la columna se llama `hotmart_transaction` por compatibilidad
-- histórica con el código (los upserts usan `onConflict: 'hotmart_transaction'`).
-- Es solo el id de transacción del proveedor de pago (Hotmart en este proyecto).

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidad del comprador
  email TEXT NOT NULL,

  -- Identificador único de la transacción del provider (UNIQUE → idempotente).
  hotmart_transaction TEXT,

  -- Producto comprado (informativo; el acceso a la PWA NO depende del tier).
  product_id TEXT,
  product_name TEXT,
  amount NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Estado: 'approved' | 'refunded' | 'chargeback'.
  -- Solo 'approved' habilita acceso a la PWA.
  status TEXT NOT NULL DEFAULT 'approved',

  -- País del comprador (ISO 3166-1 alpha-2). Lo extrae el webhook del
  -- payload de Hotmart (buyer.address.country / address.country / 
  -- buyer.country). NULL si no vino.
  country TEXT
    CHECK (country IS NULL OR country IN ('CL','CO','MX','PE','US')),

  -- UTMs de atribución de la venta — viajan en el checkout URL y vuelven en
  -- los `xcod`/`src` parameters de Hotmart.
  utm_source   TEXT,
  utm_medium   TEXT,
  utm_campaign TEXT,
  utm_content  TEXT,
  utm_term     TEXT,

  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotencia: el upsert con onConflict='hotmart_transaction' garantiza que
-- un reintento del webhook no duplica la fila.
CREATE UNIQUE INDEX IF NOT EXISTS purchases_transaction_idx
  ON public.purchases (hotmart_transaction);

-- Login PWA: por email + status approved (lookup rápido).
CREATE INDEX IF NOT EXISTS purchases_email_status_idx
  ON public.purchases (email, status);

-- /admin/ventas filtra por utm_source y por country sobre status='approved'.
CREATE INDEX IF NOT EXISTS purchases_utm_source_idx
  ON public.purchases (utm_source)
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS purchases_country_idx
  ON public.purchases (country)
  WHERE status = 'approved';

ALTER TABLE public.purchases DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 4) Tabla `funnel_counts` — contadores agregados del embudo
-- ============================================================================
-- Una fila por combinación única de:
--   (event_name, slide, utm_*, quiz_version, country, day)
-- Cada visita a un slide / cada compra incrementa `count` en lugar de crear
-- una fila nueva → el dashboard escala a millones de eventos sin crecer.
--
-- Quién la escribe: lib/admin/supabase-store.ts vía RPC increment_funnel_count_daily.
-- Quién la lee   : /api/admin/funnel-data (vista /admin/funnel).
--
-- Decisiones del schema:
--  - day NOT NULL + DEFAULT GMT-3: cada escritura cae siempre en un día
--    determinado, así "Hoy" jamás colapsa con "Histórico" (ese fue el bug
--    que fixeó la migración 009).
--  - slide NOT NULL DEFAULT -1: -1 es el sentinel de "evento sin slide"
--    (ViewContent, Purchase, etc.). Evita que NULL ≠ NULL haga fallar el
--    UNIQUE → cada evento sin slide creaba una fila nueva en lugar de
--    incrementar la existente (ese fue el bug que fixeó la migración 009).
--  - country NOT NULL DEFAULT '(desconocido)': el track del cliente puede
--    no tener país detectado todavía (geo-IP en curso). Lo guardamos como
--    string; el set válido lo ponemos como CHECK con un slot para
--    '(desconocido)' que es el centinela.

CREATE TABLE IF NOT EXISTS public.funnel_counts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  event_name TEXT NOT NULL,

  -- -1 = sin slide (LandingView, ViewContent, Purchase, InitiateCheckout).
  slide SMALLINT NOT NULL DEFAULT -1,

  -- El embudo se agrupa SOLO por campaign para no inflar la cardinalidad.
  -- source/medium/content quedan fijos en '(directo)' por código.
  utm_source   TEXT NOT NULL DEFAULT '(directo)',
  utm_medium   TEXT NOT NULL DEFAULT '(directo)',
  utm_campaign TEXT NOT NULL DEFAULT '(directo)',
  utm_content  TEXT NOT NULL DEFAULT '(directo)',

  quiz_version TEXT NOT NULL DEFAULT 'v1',

  -- País de origen del usuario (ISO alpha-2 o '(desconocido)').
  country TEXT NOT NULL DEFAULT '(desconocido)'
    CHECK (country IN ('CL','CO','MX','PE','US','(desconocido)')),

  -- Día calendario en GMT-3 (America/Argentina/Buenos_Aires).
  day DATE NOT NULL
    DEFAULT ((NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date),

  count INTEGER NOT NULL DEFAULT 1
);

-- Índice único PLANO (sin COALESCE) — todas las columnas son NOT NULL.
-- Es el target del ON CONFLICT de las RPCs.
CREATE UNIQUE INDEX IF NOT EXISTS funnel_counts_unique_combo
  ON public.funnel_counts (
    event_name,
    slide,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    country,
    day
  );

-- Listados por día rápido (KPIs "Hoy"/"Ayer"/etc).
CREATE INDEX IF NOT EXISTS funnel_counts_day_idx
  ON public.funnel_counts (day);

ALTER TABLE public.funnel_counts DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 5) RPCs: increment_funnel_count_daily / increment_funnel_count
-- ============================================================================
-- Atómicas (INSERT … ON CONFLICT DO UPDATE) — seguras bajo concurrencia.
-- Las dos firman idéntico salvo p_day: la "_daily" lo recibe explícito,
-- la otra lo calcula sola. Las dos usan el mismo índice único de 8 columnas
-- (event, slide, utm_source, utm_medium, utm_campaign, utm_content, country, day).

-- Borramos cualquier overload previo para evitar ambigüedad.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT oid::regprocedure AS sig FROM pg_proc
    WHERE proname IN ('increment_funnel_count', 'increment_funnel_count_daily')
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig::text;
  END LOOP;
END $$;

CREATE FUNCTION public.increment_funnel_count_daily(
  p_event_name   TEXT,
  p_slide        SMALLINT DEFAULT NULL,
  p_utm_source   TEXT     DEFAULT '(directo)',
  p_utm_medium   TEXT     DEFAULT '(directo)',
  p_utm_campaign TEXT     DEFAULT '(directo)',
  p_utm_content  TEXT     DEFAULT '(directo)',
  p_quiz_version TEXT     DEFAULT 'v1',
  p_country      TEXT     DEFAULT '(desconocido)',
  p_day          DATE     DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_day     DATE     := COALESCE(p_day, (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date);
  v_slide   SMALLINT := COALESCE(p_slide, -1);
  v_country TEXT     := COALESCE(NULLIF(p_country, ''), '(desconocido)');
BEGIN
  INSERT INTO public.funnel_counts (
    event_name, slide,
    utm_source, utm_medium, utm_campaign, utm_content,
    quiz_version, country, day, count
  )
  VALUES (
    p_event_name, v_slide,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content,
    p_quiz_version, v_country, v_day, 1
  )
  ON CONFLICT (
    event_name, slide,
    utm_source, utm_medium, utm_campaign, utm_content,
    country, day
  )
  DO UPDATE SET count = public.funnel_counts.count + 1;
END;
$$;

-- Versión "vieja" (compat) — también day-aware, escribe en hoy GMT-3.
-- Si algún caller histórico la sigue llamando, igual escribe correcto.
CREATE FUNCTION public.increment_funnel_count(
  p_event_name   TEXT,
  p_slide        SMALLINT DEFAULT NULL,
  p_utm_source   TEXT     DEFAULT '(directo)',
  p_utm_medium   TEXT     DEFAULT '(directo)',
  p_utm_campaign TEXT     DEFAULT '(directo)',
  p_utm_content  TEXT     DEFAULT '(directo)',
  p_quiz_version TEXT     DEFAULT 'v1',
  p_country      TEXT     DEFAULT '(desconocido)'
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_day     DATE     := (NOW() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
  v_slide   SMALLINT := COALESCE(p_slide, -1);
  v_country TEXT     := COALESCE(NULLIF(p_country, ''), '(desconocido)');
BEGIN
  INSERT INTO public.funnel_counts (
    event_name, slide,
    utm_source, utm_medium, utm_campaign, utm_content,
    quiz_version, country, day, count
  )
  VALUES (
    p_event_name, v_slide,
    p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content,
    p_quiz_version, v_country, v_day, 1
  )
  ON CONFLICT (
    event_name, slide,
    utm_source, utm_medium, utm_campaign, utm_content,
    country, day
  )
  DO UPDATE SET count = public.funnel_counts.count + 1;
END;
$$;


-- ─── Listo ─────────────────────────────────────────────────────────────────
-- Para verificar: en SQL Editor correr
--   SELECT count(*) FROM public.clientes;
--   SELECT count(*) FROM public.purchases;
--   SELECT count(*) FROM public.funnel_counts;
-- Las tres deben dar 0 y no tirar error.

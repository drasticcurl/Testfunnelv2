-- Tabla `purchases` para habilitar el acceso a la PWA post-compra.
-- Ejecutar en Supabase SQL Editor o como migration.
--
-- IMPORTANTE: esta tabla ya existía en producción (la escribía el webhook de
-- Hotmart) pero NUNCA estuvo versionada acá. Esta migración la documenta y la
-- crea de forma IDEMPOTENTE (CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT
-- EXISTS), así correrla sobre la tabla existente NO rompe nada.
--
-- Quién la escribe:
--   - /api/shopify-webhook   (provider actual: orders/paid → status='approved')
--   - /api/hotmart-webhook   (legacy, mientras siga activo)
--
-- Quién la lee:
--   - /api/pwa/auth/login    (login PWA: email + status='approved')
--   - lib/pwa/access.ts      (acceso: cualquier compra aprobada = acceso total)
--
-- RLS: deshabilitada (solo acceso vía service_role key del backend).

CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,

  -- Identificador de transacción (UNIQUE → idempotencia ante reintentos del
  -- webhook). Histórico: se llama `hotmart_transaction` por compatibilidad.
  -- Para Shopify guardamos aquí `shopify_<order.id>`.
  hotmart_transaction TEXT,

  -- Datos del producto comprado (informativos; el acceso NO depende del tier).
  product_id TEXT,
  product_name TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'ARS',

  -- approved | refunded | chargeback
  status TEXT NOT NULL DEFAULT 'approved',

  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Por si la tabla ya existía sin alguna columna (idempotente):
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS hotmart_transaction TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS product_id TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ARS';
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS purchased_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- UNIQUE en la transacción → el upsert con onConflict='hotmart_transaction'
-- evita compras duplicadas si el webhook reintenta el mismo evento.
CREATE UNIQUE INDEX IF NOT EXISTS purchases_transaction_idx
  ON public.purchases (hotmart_transaction);

-- Lookup rápido en el login PWA (email + status).
CREATE INDEX IF NOT EXISTS purchases_email_status_idx
  ON public.purchases (email, status);

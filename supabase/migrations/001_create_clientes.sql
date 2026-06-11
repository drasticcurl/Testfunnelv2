-- Tabla `clientes` para persistir leads del quiz funnel.
-- Ejecutar en Supabase SQL Editor o como migration.
--
-- Cada row = 1 persona que completó el quiz y dejó su email.
-- Se usa para:
--   1. Enviar email de bienvenida (Resend)
--   2. Follow-up sequence (futuro)
--   3. Análisis de cohortes en admin
--
-- RLS: deshabilitada por ahora (solo acceso vía service_role key del backend).

CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  nombre TEXT,
  
  -- Datos del quiz (para segmentar y personalizar emails)
  apertura TEXT,
  momento TEXT,
  tiempo TEXT,
  sintomas TEXT[], -- array de strings
  ya_probo TEXT[],
  impacto_emocional TEXT,
  objetivo TEXT,
  compromiso TEXT,
  tipo_hinchazon SMALLINT, -- 1-4
  severidad SMALLINT, -- 0-10
  
  -- Meta attribution
  fbc TEXT,
  fbp TEXT,
  
  -- Estado
  email_enviado BOOLEAN DEFAULT FALSE,
  compro BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index por email para evitar duplicados y lookups rápidos
CREATE UNIQUE INDEX IF NOT EXISTS clientes_email_idx ON public.clientes (email);

-- Index por created_at para queries de admin
CREATE INDEX IF NOT EXISTS clientes_created_idx ON public.clientes (created_at DESC);

-- Trigger para auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- MIGRACIÓN: funnel_events → funnel_counts (contadores agregados)
--
-- PROBLEMA: La tabla funnel_events guardaba 1 fila por evento individual.
-- Con ~7 eventos por usuario, 150 usuarios = 1000 filas (límite free tier).
--
-- SOLUCIÓN: Nueva tabla funnel_counts con 1 fila por combinación única de
-- (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content).
-- Con 3 UTMs y 15 slides = máximo ~100 filas para millones de usuarios.
--
-- INSTRUCCIONES:
--   1. Ejecutar este SQL en el SQL Editor de Supabase (supabase.com/dashboard)
--   2. Después de verificar que funciona, podés borrar la tabla funnel_events
--      con: DROP TABLE IF EXISTS funnel_events;
-- ============================================================================

-- 1. Crear la tabla de contadores
CREATE TABLE IF NOT EXISTS funnel_counts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_name text NOT NULL,
  slide smallint,  -- NULL para eventos que no son QuizProgress (LandingView, ViewContent, etc.)
  utm_source text NOT NULL DEFAULT '(directo)',
  utm_medium text NOT NULL DEFAULT '(directo)',
  utm_campaign text NOT NULL DEFAULT '(directo)',
  utm_content text NOT NULL DEFAULT '(directo)',
  count integer NOT NULL DEFAULT 1
);

-- 2. Constraint UNIQUE para que el UPSERT funcione
-- Nota: PostgreSQL trata NULL como distinto en UNIQUE constraints normales,
-- por eso usamos COALESCE en un índice único parcial.
CREATE UNIQUE INDEX IF NOT EXISTS funnel_counts_unique_combo
  ON funnel_counts (event_name, COALESCE(slide, -1), utm_source, utm_medium, utm_campaign, utm_content);

-- 3. Función RPC para incrementar atómicamente (usada por el backend)
-- Es un INSERT ... ON CONFLICT DO UPDATE que garantiza atomicidad bajo concurrencia.
CREATE OR REPLACE FUNCTION increment_funnel_count(
  p_event_name text,
  p_slide smallint DEFAULT NULL,
  p_utm_source text DEFAULT '(directo)',
  p_utm_medium text DEFAULT '(directo)',
  p_utm_campaign text DEFAULT '(directo)',
  p_utm_content text DEFAULT '(directo)'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO funnel_counts (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, count)
  VALUES (p_event_name, p_slide, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, 1)
  ON CONFLICT (event_name, COALESCE(slide, -1), utm_source, utm_medium, utm_campaign, utm_content)
  DO UPDATE SET count = funnel_counts.count + 1;
END;
$$;

-- 4. (OPCIONAL) Migrar datos existentes de funnel_events a funnel_counts
-- Descomenta si querés conservar los datos que ya tenés:
--
-- INSERT INTO funnel_counts (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, count)
-- SELECT
--   event_name,
--   slide,
--   COALESCE(utms->>'utm_source', '(directo)'),
--   COALESCE(utms->>'utm_medium', '(directo)'),
--   COALESCE(utms->>'utm_campaign', '(directo)'),
--   COALESCE(utms->>'utm_content', '(directo)'),
--   COUNT(*)::integer
-- FROM funnel_events
-- GROUP BY
--   event_name,
--   slide,
--   COALESCE(utms->>'utm_source', '(directo)'),
--   COALESCE(utms->>'utm_medium', '(directo)'),
--   COALESCE(utms->>'utm_campaign', '(directo)'),
--   COALESCE(utms->>'utm_content', '(directo)')
-- ON CONFLICT (event_name, COALESCE(slide, -1), utm_source, utm_medium, utm_campaign, utm_content)
-- DO UPDATE SET count = funnel_counts.count + EXCLUDED.count;

-- 5. (OPCIONAL) Después de verificar que todo funciona:
-- DROP TABLE IF EXISTS funnel_events;

-- 6. Deshabilitar RLS (el backend usa service_role_key)
ALTER TABLE funnel_counts DISABLE ROW LEVEL SECURITY;

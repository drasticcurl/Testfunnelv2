-- ============================================================================
-- MIGRACIÓN 010: etiquetas de versión 'ar'/'latam' + aislamiento por versión
--
-- CONTEXTO: el quiz de Argentina (`/quiz`) histórico se guardó como 'v3', y el
-- de LATAM (`/latam`) se guardó MAL como 'v1' por un bug del mapeo en
-- /api/track. Además, la clave única de `funnel_counts` (migración 009) NO
-- incluye `quiz_version`, así que Argentina y LATAM que comparten
-- (event, slide, campaña, day) COLISIONAN en una sola fila contador → el
-- filtro por versión es estructuralmente imposible.
--
-- ESTA MIGRACIÓN:
--   (A) Re-etiqueta el Argentina histórico: 'v3' -> 'ar'.
--   (B) Incluye quiz_version en la clave única para que AR y LATAM NO
--       colisionen (cada versión ocupa su propia fila contador).
--   (C) Recrea los RPC increment_* con ON CONFLICT que incluya quiz_version y
--       default p_quiz_version = 'ar'.
--
-- LIMITACIÓN: el LATAM histórico quedó guardado como 'v1' (no separable con
-- certeza de la data vieja). NO se toca: 'v1' se deja intacto y solo aparece
-- en la vista "Unificado" del dashboard.
--
-- IDEMPOTENTE: se puede correr varias veces sin cambiar el estado final
-- (UPDATE acotado a 'v3', DROP INDEX IF EXISTS / CREATE UNIQUE INDEX IF NOT
-- EXISTS, y CREATE OR REPLACE de los RPC). Ejecutar en el SQL Editor de
-- Supabase. Reemplaza/complementa a 009.
-- ============================================================================

-- ── (A) Re-etiquetado de Argentina histórico: 'v3' -> 'ar'. ─────────────────
--     Acotado a las filas 'v3'; una 2ª corrida no encuentra filas y no cambia
--     nada. 'v1' (LATAM histórico + data vieja) y 'latam' quedan intactos.
UPDATE funnel_counts SET quiz_version = 'ar' WHERE quiz_version = 'v3';

-- ── (B) Recrear la clave única incluyendo quiz_version. ─────────────────────
--     Antes de recrear el índice, deduplicamos por la NUEVA clave (que incluye
--     quiz_version) para que el CREATE UNIQUE INDEX no falle si quedaron filas
--     que colapsaban AR/LATAM en la clave vieja. Colapsamos sumando count.
DROP INDEX IF EXISTS funnel_counts_unique_combo;

CREATE TEMP TABLE _fc_v010 AS
SELECT
  event_name,
  slide,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  COALESCE(quiz_version, 'ar') AS quiz_version,
  day,
  SUM(count)::integer AS count
FROM funnel_counts
GROUP BY
  event_name, slide, utm_source, utm_medium, utm_campaign, utm_content,
  COALESCE(quiz_version, 'ar'), day;

DELETE FROM funnel_counts;

INSERT INTO funnel_counts
  (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count)
SELECT
  event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count
FROM _fc_v010;

DROP TABLE _fc_v010;

-- El ÚNICO índice único correcto ahora incluye quiz_version (columnas planas;
-- day y slide ya son NOT NULL desde la migración 009).
CREATE UNIQUE INDEX IF NOT EXISTS funnel_counts_unique_combo
  ON funnel_counts (
    event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day, quiz_version
  );
CREATE INDEX IF NOT EXISTS funnel_counts_day_idx ON funnel_counts (day);

-- ── (C) Recrear los RPC increment_* con ON CONFLICT que incluya quiz_version ─
--     y default p_quiz_version = 'ar' (antes era 'v1'). Mismas firmas que 009
--     pero el ON CONFLICT ahora separa por versión.
CREATE OR REPLACE FUNCTION increment_funnel_count_daily(
  p_event_name text,
  p_slide smallint DEFAULT NULL,
  p_utm_source text DEFAULT '(directo)',
  p_utm_medium text DEFAULT '(directo)',
  p_utm_campaign text DEFAULT '(directo)',
  p_utm_content text DEFAULT '(directo)',
  p_quiz_version text DEFAULT 'ar',
  p_day date DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_day date := COALESCE(p_day, (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date);
  v_slide smallint := COALESCE(p_slide, -1);
BEGIN
  INSERT INTO funnel_counts (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count)
  VALUES (p_event_name, v_slide, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_quiz_version, v_day, 1)
  ON CONFLICT (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day, quiz_version)
  DO UPDATE SET count = funnel_counts.count + 1;
END;
$$;

CREATE OR REPLACE FUNCTION increment_funnel_count(
  p_event_name text,
  p_slide smallint DEFAULT NULL,
  p_utm_source text DEFAULT '(directo)',
  p_utm_medium text DEFAULT '(directo)',
  p_utm_campaign text DEFAULT '(directo)',
  p_utm_content text DEFAULT '(directo)',
  p_quiz_version text DEFAULT 'ar'
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_day date := (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date;
  v_slide smallint := COALESCE(p_slide, -1);
BEGIN
  INSERT INTO funnel_counts (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count)
  VALUES (p_event_name, v_slide, p_utm_source, p_utm_medium, p_utm_campaign, p_utm_content, p_quiz_version, v_day, 1)
  ON CONFLICT (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day, quiz_version)
  DO UPDATE SET count = funnel_counts.count + 1;
END;
$$;

-- RLS off (el backend usa service_role_key).
ALTER TABLE funnel_counts DISABLE ROW LEVEL SECURITY;

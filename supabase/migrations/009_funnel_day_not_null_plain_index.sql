-- ============================================================================
-- MIGRACIÓN 009: arreglo REAL del "todo va al histórico, hoy queda en 0".
--
-- DIAGNÓSTICO CORRECTO (007/008 estaban incompletos):
-- El índice único de 007/008 usaba COALESCE(day, '2000-01-01'). Si una escritura
-- entra con day = NULL (porque el path que escribe no setea el día y el DEFAULT
-- no se aplicó), ese COALESCE la convierte en '2000-01-01' y la FUSIONA con la
-- fila histórica. Resultado: cada evento nuevo (incluido cada step del quiz que
-- hago en vivo) se suma al HISTÓRICO ('2000-01-01') y nunca al día de hoy.
-- => acumulado cuenta todo, "Hoy" queda en 0.
--
-- SOLUCIÓN: que `day` (y `slide`) sean NOT NULL con DEFAULT, y que el índice
-- único use las columnas PLANAS (sin COALESCE). Así:
--   - Ninguna escritura puede entrar con day NULL (default = hoy GMT-3).
--   - Una escritura de HOY solo puede chocar con una fila de HOY, jamás con la
--     histórica. => los eventos nuevos caen siempre en el día correcto.
--   - El índice plano matchea el ON CONFLICT por lista de columnas (también el
--     upsert del cliente supabase-js), eliminando toda ambigüedad.
--
-- Idempotente. Ejecutar en el SQL Editor de Supabase. Reemplaza a 007 y 008.
-- ============================================================================

-- (A) slide NOT NULL con default -1 (sentinela de "sin slide").
UPDATE funnel_counts SET slide = -1 WHERE slide IS NULL;
ALTER TABLE funnel_counts ALTER COLUMN slide SET DEFAULT -1;
ALTER TABLE funnel_counts ALTER COLUMN slide SET NOT NULL;

-- (B) day NOT NULL con default = hoy GMT-3. Los NULL históricos -> sentinela.
ALTER TABLE funnel_counts ADD COLUMN IF NOT EXISTS day date;
UPDATE funnel_counts SET day = DATE '2000-01-01' WHERE day IS NULL;
ALTER TABLE funnel_counts
  ALTER COLUMN day SET DEFAULT ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date);
ALTER TABLE funnel_counts ALTER COLUMN day SET NOT NULL;

-- (C) Borrar TODOS los unique constraints / índices únicos (menos PK).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT con.conname FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    WHERE c.relname = 'funnel_counts' AND con.contype = 'u'
  LOOP
    EXECUTE 'ALTER TABLE funnel_counts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ' CASCADE';
  END LOOP;
  FOR r IN
    SELECT i.indexrelid::regclass AS idx FROM pg_index i
    JOIN pg_class c ON c.oid = i.indrelid
    WHERE c.relname = 'funnel_counts' AND i.indisunique AND NOT i.indisprimary
  LOOP
    EXECUTE 'DROP INDEX IF EXISTS ' || r.idx::text;
  END LOOP;
END $$;

-- (D) Colapsar por campaña + día (fusiona fb+ig de la misma campaña, dedup).
CREATE TEMP TABLE _fc_collapsed AS
SELECT
  event_name,
  slide,
  '(directo)'::text AS utm_source,
  '(directo)'::text AS utm_medium,
  COALESCE(NULLIF(utm_campaign, ''), '(directo)') AS utm_campaign,
  '(directo)'::text AS utm_content,
  COALESCE((array_agg(quiz_version ORDER BY count DESC NULLS LAST))[1], 'v1') AS quiz_version,
  day,
  SUM(count)::integer AS count
FROM funnel_counts
GROUP BY event_name, slide, COALESCE(NULLIF(utm_campaign, ''), '(directo)'), day;

DELETE FROM funnel_counts;
INSERT INTO funnel_counts
  (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count)
SELECT event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count
FROM _fc_collapsed;
DROP TABLE _fc_collapsed;

-- (E) Índice único con columnas PLANAS (sin COALESCE). day y slide son NOT NULL.
CREATE UNIQUE INDEX funnel_counts_unique_combo
  ON funnel_counts (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day);
CREATE INDEX IF NOT EXISTS funnel_counts_day_idx ON funnel_counts (day);

-- (F) Recrear las RPCs (ambas day-aware, ON CONFLICT por columnas planas).
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

CREATE FUNCTION increment_funnel_count_daily(
  p_event_name text,
  p_slide smallint DEFAULT NULL,
  p_utm_source text DEFAULT '(directo)',
  p_utm_medium text DEFAULT '(directo)',
  p_utm_campaign text DEFAULT '(directo)',
  p_utm_content text DEFAULT '(directo)',
  p_quiz_version text DEFAULT 'v1',
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
  ON CONFLICT (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day)
  DO UPDATE SET count = funnel_counts.count + 1;
END;
$$;

CREATE FUNCTION increment_funnel_count(
  p_event_name text,
  p_slide smallint DEFAULT NULL,
  p_utm_source text DEFAULT '(directo)',
  p_utm_medium text DEFAULT '(directo)',
  p_utm_campaign text DEFAULT '(directo)',
  p_utm_content text DEFAULT '(directo)',
  p_quiz_version text DEFAULT 'v1'
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
  ON CONFLICT (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, day)
  DO UPDATE SET count = funnel_counts.count + 1;
END;
$$;

ALTER TABLE funnel_counts DISABLE ROW LEVEL SECURITY;

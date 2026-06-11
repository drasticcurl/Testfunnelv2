-- ============================================================================
-- MIGRACIÓN 008: arreglo DEFINITIVO del tracking diario del funnel.
--
-- SÍNTOMA: el embudo "acumulado" suma, pero el de "Hoy" queda en 0.
--
-- CAUSA RAÍZ: en `funnel_counts` quedó un ÍNDICE ÚNICO viejo de 6 columnas
-- (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content) — SIN
-- `day` — con un nombre distinto al que la migración 007 intentó borrar.
-- Al insertar una fila del día de hoy, ese índice la bloquea (misma combinación
-- de 6 columnas que la fila histórica) y la escritura termina incrementando la
-- fila histórica (day = sentinela '2000-01-01') en vez de crear la de hoy.
-- => el acumulado crece pero "Hoy" nunca recibe filas.
--
-- SOLUCIÓN: borrar TODOS los unique constraints / índices únicos de
-- `funnel_counts` (cualquier nombre, menos la PK), dejar UNO solo que incluya
-- `day`, y recrear las funciones RPC para que SIEMPRE escriban en el día (GMT-3)
-- y hagan ON CONFLICT contra ese índice de 7 columnas.
--
-- Es idempotente: se puede correr varias veces. Reemplaza/complementa a 007.
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

-- (A) Columna `day` + default GMT-3 + backfill de NULLs al sentinela.
ALTER TABLE funnel_counts ADD COLUMN IF NOT EXISTS day date;
ALTER TABLE funnel_counts
  ALTER COLUMN day SET DEFAULT ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date);
UPDATE funnel_counts SET day = DATE '2000-01-01' WHERE day IS NULL;

-- (B) Borrar TODOS los unique constraints e índices únicos (cualquier nombre),
--     menos la PRIMARY KEY. Esto elimina cualquier índice de 6 cols que bloquee
--     la creación de filas por día.
DO $$
DECLARE r record;
BEGIN
  -- 1) constraints UNIQUE
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    WHERE c.relname = 'funnel_counts' AND con.contype = 'u'
  LOOP
    EXECUTE 'ALTER TABLE funnel_counts DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname) || ' CASCADE';
  END LOOP;

  -- 2) índices únicos sueltos (no PK)
  FOR r IN
    SELECT i.indexrelid::regclass AS idx
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indrelid
    WHERE c.relname = 'funnel_counts' AND i.indisunique AND NOT i.indisprimary
  LOOP
    EXECUTE 'DROP INDEX IF EXISTS ' || r.idx::text;
  END LOOP;
END $$;

-- (C) Colapsar por (event_name, slide, utm_campaign, day): fusiona fb+ig de la
--     misma campaña y deja source/medium/content en '(directo)'. Esto también
--     deduplica filas que podrían impedir crear el índice único nuevo.
CREATE TEMP TABLE _fc_collapsed AS
SELECT
  event_name,
  slide,
  '(directo)'::text AS utm_source,
  '(directo)'::text AS utm_medium,
  COALESCE(NULLIF(utm_campaign, ''), '(directo)') AS utm_campaign,
  '(directo)'::text AS utm_content,
  COALESCE((array_agg(quiz_version ORDER BY count DESC NULLS LAST))[1], 'v1') AS quiz_version,
  COALESCE(day, DATE '2000-01-01') AS day,
  SUM(count)::integer AS count
FROM funnel_counts
GROUP BY event_name, slide, COALESCE(NULLIF(utm_campaign, ''), '(directo)'), COALESCE(day, DATE '2000-01-01');

DELETE FROM funnel_counts;

INSERT INTO funnel_counts
  (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count)
SELECT event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count
FROM _fc_collapsed;

DROP TABLE _fc_collapsed;

-- (D) El ÚNICO índice único correcto (incluye day).
CREATE UNIQUE INDEX funnel_counts_unique_combo
  ON funnel_counts (
    event_name,
    COALESCE(slide, -1),
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    COALESCE(day, DATE '2000-01-01')
  );
CREATE INDEX IF NOT EXISTS funnel_counts_day_idx ON funnel_counts (day);

-- (E) Recrear las funciones RPC day-aware. Borramos cualquier overload previo
--     por nombre para evitar ambigüedad.
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

-- Función "diaria" (la que llama el código nuevo, con p_day).
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
BEGIN
  INSERT INTO funnel_counts (
    event_name, slide, utm_source, utm_medium, utm_campaign, utm_content,
    quiz_version, day, count
  )
  VALUES (
    p_event_name, p_slide, p_utm_source, p_utm_medium, p_utm_campaign,
    p_utm_content, p_quiz_version, v_day, 1
  )
  ON CONFLICT (
    event_name, COALESCE(slide, -1), utm_source, utm_medium, utm_campaign,
    utm_content, COALESCE(day, DATE '2000-01-01')
  )
  DO UPDATE SET count = funnel_counts.count + 1;
END;
$$;

-- Función "vieja" (compat): TAMBIÉN day-aware. Si por orden de deploy algún
-- caller viejo la llama, igual escribe en el día de hoy (GMT-3) y usa el mismo
-- índice de 7 columnas. Así el orden deploy/migración deja de importar.
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
BEGIN
  INSERT INTO funnel_counts (
    event_name, slide, utm_source, utm_medium, utm_campaign, utm_content,
    quiz_version, day, count
  )
  VALUES (
    p_event_name, p_slide, p_utm_source, p_utm_medium, p_utm_campaign,
    p_utm_content, p_quiz_version, v_day, 1
  )
  ON CONFLICT (
    event_name, COALESCE(slide, -1), utm_source, utm_medium, utm_campaign,
    utm_content, COALESCE(day, DATE '2000-01-01')
  )
  DO UPDATE SET count = funnel_counts.count + 1;
END;
$$;

-- (F) RLS off (el backend usa service_role_key).
ALTER TABLE funnel_counts DISABLE ROW LEVEL SECURITY;

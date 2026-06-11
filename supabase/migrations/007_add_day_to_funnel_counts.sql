-- ============================================================================
-- MIGRACIÓN 007: funnel por DÍA (GMT-3) + atribución SOLO por campaña
--
-- DOS CAMBIOS:
--
-- (A) TRACKING DIARIO: agregamos una columna `day` (date) a `funnel_counts`
--     que guarda el día calendario en GMT-3 (America/Argentina/Buenos_Aires).
--     Así el dashboard puede ver el embudo "por día" (Hoy, Ayer, cualquier
--     fecha) o el acumulado, sin tener que resetear a mano.
--
-- (B) ATRIBUCIÓN POR CAMPAÑA: el funnel deja de distinguir traffic source
--     (ig/fb), medium y content — solo importa la CAMPAÑA. Esto baja muchísimo
--     la cardinalidad de la tabla (clave para no llenar Supabase ahora que
--     sumamos la dimensión `day`). Además COLAPSAMOS las filas que ya existen:
--     "campaña 1 + fb" y "campaña 1 + ig" se fusionan en una sola fila
--     "campaña 1" sumando los conteos.
--
-- Resultado: 1 fila por (event_name, slide, utm_campaign, day).
-- source/medium/content quedan fijos en '(directo)'.
--
-- INSTRUCCIONES: ejecutar este SQL en el SQL Editor de Supabase. Es idempotente
-- (se puede correr varias veces sin romper nada).
-- ============================================================================

-- 1. Agregar la columna `day`. Default = hoy en GMT-3.
ALTER TABLE funnel_counts
  ADD COLUMN IF NOT EXISTS day date;

ALTER TABLE funnel_counts
  ALTER COLUMN day SET DEFAULT ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date);

-- 2. Backfill de filas históricas (day NULL) al sentinela '2000-01-01'
--    (en el dashboard se muestran como "Histórico (sin fecha)").
UPDATE funnel_counts
  SET day = DATE '2000-01-01'
  WHERE day IS NULL;

-- 3. Borrar el índice único viejo (estaba sobre source/medium/campaign/content)
--    para poder colapsar y luego recrearlo con la nueva forma.
DROP INDEX IF EXISTS funnel_counts_unique_combo;

-- 4. COLAPSAR filas existentes por campaña (fusiona fb + ig de la misma campaña).
--    Agrupa por (event_name, slide, utm_campaign, day) sumando count, y deja
--    source/medium/content en '(directo)'.
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
SELECT
  event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, day, count
FROM _fc_collapsed;

DROP TABLE _fc_collapsed;

-- 5. Recrear el índice único incluyendo el día.
--    (COALESCE para tratar NULL de forma estable, igual que con `slide`.)
CREATE UNIQUE INDEX IF NOT EXISTS funnel_counts_unique_combo
  ON funnel_counts (
    event_name,
    COALESCE(slide, -1),
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    COALESCE(day, DATE '2000-01-01')
  );

-- 6. Índice auxiliar para filtrar/listar por día rápido.
CREATE INDEX IF NOT EXISTS funnel_counts_day_idx ON funnel_counts (day);

-- 7. Nueva función RPC: incremento atómico CON día (y quiz_version).
--    Nombre nuevo para no pisar la firma del RPC anterior.
CREATE OR REPLACE FUNCTION increment_funnel_count_daily(
  p_event_name text,
  p_slide smallint DEFAULT NULL,
  p_utm_source text DEFAULT '(directo)',
  p_utm_medium text DEFAULT '(directo)',
  p_utm_campaign text DEFAULT '(directo)',
  p_utm_content text DEFAULT '(directo)',
  p_quiz_version text DEFAULT 'v1',
  p_day date DEFAULT ((now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date)
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO funnel_counts (
    event_name, slide, utm_source, utm_medium, utm_campaign, utm_content,
    quiz_version, day, count
  )
  VALUES (
    p_event_name, p_slide, p_utm_source, p_utm_medium, p_utm_campaign,
    p_utm_content, p_quiz_version,
    COALESCE(p_day, (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date), 1
  )
  ON CONFLICT (
    event_name,
    COALESCE(slide, -1),
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    COALESCE(day, DATE '2000-01-01')
  )
  DO UPDATE SET count = funnel_counts.count + 1;
END;
$$;

-- 8. RLS off (el backend usa service_role_key).
ALTER TABLE funnel_counts DISABLE ROW LEVEL SECURITY;

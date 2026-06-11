-- ============================================================================
-- Migration: Consolidate NULL slide rows into -1 sentinel
-- ============================================================================
--
-- The UNIQUE index `funnel_counts_unique_combo` uses:
--   (event_name, COALESCE(slide::integer, -1), utm_source, utm_medium, utm_campaign, utm_content)
--
-- After deploying the code fix (slide=-1 instead of NULL), there may be BOTH
-- null-slide rows (old) and -1-slide rows (new) for the same UTM combo.
-- This script merges the old NULL rows into the existing -1 rows.
--
-- Safe to run multiple times (idempotent).
-- ============================================================================

BEGIN;

-- Step 1: For NULL rows that have a matching -1 row, add counts to the -1 row
UPDATE funnel_counts AS target
SET count = target.count + source.total_count
FROM (
  SELECT
    event_name,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    SUM(count) AS total_count
  FROM funnel_counts
  WHERE slide IS NULL
  GROUP BY event_name, utm_source, utm_medium, utm_campaign, utm_content
) AS source
WHERE target.slide = -1
  AND target.event_name = source.event_name
  AND target.utm_source = source.utm_source
  AND target.utm_medium = source.utm_medium
  AND target.utm_campaign = source.utm_campaign
  AND target.utm_content = source.utm_content;

-- Step 2: For NULL rows WITHOUT a matching -1 row, consolidate and convert to -1
-- First, collect the consolidated data
CREATE TEMP TABLE _null_consolidated AS
SELECT
  event_name,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  quiz_version,
  SUM(count) AS total_count
FROM funnel_counts
WHERE slide IS NULL
GROUP BY event_name, utm_source, utm_medium, utm_campaign, utm_content, quiz_version;

-- Step 3: Delete ALL null-slide rows (they've either been merged in step 1
-- or will be re-inserted as -1 in step 4)
DELETE FROM funnel_counts WHERE slide IS NULL;

-- Step 4: Insert consolidated rows that didn't have a -1 match
INSERT INTO funnel_counts (event_name, slide, utm_source, utm_medium, utm_campaign, utm_content, quiz_version, count)
SELECT
  nc.event_name,
  -1,
  nc.utm_source,
  nc.utm_medium,
  nc.utm_campaign,
  nc.utm_content,
  nc.quiz_version,
  nc.total_count
FROM _null_consolidated nc
WHERE NOT EXISTS (
  SELECT 1 FROM funnel_counts fc
  WHERE fc.event_name = nc.event_name
    AND fc.slide = -1
    AND fc.utm_source = nc.utm_source
    AND fc.utm_medium = nc.utm_medium
    AND fc.utm_campaign = nc.utm_campaign
    AND fc.utm_content = nc.utm_content
);

DROP TABLE _null_consolidated;

COMMIT;

-- ============================================================================
-- Verification:
--   SELECT COUNT(*) FROM funnel_counts WHERE slide IS NULL;
--   -- Should return 0
--
--   SELECT event_name, utm_source, slide, count
--   FROM funnel_counts
--   WHERE event_name IN ('ViewContent', 'Purchase', 'InitiateCheckout')
--   ORDER BY event_name, count DESC;
-- ============================================================================

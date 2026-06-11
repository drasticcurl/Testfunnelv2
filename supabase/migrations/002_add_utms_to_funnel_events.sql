-- Add utms JSONB column to funnel_events table.
-- This stores the UTM parameters (source, medium, campaign, content) for each
-- tracked event, enabling attribution analysis in the admin panel.
--
-- Run this AFTER the initial funnel_events table already exists.
-- If the column already exists (idempotent), this will no-op.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'funnel_events'
      AND column_name = 'utms'
  ) THEN
    ALTER TABLE public.funnel_events ADD COLUMN utms JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Agrega columnas UTM a `purchases` para poder filtrar revenue por canal en
-- /admin/funnel (sección Ventas). Idempotente: ADD COLUMN IF NOT EXISTS.
--
-- Antes de esta migration, los UTMs se registraban solo en `funnel_counts`
-- (tabla agregada por contador, sin amounts). Ahora también se persisten por
-- venta para poder cruzar amount × utm_source en multi-select.
--
-- Quién las llena: shopify-webhook (y hotmart-webhook por consistencia).
-- Compras viejas (pre-deploy) quedan con NULL → caen en "(directo)" en la UI.

ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS utm_source   TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS utm_medium   TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS utm_content  TEXT;
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS utm_term     TEXT;

-- Index para que la query de revenue-stats sea barata cuando filtre por source.
CREATE INDEX IF NOT EXISTS purchases_utm_source_idx
  ON public.purchases (utm_source)
  WHERE status = 'approved';

-- Agrega columnas UTM a `clientes` para el puente de atribución por email.
--
-- Por qué: el front AR vende por Tienda Nube (checkout en otro dominio). Cuando
-- llega la venta (vía el código de conversión de la página /success/ → /api/track),
-- el único identificador disponible es el EMAIL del comprador. Para atribuir esa
-- venta a la campaña correcta en /admin/funnel (en vez de "(directo)") y para
-- enriquecer el Purchase de Meta CAPI con los mismos identificadores del funnel,
-- guardamos los UTMs del lead acá (los escribe /api/submit-quiz al capturar el
-- email) y los recuperamos por email en el momento de la compra.
--
-- Idempotente y no destructiva.

ALTER TABLE public.clientes
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content  TEXT,
  ADD COLUMN IF NOT EXISTS utm_term     TEXT,
  ADD COLUMN IF NOT EXISTS fbclid       TEXT;

-- Backfill de atribución (UTMs) para compras YA existentes en `purchases`.
--
-- Contexto: el webhook de Shopify ahora pasa los UTMs como cart attributes y,
-- si una orden de upsell/downsell llega sin UTMs, los hereda de la compra
-- previa del mismo email. Pero las compras VIEJAS (pre-deploy) quedaron con
-- utm_source NULL → caen en "(directo)" en /admin/ventas.
--
-- Esta migración rellena esas filas copiando los UTMs de la compra del mismo
-- email que SÍ tiene atribución (la más reciente con purchased_at <= la fila
-- a rellenar; típicamente, la venta del FRONT que originó al comprador).
--
-- Es idempotente y NO destructiva: solo toca filas con utm_source NULL y solo
-- si existe una compra "hermana" atribuida del mismo email. Se puede correr
-- varias veces sin efectos secundarios.

UPDATE public.purchases AS tgt
SET
  utm_source   = src.utm_source,
  utm_medium   = COALESCE(tgt.utm_medium,   src.utm_medium),
  utm_campaign = COALESCE(tgt.utm_campaign, src.utm_campaign),
  utm_content  = COALESCE(tgt.utm_content,  src.utm_content),
  utm_term     = COALESCE(tgt.utm_term,     src.utm_term)
FROM public.purchases AS src
WHERE tgt.utm_source IS NULL
  AND src.email = tgt.email
  AND src.utm_source IS NOT NULL
  -- Elegimos la compra atribuida más reciente que ocurrió ANTES (o igual) que
  -- la fila a rellenar. Para un upsell, eso es la compra del front.
  AND src.purchased_at = (
    SELECT MAX(s2.purchased_at)
    FROM public.purchases AS s2
    WHERE s2.email = tgt.email
      AND s2.utm_source IS NOT NULL
      AND s2.purchased_at <= COALESCE(tgt.purchased_at, NOW())
  );

-- Fallback: si una compra sin UTMs no tiene ninguna compra atribuida ANTERIOR
-- (ej. el front se perdió pero el upsell sí tenía UTMs), heredamos de CUALQUIER
-- compra atribuida del mismo email (la más reciente).
UPDATE public.purchases AS tgt
SET
  utm_source   = src.utm_source,
  utm_medium   = COALESCE(tgt.utm_medium,   src.utm_medium),
  utm_campaign = COALESCE(tgt.utm_campaign, src.utm_campaign),
  utm_content  = COALESCE(tgt.utm_content,  src.utm_content),
  utm_term     = COALESCE(tgt.utm_term,     src.utm_term)
FROM public.purchases AS src
WHERE tgt.utm_source IS NULL
  AND src.email = tgt.email
  AND src.utm_source IS NOT NULL
  AND src.purchased_at = (
    SELECT MAX(s2.purchased_at)
    FROM public.purchases AS s2
    WHERE s2.email = tgt.email
      AND s2.utm_source IS NOT NULL
  );

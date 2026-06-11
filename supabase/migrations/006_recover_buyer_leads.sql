-- Recupera como leads a los COMPRADORES cuyo email quedó en `purchases` pero
-- nunca se guardó en `clientes`.
--
-- Contexto: un bug guardaba `severidad` (decimal) en una columna SMALLINT, lo
-- que hacía fallar el INSERT en `clientes` para la mayoría de los leads. Los
-- compradores sí quedaron registrados en `purchases` (otro flujo), así que de
-- ahí podemos reconstruir al menos esos leads.
--
-- NOTA: los leads que NO compraron y fallaron al guardarse NO se pueden
-- recuperar (no quedaron en ninguna tabla). Esta migración solo recupera
-- compradores.
--
-- Idempotente: ON CONFLICT (email) DO NOTHING. Se puede correr varias veces.

INSERT INTO public.clientes (email, compro, created_at)
SELECT
  LOWER(TRIM(p.email)) AS email,
  TRUE                 AS compro,
  MIN(p.purchased_at)  AS created_at  -- aproximamos la fecha de lead a la 1ra compra
FROM public.purchases AS p
WHERE p.status = 'approved'
  AND p.email IS NOT NULL
  AND TRIM(p.email) <> ''
GROUP BY LOWER(TRIM(p.email))
ON CONFLICT (email) DO NOTHING;

-- Marca compro=true en compradores que ya estaban como lead (por consistencia
-- con la sección Leads del admin).
UPDATE public.clientes AS c
SET compro = TRUE
FROM (
  SELECT DISTINCT LOWER(TRIM(email)) AS email
  FROM public.purchases
  WHERE status = 'approved'
) AS b
WHERE LOWER(TRIM(c.email)) = b.email
  AND c.compro IS DISTINCT FROM TRUE;

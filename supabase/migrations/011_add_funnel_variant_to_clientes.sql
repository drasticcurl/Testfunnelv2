-- ============================================================================
-- MIGRACIÓN 011: columna funnel_variant en `clientes` (test full-funnel AR)
--
-- CONTEXTO: el test FULL-FUNNEL de Argentina (Funnel A control vs Funnel B
-- rebrand) necesita atribuir la VENTA del front (Tienda Nube, que llega por
-- email desde /success/) a la variante que vio el visitante. La variante se
-- asigna en el cliente (localStorage `ab_funnel_v1`) y /api/submit-quiz la
-- guarda acá, para que /api/track la recupere por email al confirmarse la
-- compra y registre `af_<V>_purchase`.
--
-- ADITIVA, NULLABLE y NO BREAKING:
--   - columna nueva, opcional → no afecta filas existentes ni el schema previo.
--   - NULL para leads pre-test y para LATAM (que nunca se asigna variante).
--
-- IDEMPOTENTE: ADD COLUMN IF NOT EXISTS / COMMENT se pueden correr varias veces.
-- Ejecutar en el SQL Editor de Supabase.
-- ============================================================================

ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS funnel_variant text;

COMMENT ON COLUMN clientes.funnel_variant IS
  'Variante del test full-funnel AR (A=control, B=rebrand). NULL para leads pre-test / LATAM.';

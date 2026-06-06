ALTER TABLE products
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS qr_code_value text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_company_qr_code_value
  ON products(company_id, qr_code_value)
  WHERE qr_code_value IS NOT NULL;

ALTER TABLE stock_movements
  ADD COLUMN IF NOT EXISTS stock_before numeric(12,2),
  ADD COLUMN IF NOT EXISTS stock_after numeric(12,2),
  ADD COLUMN IF NOT EXISTS reason text,
  ADD COLUMN IF NOT EXISTS supplier text;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'estoque', 'instrutor_os', 'tecnico', 'vendedor'));

UPDATE products
SET qr_code_value = 'PROD:' || sku
WHERE qr_code_value IS NULL AND sku IS NOT NULL;

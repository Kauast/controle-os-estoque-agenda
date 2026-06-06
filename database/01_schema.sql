CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'estoque', 'instrutor_os', 'tecnico', 'vendedor')),
  active boolean NOT NULL DEFAULT true,
  can_view_financial boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  document_number text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  email text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, name)
);

CREATE TABLE team_members (
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, technician_id)
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  category text,
  location text,
  qr_code_value text,
  quantity_total numeric(12,2) NOT NULL DEFAULT 0 CHECK (quantity_total >= 0),
  quantity_reserved numeric(12,2) NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_available numeric(12,2) GENERATED ALWAYS AS (quantity_total - quantity_reserved) STORED,
  min_quantity numeric(12,2) NOT NULL DEFAULT 0 CHECK (min_quantity >= 0),
  purchase_cost numeric(12,2) NOT NULL DEFAULT 0 CHECK (purchase_cost >= 0),
  sale_price numeric(12,2) NOT NULL DEFAULT 0 CHECK (sale_price >= 0),
  supplier text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, sku),
  UNIQUE (company_id, qr_code_value),
  CHECK (quantity_reserved <= quantity_total)
);

CREATE TABLE service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  os_number text NOT NULL,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  technician_id uuid REFERENCES technicians(id) ON DELETE SET NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  service_address text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'aguardando_material', 'material_solicitado', 'material_separado', 'em_andamento', 'finalizada', 'cancelada')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta')),
  opened_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  completed_at timestamptz,
  service_value numeric(12,2) NOT NULL DEFAULT 0 CHECK (service_value >= 0),
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'parcial', 'pago', 'cancelado')),
  tracker_chip_id text,
  tracker_chip_verified_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, os_number)
);

CREATE TABLE material_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  justification text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'negada', 'separada', 'retirada', 'cancelada')),
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  separated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  withdrawn_by uuid REFERENCES users(id) ON DELETE SET NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  withdrawn_at timestamptz
);

CREATE TABLE stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  movement_type text NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'reserva', 'cancelamento_reserva', 'ajuste')),
  quantity numeric(12,2) NOT NULL CHECK (quantity > 0),
  stock_before numeric(12,2),
  stock_after numeric(12,2),
  reason text,
  supplier text,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  service_order_id uuid REFERENCES service_orders(id) ON DELETE SET NULL,
  material_request_id uuid REFERENCES material_requests(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_order_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  photo_type text NOT NULL CHECK (photo_type IN ('antes', 'durante', 'depois', 'extra')),
  file_url text NOT NULL,
  storage_key text,
  file_name text,
  mime_type text,
  file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  uploaded_by uuid REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_order_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid NOT NULL UNIQUE REFERENCES service_orders(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  signature_url text NOT NULL,
  storage_key text,
  file_name text,
  mime_type text,
  file_size_bytes bigint CHECK (file_size_bytes IS NULL OR file_size_bytes >= 0),
  signed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE service_order_instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  instructed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  instruction_type text NOT NULL DEFAULT 'distribuicao' CHECK (instruction_type IN ('distribuicao', 'orientacao_tecnica', 'redirecionamento', 'revisao_qualidade')),
  notes text NOT NULL,
  pending_items integer NOT NULL DEFAULT 0 CHECK (pending_items >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE technician_status (
  technician_id uuid PRIMARY KEY REFERENCES technicians(id) ON DELETE CASCADE,
  current_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  current_service_order_id uuid REFERENCES service_orders(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'a_caminho', 'em_atendimento', 'aguardando_checklist', 'redirecionado', 'offline')),
  last_location text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE technician_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id uuid NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
  from_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  to_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  service_order_id uuid REFERENCES service_orders(id) ON DELETE SET NULL,
  reason text,
  redirected_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_company_role ON users(company_id, role);
CREATE INDEX idx_service_orders_company_status ON service_orders(company_id, status);
CREATE INDEX idx_service_orders_technician ON service_orders(technician_id, status);
CREATE INDEX idx_products_company_active ON products(company_id, active);
CREATE INDEX idx_material_requests_status ON material_requests(status, requested_at);
CREATE INDEX idx_stock_movements_product_date ON stock_movements(product_id, created_at);
CREATE INDEX idx_service_order_photos_order ON service_order_photos(service_order_id, photo_type);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at);

CREATE OR REPLACE FUNCTION require_stock_or_admin(user_id uuid)
RETURNS void AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM users WHERE id = user_id;

  IF user_role NOT IN ('admin', 'estoque') THEN
    RAISE EXCEPTION 'Only admin or estoque users can approve, separate or confirm material withdrawal';
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION apply_material_request_stock_rules()
RETURNS trigger AS $$
DECLARE
  available_quantity numeric(12,2);
BEGIN
  IF NEW.status IN ('aprovada', 'negada') THEN
    IF NEW.approved_by IS NULL THEN
      RAISE EXCEPTION 'approved_by is required for approved or denied material requests';
    END IF;
    PERFORM require_stock_or_admin(NEW.approved_by);
  END IF;

  IF NEW.status = 'separada' THEN
    IF NEW.separated_by IS NULL THEN
      RAISE EXCEPTION 'separated_by is required to separate material';
    END IF;
    PERFORM require_stock_or_admin(NEW.separated_by);
  END IF;

  IF NEW.status = 'retirada' THEN
    IF NEW.withdrawn_by IS NULL THEN
      RAISE EXCEPTION 'withdrawn_by is required to confirm material withdrawal';
    END IF;
    PERFORM require_stock_or_admin(NEW.withdrawn_by);
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status AND NEW.status = 'aprovada' THEN
    SELECT quantity_available INTO available_quantity
    FROM products
    WHERE id = NEW.product_id
    FOR UPDATE;

    IF available_quantity < NEW.quantity THEN
      RAISE EXCEPTION 'Insufficient available stock to approve material request';
    END IF;

    UPDATE products
    SET quantity_reserved = quantity_reserved + NEW.quantity
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, user_id, service_order_id, material_request_id, notes)
    VALUES (NEW.product_id, 'reserva', NEW.quantity, NEW.approved_by, NEW.service_order_id, NEW.id, 'Reserva gerada por aprovacao de solicitacao');

    NEW.approved_at = COALESCE(NEW.approved_at, now());
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status <> NEW.status AND NEW.status = 'retirada' THEN
    UPDATE products
    SET
      quantity_total = quantity_total - NEW.quantity,
      quantity_reserved = GREATEST(quantity_reserved - NEW.quantity, 0)
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, user_id, service_order_id, material_request_id, notes)
    VALUES (NEW.product_id, 'saida', NEW.quantity, NEW.withdrawn_by, NEW.service_order_id, NEW.id, 'Baixa gerada por retirada confirmada');

    NEW.withdrawn_at = COALESCE(NEW.withdrawn_at, now());
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IN ('aprovada', 'separada') AND NEW.status IN ('negada', 'cancelada') THEN
    UPDATE products
    SET quantity_reserved = GREATEST(quantity_reserved - NEW.quantity, 0)
    WHERE id = NEW.product_id;

    INSERT INTO stock_movements (product_id, movement_type, quantity, user_id, service_order_id, material_request_id, notes)
    VALUES (NEW.product_id, 'cancelamento_reserva', NEW.quantity, COALESCE(NEW.approved_by, OLD.approved_by), NEW.service_order_id, NEW.id, 'Reserva cancelada');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apply_material_request_stock_rules
BEFORE UPDATE OF status ON material_requests
FOR EACH ROW
EXECUTE FUNCTION apply_material_request_stock_rules();

CREATE OR REPLACE FUNCTION validate_service_order_completion()
RETURNS trigger AS $$
DECLARE
  photo_count integer;
  has_signature boolean;
BEGIN
  IF NEW.status = 'finalizada' AND OLD.status IS DISTINCT FROM 'finalizada' THEN
    SELECT COUNT(*) INTO photo_count
    FROM service_order_photos
    WHERE service_order_id = NEW.id;

    SELECT EXISTS (
      SELECT 1
      FROM service_order_signatures
      WHERE service_order_id = NEW.id
    ) INTO has_signature;

    IF photo_count < 3 OR NOT has_signature OR NEW.tracker_chip_id IS NULL OR btrim(NEW.tracker_chip_id) = '' THEN
      RAISE EXCEPTION 'OS cannot be completed without at least 3 photos, client signature and tracker chip id';
    END IF;

    NEW.completed_at = COALESCE(NEW.completed_at, now());
    NEW.tracker_chip_verified_at = COALESCE(NEW.tracker_chip_verified_at, now());
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_service_order_completion
BEFORE UPDATE OF status ON service_orders
FOR EACH ROW
EXECUTE FUNCTION validate_service_order_completion();

CREATE OR REPLACE VIEW product_stock AS
SELECT
  id AS product_id,
  company_id,
  sku,
  name,
  category,
  location,
  qr_code_value,
  quantity_total,
  quantity_reserved,
  quantity_available,
  min_quantity,
  purchase_cost,
  sale_price,
  supplier,
  quantity_total * purchase_cost AS stock_value
FROM products;

CREATE OR REPLACE VIEW monthly_financial_summary AS
WITH material_by_os AS (
  SELECT
    mr.service_order_id,
    SUM(mr.quantity * p.sale_price) AS material_sold_value,
    SUM(mr.quantity * p.purchase_cost) AS material_cost_value
  FROM material_requests mr
  JOIN products p ON p.id = mr.product_id
  WHERE mr.status = 'retirada'
  GROUP BY mr.service_order_id
)
SELECT
  so.company_id,
  date_trunc('month', so.opened_at)::date AS month,
  COALESCE(SUM(mo.material_sold_value), 0) AS material_sold_value,
  COALESCE(SUM(so.service_value), 0) AS scheduled_service_value,
  COALESCE(SUM(so.service_value), 0) + COALESCE(SUM(mo.material_sold_value), 0) AS expected_revenue,
  COALESCE(SUM(mo.material_cost_value), 0) AS material_cost_value,
  COALESCE(SUM(so.service_value), 0) + COALESCE(SUM(mo.material_sold_value), 0) - COALESCE(SUM(mo.material_cost_value), 0) AS estimated_profit
FROM service_orders so
LEFT JOIN material_by_os mo ON mo.service_order_id = so.id
WHERE so.status <> 'cancelada'
GROUP BY so.company_id, date_trunc('month', so.opened_at);

CREATE OR REPLACE VIEW team_status_summary AS
SELECT
  t.id AS team_id,
  t.company_id,
  t.name AS team_name,
  t.notes,
  COUNT(DISTINCT tm.technician_id) AS member_count,
  COUNT(DISTINCT so.id) FILTER (WHERE so.status IN ('aberta', 'aguardando_material', 'material_solicitado', 'material_separado', 'em_andamento')) AS active_orders,
  COUNT(DISTINCT ts.technician_id) FILTER (WHERE ts.status = 'disponivel') AS available_technicians,
  COUNT(DISTINCT ts.technician_id) FILTER (WHERE ts.status = 'a_caminho') AS on_route_technicians,
  COUNT(DISTINCT ts.technician_id) FILTER (WHERE ts.status = 'em_atendimento') AS in_service_technicians,
  COUNT(DISTINCT ts.technician_id) FILTER (WHERE ts.status = 'redirecionado') AS redirected_technicians,
  CASE
    WHEN COUNT(DISTINCT ts.technician_id) FILTER (WHERE ts.status = 'em_atendimento') > 0 THEN 'em_atendimento'
    WHEN COUNT(DISTINCT ts.technician_id) FILTER (WHERE ts.status = 'a_caminho') > 0 THEN 'a_caminho'
    WHEN COUNT(DISTINCT so.id) FILTER (WHERE so.status IN ('aberta', 'material_solicitado', 'material_separado')) > 0 THEN 'agendada'
    ELSE 'disponivel'
  END AS team_status
FROM teams t
LEFT JOIN team_members tm ON tm.team_id = t.id
LEFT JOIN technician_status ts ON ts.technician_id = tm.technician_id
LEFT JOIN service_orders so ON so.team_id = t.id
GROUP BY t.id;

CREATE OR REPLACE VIEW team_performance_report AS
SELECT
  t.id AS team_id,
  t.company_id,
  t.name AS team_name,
  COUNT(DISTINCT so.id) FILTER (WHERE so.status = 'finalizada') AS completed_orders,
  COUNT(DISTINCT so.id) FILTER (WHERE so.status IN ('aberta', 'material_solicitado', 'material_separado', 'em_andamento')) AS active_orders,
  COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (so.completed_at - so.opened_at)) / 3600) FILTER (WHERE so.completed_at IS NOT NULL), 2), 0) AS average_hours,
  COUNT(DISTINCT mr.id) FILTER (WHERE mr.status = 'retirada') AS withdrawn_material_requests,
  COUNT(DISTINCT sig.id) AS orders_with_signature,
  COUNT(DISTINCT photo.id) AS photos_uploaded
FROM teams t
LEFT JOIN service_orders so ON so.team_id = t.id
LEFT JOIN material_requests mr ON mr.service_order_id = so.id
LEFT JOIN service_order_signatures sig ON sig.service_order_id = so.id
LEFT JOIN service_order_photos photo ON photo.service_order_id = so.id
GROUP BY t.id;

CREATE OR REPLACE VIEW instruction_report AS
SELECT
  u.id AS instructor_id,
  u.company_id,
  u.name AS instructor_name,
  COUNT(soi.id) AS instructions_created,
  COUNT(soi.id) FILTER (WHERE soi.instruction_type = 'redirecionamento') AS redirects_created,
  COALESCE(SUM(soi.pending_items), 0) AS pending_items,
  MAX(soi.created_at) AS last_instruction_at
FROM users u
LEFT JOIN service_order_instructions soi ON soi.instructed_by = u.id
WHERE u.role IN ('admin', 'instrutor_os')
GROUP BY u.id;

CREATE OR REPLACE VIEW client_service_history AS
SELECT
  c.id AS client_id,
  c.company_id,
  c.name AS client_name,
  so.id AS service_order_id,
  so.os_number,
  so.description,
  so.status,
  so.opened_at,
  so.completed_at,
  t.name AS team_name,
  tech.name AS technician_name,
  COUNT(DISTINCT photo.id) AS photo_count,
  jsonb_agg(
    DISTINCT jsonb_build_object(
      'id', photo.id,
      'type', photo.photo_type,
      'url', photo.file_url,
      'storageKey', photo.storage_key,
      'uploadedAt', photo.uploaded_at
    )
  ) FILTER (WHERE photo.id IS NOT NULL) AS photos,
  CASE
    WHEN sig.id IS NULL THEN NULL
    ELSE jsonb_build_object(
      'clientName', sig.client_name,
      'url', sig.signature_url,
      'storageKey', sig.storage_key,
      'signedAt', sig.signed_at
    )
  END AS signature
FROM clients c
JOIN service_orders so ON so.client_id = c.id
LEFT JOIN teams t ON t.id = so.team_id
LEFT JOIN technicians tech ON tech.id = so.technician_id
LEFT JOIN service_order_photos photo ON photo.service_order_id = so.id
LEFT JOIN service_order_signatures sig ON sig.service_order_id = so.id
GROUP BY c.id, so.id, t.name, tech.name, sig.id;

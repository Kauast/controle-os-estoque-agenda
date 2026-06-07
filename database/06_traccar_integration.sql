CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  plate text,
  model text,
  tracker_chip_id text,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, plate),
  UNIQUE (company_id, tracker_chip_id)
);

CREATE TABLE IF NOT EXISTS traccar_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  traccar_id bigint NOT NULL,
  unique_id text,
  name text NOT NULL,
  status text,
  disabled boolean,
  phone text,
  model text,
  contact text,
  category text,
  position_id bigint,
  last_update timestamptz,
  attributes jsonb,
  raw jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, traccar_id),
  UNIQUE (company_id, unique_id)
);

CREATE TABLE IF NOT EXISTS traccar_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  traccar_device_id uuid NOT NULL REFERENCES traccar_devices(id) ON DELETE CASCADE,
  traccar_position_id bigint,
  device_time timestamptz,
  fix_time timestamptz,
  server_time timestamptz,
  valid boolean,
  latitude numeric(10,7) NOT NULL,
  longitude numeric(10,7) NOT NULL,
  altitude numeric(12,2),
  speed numeric(12,2),
  course numeric(12,2),
  address text,
  accuracy numeric(12,2),
  attributes jsonb,
  raw jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, traccar_position_id)
);

CREATE INDEX IF NOT EXISTS idx_vehicles_company_team ON vehicles(company_id, team_id, active);
CREATE INDEX IF NOT EXISTS idx_traccar_devices_company_status ON traccar_devices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_traccar_positions_device_time ON traccar_positions(traccar_device_id, fix_time DESC, received_at DESC);

CREATE OR REPLACE VIEW fleet_tracking_status AS
SELECT
  d.company_id,
  d.id AS device_id,
  d.traccar_id,
  d.unique_id,
  d.name AS device_name,
  d.status AS device_status,
  d.last_update,
  d.synced_at,
  v.id AS vehicle_id,
  v.name AS vehicle_name,
  v.plate,
  v.model AS vehicle_model,
  v.tracker_chip_id,
  t.id AS team_id,
  t.name AS team_name,
  p.fix_time,
  p.latitude,
  p.longitude,
  p.speed,
  p.course,
  p.address,
  p.valid,
  p.attributes AS position_attributes
FROM traccar_devices d
LEFT JOIN vehicles v ON v.id = d.vehicle_id
LEFT JOIN teams t ON t.id = COALESCE(d.team_id, v.team_id)
LEFT JOIN LATERAL (
  SELECT *
  FROM traccar_positions tp
  WHERE tp.traccar_device_id = d.id
  ORDER BY tp.fix_time DESC NULLS LAST, tp.received_at DESC
  LIMIT 1
) p ON true;

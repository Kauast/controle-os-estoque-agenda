ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS checkin_location text,
  ADD COLUMN IF NOT EXISTS technician_notes text;

CREATE TABLE IF NOT EXISTS service_order_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_order_id uuid NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_order_notes_order
  ON service_order_notes(service_order_id, created_at);

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

    IF NEW.started_at IS NULL OR photo_count < 3 OR NOT has_signature OR NEW.tracker_chip_id IS NULL OR btrim(NEW.tracker_chip_id) = '' THEN
      RAISE EXCEPTION 'OS cannot be completed without check-in, at least 3 photos, client signature and tracker chip id';
    END IF;

    NEW.completed_at = COALESCE(NEW.completed_at, now());
    NEW.tracker_chip_verified_at = COALESCE(NEW.tracker_chip_verified_at, now());
  END IF;

  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

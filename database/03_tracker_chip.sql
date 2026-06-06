ALTER TABLE service_orders
  ADD COLUMN IF NOT EXISTS tracker_chip_id text,
  ADD COLUMN IF NOT EXISTS tracker_chip_verified_at timestamptz;

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

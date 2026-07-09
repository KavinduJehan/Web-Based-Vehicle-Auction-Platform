-- Migration 008: Enforce unique chassis numbers on vehicles
-- Ignores NULL values (not all vehicles may have a chassis number entered).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_chassis_number_unique'
  ) THEN
    ALTER TABLE vehicles
      ADD CONSTRAINT vehicles_chassis_number_unique UNIQUE (chassis_number);
  END IF;
END $$;

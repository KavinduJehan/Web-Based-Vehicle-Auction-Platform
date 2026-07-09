-- Migration 005: Replace is_verified boolean with verification_status enum
-- Valid values: 'pending' (default), 'verified', 'rejected'
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected'));

-- Migrate existing data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_verified'
  ) THEN
    UPDATE users SET verification_status = 'verified' WHERE is_verified = true;
    ALTER TABLE users DROP COLUMN is_verified;
  END IF;
END $$;

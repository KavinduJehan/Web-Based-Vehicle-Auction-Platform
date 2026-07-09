-- Migration 009: Force password change on first login
-- Used for seeded admin accounts that have a temporary password.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT false;

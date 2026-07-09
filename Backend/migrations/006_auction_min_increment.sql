-- Migration 006: Add min_increment to auctions
-- Sets the minimum amount by which each new bid must exceed the current highest.
-- 0 means "just beat current highest" (default, preserves existing behaviour).
ALTER TABLE auctions
  ADD COLUMN IF NOT EXISTS min_increment NUMERIC(12,2) NOT NULL DEFAULT 0
    CONSTRAINT auctions_min_increment_check CHECK (min_increment >= 0);

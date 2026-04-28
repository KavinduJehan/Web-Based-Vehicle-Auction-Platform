-- Migration 002: Scope bids to auctions instead of vehicles
-- Run against BOTH databases:
--   psql -U postgres -d vehicle_auction      -f migrations/002_bids_auction_id.sql
--   psql -U postgres -d vehicle_auction_test -f migrations/002_bids_auction_id.sql

-- Drop old vehicle-scoped indexes
DROP INDEX IF EXISTS idx_bids_vehicle_id;
DROP INDEX IF EXISTS idx_bids_amount;

-- Swap vehicle_id for auction_id on the bids table
ALTER TABLE bids DROP COLUMN vehicle_id;
ALTER TABLE bids ADD COLUMN auction_id INTEGER NOT NULL REFERENCES auctions(id) ON DELETE CASCADE;

-- New auction-scoped indexes
CREATE INDEX idx_bids_auction_id     ON bids(auction_id);
CREATE INDEX idx_bids_auction_amount ON bids(auction_id, amount DESC);

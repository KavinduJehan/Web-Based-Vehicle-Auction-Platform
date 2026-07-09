-- Migration 002: Scope bids to auctions instead of vehicles
-- Run against BOTH databases:
--   psql -U postgres -d vehicle_auction      -f migrations/002_bids_auction_id.sql
--   psql -U postgres -d vehicle_auction_test -f migrations/002_bids_auction_id.sql

-- Drop old vehicle-scoped indexes
DROP INDEX IF EXISTS idx_bids_vehicle_id;
DROP INDEX IF EXISTS idx_bids_amount;

-- Swap vehicle_id for auction_id on the bids table (idempotent)
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'bids' AND column_name = 'vehicle_id'
	) THEN
		ALTER TABLE bids DROP COLUMN vehicle_id;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'bids' AND column_name = 'auction_id'
	) THEN
		ALTER TABLE bids ADD COLUMN auction_id INTEGER REFERENCES auctions(id) ON DELETE CASCADE;
	END IF;

	-- Backward safety: if auction_id exists and is nullable from a prior partial run,
	-- enforce NOT NULL once data is expected to be valid.
	BEGIN
		ALTER TABLE bids ALTER COLUMN auction_id SET NOT NULL;
	EXCEPTION WHEN others THEN
		NULL;
	END;
END $$;

-- New auction-scoped indexes
CREATE INDEX IF NOT EXISTS idx_bids_auction_id     ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount ON bids(auction_id, amount DESC);

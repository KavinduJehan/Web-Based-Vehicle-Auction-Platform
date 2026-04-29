-- Migration 007: Add reserve_price to auctions
-- The reserve price is a hidden minimum that the auction must surpass to be considered "genuine".
-- NULL means no reserve (treated as always met). Not exposed to non-admin users via the API.
ALTER TABLE auctions
  ADD COLUMN reserve_price NUMERIC(12,2) DEFAULT NULL
    CONSTRAINT auctions_reserve_price_check CHECK (reserve_price IS NULL OR reserve_price >= 0);

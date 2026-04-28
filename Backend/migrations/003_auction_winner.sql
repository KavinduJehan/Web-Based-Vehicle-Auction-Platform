-- Migration 003: Add winning_bid_id to auctions
-- Records which bid won the auction; NULL until the admin selects a winner.
ALTER TABLE auctions
  ADD COLUMN winning_bid_id INTEGER REFERENCES bids(id) ON DELETE SET NULL;

-- Migration 010: Extend schema for production-like seeded data
-- Additive only: no existing columns or constraints are removed.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS profile_image TEXT,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS transmission VARCHAR(30),
  ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(30),
  ADD COLUMN IF NOT EXISTS drivetrain VARCHAR(30),
  ADD COLUMN IF NOT EXISTS engine_capacity VARCHAR(20),
  ADD COLUMN IF NOT EXISTS exterior_color VARCHAR(40),
  ADD COLUMN IF NOT EXISTS interior_color VARCHAR(40),
  ADD COLUMN IF NOT EXISTS vin VARCHAR(40),
  ADD COLUMN IF NOT EXISTS condition VARCHAR(20),
  ADD COLUMN IF NOT EXISTS reserve_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS estimated_market_value NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS registration_country VARCHAR(80),
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_vin_unique'
  ) THEN
    ALTER TABLE vehicles
      ADD CONSTRAINT vehicles_vin_unique UNIQUE (vin);
  END IF;
END $$;

ALTER TABLE auctions
  ADD COLUMN IF NOT EXISTS seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS starting_price NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS current_highest_bid NUMERIC(12,2);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  payer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'pending', 'refunded')),
  payment_method VARCHAR(30),
  transaction_ref VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (auction_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  auction_id INTEGER NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (auction_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS watchlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, vehicle_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  payload JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_user ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

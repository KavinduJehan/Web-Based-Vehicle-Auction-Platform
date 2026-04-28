-- Migration 001: Initial schema
-- Run: psql -U <user> -d vehicle_auction -f migrations/001_initial_schema.sql

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'buyer')),
  is_verified   BOOLEAN      NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id             SERIAL PRIMARY KEY,
  seller_id      INTEGER      NOT NULL REFERENCES users(id),
  title          VARCHAR(255) NOT NULL,
  description    TEXT         NOT NULL DEFAULT '',
  make           VARCHAR(100) NOT NULL DEFAULT '',
  model          VARCHAR(100) NOT NULL DEFAULT '',
  year           SMALLINT     NOT NULL,
  starting_price NUMERIC(12,2) NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'listed', 'sold')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auctions (
  id          SERIAL PRIMARY KEY,
  vehicle_id  INTEGER      NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NOT NULL DEFAULT '',
  status      VARCHAR(20)  NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended')),
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bids (
  id         SERIAL PRIMARY KEY,
  vehicle_id INTEGER      NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id    INTEGER      NOT NULL REFERENCES users(id),
  amount     NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bids_vehicle_id ON bids(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bids_amount     ON bids(vehicle_id, amount DESC);
CREATE INDEX IF NOT EXISTS idx_auctions_vehicle ON auctions(vehicle_id);

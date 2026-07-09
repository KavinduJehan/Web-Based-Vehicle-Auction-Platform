-- Migration 004: Add chassis_number, mileage, grade, images to vehicles
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS mileage        INTEGER      DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS grade          VARCHAR(20)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS images         TEXT[]       NOT NULL DEFAULT '{}';

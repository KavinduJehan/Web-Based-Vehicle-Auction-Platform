-- Migration 004: Add chassis_number, mileage, grade, images to vehicles
ALTER TABLE vehicles
  ADD COLUMN chassis_number VARCHAR(100) DEFAULT NULL,
  ADD COLUMN mileage        INTEGER      DEFAULT NULL,
  ADD COLUMN grade          VARCHAR(20)  DEFAULT NULL,
  ADD COLUMN images         TEXT[]       NOT NULL DEFAULT '{}';

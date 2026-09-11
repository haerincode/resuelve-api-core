-- Migration: Add commission_rate field to affiliates table
-- This allows setting different commission rates per affiliate (e.g., 10%, 20%, 30%)

-- +goose Up
ALTER TABLE affiliates ADD COLUMN commission_rate DECIMAL(5,4) NOT NULL DEFAULT 0.3000;

-- Add check constraint to ensure rate is between 0 and 1 (0% to 100%)
ALTER TABLE affiliates ADD CONSTRAINT commission_rate_range CHECK (commission_rate >= 0 AND commission_rate <= 1);

-- +goose Down
ALTER TABLE affiliates DROP CONSTRAINT IF EXISTS commission_rate_range;
ALTER TABLE affiliates DROP COLUMN IF EXISTS commission_rate;

-- Affiliate System Tables
-- Run this migration on your PostgreSQL database

-- 1. Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    affiliate_code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    telegram_handle VARCHAR(255),
    usdt_wallet VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_affiliates_code ON affiliates(affiliate_code);
CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);

-- 2. Create affiliate_commissions table
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id SERIAL PRIMARY KEY,
    affiliate_id INTEGER NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topup_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_commissions_affiliate ON affiliate_commissions(affiliate_id);
CREATE INDEX idx_commissions_user ON affiliate_commissions(user_id);
CREATE INDEX idx_commissions_paid ON affiliate_commissions(paid);

-- 3. Ensure users table has inviter_id (may already exist)
-- This is safe to run even if column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='users' AND column_name='inviter_id'
    ) THEN
        ALTER TABLE users ADD COLUMN inviter_id INTEGER DEFAULT 0;
        CREATE INDEX idx_users_inviter ON users(inviter_id);
    END IF;
END $$;

-- 4. Create view for affiliate stats
CREATE OR REPLACE VIEW affiliate_stats AS
SELECT
    a.id,
    a.affiliate_code,
    a.email,
    COUNT(DISTINCT u.id) as referred_count,
    COALESCE(SUM(CASE WHEN NOT c.paid THEN c.amount ELSE 0 END), 0) as total_pending,
    COALESCE(SUM(CASE WHEN c.paid THEN c.amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(c.amount), 0) as total_earned
FROM affiliates a
LEFT JOIN users u ON u.inviter_id = a.user_id
LEFT JOIN affiliate_commissions c ON c.affiliate_id = a.id
GROUP BY a.id, a.affiliate_code, a.email;

-- Done! Affiliate system ready.

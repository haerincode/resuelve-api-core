-- Schema SQL para sistema de afiliados completo
-- Compatible con PostgreSQL, MySQL, SQLite

-- Tabla de comisiones detalladas
CREATE TABLE IF NOT EXISTS commissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    inviter_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    source_type VARCHAR(50) NOT NULL DEFAULT 'topup',
    source_id INTEGER,
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 30.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    paid_at BIGINT,
    created_at BIGINT NOT NULL,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (inviter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_commissions_inviter ON commissions(inviter_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);

-- Tabla de afiliados (metadata adicional)
CREATE TABLE IF NOT EXISTS affiliates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    wallet_address VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'usdt',
    total_paid INTEGER NOT NULL DEFAULT 0,
    last_payout_at BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_affiliates_user ON affiliates(user_id);

-- Agregar columnas a users si no existen (PostgreSQL)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS aff_code VARCHAR(32) UNIQUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS aff_count INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS aff_quota INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS aff_history_quota INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS inviter_id INTEGER;

-- Vista para reportes de afiliados
CREATE OR REPLACE VIEW affiliate_stats AS
SELECT
    u.id,
    u.username,
    u.email,
    u.aff_code,
    u.aff_count as total_referrals,
    u.aff_quota as pending_commission,
    u.aff_history_quota as total_earned,
    a.wallet_address,
    a.total_paid,
    a.last_payout_at,
    COALESCE(SUM(CASE WHEN c.status = 'pending' THEN c.amount ELSE 0 END), 0) as pending_amount,
    COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.amount ELSE 0 END), 0) as paid_amount,
    COUNT(c.id) as total_commissions
FROM users u
LEFT JOIN affiliates a ON u.id = a.user_id
LEFT JOIN commissions c ON u.id = c.inviter_id
WHERE u.aff_count > 0
GROUP BY u.id, u.username, u.email, u.aff_code, u.aff_count, u.aff_quota, u.aff_history_quota,
         a.wallet_address, a.total_paid, a.last_payout_at;

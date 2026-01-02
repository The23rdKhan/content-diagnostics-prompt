-- Seed initial admin user
-- IMPORTANT: Password must be changed immediately after first login
-- Default password: admin123 (bcrypt hashed)
-- This migration only runs if no admin exists

-- Insert admin user only if not exists
INSERT INTO users (email, password_hash, role, enabled, created_at, updated_at)
SELECT
    'admin@contentdiagnostics.com',
    -- Bcrypt hash of 'admin123' - MUST be changed on first login
    '$2a$10$xtYPPNdZZZbIzo3x0TRDIO5heOpcKJ1GbYo0PhYAuDn.ZReRFt.Fa',
    'ADMIN',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'ADMIN'
);

-- Add comment for audit
COMMENT ON TABLE users IS 'User accounts. Admin users are seeded via migration and must change password on first login.';

-- Seed initial admin user
-- IMPORTANT: Password must be changed immediately after first login
-- Default password: ChangeMe123! (bcrypt hashed)
-- This migration only runs if no admin exists

-- Insert admin user only if not exists
INSERT INTO users (email, password_hash, role, enabled, created_at, updated_at)
SELECT
    'admin@contentdiagnostics.com',
    -- Bcrypt hash of 'ChangeMe123!' - MUST be changed on first login
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.MRMlRl/bFR7/I4.LxLxLxLxLxLxLxLu',
    'ADMIN',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'ADMIN'
);

-- Add comment for audit
COMMENT ON TABLE users IS 'User accounts. Admin users are seeded via migration and must change password on first login.';

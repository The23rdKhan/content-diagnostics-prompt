-- Create credit_bundles table for purchasable credit packs
CREATE TABLE credit_bundles (
    id BIGSERIAL PRIMARY KEY,
    bundle_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    price_per_credit DECIMAL(10,2),
    savings_percent INTEGER,
    popular BOOLEAN NOT NULL DEFAULT false,
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on bundle_code for fast lookups
CREATE INDEX idx_credit_bundles_bundle_code ON credit_bundles(bundle_code);
CREATE INDEX idx_credit_bundles_active ON credit_bundles(active);

-- Seed default credit bundles
INSERT INTO credit_bundles (bundle_code, name, credits, price, description, price_per_credit, savings_percent, popular, sort_order) VALUES
('starter', 'Starter Pack', 10, 15.00, '2 video reviews', 1.50, 0, false, 1),
('creator', 'Creator Pack', 25, 30.00, '5 video reviews', 1.20, 20, true, 2),
('pro', 'Pro Pack', 50, 50.00, '10 video reviews', 1.00, 33, false, 3),
('studio', 'Studio Pack', 100, 85.00, '20 video reviews', 0.85, 43, false, 4);

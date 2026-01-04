-- Create plans table for subscription tiers
CREATE TABLE plans (
    id BIGSERIAL PRIMARY KEY,
    tier_code VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    credits_per_month INTEGER NOT NULL,
    reviewers_per_video INTEGER NOT NULL,
    videos_per_month INTEGER,
    sla_hours INTEGER,
    features_json TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on tier_code for fast lookups
CREATE INDEX idx_plans_tier_code ON plans(tier_code);
CREATE INDEX idx_plans_active ON plans(active);

-- Seed default plans (using $499 for enterprise as canonical price)
INSERT INTO plans (tier_code, display_name, description, monthly_price, credits_per_month, reviewers_per_video, sla_hours, features_json, sort_order) VALUES
('basic', 'Basic', 'Perfect for getting started', 49.00, 15, 3, 72,
 '["15 video credits/month","3 reviewers per video","72-hour turnaround","Basic analytics"]', 1),
('professional', 'Professional', 'For growing creators', 149.00, 50, 5, 48,
 '["50 video credits/month","5 reviewers per video","48-hour turnaround","Advanced analytics","Priority support"]', 2),
('enterprise', 'Enterprise', 'For teams and agencies', 499.00, 250, 10, 24,
 '["250 video credits/month","10 reviewers per video","24-hour turnaround","Full analytics suite","Dedicated support","API access"]', 3);

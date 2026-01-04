-- Create language pool settings table for capacity management
CREATE TABLE language_pool_settings (
    id BIGSERIAL PRIMARY KEY,
    language_code VARCHAR(10) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    current_sla VARCHAR(10) NOT NULL DEFAULT '24h',
    max_reviewers_per_video INTEGER NOT NULL DEFAULT 5,
    checkout_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    live_addon_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on language code for fast lookups
CREATE INDEX idx_language_pool_settings_code ON language_pool_settings(language_code);

-- Seed default language pool (English)
INSERT INTO language_pool_settings (language_code, display_name, current_sla, max_reviewers_per_video, checkout_enabled, live_addon_enabled)
VALUES
    ('en', 'English (Global)', '24h', 5, TRUE, TRUE),
    ('es', 'Spanish', '48h', 5, TRUE, TRUE),
    ('pt', 'Portuguese', '48h', 5, TRUE, TRUE),
    ('fr', 'French', '72h', 3, TRUE, FALSE),
    ('de', 'German', '72h', 3, TRUE, FALSE);

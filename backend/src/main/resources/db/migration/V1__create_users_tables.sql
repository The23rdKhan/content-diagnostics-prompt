-- V1: Create users and auth tables

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address VARCHAR(45)
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Creator profiles table
CREATE TABLE creator_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    profile_image_url VARCHAR(512),
    banner_image_url VARCHAR(512),
    primary_language VARCHAR(50) NOT NULL DEFAULT 'English',
    plan_tier VARCHAR(20) NOT NULL DEFAULT 'basic',
    remaining_credits INTEGER NOT NULL DEFAULT 0,
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_creator_profiles_stripe_customer ON creator_profiles(stripe_customer_id);

-- Reviewer profiles table
CREATE TABLE reviewer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    profile_image_url VARCHAR(512),
    language VARCHAR(50) NOT NULL DEFAULT 'English',
    proficiency VARCHAR(20) NOT NULL DEFAULT 'native',
    qualification_passed BOOLEAN NOT NULL DEFAULT false,
    quality_score INTEGER NOT NULL DEFAULT 100,
    queue_locked BOOLEAN NOT NULL DEFAULT true,
    tasks_completed INTEGER NOT NULL DEFAULT 0,
    tasks_approved INTEGER NOT NULL DEFAULT 0,
    tasks_rejected INTEGER NOT NULL DEFAULT 0,
    total_earnings DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    pending_earnings DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    payout_method VARCHAR(20),
    payout_details VARCHAR(255),
    strikes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviewer_profiles_language ON reviewer_profiles(language);
CREATE INDEX idx_reviewer_profiles_quality_score ON reviewer_profiles(quality_score);

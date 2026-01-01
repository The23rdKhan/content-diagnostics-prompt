-- V5: Create billing and payment tables

-- Stripe events for idempotency
CREATE TABLE stripe_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT,
    processed BOOLEAN NOT NULL DEFAULT false,
    processing_error VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_stripe_events_event_id ON stripe_events(event_id);

-- Payouts table
CREATE TABLE payouts (
    id BIGSERIAL PRIMARY KEY,
    reviewer_id BIGINT NOT NULL REFERENCES reviewer_profiles(id),
    amount DECIMAL(10,2) NOT NULL,
    tasks_included INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP WITH TIME ZONE,
    transaction_id VARCHAR(255),
    notes VARCHAR(500)
);

CREATE INDEX idx_payouts_reviewer_id ON payouts(reviewer_id);
CREATE INDEX idx_payouts_status ON payouts(status);

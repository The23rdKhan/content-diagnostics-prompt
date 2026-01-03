-- V12: Create credit transactions table for tracking all credit changes

CREATE TABLE credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(30) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description VARCHAR(255),
    stripe_payment_intent_id VARCHAR(100),
    price_paid DECIMAL(10, 2),
    bundle_id VARCHAR(50),
    job_id BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
    admin_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_credit_tx_creator ON credit_transactions(creator_id);
CREATE INDEX idx_credit_tx_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_tx_created ON credit_transactions(created_at);
CREATE INDEX idx_credit_tx_job ON credit_transactions(job_id);
CREATE INDEX idx_credit_tx_stripe ON credit_transactions(stripe_payment_intent_id);
CREATE UNIQUE INDEX idx_credit_tx_stripe_unique ON credit_transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- V11: Create addons, invoices, and support tables

-- Add-ons catalog
CREATE TABLE addons (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    price DECIMAL(10, 2) NOT NULL,
    price_display VARCHAR(50),
    category VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true
);

-- Seed default add-ons
INSERT INTO addons (code, name, description, price, price_display, category) VALUES
    ('extra_reviewers_5', 'Additional 5 Reviewers', 'Add 5 more reviewers to increase feedback diversity', 25.00, '$25', 'REVIEWERS'),
    ('extra_reviewers_10', 'Additional 10 Reviewers', 'Add 10 more reviewers for comprehensive feedback', 45.00, '$45', 'REVIEWERS'),
    ('rush_24h', '24-Hour Rush Delivery', 'Get your results within 24 hours', 50.00, '$50', 'DELIVERY'),
    ('rush_12h', '12-Hour Rush Delivery', 'Get your results within 12 hours', 75.00, '$75', 'DELIVERY'),
    ('sentiment_analysis', 'Advanced Sentiment Analysis', 'Deep emotional response analysis', 35.00, '$35', 'ANALYSIS'),
    ('competitor_comparison', 'Competitor Comparison', 'Compare against similar content in your niche', 40.00, '$40', 'ANALYSIS'),
    ('live_session', 'Live Feedback Session', 'Real-time session with reviewers (30 min)', 100.00, '$100', 'LIVE');

-- Applied add-ons (add-ons purchased for specific jobs)
CREATE TABLE applied_addons (
    id BIGSERIAL PRIMARY KEY,
    addon_id BIGINT NOT NULL REFERENCES addons(id),
    job_id BIGINT NOT NULL REFERENCES jobs(id),
    creator_id BIGINT NOT NULL REFERENCES users(id),
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_applied_addons_job ON applied_addons(job_id);
CREATE INDEX idx_applied_addons_creator ON applied_addons(creator_id);

-- Invoices
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    stripe_invoice_id VARCHAR(100),
    pdf_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_invoices_user ON invoices(user_id);
CREATE INDEX idx_invoices_stripe_id ON invoices(stripe_invoice_id);

-- Support tickets
CREATE TABLE support_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    subject VARCHAR(255) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Ticket replies
CREATE TABLE ticket_replies (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    message VARCHAR(2000) NOT NULL,
    author VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);

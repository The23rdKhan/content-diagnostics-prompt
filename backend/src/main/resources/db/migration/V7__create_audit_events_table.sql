-- Audit Events Table
-- Immutable audit log for security and compliance

CREATE TABLE audit_events (
    id BIGSERIAL PRIMARY KEY,
    correlation_id VARCHAR(36) NOT NULL,
    actor_id BIGINT,
    actor_email VARCHAR(255),
    actor_role VARCHAR(20),
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id BIGINT,
    description VARCHAR(500),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    result VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    error_message VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX idx_audit_events_actor_id ON audit_events(actor_id);
CREATE INDEX idx_audit_events_action ON audit_events(action);
CREATE INDEX idx_audit_events_target_type ON audit_events(target_type);
CREATE INDEX idx_audit_events_target_id ON audit_events(target_id);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);
CREATE INDEX idx_audit_events_correlation_id ON audit_events(correlation_id);

-- Partial index for failed actions (security monitoring)
CREATE INDEX idx_audit_events_failed ON audit_events(created_at)
    WHERE result IN ('FAILURE', 'DENIED');

-- Add comment for documentation
COMMENT ON TABLE audit_events IS 'Immutable audit log for admin actions and security events';
COMMENT ON COLUMN audit_events.correlation_id IS 'Request correlation ID for distributed tracing';
COMMENT ON COLUMN audit_events.old_values IS 'JSON snapshot of values before the change';
COMMENT ON COLUMN audit_events.new_values IS 'JSON snapshot of values after the change';

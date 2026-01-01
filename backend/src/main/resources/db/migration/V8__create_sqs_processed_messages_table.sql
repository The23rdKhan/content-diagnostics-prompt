-- SQS Processed Messages Table
-- For idempotent message processing across consumers

CREATE TABLE sqs_processed_messages (
    id BIGSERIAL PRIMARY KEY,
    message_id VARCHAR(100) NOT NULL,
    queue_name VARCHAR(100) NOT NULL,
    message_type VARCHAR(50),
    processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processing_result VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT uq_sqs_message UNIQUE (message_id, queue_name)
);

-- Index for cleanup of old records
CREATE INDEX idx_sqs_processed_messages_processed_at ON sqs_processed_messages(processed_at);

-- Index for failed message monitoring
CREATE INDEX idx_sqs_processed_messages_failed ON sqs_processed_messages(queue_name, processing_result)
    WHERE processing_result = 'FAILURE';

-- Add comments
COMMENT ON TABLE sqs_processed_messages IS 'Tracks processed SQS messages for idempotency';
COMMENT ON COLUMN sqs_processed_messages.message_id IS 'AWS SQS Message ID';
COMMENT ON COLUMN sqs_processed_messages.queue_name IS 'Source queue name';

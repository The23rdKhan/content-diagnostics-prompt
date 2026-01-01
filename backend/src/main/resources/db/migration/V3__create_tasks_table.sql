-- V3: Create tasks table

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reviewer_id BIGINT REFERENCES reviewer_profiles(id),
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    language VARCHAR(50) NOT NULL,
    segment_timestamp VARCHAR(50),
    segment_start_seconds INTEGER,
    segment_end_seconds INTEGER,
    pay_amount DECIMAL(10,2) NOT NULL DEFAULT 0.30,
    video_segment_url VARCHAR(512),
    questions_json TEXT,
    attention_check_index INTEGER,
    lease_expires_at TIMESTAMP WITH TIME ZONE,
    lease_version INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE,
    answers_json TEXT,
    watch_ratio DECIMAL(5,2),
    completion_time_seconds INTEGER,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason VARCHAR(500),
    attention_check_passed BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_job_id ON tasks(job_id);
CREATE INDEX idx_tasks_reviewer_id ON tasks(reviewer_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_language_status ON tasks(language, status);

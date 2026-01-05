-- Qualification test submissions table
CREATE TABLE qualification_submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB,
    completion_time_seconds DOUBLE PRECISION,
    score DOUBLE PRECISION NOT NULL,
    correct_count INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    attempt_number INTEGER NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_qualification_user ON qualification_submissions(user_id);
CREATE INDEX idx_qualification_submitted_at ON qualification_submissions(submitted_at);
CREATE INDEX idx_qualification_user_passed ON qualification_submissions(user_id, passed);

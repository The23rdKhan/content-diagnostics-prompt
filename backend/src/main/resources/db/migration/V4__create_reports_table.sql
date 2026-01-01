-- V4: Create reports table

CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPILING',
    video_title VARCHAR(255) NOT NULL,
    duration VARCHAR(20),
    video_duration_minutes INTEGER,
    language_pool VARCHAR(50) NOT NULL,
    guaranteed_reviewers INTEGER NOT NULL,
    sla_window VARCHAR(50),
    actual_delivery_time VARCHAR(50),
    clarity_score INTEGER,
    pacing_score INTEGER,
    engagement_score INTEGER,
    structure_score INTEGER,
    executive_summary TEXT,
    timeline_insights_json TEXT,
    ai_analysis_json TEXT,
    human_reviews_json TEXT,
    action_plan_json TEXT,
    series_id VARCHAR(100),
    version INTEGER,
    date_submitted TIMESTAMP WITH TIME ZONE,
    date_completed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_creator_id ON reports(creator_id);
CREATE INDEX idx_reports_job_id ON reports(job_id);
CREATE INDEX idx_reports_status ON reports(status);

-- V2: Create videos and jobs tables

-- Videos table
CREATE TABLE videos (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_key VARCHAR(512) NOT NULL,
    storage_url VARCHAR(512),
    status VARCHAR(20) NOT NULL DEFAULT 'UPLOADING',
    language VARCHAR(50) NOT NULL DEFAULT 'English',
    duration_seconds INTEGER,
    resolution VARCHAR(100),
    codec VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_videos_creator_id ON videos(creator_id);
CREATE INDEX idx_videos_status ON videos(status);

-- Jobs table
CREATE TABLE jobs (
    id BIGSERIAL PRIMARY KEY,
    creator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id BIGINT NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'UPLOADING',
    language VARCHAR(50) NOT NULL DEFAULT 'English',
    sla_hours INTEGER NOT NULL DEFAULT 48,
    required_reviewers INTEGER NOT NULL DEFAULT 50,
    completed_reviewers INTEGER NOT NULL DEFAULT 0,
    extra_reviewers INTEGER,
    faster_delivery BOOLEAN NOT NULL DEFAULT false,
    full_watch_summary BOOLEAN NOT NULL DEFAULT false,
    live_feedback BOOLEAN NOT NULL DEFAULT false,
    ai_diagnostics_complete BOOLEAN NOT NULL DEFAULT false,
    human_review_complete BOOLEAN NOT NULL DEFAULT false,
    report_compiled BOOLEAN NOT NULL DEFAULT false,
    sla_deadline TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    delivery_time_hours INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_creator_id ON jobs(creator_id);
CREATE INDEX idx_jobs_video_id ON jobs(video_id);
CREATE INDEX idx_jobs_status ON jobs(status);

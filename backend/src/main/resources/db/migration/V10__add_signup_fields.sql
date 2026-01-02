-- V10: Add expanded signup fields for users and profiles

-- Add new fields to users table
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN country VARCHAR(2);
ALTER TABLE users ADD COLUMN timezone VARCHAR(50);
ALTER TABLE users ADD COLUMN tos_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN tos_version VARCHAR(20);
ALTER TABLE users ADD COLUMN marketing_consent BOOLEAN NOT NULL DEFAULT false;

-- Add firstName/lastName to creator_profiles
ALTER TABLE creator_profiles ADD COLUMN first_name VARCHAR(50);
ALTER TABLE creator_profiles ADD COLUMN last_name VARCHAR(50);

-- Migrate existing name data for creators (split on first space)
UPDATE creator_profiles SET
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = COALESCE(NULLIF(TRIM(SUBSTRING(name FROM POSITION(' ' IN name))), ''), '');

-- Handle any null values from the split
UPDATE creator_profiles SET first_name = name WHERE first_name IS NULL OR first_name = '';
UPDATE creator_profiles SET last_name = '' WHERE last_name IS NULL;

-- Make columns NOT NULL after migration
ALTER TABLE creator_profiles ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE creator_profiles ALTER COLUMN last_name SET NOT NULL;

-- Add firstName/lastName to reviewer_profiles
ALTER TABLE reviewer_profiles ADD COLUMN first_name VARCHAR(50);
ALTER TABLE reviewer_profiles ADD COLUMN last_name VARCHAR(50);

-- Migrate existing name data for reviewers (split on first space)
UPDATE reviewer_profiles SET
    first_name = SPLIT_PART(name, ' ', 1),
    last_name = COALESCE(NULLIF(TRIM(SUBSTRING(name FROM POSITION(' ' IN name))), ''), '');

-- Handle any null values from the split
UPDATE reviewer_profiles SET first_name = name WHERE first_name IS NULL OR first_name = '';
UPDATE reviewer_profiles SET last_name = '' WHERE last_name IS NULL;

-- Make columns NOT NULL after migration
ALTER TABLE reviewer_profiles ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE reviewer_profiles ALTER COLUMN last_name SET NOT NULL;

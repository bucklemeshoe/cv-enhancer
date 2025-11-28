-- CV Builder Database Schema
-- Run this in Supabase SQL Editor

-- Submissions table (replaces data/submissions/ folder)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id TEXT UNIQUE NOT NULL,
    student_data JSONB NOT NULL,
    enhanced_data JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'published')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    published_slug TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Published CVs table (replaces data/published/ folder)
CREATE TABLE published_cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unique_id TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cv_data JSONB NOT NULL,
    submission_id UUID REFERENCES submissions(id),
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_submissions_unique_id ON submissions(unique_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at DESC);
CREATE INDEX idx_submissions_user_id ON submissions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_published_cvs_slug ON published_cvs(slug);
CREATE INDEX idx_published_cvs_unique_id ON published_cvs(unique_id);

-- Row Level Security (RLS) - for future admin authentication
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_cvs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published CVs (for the public CV pages)
CREATE POLICY "Allow public read access to published CVs" ON published_cvs
    FOR SELECT USING (true);

-- Allow all operations for admin/service role (backward compatibility)
CREATE POLICY "Allow all operations on submissions" ON submissions
    FOR ALL USING (true);

-- RLS Policies for user submissions
-- Users can view their own submissions or legacy submissions (no user_id)
CREATE POLICY "Users can view own submissions" ON submissions
    FOR SELECT USING (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions" ON submissions
    FOR UPDATE USING (
        auth.uid() = user_id OR auth.uid() IS NULL
    );

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON submissions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update timestamps
CREATE TRIGGER update_submissions_updated_at 
    BEFORE UPDATE ON submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_published_cvs_updated_at 
    BEFORE UPDATE ON published_cvs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
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
    published_slug TEXT
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
CREATE INDEX idx_published_cvs_slug ON published_cvs(slug);
CREATE INDEX idx_published_cvs_unique_id ON published_cvs(unique_id);

-- Row Level Security (RLS) - for future admin authentication
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_cvs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published CVs (for the public CV pages)
CREATE POLICY "Allow public read access to published CVs" ON published_cvs
    FOR SELECT USING (true);

-- Allow all operations for now (we'll add proper auth later)
CREATE POLICY "Allow all operations on submissions" ON submissions
    FOR ALL USING (true);

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
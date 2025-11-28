-- Add user_id column to submissions table for user account linking
-- This allows users to own and edit their CV submissions

-- Add user_id column (nullable to support existing CVs)
ALTER TABLE submissions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance on user lookups
CREATE INDEX idx_submissions_user_id ON submissions(user_id) WHERE user_id IS NOT NULL;

-- Add comment for clarity
COMMENT ON COLUMN submissions.user_id IS 'Links submission to authenticated user account. NULL for legacy submissions before user accounts were implemented.';

-- RLS Policies for user submissions
-- Users can only view their own submissions
CREATE POLICY "Users can view own submissions" ON submissions
    FOR SELECT USING (
        -- Allow if user_id matches authenticated user
        auth.uid() = user_id
        OR
        -- Or if submission has no user_id (legacy submissions accessible by all)
        user_id IS NULL
    );

-- Users can update their own submissions
CREATE POLICY "Users can update own submissions" ON submissions
    FOR UPDATE USING (
        -- Allow if user_id matches authenticated user
        auth.uid() = user_id
        OR
        -- Or if no authentication (for admin/service role operations)
        auth.uid() IS NULL
    );

-- Users can insert their own submissions
CREATE POLICY "Users can insert own submissions" ON submissions
    FOR INSERT WITH CHECK (
        -- Allow if user_id matches authenticated user or is NULL
        auth.uid() = user_id OR user_id IS NULL
    );

-- Note: The existing policy "Allow all operations on submissions" remains
-- This ensures admin/service role operations continue to work for backward compatibility


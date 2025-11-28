import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ message: 'Missing submission ID' })
    }

    // Get authenticated user from JWT token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' })
    }

    const token = authHeader.substring(7)
    
    // Verify user token and get user ID
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' })
    }

    // Get submission and verify ownership
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !submission) {
      console.error('Supabase query error:', fetchError)
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Verify ownership - user can only access their own CVs
    if (submission.user_id !== user.id) {
      return res.status(403).json({ message: 'Forbidden - You can only access your own CVs' })
    }

    // Transform Supabase data to match expected format
    const transformedSubmission = {
      id: submission.id,
      uniqueId: submission.unique_id,
      studentData: submission.student_data,
      enhancedData: submission.enhanced_data || null,
      status: submission.status,
      submittedAt: submission.submitted_at,
      updatedAt: submission.updated_at || submission.submitted_at,
      reviewedAt: submission.reviewed_at || null,
      publishedAt: submission.published_at || null,
      publishedSlug: submission.published_slug || submission.unique_id,
      slug: submission.published_slug || submission.unique_id
    }

    res.status(200).json({ submission: transformedSubmission })

  } catch (error) {
    console.error('Error loading submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
}


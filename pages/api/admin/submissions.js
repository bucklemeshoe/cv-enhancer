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
    // Pagination params
    const limit = Number.isFinite(parseInt(req.query.limit)) ? Math.max(1, parseInt(req.query.limit)) : 25
    const offset = Number.isFinite(parseInt(req.query.offset)) ? Math.max(0, parseInt(req.query.offset)) : 0

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Supabase query error:', error)
      throw new Error(`Failed to load submissions from database: ${error.message}`)
    }
    
    // Transform Supabase data to match expected format
    const submissions = data.map(submission => ({
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
    }))

    res.status(200).json({ submissions, page: { limit, offset, returned: submissions.length } })

  } catch (error) {
    console.error('Error loading submissions:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
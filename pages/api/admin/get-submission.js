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

    console.log('Getting submission from Supabase with ID:', id)

    const { data, error } = await supabase
      .from('cv_submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Transform Supabase data to match expected format
    const transformedSubmission = {
      id: data.id,
      uniqueId: data.unique_id,
      studentData: data.student_data,
      enhancedData: data.enhanced_data || null,
      status: data.status,
      submittedAt: data.submitted_at,
      updatedAt: data.updated_at || data.submitted_at,
      reviewedAt: data.reviewed_at || null,
      publishedAt: data.published_at || null,
      publishedSlug: data.published_slug || data.slug,
      slug: data.published_slug || data.slug
    }

    res.status(200).json({ submission: transformedSubmission })

  } catch (error) {
    console.error('Error loading submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
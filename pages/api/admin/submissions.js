import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Fetch all submissions from Supabase, ordered by newest first
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Supabase fetch error:', error)
      return res.status(500).json({ message: `Database error: ${error.message}` })
    }

    // Transform data to match the existing format expected by the frontend
    const transformedSubmissions = submissions.map(submission => ({
      id: submission.id,
      uniqueId: submission.unique_id,
      studentData: submission.student_data,
      enhancedData: submission.enhanced_data,
      status: submission.status,
      submittedAt: submission.submitted_at,
      updatedAt: submission.updated_at,
      reviewedAt: submission.reviewed_at,
      publishedAt: submission.published_at,
      publishedSlug: submission.published_slug,
      slug: submission.published_slug
    }))

    res.status(200).json({ submissions: transformedSubmissions })

  } catch (error) {
    console.error('Error loading submissions:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
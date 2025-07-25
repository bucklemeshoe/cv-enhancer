import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ message: 'Missing submission ID' })
    }

    // Fetch the specific submission from Supabase
    const { data: submission, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase fetch error:', error)
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Submission not found' })
      }
      
      return res.status(500).json({ message: `Database error: ${error.message}` })
    }

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Transform data to match the existing format expected by the frontend
    const transformedSubmission = {
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
    }

    res.status(200).json({ submission: transformedSubmission })

  } catch (error) {
    console.error('Error loading submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
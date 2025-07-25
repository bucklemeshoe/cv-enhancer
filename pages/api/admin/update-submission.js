import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { submissionId, studentData } = req.body

    if (!submissionId || !studentData) {
      return res.status(400).json({ message: 'Missing submissionId or studentData' })
    }

    // Validate required fields
    if (!studentData.firstName || !studentData.lastName || !studentData.email) {
      return res.status(400).json({ message: 'Missing required fields: firstName, lastName, and email are required' })
    }

    // Update the submission in Supabase
    const { data, error } = await supabase
      .from('submissions')
      .update({ 
        student_data: studentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Submission not found' })
      }
      
      return res.status(500).json({ message: `Database error: ${error.message}` })
    }

    if (!data) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    res.status(200).json({ message: 'Submission updated successfully', submission: data })

  } catch (error) {
    console.error('Error updating submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
import { supabase } from '../../lib/supabase'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const formData = req.body

    // Generate a unique ID for this submission (6 characters)
    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create the submission record in Supabase
    const { data: submission, error } = await supabase
      .from('submissions')
      .insert([{
        unique_id: uniqueId,
        student_data: formData,
        status: 'pending',
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      
      // Handle unique constraint violations
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Submission ID conflict, please try again' })
      }
      
      return res.status(500).json({ message: `Database error: ${error.message}` })
    }

    console.log(`New submission created: ${uniqueId}`)

    // Return success response with the unique ID
    res.status(200).json({ 
      message: 'Application submitted successfully!',
      uniqueId: uniqueId,
      submissionId: submission.id
    })

  } catch (error) {
    console.error('Error submitting application:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
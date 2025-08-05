import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { submissionId } = req.body
    console.log('Delete CV request received for submissionId:', submissionId)
    console.log('Supabase client initialized:', !!supabase)
    console.log('Using Supabase API - file system disabled')

    if (!submissionId) {
      return res.status(400).json({ message: 'Missing submissionId' })
    }

    // Get the submission from Supabase first to check if it exists and get details
    console.log('Querying Supabase for submission with ID:', submissionId)
    console.log('ID type:', typeof submissionId)
    console.log('ID length:', submissionId?.length)
    
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    console.log('Supabase query result:')
    console.log('- Data:', submission)
    console.log('- Error:', fetchError)
    console.log('- Error code:', fetchError?.code)
    console.log('- Error message:', fetchError?.message)
    console.log('- Error details:', fetchError?.details)

    if (fetchError || !submission) {
      console.log('Submission not found for ID:', submissionId)
      return res.status(404).json({ 
        message: 'Submission not found',
        debug: {
          submissionId,
          error: fetchError,
          hasData: !!submission
        }
      })
    }

    console.log('Found submission to delete:', submission.student_data?.firstName, submission.student_data?.lastName)

    // If the CV was published, also delete the published version
    if (submission.status === 'published' && submission.unique_id) {
      console.log('Deleting published CV for unique_id:', submission.unique_id)
      
      const { error: publishedDeleteError } = await supabase
        .from('published_cvs')
        .delete()
        .eq('unique_id', submission.unique_id)

      if (publishedDeleteError) {
        console.error('Error deleting published CV:', publishedDeleteError)
        // Don't fail the entire request if published CV deletion fails
      } else {
        console.log('Published CV deleted successfully')
      }
    }

    // Delete the submission from Supabase
    const { error: deleteError } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId)

    if (deleteError) {
      console.error('Error deleting submission:', deleteError)
      throw new Error(`Failed to delete submission: ${deleteError.message}`)
    }

    console.log('Submission deleted successfully')

    res.status(200).json({ 
      message: 'CV deleted successfully',
      deletedSubmission: submission.student_data.firstName + ' ' + submission.student_data.lastName
    })

  } catch (error) {
    console.error('Error deleting CV:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
} 
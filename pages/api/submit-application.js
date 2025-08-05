import formidable from 'formidable'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
console.log('Environment variables check:', {
  NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  url_length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
  key_length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('Supabase client initialized with service role:', !!supabase)

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
    console.log('Submit application request received')
    // Parse FormData
    const form = formidable({})
    console.log('Parsing FormData...')
    
    const [fields, files] = await form.parse(req)
    console.log('FormData parsed successfully')
    console.log('Fields received:', Object.keys(fields))
    console.log('Files received:', Object.keys(files))
    
    // Convert fields to proper format
    const formData = {}
    Object.keys(fields).forEach(key => {
      const value = Array.isArray(fields[key]) ? fields[key][0] : fields[key]
      
      // Try to parse JSON fields
      if (key === 'experience' || key === 'certifications' || key === 'education' || key === 'references' || key === 'languages' || key === 'visa') {
        try {
          formData[key] = JSON.parse(value)
        } catch (e) {
          formData[key] = value
        }
      } else {
        formData[key] = value
      }
    })

    // Handle profile picture if uploaded
    if (files.profilePicture) {
      const file = Array.isArray(files.profilePicture) ? files.profilePicture[0] : files.profilePicture
      
      // Read file and convert to base64
      const fileBuffer = fs.readFileSync(file.filepath)
      const base64String = fileBuffer.toString('base64')
      const mimeType = file.mimetype || 'image/jpeg'
      
      formData.profilePicture = `data:${mimeType};base64,${base64String}`
      
      // Clean up temporary file
      fs.unlinkSync(file.filepath)
    }

    // Generate a unique ID for this submission (6 characters)
    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Create timestamp for the submission
    const submittedAt = new Date().toISOString()
    const timestamp = submittedAt.replace(/[:.]/g, '-')
    
    // Create the submission ID
    const submissionId = `${timestamp}_${uniqueId}`
    
    // Create the filename based on the student's name
    const firstName = formData.firstName || 'unknown'
    const lastName = formData.lastName || 'user'
    const filename = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${uniqueId.toLowerCase()}.json`
    
    // Create the submission object
    const submission = {
      id: submissionId,
      uniqueId: uniqueId,
      submittedAt: submittedAt,
      status: 'pending',
      studentData: formData,
      slug: uniqueId,
      metadata: {
        submissionDate: submittedAt,
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      }
    }

    // Store in Supabase
    console.log('Storing submission in Supabase...')
    
    const { data, error } = await supabase
      .from('submissions')
      .insert([{
        unique_id: uniqueId,
        submitted_at: submittedAt,
        status: 'pending',
        student_data: formData,
        published_slug: uniqueId
      }])
      .select()
    
    if (error) {
      console.error('Supabase insert error:', error)
      throw new Error(`Failed to store submission in database: ${error.message}`)
    }
    
    console.log(`New submission created in Supabase: ${uniqueId}`)

    // Return success response with the unique ID
    res.status(200).json({ 
      message: 'Application submitted successfully!',
      uniqueId: uniqueId,
      submissionId: submissionId
    })

  } catch (error) {
    console.error('Error submitting application:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
} 
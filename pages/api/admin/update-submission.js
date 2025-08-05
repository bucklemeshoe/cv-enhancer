import fs from 'fs'
import formidable from 'formidable'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '10mb',
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Parse FormData
    const form = formidable({})
    const [fields, files] = await form.parse(req)
    
    const submissionId = Array.isArray(fields.submissionId) ? fields.submissionId[0] : fields.submissionId
    
    if (!submissionId) {
      return res.status(400).json({ message: 'Missing submissionId' })
    }

    // Convert studentData to proper format
    const studentData = {}
    Object.keys(fields).forEach(key => {
      if (key !== 'submissionId') {
        const value = Array.isArray(fields[key]) ? fields[key][0] : fields[key]
        
        // Try to parse JSON fields
        if (key === 'experience' || key === 'certifications' || key === 'education' || key === 'references' || key === 'languages' || key === 'visa') {
          try {
            studentData[key] = JSON.parse(value)
          } catch (e) {
            studentData[key] = value
          }
        } else {
          studentData[key] = value
        }
      }
    })

    // Handle profile picture if uploaded
    if (files.profilePicture) {
      const file = Array.isArray(files.profilePicture) ? files.profilePicture[0] : files.profilePicture
      
      // Read file and convert to base64
      const fileBuffer = fs.readFileSync(file.filepath)
      const base64String = fileBuffer.toString('base64')
      const mimeType = file.mimetype || 'image/jpeg'
      
      studentData.profilePicture = `data:${mimeType};base64,${base64String}`
      
      // Clean up temporary file
      fs.unlinkSync(file.filepath)
    }

    // Validate required fields
    if (!studentData.firstName || !studentData.lastName || !studentData.email) {
      return res.status(400).json({ message: 'Missing required fields: firstName, lastName, and email are required' })
    }

    // Get the submission from Supabase
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      console.error('Error fetching submission:', fetchError)
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Update the submission data in Supabase
    const updatedAt = new Date().toISOString()
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update({
        student_data: studentData,
        updated_at: updatedAt
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating submission:', updateError)
      throw new Error(`Failed to update submission: ${updateError.message}`)
    }

    // If this submission is published, also update the published CV
    if (submission.status === 'published') {
      console.log('Updating published CV for:', submission.unique_id)
      
      // Use the latest student data (could be enhanced_data or student_data)
      const cvData = submission.enhanced_data || studentData
      
      // Generate the same slug format as publish-cv.js
      const firstName = cvData.firstName.toLowerCase().replace(/\s+/g, '-')
      const lastName = cvData.lastName.toLowerCase().replace(/\s+/g, '-')
      const uniqueId = submission.unique_id.toLowerCase()
      const concatenatedSlug = `${firstName}-${lastName}-${uniqueId}`
      
      // Transform the data to match the existing CV format (same as publish-cv.js)
      const publishedCV = {
        header: {
          name: `${cvData.firstName} ${cvData.lastName}`,
          title: cvData.targetRole || "Professional Yacht Crew",
          email: cvData.email,
          phone: cvData.phone,
          location: cvData.location,
          website: cvData.website || null,
          photo: cvData.profilePicture || null
        },
        personalInformation: {
          location: cvData.location,
          nationality: cvData.nationality,
          languages: cvData.languages?.filter(l => l) || [],
          visa: Array.isArray(cvData.visa) 
            ? cvData.visa.filter(v => v).join(', ') 
            : cvData.visa || '',
          health: cvData.health
        },
        skills: typeof cvData.skills === 'string' 
          ? cvData.skills.split(',').map(s => s.trim()).filter(s => s) 
          : cvData.skills?.filter(s => s) || [],
        profile: cvData.profile || "",
        certifications: cvData.certifications?.filter(c => c.name) || [],
        experience: cvData.experience?.filter(e => e.role) || [],
        education: cvData.education?.filter(e => e.qualification) || [],
        highestQualification: cvData.highestQualification || 'Matric',
        hobbiesAndInterests: typeof cvData.hobbiesAndInterests === 'string' 
          ? cvData.hobbiesAndInterests.split(',').map(h => h.trim()).filter(h => h) 
          : cvData.hobbiesAndInterests?.filter(h => h) || [],
        references: cvData.references?.filter(r => r.name) || []
      }

      // Update the published CV in Supabase
      const publishedData = {
        unique_id: submission.unique_id,
        slug: concatenatedSlug,
        cv_data: publishedCV,
        updated_at: updatedAt
      }

      const { error: publishedUpdateError } = await supabase
        .from('published_cvs')
        .update(publishedData)
        .eq('unique_id', submission.unique_id)

      if (publishedUpdateError) {
        console.error('Error updating published CV:', publishedUpdateError)
        // Don't fail the entire request if published CV update fails
      } else {
        console.log('✅ Published CV updated successfully')
      }
    }

    // Transform the response to match expected format
    const responseSubmission = {
      id: updatedSubmission.id,
      uniqueId: updatedSubmission.unique_id,
      studentData: updatedSubmission.student_data,
      enhancedData: updatedSubmission.enhanced_data,
      status: updatedSubmission.status,
      submittedAt: updatedSubmission.submitted_at,
      updatedAt: updatedSubmission.updated_at,
      publishedSlug: updatedSubmission.published_slug
    }

    res.status(200).json({ message: 'Submission updated successfully', submission: responseSubmission })

  } catch (error) {
    console.error('Error updating submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
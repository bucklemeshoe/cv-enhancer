import { createClient } from '@supabase/supabase-js'
import { uploadProfilePhoto, deleteImage, isCloudinaryUrl } from '../../../../lib/cloudinary'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
      console.error('Error fetching submission:', fetchError)
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Verify ownership - user can only update their own CVs
    if (submission.user_id !== user.id) {
      return res.status(403).json({ message: 'Forbidden - You can only update your own CVs' })
    }

    // Parse request body
    let studentData
    if (req.headers['content-type']?.includes('application/json')) {
      // Handle JSON request
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      await new Promise((resolve) => {
        req.on('end', resolve)
      })
      
      const parsed = JSON.parse(body)
      studentData = parsed.studentData
    } else {
      return res.status(400).json({ message: 'Content-Type must be application/json' })
    }

    if (!studentData) {
      return res.status(400).json({ message: 'Missing studentData' })
    }

    // SECURITY: Remove admin-only fields that students shouldn't modify
    const restrictedFields = ['showBadge', 'status', 'enhanced_data']
    restrictedFields.forEach(field => {
      delete studentData[field]
    })

    // Merge with existing data (preserve fields not being updated)
    const existingData = submission.student_data || {}
    const mergedData = { ...existingData }

    // Update only provided fields
    for (const key of Object.keys(studentData)) {
      const newValue = studentData[key]
      
      // Skip null, undefined, or empty string values (preserve existing)
      if (newValue !== null && newValue !== undefined && newValue !== '') {
        // If updating profile picture and new one is Cloudinary URL, clean up old Cloudinary image
        if (key === 'profilePicture' && isCloudinaryUrl(newValue)) {
          const oldProfilePicture = existingData.profilePicture
          const oldPublicId = existingData.profilePicturePublicId
          
          // Delete old Cloudinary image if it exists
          if (oldPublicId && isCloudinaryUrl(oldProfilePicture)) {
            try {
              const deleteResult = await deleteImage(oldPublicId)
              if (deleteResult.success) {
                console.log('Old Cloudinary image deleted:', oldPublicId)
              }
            } catch (error) {
              console.warn('Error deleting old Cloudinary image:', error)
            }
          }
        }
        
        mergedData[key] = newValue
      } else if (key === 'profilePicture' && newValue === null) {
        // Special case: allow explicit removal of profile picture
        const oldPublicId = existingData.profilePicturePublicId
        if (oldPublicId && isCloudinaryUrl(existingData.profilePicture)) {
          try {
            await deleteImage(oldPublicId)
          } catch (error) {
            console.warn('Error deleting old Cloudinary image on removal:', error)
          }
        }
        mergedData[key] = null
      } else if (key === 'videoUrl' && newValue === null) {
        // Special case: allow explicit removal of video URL
        mergedData[key] = null
      }
    }

    // Validate critical fields
    const criticalFields = ['firstName', 'lastName', 'email']
    const missingCritical = criticalFields.filter(field => {
      const value = mergedData[field]
      return !value || (typeof value === 'string' && value.trim() === '')
    })
    
    if (missingCritical.length > 0) {
      return res.status(400).json({ 
        message: `Critical fields cannot be empty: ${missingCritical.join(', ')}`
      })
    }

    // Validate skills limit
    if (mergedData.skills) {
      const skillsArray = mergedData.skills.split(',').map(s => s.trim()).filter(s => s)
      if (skillsArray.length > 15) {
        return res.status(400).json({ 
          message: 'Too many skills. Please limit to 15 skills maximum.',
          field: 'skills'
        })
      }
    }

    // Validate references limit
    if (mergedData.references && Array.isArray(mergedData.references)) {
      const validReferences = mergedData.references.filter(ref => 
        ref.name && ref.name.trim() !== '' && 
        ref.roleOrRelation && ref.roleOrRelation.trim() !== '' && 
        ref.contact && ref.contact.trim() !== ''
      )
      if (validReferences.length > 3) {
        return res.status(400).json({ 
          message: 'Too many references. Please limit to 3 references maximum.',
          field: 'references'
        })
      }
    }

    // Update the submission data in Supabase
    const updatedAt = new Date().toISOString()
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update({
        student_data: mergedData,
        updated_at: updatedAt
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating submission:', updateError)
      throw new Error(`Failed to update submission: ${updateError.message}`)
    }

    // If this submission is published, also update the published CV
    if (submission.status === 'published') {
      console.log('🔄 Syncing published CV with updated data...')
      
      // Use the latest merged data
      const cvData = submission.enhanced_data || mergedData
      
      // Generate the same slug format as publish-cv.js
      const firstName = cvData.firstName.toLowerCase().replace(/\s+/g, '-')
      const lastName = cvData.lastName.toLowerCase().replace(/\s+/g, '-')
      const uniqueId = submission.unique_id.toLowerCase()
      const concatenatedSlug = `${firstName}-${lastName}-${uniqueId}`
      
      // Transform the data to match the existing CV format
      const publishedCV = {
        header: {
          name: `${cvData.firstName} ${cvData.lastName}`,
          title: cvData.targetRole || "Professional Yacht Crew",
          email: cvData.email,
          phone: cvData.phone,
          location: cvData.location,
          website: cvData.website || null,
          photo: cvData.profilePicture || null,
          videoUrl: cvData.videoUrl && cvData.videoUrl.trim() !== '' ? cvData.videoUrl : null,
          showBadge: cvData.showBadge || false
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
        references: cvData.references?.filter(r => r.name) || [],
        videoUrl: cvData.videoUrl && cvData.videoUrl.trim() !== '' ? cvData.videoUrl : null
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
        console.log('✅ Published CV synced successfully')
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

    res.status(200).json({ message: 'CV updated successfully', submission: responseSubmission })

  } catch (error) {
    console.error('Error updating submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
}


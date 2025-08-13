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
    let submissionId, studentData

    // Check if request is JSON (from admin edit form) or FormData (from file uploads)
    if (req.headers['content-type']?.includes('application/json')) {
      // Handle JSON request from admin edit form
      let body = ''
      req.on('data', chunk => {
        body += chunk.toString()
      })
      
      await new Promise((resolve) => {
        req.on('end', resolve)
      })
      
      const parsed = JSON.parse(body)
      submissionId = parsed.submissionId
      studentData = parsed.studentData
      
    } else {
      // Handle FormData request (for file uploads)
      const form = formidable({})
      const [fields, files] = await form.parse(req)
      
      submissionId = Array.isArray(fields.submissionId) ? fields.submissionId[0] : fields.submissionId
      
      // Convert studentData to proper format
      studentData = {}
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
    }
    
    if (!submissionId) {
      return res.status(400).json({ message: 'Missing submissionId' })
    }

    // NOTE: We don't validate required fields here because we support partial updates.
    // Validation happens after merging with existing data to ensure critical fields aren't lost.
    console.log('DEBUG: Skipping premature validation for partial updates')

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

    // FUTURE-PROOF DATA PROTECTION: Merge new data with existing data
    const existingData = submission.student_data || {}
    
    // Create backup snapshot before update (for data recovery)
    const backupSnapshot = {
      timestamp: new Date().toISOString(),
      submissionId,
      previousData: existingData,
      updateSource: req.headers['content-type']?.includes('application/json') ? 'admin-edit-json' : 'admin-edit-formdata'
    }
    console.log('Creating backup snapshot:', JSON.stringify(backupSnapshot, null, 2))
    
    // SMART MERGE: Preserve existing fields, only update provided fields
    const mergedData = { ...existingData }
    
    // Only update fields that are actually provided (not null/undefined/empty)
    Object.keys(studentData).forEach(key => {
      const newValue = studentData[key]
      
      // Skip null, undefined, or empty string values (preserve existing)
      if (newValue !== null && newValue !== undefined && newValue !== '') {
        mergedData[key] = newValue
      } else if (key === 'profilePicture' && newValue === null) {
        // Special case: allow explicit removal of profile picture
        mergedData[key] = null
      }
      // For all other cases, keep existing value
    })
    
    // DATA VALIDATION: Ensure critical fields are never lost (check AFTER merge)
    const criticalFields = ['firstName', 'lastName', 'email']
    const missingCritical = criticalFields.filter(field => {
      const value = mergedData[field]
      return !value || (typeof value === 'string' && value.trim() === '')
    })
    
    if (missingCritical.length > 0) {
      return res.status(400).json({ 
        message: `Data protection error: Critical fields cannot be empty: ${missingCritical.join(', ')}`,
        backup: backupSnapshot
      })
    }
    
    console.log('Data merge complete. Fields updated:', Object.keys(studentData))
    console.log('Merged data preview:', {
      firstName: mergedData.firstName,
      lastName: mergedData.lastName,
      email: mergedData.email,
      fieldCount: Object.keys(mergedData).length
    })
    
    // DEBUG: Log critical fields status
    console.log('Critical fields check:', {
      firstName: { exists: !!mergedData.firstName, value: mergedData.firstName },
      lastName: { exists: !!mergedData.lastName, value: mergedData.lastName },
      email: { exists: !!mergedData.email, value: mergedData.email }
    })
    
    // Update the submission data in Supabase with MERGED data
    const updatedAt = new Date().toISOString()
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('submissions')
      .update({
        student_data: mergedData, // Use merged data instead of raw studentData
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
      
      // Use the latest merged data (preserves enhanced_data if available, otherwise uses merged data)
      const cvData = submission.enhanced_data || mergedData
      
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
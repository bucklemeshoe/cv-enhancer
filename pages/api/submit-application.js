import formidable from 'formidable'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import { uploadProfilePhoto, isCloudinaryUrl, isBase64DataUrl } from '../../lib/cloudinary'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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
    // Parse FormData
    const form = formidable({})
    
    const [fields, files] = await form.parse(req)
    
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
      } else if (key === 'videoUrl') {
        // Handle video URL - validate and store
        formData[key] = value
      } else {
        formData[key] = value
      }
    })

    // Handle profile picture if uploaded
    if (files.profilePicture) {
      const file = Array.isArray(files.profilePicture) ? files.profilePicture[0] : files.profilePicture
      
      try {
        // Upload to Cloudinary for new submissions
        const fileBuffer = fs.readFileSync(file.filepath)
        const uploadResult = await uploadProfilePhoto(fileBuffer, {
          public_id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        })
        
        if (uploadResult.success) {
          // Store Cloudinary URL
          formData.profilePicture = uploadResult.url
          formData.profilePictureCloudinary = uploadResult.url
          formData.profilePicturePublicId = uploadResult.public_id
          console.log('Profile picture uploaded to Cloudinary:', uploadResult.url)
        } else {
          console.error('Cloudinary upload failed, falling back to base64:', uploadResult.error)
          // Fallback to base64 if Cloudinary fails
          const base64String = fileBuffer.toString('base64')
          const mimeType = file.mimetype || 'image/jpeg'
          formData.profilePicture = `data:${mimeType};base64,${base64String}`
        }
      } catch (error) {
        console.error('Error uploading to Cloudinary, falling back to base64:', error)
        // Fallback to base64 if Cloudinary fails
        const fileBuffer = fs.readFileSync(file.filepath)
        const base64String = fileBuffer.toString('base64')
        const mimeType = file.mimetype || 'image/jpeg'
        formData.profilePicture = `data:${mimeType};base64,${base64String}`
      }
      
      // Clean up temporary file
      fs.unlinkSync(file.filepath)
    }

    // Validate skills limit
    if (formData.skills) {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s)
      if (skillsArray.length > 15) {
        return res.status(400).json({ 
          message: 'Too many skills. Please limit to 15 skills maximum.',
          field: 'skills'
        })
      }
    }

    // Validate references limit
    if (formData.references && Array.isArray(formData.references)) {
      const validReferences = formData.references.filter(ref => 
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

    // Generate a unique ID for this submission (6 characters)
    const uniqueId = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Create timestamp for the submission
    const submittedAt = new Date().toISOString()

    // Store in Supabase
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
      console.error('Supabase insert error:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to store submission in database: ${error.message || JSON.stringify(error)}`)
    }

    // Return success response with the actual database ID
    res.status(200).json({ 
      message: 'Application submitted successfully!',
      uniqueId: uniqueId,
      submissionId: data[0].id  // Use the actual database ID from Supabase
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
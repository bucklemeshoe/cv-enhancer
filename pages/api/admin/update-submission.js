import fs from 'fs'
import path from 'path'
import formidable from 'formidable'

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

    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    
    // Check if submissions directory exists
    if (!fs.existsSync(submissionsDir)) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Read all JSON files and find the one with matching ID
    const files_list = fs.readdirSync(submissionsDir).filter(file => file.endsWith('.json'))
    
    let submission = null
    let submissionFile = null
    
    for (const file of files_list) {
      try {
        const filePath = path.join(submissionsDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const fileSubmission = JSON.parse(fileContent)
        
        if (fileSubmission.id === submissionId) {
          submission = fileSubmission
          submissionFile = file
          break
        }
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError)
        // Continue with other files even if one fails
      }
    }

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Update the submission data
    submission.studentData = studentData
    submission.updatedAt = new Date().toISOString()

    // Write the updated submission back to the file
    const filePath = path.join(submissionsDir, submissionFile)
    fs.writeFileSync(filePath, JSON.stringify(submission, null, 2))

    // If this submission is published, also update the published CV
    if (submission.status === 'published') {
      console.log('Updating published CV for:', submission.uniqueId)
      
      // Use the latest student data (could be enhanced_data or student_data)
      const cvData = submission.enhancedData || submission.studentData
      
      // Generate the same slug format as publish-cv.js
      const firstName = cvData.firstName.toLowerCase().replace(/\s+/g, '-')
      const lastName = cvData.lastName.toLowerCase().replace(/\s+/g, '-')
      const uniqueId = submission.uniqueId.toLowerCase()
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

      // Update the published CV file
      const publishedDir = path.join(process.cwd(), 'data', 'published')
      if (!fs.existsSync(publishedDir)) {
        fs.mkdirSync(publishedDir, { recursive: true })
      }

      const publishedFilePath = path.join(publishedDir, `${submission.uniqueId}.json`)
      const publishedData = {
        uniqueId: submission.uniqueId,
        slug: concatenatedSlug,
        cvData: publishedCV,
        publishedAt: submission.publishedAt,
        updatedAt: new Date().toISOString()
      }

      fs.writeFileSync(publishedFilePath, JSON.stringify(publishedData, null, 2))
      console.log('✅ Published CV updated successfully')
    }

    res.status(200).json({ message: 'Submission updated successfully', submission })

  } catch (error) {
    console.error('Error updating submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
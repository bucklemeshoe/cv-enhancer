import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { submissionId } = req.body

    if (!submissionId) {
      return res.status(400).json({ message: 'Missing submissionId' })
    }

    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    
    // Check if submissions directory exists
    if (!fs.existsSync(submissionsDir)) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Read all JSON files and find the one with matching ID
    const files = fs.readdirSync(submissionsDir).filter(file => file.endsWith('.json'))
    
    let submission = null
    let submissionFile = null
    
    for (const file of files) {
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

    // Create the CV data for publication
    const cvData = submission.enhancedData || submission.studentData
    
    // Generate concatenated slug: firstname-lastname-uniqueid
    const firstName = cvData.firstName.toLowerCase().replace(/\s+/g, '-')
    const lastName = cvData.lastName.toLowerCase().replace(/\s+/g, '-')
    const uniqueId = submission.uniqueId.toLowerCase()
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

    // Ensure the published directory exists
    const publishedDir = path.join(process.cwd(), 'data', 'published')
    if (!fs.existsSync(publishedDir)) {
      fs.mkdirSync(publishedDir, { recursive: true })
    }

    // Save the published CV to file
    const publishedFilePath = path.join(publishedDir, `${submission.uniqueId}.json`)
    const publishedData = {
      uniqueId: submission.uniqueId,
      slug: concatenatedSlug,
      cvData: publishedCV,
      submissionId: submission.id,
      publishedAt: new Date().toISOString()
    }

    fs.writeFileSync(publishedFilePath, JSON.stringify(publishedData, null, 2))

    // Update submission status
    submission.status = 'published'
    submission.publishedAt = new Date().toISOString()
    submission.publishedSlug = concatenatedSlug

    // Write the updated submission back to the file
    const filePath = path.join(submissionsDir, submissionFile)
    fs.writeFileSync(filePath, JSON.stringify(submission, null, 2))

    res.status(200).json({ 
      message: 'CV published successfully',
      cvUrl: `/cvs/${concatenatedSlug}`,
      slug: concatenatedSlug
    })

  } catch (error) {
    console.error('Error publishing CV:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
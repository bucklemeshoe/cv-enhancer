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

    // Find the submission
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    const files = fs.readdirSync(submissionsDir)
    
    let submission = null
    let submissionFilePath = null

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(submissionsDir, file)
        const sub = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        if (sub.id === submissionId) {
          submission = sub
          submissionFilePath = filePath
          break
        }
      }
    }

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Allow publishing from any status (removed reviewed requirement)

    // Ensure published directory exists
    const publishedDir = path.join(process.cwd(), 'data', 'published')
    if (!fs.existsSync(publishedDir)) {
      fs.mkdirSync(publishedDir, { recursive: true })
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
        photo: cvData.profilePicture || null // Include profile picture if uploaded
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

    // Save the published CV (keep using unique ID as filename for consistency)
    const publishedFilePath = path.join(publishedDir, `${submission.uniqueId}.json`)
    fs.writeFileSync(publishedFilePath, JSON.stringify(publishedCV, null, 2))

    // Update the slug mapping in the CVs route file
    await updateSlugMapping(concatenatedSlug, submission.uniqueId)

    // Update submission status
    const updatedSubmission = {
      ...submission,
      status: 'published',
      publishedAt: new Date().toISOString(),
      publishedSlug: concatenatedSlug,
      slug: concatenatedSlug
    }

    fs.writeFileSync(submissionFilePath, JSON.stringify(updatedSubmission, null, 2))

    // TODO: Send email to student notifying them their CV is ready
    // await sendStudentNotification(submission.studentData.email, concatenatedSlug)

    res.status(200).json({ 
      message: 'CV published successfully',
      cvUrl: `/cvs/${concatenatedSlug}`,
      slug: concatenatedSlug
    })

  } catch (error) {
    console.error('Error publishing CV:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Function to update the slug mapping in the CVs route file
async function updateSlugMapping(concatenatedSlug, uniqueId) {
  try {
    const routeFilePath = path.join(process.cwd(), 'pages', 'cvs', '[slug].js')
    let fileContent = fs.readFileSync(routeFilePath, 'utf8')
    
    // Find the slugMapping object and add/update the new mapping
    const mappingRegex = /(const slugMapping = \{[^}]*)/
    const match = fileContent.match(mappingRegex)
    
    if (match) {
      // Extract the existing mapping content
      let existingMappings = match[1]
      
      // Add the new mapping (remove existing if present)
      const newMapping = `'${concatenatedSlug}': '${uniqueId}'`
      
      // Check if this concatenated slug already exists and replace it, or add it
      const existingSlugRegex = new RegExp(`'${concatenatedSlug.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}':\\s*'[^']*'`, 'g')
      
      if (existingSlugRegex.test(existingMappings)) {
        // Replace existing mapping
        existingMappings = existingMappings.replace(existingSlugRegex, newMapping)
      } else {
        // Add new mapping (add comma if needed)
        if (!existingMappings.includes('{')) {
          existingMappings += `\n      ${newMapping}`
        } else {
          // Insert after the opening brace
          existingMappings = existingMappings.replace('{', `{\n      ${newMapping},`)
        }
      }
      
      // Replace the entire mapping object
      const newMappingBlock = existingMappings + '\n    }'
      fileContent = fileContent.replace(mappingRegex, newMappingBlock)
      
      // Write the updated file
      fs.writeFileSync(routeFilePath, fileContent)
    }
  } catch (error) {
    console.error('Error updating slug mapping:', error)
    // Don't fail the publish process if mapping update fails
  }
}

// Future function to notify student
async function sendStudentNotification(email, slug) {
  // This would send an email to the student
  /*
  const emailData = {
    to: email,
    subject: 'Your Professional CV is Ready!',
    html: `
      <h2>Your CV Enhancement is Complete!</h2>
      <p>Your professional yacht crew CV has been reviewed and enhanced. You can now view and share it at:</p>
      <p><a href="https://yoursite.com/cvs/${slug}">View Your CV</a></p>
      <p>You can print, download, or share this link with potential employers.</p>
    `
  }
  */
} 
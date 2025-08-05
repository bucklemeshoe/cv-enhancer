import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const formData = req.body

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

    // Ensure the submissions directory exists
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true })
    }

    // Write the submission to a JSON file
    const filePath = path.join(submissionsDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(submission, null, 2))

    console.log(`New submission created: ${uniqueId} - ${filename}`)

    // Return success response with the unique ID
    res.status(200).json({ 
      message: 'Application submitted successfully!',
      uniqueId: uniqueId,
      submissionId: submissionId
    })

  } catch (error) {
    console.error('Error submitting application:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
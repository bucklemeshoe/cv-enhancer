import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { id } = req.query

    if (!id) {
      return res.status(400).json({ message: 'Missing submission ID' })
    }

    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    
    // Check if submissions directory exists
    if (!fs.existsSync(submissionsDir)) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Read all JSON files and find the one with matching ID
    const files = fs.readdirSync(submissionsDir).filter(file => file.endsWith('.json'))
    
    let submission = null
    
    for (const file of files) {
      try {
        const filePath = path.join(submissionsDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const fileSubmission = JSON.parse(fileContent)
        
        if (fileSubmission.id === id) {
          submission = fileSubmission
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

    // Transform data to match the expected format
    const transformedSubmission = {
      id: submission.id,
      uniqueId: submission.uniqueId,
      studentData: submission.studentData,
      enhancedData: submission.enhancedData || null,
      status: submission.status,
      submittedAt: submission.submittedAt,
      updatedAt: submission.updatedAt || submission.submittedAt,
      reviewedAt: submission.reviewedAt || null,
      publishedAt: submission.publishedAt || null,
      publishedSlug: submission.publishedSlug || submission.slug,
      slug: submission.publishedSlug || submission.slug
    }

    res.status(200).json({ submission: transformedSubmission })

  } catch (error) {
    console.error('Error loading submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
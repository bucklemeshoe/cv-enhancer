import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    
    // Check if submissions directory exists
    if (!fs.existsSync(submissionsDir)) {
      return res.status(200).json({ submissions: [] })
    }

    // Read all JSON files from the submissions directory
    const files = fs.readdirSync(submissionsDir).filter(file => file.endsWith('.json'))
    
    const submissions = []
    
    for (const file of files) {
      try {
        const filePath = path.join(submissionsDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const submission = JSON.parse(fileContent)
        
        // Transform data to match the expected format
        submissions.push({
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
        })
      } catch (fileError) {
        console.error(`Error reading file ${file}:`, fileError)
        // Continue with other files even if one fails
      }
    }

    // Sort by submittedAt (newest first)
    submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

    res.status(200).json({ submissions })

  } catch (error) {
    console.error('Error loading submissions:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
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

    // Read all submission files
    const files = fs.readdirSync(submissionsDir)
    const submissions = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(submissionsDir, file)
          const fileContent = fs.readFileSync(filePath, 'utf8')
          const submission = JSON.parse(fileContent)
          submissions.push(submission)
        } catch (error) {
          console.error(`Error reading submission file ${file}:`, error)
        }
      }
    }

    // Sort submissions by submission date (newest first)
    submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

    res.status(200).json({ submissions })

  } catch (error) {
    console.error('Error loading submissions:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 
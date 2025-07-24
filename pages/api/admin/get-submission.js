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

    // Find the submission file
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    const files = fs.readdirSync(submissionsDir)
    
    let submission = null

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(submissionsDir, file)
        const sub = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        if (sub.id === id) {
          submission = sub
          break
        }
      }
    }

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    res.status(200).json({ submission })

  } catch (error) {
    console.error('Error fetching submission:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { submissionId } = req.body

    if (!submissionId) {
      return res.status(400).json({ message: 'Missing submissionId' })
    }

    // Find and delete the submission
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

    // Delete the submission file
    fs.unlinkSync(submissionFilePath)

    // If the CV was published, also delete the published version
    if (submission.status === 'published' && submission.slug) {
      const publishedDir = path.join(process.cwd(), 'data', 'published')
      const publishedFilePath = path.join(publishedDir, `${submission.slug}.json`)
      
      if (fs.existsSync(publishedFilePath)) {
        fs.unlinkSync(publishedFilePath)
      }
    }

    res.status(200).json({ 
      message: 'CV deleted successfully',
      deletedSubmission: submission.studentData.firstName + ' ' + submission.studentData.lastName
    })

  } catch (error) {
    console.error('Error deleting CV:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 
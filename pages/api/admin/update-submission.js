import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { submissionId, studentData } = req.body

    if (!submissionId || !studentData) {
      return res.status(400).json({ message: 'Missing submissionId or studentData' })
    }

    // Find the submission file
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

    // Update the submission with new data
    const updatedSubmission = {
      ...submission,
      studentData: studentData,
      updatedAt: new Date().toISOString()
    }

    // Save the updated submission
    fs.writeFileSync(submissionFilePath, JSON.stringify(updatedSubmission, null, 2))

    res.status(200).json({ message: 'Submission updated successfully' })

  } catch (error) {
    console.error('Error updating submission:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 
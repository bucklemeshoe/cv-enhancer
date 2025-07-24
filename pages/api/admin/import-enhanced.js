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
    const form = formidable({})
    const [fields, files] = await form.parse(req)
    
    const submissionId = Array.isArray(fields.submissionId) ? fields.submissionId[0] : fields.submissionId
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file

    if (!submissionId || !uploadedFile) {
      return res.status(400).json({ message: 'Missing submissionId or file' })
    }

    // Read the uploaded JSON file
    const enhancedData = JSON.parse(fs.readFileSync(uploadedFile.filepath, 'utf8'))

    // Find the original submission
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    const files_list = fs.readdirSync(submissionsDir)
    
    let originalSubmission = null
    let originalFilePath = null

    for (const file of files_list) {
      if (file.endsWith('.json')) {
        const filePath = path.join(submissionsDir, file)
        const submission = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        if (submission.id === submissionId) {
          originalSubmission = submission
          originalFilePath = filePath
          break
        }
      }
    }

    if (!originalSubmission) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Update the submission with enhanced data and mark as reviewed
    const updatedSubmission = {
      ...originalSubmission,
      status: 'reviewed',
      enhancedData: enhancedData,
      reviewedAt: new Date().toISOString()
    }

    // Save the updated submission
    fs.writeFileSync(originalFilePath, JSON.stringify(updatedSubmission, null, 2))

    res.status(200).json({ message: 'Enhanced data imported successfully' })

  } catch (error) {
    console.error('Error importing enhanced data:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
} 
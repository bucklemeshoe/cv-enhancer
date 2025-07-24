import fs from 'fs'
import path from 'path'
import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Generate a unique 5-character ID
function generateUniqueId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if ID already exists in submissions
function isIdUnique(id) {
  const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
  if (!fs.existsSync(submissionsDir)) {
    return true
  }
  
  const files = fs.readdirSync(submissionsDir)
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const filePath = path.join(submissionsDir, file)
        const submission = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        if (submission.uniqueId === id) {
          return false
        }
      } catch (error) {
        // Skip invalid files
        continue
      }
    }
  }
  return true
}

// Generate a guaranteed unique ID
function generateGuaranteedUniqueId() {
  let id
  do {
    id = generateUniqueId()
  } while (!isIdUnique(id))
  return id
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Parse form data including files
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'public', 'uploads', 'profiles'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB max
    })

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const [fields, files] = await form.parse(req)
    
    // Convert fields to regular object
    const formData = {}
    Object.keys(fields).forEach(key => {
      const value = fields[key][0] // formidable returns arrays
      try {
        // Try to parse JSON fields (arrays/objects)
        formData[key] = JSON.parse(value)
      } catch {
        // If not JSON, keep as string
        formData[key] = value
      }
    })
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.targetRole) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Generate unique ID for this CV
    const uniqueId = generateGuaranteedUniqueId()
    
    // Generate filename using timestamp and unique ID
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const nameSlug = `${formData.firstName.trim()}-${formData.lastName.trim()}`.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const filename = `${timestamp}_${uniqueId}.json`

    // Handle profile picture if uploaded
    let profilePicturePath = null
    if (files.profilePicture && files.profilePicture[0]) {
      const profilePic = files.profilePicture[0]
      const fileExtension = path.extname(profilePic.originalFilename || profilePic.newFilename)
      const newFileName = `${timestamp}_${uniqueId}_profile${fileExtension}`
      const newFilePath = path.join(uploadDir, newFileName)
      
      // Move and rename the uploaded file
      fs.renameSync(profilePic.filepath, newFilePath)
      profilePicturePath = `/uploads/profiles/${newFileName}`
    }
    
    // Create submission object with metadata
    const submission = {
      id: `${timestamp}_${uniqueId}`,
      uniqueId: uniqueId, // 5-character unique identifier for URLs
      submittedAt: new Date().toISOString(),
      status: 'pending', // pending, reviewed, published
      studentData: {
        ...formData,
        profilePicture: profilePicturePath // Add the profile picture path
      },
      slug: uniqueId, // Use unique ID for URL generation
      metadata: {
        submissionDate: new Date().toISOString(),
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      }
    }

    // Ensure submissions directory exists
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true })
    }

    // Save submission to file
    const filePath = path.join(submissionsDir, filename)
    fs.writeFileSync(filePath, JSON.stringify(submission, null, 2))

    // Log the submission (in production, you'd send an email notification here)
    console.log(`New CV application submitted: ${formData.firstName} ${formData.lastName} (${formData.email})`)
    console.log(`Saved to: ${filename}`)

    // TODO: Send email notification to admin
    // await sendEmailNotification(submission)

    res.status(200).json({ 
      message: 'Application submitted successfully',
      submissionId: submission.id
    })

  } catch (error) {
    console.error('Error processing application:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Future email notification function
async function sendEmailNotification(submission) {
  // This would integrate with your email service (SendGrid, Nodemailer, etc.)
  // Example structure:
  /*
  const emailData = {
    to: 'admin@yoursite.com',
    subject: `New CV Application: ${submission.studentData.firstName} ${submission.studentData.lastName}`,
    html: `
      <h2>New CV Application Received</h2>
      <p><strong>Name:</strong> ${submission.studentData.firstName} ${submission.studentData.lastName}</p>
      <p><strong>Email:</strong> ${submission.studentData.email}</p>
      <p><strong>Target Role:</strong> ${submission.studentData.targetRole}</p>
      <p><strong>Submitted:</strong> ${submission.submittedAt}</p>
      <p><a href="https://yoursite.com/admin">Review Application</a></p>
    `
  }
  */
} 
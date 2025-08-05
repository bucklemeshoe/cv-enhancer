import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Environment detection - Netlify sets several environment variables
const isProduction = process.env.NETLIFY || 
                     process.env.NETLIFY_DEV || 
                     process.env.AWS_LAMBDA_FUNCTION_NAME || 
                     process.env.NODE_ENV === 'production'

// Supabase client (only used in production)
const supabase = isProduction ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
) : null

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    let submissions = []

    if (isProduction) {
      // PRODUCTION: Load from Supabase
      console.log('Loading submissions from Supabase...')
      
      const { data, error } = await supabase
        .from('cv_submissions')
        .select('*')
        .order('submitted_at', { ascending: false })
      
      if (error) {
        console.error('Supabase query error:', error)
        throw new Error(`Failed to load submissions from database: ${error.message}`)
      }
      
      // Transform Supabase data to match expected format
      submissions = data.map(submission => ({
        id: submission.id,
        uniqueId: submission.unique_id,
        studentData: submission.student_data,
        enhancedData: submission.enhanced_data || null,
        status: submission.status,
        submittedAt: submission.submitted_at,
        updatedAt: submission.updated_at || submission.submitted_at,
        reviewedAt: submission.reviewed_at || null,
        publishedAt: submission.published_at || null,
        publishedSlug: submission.published_slug || submission.slug,
        slug: submission.published_slug || submission.slug
      }))
      
    } else {
      // DEVELOPMENT: Load from local files
      console.log('Loading submissions from local files...')
      
      const submissionsDir = path.join(process.cwd(), 'data', 'submissions')
      
      // Check if submissions directory exists
      if (!fs.existsSync(submissionsDir)) {
        return res.status(200).json({ submissions: [] })
      }

      // Read all JSON files from the submissions directory
      const files = fs.readdirSync(submissionsDir).filter(file => file.endsWith('.json'))
      
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
    }

    res.status(200).json({ submissions })

  } catch (error) {
    console.error('Error loading submissions:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
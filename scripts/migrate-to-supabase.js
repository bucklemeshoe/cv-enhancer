const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrateSubmissions() {
  console.log('🔄 Migrating submissions...')
  
  const submissionsDir = path.join(__dirname, '..', 'data', 'submissions')
  
  if (!fs.existsSync(submissionsDir)) {
    console.log('📁 No submissions directory found - skipping submissions migration')
    return
  }

  const files = fs.readdirSync(submissionsDir).filter(file => file.endsWith('.json'))
  
  for (const file of files) {
    try {
      const filePath = path.join(submissionsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const submission = JSON.parse(fileContent)
      
      // Transform to match database schema (generate new UUID for id)
      const dbSubmission = {
        // Don't include id - let database auto-generate UUID
        unique_id: submission.uniqueId,
        student_data: submission.studentData,
        enhanced_data: submission.enhancedData || null,
        status: submission.status || 'pending',
        submitted_at: submission.submittedAt,
        updated_at: submission.updatedAt || submission.submittedAt,
        reviewed_at: submission.reviewedAt || null,
        published_at: submission.publishedAt || null,
        published_slug: submission.publishedSlug || null
      }

      // Insert into Supabase (use upsert to handle duplicates by unique_id)
      const { error } = await supabase
        .from('submissions')
        .upsert([dbSubmission], { 
          onConflict: 'unique_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error(`❌ Error migrating submission ${file}:`, error.message)
      } else {
        console.log(`✅ Migrated submission: ${submission.uniqueId}`)
      }
    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error.message)
    }
  }
  
  console.log(`📊 Processed ${files.length} submission files`)
}

async function migratePublishedCVs() {
  console.log('🔄 Migrating published CVs...')
  
  const publishedDir = path.join(__dirname, '..', 'data', 'published')
  
  if (!fs.existsSync(publishedDir)) {
    console.log('📁 No published directory found - skipping published CVs migration')
    return
  }

  const files = fs.readdirSync(publishedDir).filter(file => file.endsWith('.json'))
  
  for (const file of files) {
    try {
      const filePath = path.join(publishedDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      const cvData = JSON.parse(fileContent)
      
      // Extract unique_id from filename (remove .json extension)
      const uniqueId = path.basename(file, '.json')
      
      // Generate slug from CV data
      const firstName = cvData.header?.name?.split(' ')[0]?.toLowerCase().replace(/\s+/g, '-') || 'unknown'
      const lastName = cvData.header?.name?.split(' ').slice(1).join('-')?.toLowerCase().replace(/\s+/g, '-') || 'user'
      const slug = `${firstName}-${lastName}-${uniqueId.toLowerCase()}`

      // Find corresponding submission to get submission_id
      const { data: submission } = await supabase
        .from('submissions')
        .select('id')
        .eq('unique_id', uniqueId)
        .single()

      const dbPublishedCV = {
        unique_id: uniqueId,
        slug: slug,
        cv_data: cvData,
        submission_id: submission?.id || null,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert into Supabase (use upsert to handle duplicates)
      const { error } = await supabase
        .from('published_cvs')
        .upsert([dbPublishedCV], { 
          onConflict: 'unique_id',
          ignoreDuplicates: false 
        })

      if (error) {
        console.error(`❌ Error migrating published CV ${file}:`, error.message)
      } else {
        console.log(`✅ Migrated published CV: ${uniqueId} → ${slug}`)
      }
    } catch (error) {
      console.error(`❌ Error processing file ${file}:`, error.message)
    }
  }
  
  console.log(`📊 Processed ${files.length} published CV files`)
}

async function main() {
  console.log('🚀 Starting data migration to Supabase...')
  console.log(`📍 Supabase URL: ${supabaseUrl}`)
  
  try {
    // Test connection
    const { data, error } = await supabase.from('submissions').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('❌ Failed to connect to Supabase:', error.message)
      process.exit(1)
    }
    console.log('✅ Connected to Supabase successfully')
    
    await migrateSubmissions()
    await migratePublishedCVs()
    
    console.log('🎉 Migration completed!')
    
    // Show summary
    const { data: submissionsCount } = await supabase.from('submissions').select('count', { count: 'exact', head: true })
    const { data: publishedCount } = await supabase.from('published_cvs').select('count', { count: 'exact', head: true })
    
    console.log('\n📈 Database Summary:')
    console.log(`   Submissions: ${submissionsCount?.count || 0}`)
    console.log(`   Published CVs: ${publishedCount?.count || 0}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

main() 
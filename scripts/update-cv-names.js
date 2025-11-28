require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const email = 'jared+0010@makefriendly.co.za'
const firstName = 'Jared'
const lastName = 'Buckley'

async function updateCVNames() {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      throw listError
    }
    
    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      process.exit(1)
    }
    
    console.log(`✅ Found user: ${user.id}`)
    
    // Get all submissions for this user
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.id)
    
    if (fetchError) {
      console.error('❌ Error fetching submissions:', fetchError)
      throw fetchError
    }
    
    if (!submissions || submissions.length === 0) {
      console.log('ℹ️  No CVs found for this user')
      return
    }
    
    console.log(`\n📝 Found ${submissions.length} CV(s) to update`)
    
    // Update each submission
    for (const submission of submissions) {
      const studentData = submission.student_data || {}
      
      console.log(`\n📄 Updating CV: ${submission.unique_id}`)
      console.log(`   Current name: ${studentData.firstName} ${studentData.lastName}`)
      
      // Update the name
      const updatedStudentData = {
        ...studentData,
        firstName: firstName,
        lastName: lastName
      }
      
      // Update the submission
      const { data: updatedSubmission, error: updateError } = await supabase
        .from('submissions')
        .update({
          student_data: updatedStudentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', submission.id)
        .select()
        .single()
      
      if (updateError) {
        console.error(`❌ Error updating CV ${submission.unique_id}:`, updateError)
      } else {
        console.log(`✅ Updated CV ${submission.unique_id}`)
        console.log(`   New name: ${updatedStudentData.firstName} ${updatedStudentData.lastName}`)
        
        // If published, also update the published CV
        if (submission.status === 'published') {
          console.log(`   🔄 Updating published CV...`)
          
          const cvData = submission.enhanced_data || updatedStudentData
          
          // Generate the same slug format
          const firstNameSlug = firstName.toLowerCase().replace(/\s+/g, '-')
          const lastNameSlug = lastName.toLowerCase().replace(/\s+/g, '-')
          const uniqueId = submission.unique_id.toLowerCase()
          const concatenatedSlug = `${firstNameSlug}-${lastNameSlug}-${uniqueId}`
          
          // Transform the data to match the existing CV format
          const publishedCV = {
            header: {
              name: `${firstName} ${lastName}`,
              title: cvData.targetRole || "Professional Yacht Crew",
              email: cvData.email,
              phone: cvData.phone,
              location: cvData.location,
              website: cvData.website || null,
              photo: cvData.profilePicture || null,
              videoUrl: cvData.videoUrl && cvData.videoUrl.trim() !== '' ? cvData.videoUrl : null,
              showBadge: cvData.showBadge || false
            },
            personalInformation: {
              location: cvData.location,
              nationality: cvData.nationality,
              languages: cvData.languages?.filter(l => l) || [],
              visa: Array.isArray(cvData.visa) 
                ? cvData.visa.filter(v => v).join(', ') 
                : cvData.visa || '',
              health: cvData.health
            },
            skills: typeof cvData.skills === 'string' 
              ? cvData.skills.split(',').map(s => s.trim()).filter(s => s) 
              : cvData.skills?.filter(s => s) || [],
            profile: cvData.profile || "",
            certifications: cvData.certifications?.filter(c => c.name) || [],
            experience: cvData.experience?.filter(e => e.role) || [],
            education: cvData.education?.filter(e => e.qualification) || [],
            highestQualification: cvData.highestQualification || 'Matric',
            hobbiesAndInterests: typeof cvData.hobbiesAndInterests === 'string' 
              ? cvData.hobbiesAndInterests.split(',').map(h => h.trim()).filter(h => h) 
              : cvData.hobbiesAndInterests?.filter(h => h) || [],
            references: cvData.references?.filter(r => r.name) || [],
            videoUrl: cvData.videoUrl && cvData.videoUrl.trim() !== '' ? cvData.videoUrl : null
          }
          
          // Update the published CV
          const { error: publishedUpdateError } = await supabase
            .from('published_cvs')
            .update({
              unique_id: submission.unique_id,
              slug: concatenatedSlug,
              cv_data: publishedCV,
              updated_at: new Date().toISOString()
            })
            .eq('unique_id', submission.unique_id)
          
          if (publishedUpdateError) {
            console.error(`   ❌ Error updating published CV:`, publishedUpdateError)
          } else {
            console.log(`   ✅ Published CV updated with new slug: ${concatenatedSlug}`)
          }
        }
      }
    }
    
    console.log('\n🎉 All CVs updated successfully!')
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

updateCVNames()


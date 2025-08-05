import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { submissionId } = req.body

    if (!submissionId) {
      return res.status(400).json({ message: 'Missing submissionId' })
    }

    // Get the submission from Supabase
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError || !submission) {
      console.error('Error fetching submission:', fetchError)
      return res.status(404).json({ message: 'Submission not found' })
    }

    // Create the CV data for publication
    const cvData = submission.enhanced_data || submission.student_data
    
    // Generate concatenated slug: firstname-lastname-uniqueid
    const firstName = cvData.firstName.toLowerCase().replace(/\s+/g, '-')
    const lastName = cvData.lastName.toLowerCase().replace(/\s+/g, '-')
    const uniqueId = submission.unique_id.toLowerCase()
    const concatenatedSlug = `${firstName}-${lastName}-${uniqueId}`
    
    // Transform the data to match the existing CV format
    const publishedCV = {
      header: {
        name: `${cvData.firstName} ${cvData.lastName}`,
        title: cvData.targetRole || "Professional Yacht Crew",
        email: cvData.email,
        phone: cvData.phone,
        location: cvData.location,
        website: cvData.website || null,
        photo: cvData.profilePicture || null
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
      references: cvData.references?.filter(r => r.name) || []
    }

    const publishedAt = new Date().toISOString()

    // Save the published CV to Supabase
    const publishedData = {
      unique_id: submission.unique_id,
      slug: concatenatedSlug,
      cv_data: publishedCV,
      submission_id: submission.id,
      published_at: publishedAt
    }

    // Check if this CV is already published (upsert)
    const { data: existingPublished, error: checkError } = await supabase
      .from('published_cvs')
      .select('unique_id')
      .eq('unique_id', submission.unique_id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is fine for new publications
      console.error('Error checking existing published CV:', checkError)
      throw new Error(`Failed to check existing published CV: ${checkError.message}`)
    }

    if (existingPublished) {
      // Update existing published CV
      const { error: updatePublishedError } = await supabase
        .from('published_cvs')
        .update(publishedData)
        .eq('unique_id', submission.unique_id)
    } else {
      // Insert new published CV
      const { error: insertPublishedError } = await supabase
        .from('published_cvs')
        .insert(publishedData)

      if (insertPublishedError) {
        console.error('Error inserting published CV:', insertPublishedError)
        throw new Error(`Failed to publish CV: ${insertPublishedError.message}`)
      }
    }

    // Update submission status in Supabase
    const { error: updateSubmissionError } = await supabase
      .from('submissions')
      .update({
        status: 'published',
        published_at: publishedAt,
        published_slug: concatenatedSlug
      })
      .eq('id', submissionId)

    if (updateSubmissionError) {
      console.error('Error updating submission status:', updateSubmissionError)
      throw new Error(`Failed to update submission status: ${updateSubmissionError.message}`)
    }

    res.status(200).json({ 
      message: 'CV published successfully',
      cvUrl: `/cvs/${concatenatedSlug}`,
      slug: concatenatedSlug
    })

  } catch (error) {
    console.error('Error publishing CV:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
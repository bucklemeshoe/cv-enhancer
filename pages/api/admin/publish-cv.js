import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { submissionId } = req.body

    if (!submissionId) {
      return res.status(400).json({ message: 'Missing submissionId' })
    }

    // Find the submission in Supabase
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError)
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ message: 'Submission not found' })
      }
      return res.status(500).json({ message: `Database error: ${fetchError.message}` })
    }

    if (!submission) {
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

    // Save the published CV to database
    const { data: publishedCVRecord, error: publishError } = await supabase
      .from('published_cvs')
      .upsert([{
        unique_id: submission.unique_id,
        slug: concatenatedSlug,
        cv_data: publishedCV,
        submission_id: submission.id,
        published_at: new Date().toISOString()
      }], {
        onConflict: 'unique_id'
      })
      .select()
      .single()

    if (publishError) {
      console.error('Error publishing CV:', publishError)
      return res.status(500).json({ message: `Database error: ${publishError.message}` })
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
        published_slug: concatenatedSlug
      })
      .eq('id', submissionId)

    if (updateError) {
      console.error('Error updating submission status:', updateError)
      return res.status(500).json({ message: `Database error: ${updateError.message}` })
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
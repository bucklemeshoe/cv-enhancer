import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { submissionId, studentData } = req.body

    if (!submissionId || !studentData) {
      return res.status(400).json({ message: 'Missing submissionId or studentData' })
    }

    // Validate required fields
    if (!studentData.firstName || !studentData.lastName || !studentData.email) {
      return res.status(400).json({ message: 'Missing required fields: firstName, lastName, and email are required' })
    }

    // Update the submission in Supabase
    const { data, error } = await supabase
      .from('submissions')
      .update({ 
        student_data: studentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Submission not found' })
      }
      
      return res.status(500).json({ message: `Database error: ${error.message}` })
    }

    if (!data) {
      return res.status(404).json({ message: 'Submission not found' })
    }

    // If this submission is published, also update the published CV
    if (data.status === 'published') {
      console.log('Updating published CV for:', data.unique_id)
      
      // Use the latest student data (could be enhanced_data or student_data)
      const cvData = data.enhanced_data || data.student_data
      
      // Generate the same slug format as publish-cv.js
      const firstName = cvData.firstName.toLowerCase().replace(/\s+/g, '-')
      const lastName = cvData.lastName.toLowerCase().replace(/\s+/g, '-')
      const uniqueId = data.unique_id.toLowerCase()
      const concatenatedSlug = `${firstName}-${lastName}-${uniqueId}`
      
      // Transform the data to match the existing CV format (same as publish-cv.js)
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

      // Update the published CV
      const { error: publishError } = await supabase
        .from('published_cvs')
        .update({
          slug: concatenatedSlug,
          cv_data: publishedCV,
          updated_at: new Date().toISOString()
        })
        .eq('unique_id', data.unique_id)

      if (publishError) {
        console.error('Error updating published CV:', publishError)
        // Don't fail the whole request, just log the error
      } else {
        console.log('✅ Published CV updated successfully')
      }
    }

    res.status(200).json({ message: 'Submission updated successfully', submission: data })

  } catch (error) {
    console.error('Error updating submission:', error)
    res.status(500).json({ message: `Internal server error: ${error.message}` })
  }
} 
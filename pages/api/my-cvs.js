import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Get authenticated user from request headers
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Fetch user's submissions
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching submissions:', fetchError)
      return res.status(500).json({ message: 'Failed to fetch submissions' })
    }

    return res.status(200).json({ submissions: submissions || [] })

  } catch (error) {
    console.error('Error in my-cvs API:', error)
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    })
  }
}


import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { field, content, context } = req.body

    if (!field || !content) {
      return res.status(400).json({ message: 'Missing field or content' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key not configured' })
    }

    // Create field-specific prompts
    const prompts = {
      profile: `
        Polish this yacht crew professional profile summary to improve clarity and professionalism.
        
        Context information:
        - Name: ${context.firstName} ${context.lastName}
        - Target Role: ${context.targetRole}
        
        Guidelines:
        - Improve grammar and sentence structure
        - Use professional language and yacht industry terms where appropriate
        - If the current profile is short (under 320 characters), expand it using the context information to create a more comprehensive professional summary
        - For short profiles, incorporate relevant details about their target role and professional aspirations in the yacht industry
        - Keep the same core content and experiences mentioned, but enhance with professional context
        - Do not add fake experiences, but you can reference their target role and industry knowledge
        - Maintain professional, factual tone
        - Write in first person ("I"), as if the candidate is speaking about themselves
        - Do not use third person and do not refer to the candidate by name
        - Keep the voice consistent and natural for a candidate writing their own CV
        - Do not add emojis or overly enthusiastic language
        - Aim for at least 320 characters for short profiles while keeping longer ones appropriately concise
        
        Current profile: "${content}"
        
        Return only the polished profile text, no extra formatting or quotes.
      `,
      
      hobbies: `
        Convert this hobbies and interests text into a clean, professional comma-separated list.
        
        Guidelines:
        - Transform descriptive phrases into simple activity names (e.g., "I like to fish" becomes "Fishing")
        - Convert sentences into noun-based activities (e.g., "I enjoy playing football" becomes "Football")
        - Keep the same hobbies and interests mentioned, just reformat them
        - Do not add new hobbies or interests
        - Remove any bullet points, numbers, or other formatting
        - Ensure each item is separated by a comma and space
        - Use professional, concise activity names
        - Capitalize the first letter of each activity
        - Do not add emojis or extra descriptive words
        
        Examples:
        - "I like to fish and go swimming" → "Fishing, Swimming"
        - "Playing guitar, I enjoy hiking" → "Guitar, Hiking"
        - "Love reading books and cooking meals" → "Reading, Cooking"
        
        Current text: "${content}"
        
        Return only the comma-separated list of activity names, no extra formatting.
      `,
      
      experience: `
        Improve the grammar and clarity of these work experience bullet points.
        
        Guidelines:
        - Fix grammar, spelling, and sentence structure
        - Use professional action verbs where appropriate
        - Keep the same responsibilities and achievements mentioned
        - Do not add new responsibilities or achievements not mentioned
        - Maintain factual, professional tone
        - Use action-oriented statements with no pronouns (no "I", "he/she", "we")
        - Do not use third person and do not refer to the candidate by name
        - Do not exaggerate or embellish
        - Keep each point concise and clear
        - Do not add emojis or overly enthusiastic language
        
        Current responsibilities: "${content}"
        
        Return only the improved bullet points as a simple list, one per line, no bullet symbols.
      `
    }

    const prompt = prompts[field]
    if (!prompt) {
      return res.status(400).json({ message: 'Invalid field specified' })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional CV writer specializing in yacht crew positions. Write in the candidate's voice. For profile summaries, use first person (\"I\"). For experience bullets, use concise action statements without pronouns. Do not use third person or refer to the candidate by name. Provide direct, concise enhancements without extra commentary."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const enhancedContent = response.choices[0].message.content.trim()

    res.status(200).json({ 
      enhancedContent,
      originalContent: content,
      field 
    })

  } catch (error) {
    console.error('AI Enhancement Error:', error)
    res.status(500).json({ 
      message: 'Error enhancing content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
} 
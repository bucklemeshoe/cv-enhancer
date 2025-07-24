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
        
        Guidelines:
        - Improve grammar and sentence structure only
        - Use professional language and yacht industry terms where appropriate
        - Keep the same core content and experiences mentioned
        - Do not add new experiences, skills, or qualifications not mentioned
        - Keep it concise (2-3 sentences maximum)
        - Do not add emojis or overly enthusiastic language
        - Maintain professional, factual tone
        
        Current profile: "${content}"
        
        Return only the polished profile text, no extra formatting or quotes.
      `,
      
      hobbies: `
        Format this hobbies and interests text into proper comma-separated values.
        
        Guidelines:
        - Convert the text into a clean, comma-separated list
        - Keep the exact same hobbies and interests mentioned
        - Do not add new hobbies or interests
        - Remove any bullet points, numbers, or other formatting
        - Ensure each item is separated by a comma and space
        - Keep the original wording as much as possible
        - Do not add emojis or extra descriptive words
        
        Current text: "${content}"
        
        Return only the comma-separated list, no extra formatting.
      `,
      
      experience: `
        Improve the grammar and clarity of these work experience bullet points.
        
        Guidelines:
        - Fix grammar, spelling, and sentence structure
        - Use professional action verbs where appropriate
        - Keep the same responsibilities and achievements mentioned
        - Do not add new responsibilities or achievements not mentioned
        - Maintain factual, professional tone
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
          content: "You are a professional CV writer specializing in yacht crew positions. Provide direct, concise enhancements without extra commentary."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
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
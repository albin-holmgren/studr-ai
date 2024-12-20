import { json } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"
import OpenAI from "openai"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.projectx.ai/v1"
})

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const { content, title } = await request.json()

    if (!content) {
      return json({ error: "Content is required" }, { status: 400 })
    }

    // Take first 2000 words for better analysis
    const truncatedContent = content
      .split(/\s+/)
      .slice(0, 2000)
      .join(' ')

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional content organizer that creates clear and descriptive table of contents.
          Your task is to:
          1. Analyze the content thoroughly
          2. Identify 3-5 distinct main themes or topics
          3. Create unique, descriptive section titles that accurately reflect each theme
          4. Ensure titles are different from each other and from the main title
          5. Order sections logically to tell a coherent story
          
          Guidelines:
          - Make titles descriptive but concise (3-6 words)
          - Avoid generic titles like "Introduction" or "Section 1"
          - Focus on the unique aspects of each section
          - Use active, engaging language`
        },
        {
          role: "user",
          content: `Title: ${title || 'Article'}
          
          Content: ${truncatedContent}
          
          Create a table of contents with 3-5 distinct, descriptive section titles. Return in this JSON format:
          {
            "sections": [
              {
                "title": "Unique, descriptive section title",
                "startIndex": 0  // paragraph number where this section approximately starts
              }
            ]
          }
          
          Make sure each title is:
          1. Different from the main title and other section titles
          2. Specific to the content in that section
          3. Clear and descriptive (not generic)
          4. Engaging and informative`
        }
      ],
      temperature: 0.7, // Increased for more creative titles
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{"sections": []}')
    
    // Split content into paragraphs
    const paragraphs = content.split('\n').filter(Boolean)
    const paragraphCount = paragraphs.length
    
    // Map the sections to content ranges
    const sections = result.sections.map((section: any, index: number, array: any[]) => {
      // Calculate section ranges based on content length
      const sectionCount = array.length
      const sectionSize = Math.floor(paragraphCount / sectionCount)
      const startIndex = index * sectionSize
      const endIndex = index === sectionCount - 1 ? paragraphCount : (index + 1) * sectionSize

      return {
        title: section.title,
        content: paragraphs.slice(startIndex, endIndex)
      }
    })

    // Ensure we have at least 2 sections
    if (sections.length < 2) {
      const midPoint = Math.floor(paragraphs.length / 2)
      return json({
        sections: [
          {
            title: "Key Findings and Analysis",
            content: paragraphs.slice(0, midPoint)
          },
          {
            title: "Detailed Discussion and Implications",
            content: paragraphs.slice(midPoint)
          }
        ]
      })
    }

    return json({ sections })
  } catch (error) {
    console.error('Error creating table of contents:', error)
    
    // Improved fallback with better default titles
    const paragraphs = content.split('\n').filter(Boolean)
    const sectionCount = 3
    const sectionSize = Math.ceil(paragraphs.length / sectionCount)
    
    const defaultTitles = [
      "Key Concepts and Background",
      "Analysis and Main Points",
      "Implications and Conclusions"
    ]
    
    const sections = defaultTitles.map((title, index) => ({
      title,
      content: paragraphs.slice(
        index * sectionSize,
        index === sectionCount - 1 ? paragraphs.length : (index + 1) * sectionSize
      )
    }))

    return json({ sections })
  }
}

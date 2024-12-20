import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function getEmojiForContent(title: string, content: string): Promise<string> {
  try {
    // Prepare a concise version of the content
    const contentPreview = content.slice(0, 1500) // Increased to get more context

    const prompt = `Read this article carefully and select ONE emoji that best captures its core message or main theme.
Think about:
- What is the main subject matter?
- What is the key message or emotion?
- What would instantly communicate the essence of this article?

Title: ${title}
Content preview: ${contentPreview}

First, analyze what the article is truly about. Then select the single most fitting emoji that would help someone instantly understand the article's core topic.

Respond with ONLY the emoji character. No explanation needed.`

    const response = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", // Using GPT-4 for better comprehension
      messages: [
        {
          role: "system",
          content: "You are an expert at understanding content and selecting the perfect emoji to represent it. You have a deep understanding of emoji meanings and can pick the one that best captures the essence of any content. Always select a single emoji that would give users an instant understanding of what the content is about."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 10, // We only need one emoji
      temperature: 0.7, // Increased for more creative selections
    })

    const emoji = response.choices[0].message.content?.trim() || "📝"
    console.log("AI analyzed content and selected emoji:", emoji, "for title:", title)
    return emoji
  } catch (error) {
    console.error("Error getting emoji from AI:", error)
    return "📝" // Default emoji if AI fails
  }
}

import OpenAI from "openai"
import { getOpenAIEnvVars } from "./env.server"

const { OPENAI_API_KEY } = getOpenAIEnvVars()

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

export async function generateAIResponse(messages: { role: "user" | "assistant"; content: string }[]) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant focused on helping users improve their documents and writing.",
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error("OpenAI API error:", error)
    throw new Error("Failed to generate AI response")
  }
}
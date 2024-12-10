import { json } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1",
})

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    console.log("API Key:", process.env.OPENAI_API_KEY?.slice(0, 10) + "...")
    const { message } = await request.json()
    console.log("Received message:", message)

    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing")
      return json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    console.log("Making request to OpenAI...")
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Respond in a concise and friendly manner.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })
    console.log("Received response from OpenAI")

    if (!completion.choices[0]?.message?.content) {
      console.error("No response content from OpenAI")
      return json({ error: "Failed to generate response" }, { status: 500 })
    }

    const reply = completion.choices[0].message.content
    console.log("Sending reply:", reply.slice(0, 50) + "...")

    return json({ reply })
  } catch (error: any) {
    console.error("Chat API Error:", {
      name: error.name,
      message: error.message,
      status: error.status,
      response: error.response?.data,
    })
    
    // Check for specific OpenAI errors
    if (error.response?.status === 401) {
      return json({ error: "Invalid OpenAI API key" }, { status: 401 })
    }
    
    return json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    )
  }
}

import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { getDocumentResponse } from "~/lib/openai.server"
import { checkTokenAvailability, updateTokenUsage } from "~/lib/tokens.server"
import { db } from "~/lib/db.server"

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return json({ error: "User not found" }, { status: 404 })
  }

  const formData = await request.formData()
  const message = formData.get("message")?.toString()
  const documentTitle = formData.get("documentTitle")?.toString()

  if (!message) {
    return json({ error: "Message is required" }, { status: 400 })
  }

  // Estimate token usage (rough estimate: 1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(message.length / 4) + 100 // Add buffer for system message

  // Check if user has enough tokens
  const hasTokens = await checkTokenAvailability(user.id, estimatedTokens)
  if (!hasTokens) {
    return json({ error: "Daily token limit reached. Please upgrade to Pro for unlimited tokens." }, { status: 403 })
  }

  try {
    // Get the AI response using OpenAI
    const aiResponse = await getDocumentResponse(message, documentTitle)
    
    // Update token usage (include response tokens in the count)
    const totalTokens = estimatedTokens + Math.ceil(aiResponse.length / 4)
    await updateTokenUsage(user.id, totalTokens)
    
    return json({ response: aiResponse })
  } catch (error) {
    console.error("Error in chat endpoint:", error)
    return json({ error: "Failed to process message" }, { status: 500 })
  }
}

export default function Chat() {
  return null
}

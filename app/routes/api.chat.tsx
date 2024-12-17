import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { getDocumentResponse } from "~/lib/openai.server"

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

  const formData = await request.formData()
  const message = formData.get("message")?.toString()
  const documentTitle = formData.get("documentTitle")?.toString()

  if (!message) {
    return json({ error: "Message is required" }, { status: 400 })
  }

  try {
    // Get the AI response using OpenAI
    const aiResponse = await getDocumentResponse(message, documentTitle)
    return json({ response: aiResponse })
  } catch (error) {
    console.error("Error in chat endpoint:", error)
    return json({ error: "Failed to process message" }, { status: 500 })
  }
}

export default function Chat() {
  return null
}

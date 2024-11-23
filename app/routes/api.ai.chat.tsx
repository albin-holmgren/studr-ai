import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"
import { generateAIResponse } from "~/lib/openai.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, session, response } = await requireAuth(request)
  const formData = await request.formData()

  const messages = JSON.parse(formData.get("messages") as string)

  try {
    // Get user's token usage
    const { data: user } = await supabase
      .from("users")
      .select("token_usage, subscription_tier")
      .eq("id", session.user.id)
      .single()

    // Check token limits for free users
    if (user?.subscription_tier === "free" && user?.token_usage >= 50000) {
      return json(
        { error: "Token limit reached. Please upgrade to Pro for unlimited tokens." },
        { status: 429 }
      )
    }

    const aiResponse = await generateAIResponse(messages)

    // Update token usage (rough estimate: 1 token ≈ 4 characters)
    const tokensUsed = Math.ceil(
      (messages.reduce((acc: number, msg: any) => acc + msg.content.length, 0) +
        (aiResponse?.length || 0)) / 4
    )

    await supabase
      .from("users")
      .update({ token_usage: (user?.token_usage || 0) + tokensUsed })
      .eq("id", session.user.id)

    return json({ response: aiResponse }, { headers: response.headers })
  } catch (error) {
    console.error("AI chat error:", error)
    return json(
      { error: "Failed to generate AI response" },
      { status: 500, headers: response.headers }
    )
  }
}
import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const workspaceId = formData.get("workspaceId") as string
  const name = formData.get("name") as string
  const emoji = formData.get("emoji") as string

  if (!workspaceId || !name) {
    return json({ error: "Workspace ID and name are required" }, { status: 400 })
  }

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

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true }
    })

    if (!user) {
      throw new Error("User not found")
    }

    // Update workspace name, emoji and verify ownership
    const workspace = await db.workspace.update({
      where: {
        id: workspaceId,
        userId: user.id // Ensure user owns the workspace
      },
      data: { 
        name,
        emoji: emoji || "📝" // Use default emoji if none provided
      },
      select: {
        id: true,
        name: true,
        emoji: true,
        createdAt: true,
        updatedAt: true,
        notes: {
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })

    return json({ workspace }, { headers: response.headers })
  } catch (error) {
    console.error("Error updating workspace:", error)
    return json(
      { error: "Failed to update workspace" },
      { status: 500, headers: response.headers }
    )
  }
}

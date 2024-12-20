import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const name = formData.get("name") as string || "Untitled Workspace"

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

    const workspace = await db.workspace.create({
      data: {
        name,
        emoji: "📝",
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        emoji: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return json({ workspace }, {
      headers: response.headers,
    })
  } catch (error) {
    console.error("Error creating workspace:", error)
    return json(
      { error: error instanceof Error ? error.message : "Failed to create workspace" },
      { status: 500 }
    )
  }
}

export default function WorkspaceCreate() {
  return null
}

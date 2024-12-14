import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const name = formData.get("name") as string

  if (!name) {
    return json({ error: "Workspace name is required" }, { status: 400 })
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
      include: {
        workspaces: true
      }
    })

    if (!user) {
      console.error("User not found:", session.user.email)
      return json({ error: "User not found" }, { status: 404 })
    }

    console.log("Creating workspace for user:", user.id)
    const workspace = await db.workspace.create({
      data: {
        name,
        emoji: "📝", // Default emoji
        userId: user.id,
      },
      include: {
        notes: true
      }
    })
    console.log("Workspace created:", workspace)

    return json({ workspace }, {
      headers: response.headers,
    })
  } catch (error) {
    console.error("Error creating workspace:", error)
    if (error instanceof Error) {
      return json(
        { error: error.message },
        { status: 500 }
      )
    }
    return json(
      { error: "Failed to create workspace" },
      { status: 500 }
    )
  }
}

export default function WorkspaceCreate() {
  return null
}

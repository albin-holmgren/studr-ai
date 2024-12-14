import { json, redirect, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const title = formData.get("title") as string
  const workspaceId = formData.get("workspaceId") as string

  if (!title || !workspaceId) {
    return json({ error: "Title and workspace ID are required" }, { status: 400 })
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
    })

    if (!user) {
      return json({ error: "User not found" }, { status: 404 })
    }

    // Verify workspace belongs to user
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        userId: user.id,
      },
    })

    if (!workspace) {
      return json({ error: "Workspace not found" }, { status: 404 })
    }

    const note = await db.note.create({
      data: {
        title,
        userId: user.id,
        workspaceId,
      },
    })

    return redirect("/", {
      headers: response.headers,
    })
  } catch (error) {
    console.error("Error creating note:", error)
    return json(
      { error: "Failed to create note" },
      {
        status: 500,
        headers: response.headers,
      }
    )
  }
}

export default function NoteCreate() {
  return null
}

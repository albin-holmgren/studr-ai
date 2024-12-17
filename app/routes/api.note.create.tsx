import { json, type ActionFunctionArgs } from "@remix-run/node"
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
    // Single transaction to verify workspace and create note
    const note = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { email: session.user.email! },
        select: { id: true }
      })

      if (!user) {
        throw new Error("User not found")
      }

      const workspace = await tx.workspace.findFirst({
        where: {
          id: workspaceId,
          userId: user.id,
        },
        select: { id: true }
      })

      if (!workspace) {
        throw new Error("Workspace not found")
      }

      return tx.note.create({
        data: {
          title,
          userId: user.id,
          workspaceId,
        },
        select: {
          id: true,
          title: true,
          updatedAt: true,
          createdAt: true
        }
      })
    })

    // Return note data for optimistic UI update instead of redirecting
    return json({ note }, {
      headers: response.headers
    })
  } catch (error) {
    console.error("Error creating note:", error)
    return json(
      { error: error instanceof Error ? error.message : "Failed to create note" },
      { status: 500 }
    )
  }
}

export default function NoteCreate() {
  return null
}

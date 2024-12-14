import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const noteId = formData.get("noteId") as string
  const title = formData.get("title") as string | null
  const content = formData.get("content") as string | null

  if (!noteId) {
    return json({ error: "Note ID is required" }, { status: 400 })
  }

  if (!title && !content) {
    return json({ error: "Title or content is required" }, { status: 400 })
  }

  const response = new Response()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
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

    // Verify note belongs to user
    const note = await db.note.findFirst({
      where: {
        id: noteId,
        userId: user.id,
      },
    })

    if (!note) {
      return json({ error: "Note not found" }, { status: 404 })
    }

    // Update note
    const updatedNote = await db.note.update({
      where: {
        id: noteId,
      },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    })

    return json({ note: updatedNote }, { headers: response.headers })
  } catch (error) {
    console.error("Error updating note:", error)
    return json({ error: "Failed to update note" }, { status: 500 })
  }
}

export default function NoteUpdate() {
  return null
}

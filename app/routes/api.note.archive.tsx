import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const noteId = formData.get("noteId") as string

  if (!noteId) {
    return json({ error: "Note ID is required" }, { status: 400 })
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

    const archivedNote = await db.note.update({
      where: { id: noteId },
      data: { archived: true },
    })

    return json(archivedNote, {
      headers: response.headers,
    })
  } catch (error) {
    console.error("Error archiving note:", error)
    return json(
      { error: "Failed to archive note" },
      {
        status: 500,
        headers: response.headers,
      }
    )
  }
}

export default function NoteArchive() {
  return null
}

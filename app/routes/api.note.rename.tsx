import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const noteId = formData.get("noteId") as string
  const title = formData.get("title") as string
  const emoji = formData.get("emoji") as string

  if (!noteId || !title) {
    return json({ error: "Note ID and title are required" }, { status: 400 })
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
      return json({ error: "User not found" }, { status: 404 })
    }

    // First check if note exists and user owns it
    const existingNote = await db.note.findFirst({
      where: {
        id: noteId,
        userId: user.id
      }
    })

    if (!existingNote) {
      return json({ error: "Note not found" }, { status: 404 })
    }

    // Update note title and emoji
    const note = await db.note.update({
      where: {
        id: noteId,
        userId: user.id
      },
      data: { 
        title,
        emoji: emoji || "📝"
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        workspace: {
          select: {
            id: true,
            name: true,
            emoji: true
          }
        }
      }
    })

    // Notify Supabase about the change
    await supabase.from('Note').update({
      title,
      emoji: emoji || "📝",
      updated_at: new Date().toISOString()
    }).eq('id', noteId)

    return json({ note }, { headers: response.headers })
  } catch (error) {
    console.error("Error updating note:", error)
    return json(
      { error: "Failed to update note" },
      { status: 500, headers: response.headers }
    )
  }
}

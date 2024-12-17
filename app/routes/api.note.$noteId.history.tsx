import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { noteId } = params
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
    // Verify note belongs to user
    const note = await db.note.findFirst({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    })

    if (!note) {
      return json({ error: "Note not found" }, { status: 404 })
    }

    // Get version history
    const history = await db.noteHistory.findMany({
      where: {
        noteId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        content: true,
        emoji: true,
        changeType: true,
        changeSummary: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return json({ history })
  } catch (error) {
    console.error("Error fetching note history:", error)
    return json({ error: "Failed to fetch note history" }, { status: 500 })
  }
}

export default function NoteHistory() {
  return null
}

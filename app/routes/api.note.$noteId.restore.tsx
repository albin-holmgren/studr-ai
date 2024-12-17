import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { noteId } = params
  if (!noteId) {
    return json({ error: "Note ID is required" }, { status: 400 })
  }

  const formData = await request.formData()
  const versionId = formData.get("versionId") as string

  if (!versionId) {
    return json({ error: "Version ID is required" }, { status: 400 })
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

    // Get the version to restore
    const version = await db.noteHistory.findUnique({
      where: {
        id: versionId,
      },
    })

    if (!version) {
      return json({ error: "Version not found" }, { status: 404 })
    }

    // Create a history entry for the current version before restoring
    await db.noteHistory.create({
      data: {
        noteId,
        userId: session.user.id,
        title: note.title,
        content: note.content,
        emoji: note.emoji,
        changeType: "backup_created",
        changeSummary: "Created backup before restoring previous version",
      },
    })

    // Restore the version
    const updatedNote = await db.note.update({
      where: { id: noteId },
      data: {
        title: version.title,
        content: version.content,
        emoji: version.emoji,
      },
    })

    // Create a history entry for the restore
    await db.noteHistory.create({
      data: {
        noteId,
        userId: session.user.id,
        title: version.title,
        content: version.content,
        emoji: version.emoji,
        changeType: "version_restored",
        changeSummary: `Restored version from ${version.createdAt.toLocaleString()}`,
      },
    })

    return json({ note: updatedNote })
  } catch (error) {
    console.error("Error restoring version:", error)
    return json({ error: "Failed to restore version" }, { status: 500 })
  }
}

import { json } from "@remix-run/node"
import type { ActionFunctionArgs } from "@remix-run/node"
import { prisma } from "~/lib/prisma.server"
import { requireUser } from "~/lib/session.server"

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const noteId = formData.get("noteId") as string
  const action = formData.get("action") as string

  // Verify the user has permission to modify access
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      access: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
  })

  if (!note) {
    return json({ error: "Note not found" }, { status: 404 })
  }

  // Only note owner or admins can modify access
  const userAccess = note.access.find((a) => a.userId === user.id)
  if (note.userId !== user.id && userAccess?.role !== "admin") {
    return json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    switch (action) {
      case "updateLinkAccess": {
        const access = formData.get("access") as "viewer" | "editor" | "admin"
        if (!["viewer", "editor", "admin"].includes(access)) {
          return json({ error: "Invalid access level" }, { status: 400 })
        }

        await prisma.note.update({
          where: { id: noteId },
          data: {
            linkAccess: access,
          },
        })
        break
      }

      case "add":
      case "update": {
        const targetUserId = formData.get("userId") as string
        const role = formData.get("role") as string

        if (!["viewer", "editor", "admin"].includes(role)) {
          return json({ error: "Invalid role" }, { status: 400 })
        }

        await prisma.noteAccess.upsert({
          where: {
            noteId_userId: {
              noteId,
              userId: targetUserId,
            },
          },
          create: {
            noteId,
            userId: targetUserId,
            role,
          },
          update: {
            role,
          },
        })
        break
      }

      case "remove": {
        const targetUserId = formData.get("userId") as string
        // Don't allow removing the owner's access
        if (note.userId === targetUserId) {
          return json({ error: "Cannot remove owner's access" }, { status: 400 })
        }

        await prisma.noteAccess.delete({
          where: {
            noteId_userId: {
              noteId,
              userId: targetUserId,
            },
          },
        })
        break
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 })
    }

    // Return updated note with access information
    const updatedNote = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        access: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return json({ note: updatedNote })
  } catch (error) {
    console.error("Error modifying note access:", error)
    return json({ error: "Failed to modify access" }, { status: 500 })
  }
}

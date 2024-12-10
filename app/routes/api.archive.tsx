import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"
import { prisma } from "~/lib/prisma.server"

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await requireAuth(request)
  const formData = await request.formData()
  const action = formData.get("_action")
  const documentId = formData.get("documentId") as string

  if (!documentId) {
    return json({ error: "Document ID is required" }, { status: 400 })
  }

  try {
    switch (action) {
      case "archive": {
        await prisma.document.update({
          where: {
            id: documentId,
            userId: session.user.id,
          },
          data: {
            isArchived: true,
          },
        })
        return json({ success: true })
      }

      case "unarchive": {
        await prisma.document.update({
          where: {
            id: documentId,
            userId: session.user.id,
          },
          data: {
            isArchived: false,
          },
        })
        return json({ success: true })
      }

      case "delete": {
        await prisma.document.update({
          where: {
            id: documentId,
            userId: session.user.id,
          },
          data: {
            isArchived: true,
          },
        })
        return json({ success: true })
      }

      case "restore": {
        await prisma.document.update({
          where: {
            id: documentId,
            userId: session.user.id,
          },
          data: {
            isArchived: false,
          },
        })
        return json({ success: true })
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Archive action error:", error)
    return json(
      { error: "Failed to perform action on document" },
      { status: 500 }
    )
  }
}

import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireUser } from "~/lib/session.server"
import { prisma } from "~/lib/db.server"

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request)
  const formData = await request.formData()
  const documentId = formData.get("documentId") as string
  const title = formData.get("title") as string
  const emoji = formData.get("emoji") as string

  if (!documentId) {
    return json({ error: "Document ID is required" }, { status: 400 })
  }

  try {
    const document = await prisma.document.update({
      where: {
        id: documentId,
        userId: user.id,
      },
      data: {
        title: title || undefined,
        emoji: emoji || undefined,
      },
      select: {
        id: true,
        title: true,
        emoji: true,
      },
    })

    return json({ document })
  } catch (error) {
    console.error("Error updating document:", error)
    return json({ error: "Failed to update document" }, { status: 500 })
  }
}
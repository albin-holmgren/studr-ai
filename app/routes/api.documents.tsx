import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireUser } from "~/lib/session.server"
import { prisma } from "~/lib/db.server"
import { nanoid } from "nanoid"

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 })
  }

  try {
    const user = await requireUser(request)
    const formData = await request.formData()
    const parentId = formData.get("parentId")?.toString() || null

    // Create the document
    const document = await prisma.document.create({
      data: {
        id: nanoid(),
        title: "Untitled",
        emoji: "📄",
        parentId: parentId,
        userId: user.id,
        content: JSON.stringify({
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "" }],
            },
          ],
        }),
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        parentId: true,
        content: true,
        updatedAt: true,
      },
    })

    return json({ document })
  } catch (error) {
    console.error("Error creating document:", error)
    return json(
      { error: "Failed to create document" },
      { status: 500 }
    )
  }
}

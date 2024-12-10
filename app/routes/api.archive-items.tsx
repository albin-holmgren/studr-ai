import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { requireUser } from "~/lib/session.server"
import { prisma } from "~/lib/db.server"

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request)
    const url = new URL(request.url)
    const filter = url.searchParams.get("filter") || "all"
    const query = url.searchParams.get("q") || ""

    const baseWhere = {
      userId: user.id,
    }

    // Apply filters
    let where = { ...baseWhere }
    let orderBy = { updatedAt: "desc" as const }
    let take: number | undefined

    switch (filter) {
      case "recent":
        where = { ...where, isArchived: false }
        take = 10
        break
      case "starred":
        where = { ...where, isArchived: false, isStarred: true }
        break
      case "trash":
        where = { ...where, isArchived: true }
        break
      default: // "all"
        where = { ...where, isArchived: false }
    }

    // Apply search if query exists
    if (query) {
      where = {
        ...where,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive" as const,
            }
          },
          {
            content: {
              contains: query,
              mode: "insensitive" as const,
            }
          }
        ]
      }
    }

    const items = await prisma.document.findMany({
      where,
      orderBy,
      take,
      select: {
        id: true,
        title: true,
        emoji: true,
        isStarred: true,
        isArchived: true,
        updatedAt: true,
        content: true,
        isPublished: true,
        parentId: true,
        position: true,
      },
    })

    return json({ items })
  } catch (error) {
    console.error("Error in archive-items loader:", error)
    if (error instanceof Response) {
      throw error
    }
    if (error instanceof Error) {
      throw new Response(error.message, { status: 500 })
    }
    throw new Response("Failed to load archive items", { status: 500 })
  }
}

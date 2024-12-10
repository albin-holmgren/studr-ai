import { json } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"
import { prisma } from "~/lib/prisma.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { userId } = await requireAuth(request)
  const url = new URL(request.url)
  const query = url.searchParams.get("q")
  
  if (!query) {
    return json({ documents: [] })
  }

  const documents = await prisma.document.findMany({
    where: {
      userId,
      isArchived: false,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ],
    },
    select: {
      id: true,
      title: true,
      emoji: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    take: 5,
  })

  return json({
    documents: documents.map(doc => ({
      ...doc,
      updated_at: doc.updatedAt.toISOString(),
    })),
  })
}

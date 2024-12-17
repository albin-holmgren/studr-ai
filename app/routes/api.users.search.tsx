import { json } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { prisma } from "~/lib/prisma.server"
import { requireUser } from "~/lib/session.server"

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request)
  const url = new URL(request.url)
  const query = url.searchParams.get("q")

  if (!query) {
    return json({ users: [] })
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
    take: 5,
  })

  return json({ users })
}

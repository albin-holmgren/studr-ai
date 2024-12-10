import * as React from "react"
import { json, type LoaderFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { Layout } from "~/components/layout"
import { requireAuth } from "~/lib/auth.server"
import { prisma } from "~/lib/prisma.server"
import { ArchiveCommand } from "~/components/archive-command"

interface LoaderData {
  documents: Array<{
    id: string
    title: string
    emoji: string
    isArchived: boolean
    updatedAt: Date
  }>
}

export const loader: LoaderFunction = async ({ request }) => {
  const { session } = await requireAuth(request)

  const documents = await prisma.document.findMany({
    where: {
      userId: session.user.id,
      isArchived: true,
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      emoji: true,
      isArchived: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return json<LoaderData>({ documents })
}

export default function Archive() {
  const { documents } = useLoaderData<LoaderData>()

  return (
    <Layout>
      <div className="flex-1 flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Archive</h1>
          <ArchiveCommand open={false} onOpenChange={() => {}} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex flex-col gap-2 p-4 bg-card rounded-lg border"
            >
              <div className="flex items-center gap-2">
                <span>{document.emoji}</span>
                <h2 className="font-semibold">{document.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Updated {new Date(document.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}

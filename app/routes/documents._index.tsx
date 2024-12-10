import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { requireUser } from "~/lib/session.server"
import { prisma } from "~/lib/db.server"
import { Layout } from "~/components/layout"
import { DocumentTree } from "~/components/document-tree"

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUser(request)

    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
        isArchived: false,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        parentId: true,
        position: true,
        updatedAt: true,
      },
      orderBy: [
        {
          position: 'asc',
        },
        {
          updatedAt: 'desc',
        },
      ],
    })

    return json({ 
      documents, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        subscription: null
      }
    })
  } catch (error) {
    console.error("Error loading documents:", error)
    throw new Response("Failed to load documents", { status: 500 })
  }
}

export default function DocumentsIndex() {
  const { documents, user } = useLoaderData<typeof loader>()

  return (
    <Layout user={user}>
      <div className="grid grid-cols-[250px_1fr] h-full">
        <aside className="border-r border-border bg-sidebar p-4 overflow-auto">
          <DocumentTree documents={documents} />
        </aside>
        
        <main className="p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold">My Documents</h1>
            <p className="text-muted-foreground mt-2">
              Select a document from the sidebar or create a new one to get started.
            </p>
          </div>
        </main>
      </div>
    </Layout>
  )
}

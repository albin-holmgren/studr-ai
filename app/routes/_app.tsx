import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { AppSidebar } from "~/components/app-sidebar"

export const loader = async ({ request }: LoaderFunctionArgs) => {
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

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    include: {
      workspaces: {
        include: {
          notes: {
            orderBy: { createdAt: "desc" }
          }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) {
    return json({ error: "User not found" }, { status: 404 })
  }

  return json(
    { user },
    {
      headers: response.headers,
    }
  )
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  
  if ('error' in data) {
    return <div>Error: {data.error}</div>
  }

  // Transform workspaces to match required type
  const workspaces = data.user.workspaces.map(workspace => {
    const createdAt = typeof workspace.createdAt === 'string' ? workspace.createdAt : new Date(workspace.createdAt).toISOString()
    const updatedAt = typeof workspace.updatedAt === 'string' ? workspace.updatedAt : new Date(workspace.updatedAt).toISOString()
    
    return {
      ...workspace,
      emoji: workspace.emoji || "📝",
      createdAt,
      updatedAt,
      notes: workspace.notes?.map(note => ({
        ...note,
        createdAt: typeof note.createdAt === 'string' ? note.createdAt : new Date(note.createdAt).toISOString(),
        updatedAt: typeof note.updatedAt === 'string' ? note.updatedAt : new Date(note.updatedAt).toISOString()
      }))
    }
  })

  return (
    <div className="flex h-screen">
      <AppSidebar workspaces={workspaces} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

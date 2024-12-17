import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { Outlet, useLoaderData, useRevalidator } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { AppSidebar } from "~/components/app-sidebar"
import { useEffect, useState } from "react"
import { SidebarProvider } from "~/components/ui/sidebar"
import { PageTitleProvider } from "~/components/page-title-context"
import type { User } from "@prisma/client"
import { createBrowserClient } from "~/lib/supabase"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const env = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }

  const response = new Response()
  const supabase = createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return json({ error: "Unauthorized", env }, { status: 401 })
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
    return json({ error: "User not found", env }, { status: 404 })
  }

  return json(
    { 
      user, 
      session,
      env 
    },
    {
      headers: response.headers,
    }
  )
}

export default function App() {
  const data = useLoaderData<typeof loader>()
  const revalidator = useRevalidator()
  const [supabase] = useState(() => 
    createBrowserClient(
      data.env.SUPABASE_URL,
      data.env.SUPABASE_ANON_KEY
    )
  )
  
  useEffect(() => {
    if (!supabase) return

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      revalidator.revalidate()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, revalidator])
  
  if ('error' in data) {
    return <div>Error: {data.error}</div>
  }

  // Transform workspaces to match required type
  const workspaces = data.user.workspaces.map(workspace => ({
    ...workspace,
    emoji: workspace.emoji || "📝",
    createdAt: new Date(workspace.createdAt).toISOString(),
    updatedAt: new Date(workspace.updatedAt).toISOString(),
    notes: workspace.notes?.map(note => ({
      ...note,
      createdAt: new Date(note.createdAt).toISOString(),
      updatedAt: new Date(note.updatedAt).toISOString()
    }))
  }))

  return (
    <SidebarProvider>
      <PageTitleProvider>
        <div className="flex-1 flex">
          <AppSidebar 
            workspaces={workspaces} 
            user={data.user}
            session={data.session}
            supabase={supabase}
          />
          <main className="flex-1 flex">
            <Outlet context={{ workspaces, supabase }} />
          </main>
        </div>
      </PageTitleProvider>
    </SidebarProvider>
  )
}

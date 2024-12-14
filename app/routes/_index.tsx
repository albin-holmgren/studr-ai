import { redirect, json, type LoaderFunctionArgs } from "@remix-run/node"
import { useOutletContext, useLoaderData } from "@remix-run/react"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { NavActions } from "~/components/nav-actions"
import { Separator } from "~/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb"
import { AppSidebar } from "~/components/app-sidebar"
import {
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { usePageTitle } from "~/components/page-title-context"
import { Note } from "~/components/note"

type ContextType = {
  supabase: SupabaseClient
  session: {
    user: User
  } | null
  user: User | null
  workspaces: Array<{
    id: string
    name: string
    emoji: string
    createdAt: string
    updatedAt: string
    notes?: Array<{
      id: string
      title: string
      content: string
      updatedAt: string
    }>
  }>
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return redirect("/auth/login", {
      headers: response.headers,
    })
  }

  return json(
    {
      session,
      user: session.user,
      workspaces: []  // We'll fetch workspaces later
    },
    {
      headers: response.headers,
    }
  )
}

export default function Index() {
  const { session } = useLoaderData<typeof loader>()
  const { supabase, user, workspaces } = useOutletContext<ContextType>()
  const { title } = usePageTitle()

  if (!session) {
    return null
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="grid flex-1 h-screen grid-cols-[auto_1fr]">
        <AppSidebar workspaces={workspaces} />
        <div className="flex h-screen flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      {title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-3">
              <NavActions />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Note 
              initialContent="<h1>Welcome to Studr</h1><p>Start typing or press / for commands...</p>"
              onSave={(content) => {
                console.log('Saving:', content)
              }}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

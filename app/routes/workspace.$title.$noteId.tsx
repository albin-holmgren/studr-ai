import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useOutletContext, useFetcher } from "@remix-run/react"
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
import { db } from "~/lib/db.server"

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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { noteId } = params
  if (!noteId) {
    return redirect("/")
  }

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

  // Fetch the note
  const note = await db.note.findUnique({
    where: {
      id: noteId,
    },
    include: {
      workspace: true,
    },
  })

  if (!note) {
    return redirect("/")
  }

  return json(
    {
      note,
      session,
      user: session.user,
    },
    {
      headers: response.headers,
    }
  )
}

export default function NotePage() {
  const { note } = useLoaderData<typeof loader>()
  const { supabase, workspaces } = useOutletContext<ContextType>()
  const { title } = usePageTitle()
  const fetcher = useFetcher()

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
                      {note.title}
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
              initialContent={note.content || "<h1>" + note.title + "</h1><p>Start typing or press / for commands...</p>"}
              onSave={(content) => {
                fetcher.submit(
                  { noteId: note.id, content },
                  { method: "post", action: "/api/note/update" }
                )
              }}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

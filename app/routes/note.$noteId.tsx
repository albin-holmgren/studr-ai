import { redirect, json, type LoaderFunctionArgs } from "@remix-run/node"
import { useOutletContext, useLocation, useParams, useSubmit } from "@remix-run/react"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/auth-helpers-remix"

import { AppSidebar } from "~/components/app-sidebar"
import { NavActions } from "~/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { usePageTitle } from "~/components/page-title-context"
import { NoteEditor } from "~/components/note-editor"

type ContextType = {
  supabase: SupabaseClient
  session: {
    user: User
  } | null
  user: User
  workspaces: {
    id: string
    name: string
    emoji: string
    createdAt: string
    updatedAt: string
  }[]
  id: string
  name: string
  emoji: string
  createdAt: string
  updatedAt: string
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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
    return redirect("/auth/login")
  }

  return json(
    { session },
    {
      headers: response.headers,
    }
  )
}

export default function Note() {
  const { supabase, session, user, workspaces } = useOutletContext<ContextType>()
  const { noteId } = useParams()
  const location = useLocation()
  const submit = useSubmit()
  const { setTitle } = usePageTitle()

  return (
    <SidebarProvider>
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col h-screen overflow-hidden">
          <header className="h-14 border-b px-4 flex items-center gap-4">
            <SidebarTrigger className="lg:hidden" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Note</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <Separator orientation="vertical" className="h-6" />
            <NavActions />
          </header>
          <div className="flex-1 overflow-y-auto">
            <div className="container max-w-screen-lg py-6">
              <NoteEditor content="" onChange={() => {}} />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useOutletContext, useSubmit } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { usePageTitle } from "~/components/page-title-context"
import { useEffect } from "react"
import { NoteEditor } from "~/components/note-editor"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import { NavActions } from "~/components/nav-actions"
import { AppSidebar } from "~/components/app-sidebar"
import {
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { slugify } from "~/lib/utils"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { workspaceId, noteId, slug } = params
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
    throw new Response("Unauthorized", { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }

  const note = await db.note.findFirst({
    where: {
      id: noteId,
      workspaceId,
      userId: user.id,
    },
  })

  if (!note) {
    throw new Response("Note not found", { status: 404 })
  }

  // Redirect if slug doesn't match
  if (slug !== slugify(note.title)) {
    return redirect(`/workspace/${workspaceId}/note/${noteId}/${slugify(note.title)}`, {
      headers: response.headers,
    })
  }

  return json(
    { note },
    {
      headers: response.headers,
    }
  )
}

export default function WorkspaceNotePage() {
  const { note } = useLoaderData<typeof loader>()
  const { setTitle } = usePageTitle()
  const submit = useSubmit()
  const { workspaces } = useOutletContext<{ workspaces: any[] }>()

  useEffect(() => {
    setTitle(note.title)
  }, [note.title, setTitle])

  return (
    <SidebarProvider>
      <AppSidebar workspaces={workspaces} />
      <div className="flex-1">
        <header className="flex h-14 shrink-0 items-center gap-2">
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
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            <NoteEditor 
              content={note.content || ""} 
              onChange={(content) => {
                const formData = new FormData()
                formData.append("noteId", note.id)
                formData.append("content", content)
                submit(formData, {
                  method: "post",
                  action: "/api/note/update"
                })
              }}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

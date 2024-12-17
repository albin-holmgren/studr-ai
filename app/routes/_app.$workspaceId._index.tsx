import React from 'react';
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { usePageTitle } from "~/components/page-title-context"
import { useEffect } from "react"
import { type Note, type Workspace } from "@prisma/client"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import { NavActions } from "~/components/nav-actions"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Link } from "@remix-run/react"
import { FileText, FolderOpen, Archive } from "lucide-react"
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar"
import { formatDistanceToNow } from "date-fns"
import { AppSidebar } from '~/components/app-sidebar';
import { WorkspaceTitle } from "~/components/workspace-title"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { workspaceId } = params
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

  const workspace = await db.workspace.findFirst({
    where: {
      id: workspaceId,
      userId: user.id,
    },
    include: {
      notes: {
        orderBy: {
          updatedAt: 'desc'
        }
      }
    }
  })

  if (!workspace) {
    throw new Response("Workspace not found", { status: 404 })
  }

  return json(
    { 
      workspace
    },
    {
      headers: response.headers,
    }
  )
}

export default function WorkspacePage() {
  const { workspace } = useLoaderData<typeof loader>()
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle(workspace.name)
  }, [workspace.name, setTitle])

  return (
    <SidebarProvider>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <WorkspaceTitle 
                      id={workspace.id} 
                      name={workspace.name}
                      emoji={workspace.emoji}
                      className="line-clamp-1"
                    />
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto px-3">
            <NavActions />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notes</CardTitle>
              <CardDescription>Your most recently updated notes in this workspace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {workspace.notes.map(note => (
                  <div key={note.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{note.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Last updated {formatDistanceToNow(new Date(note.updatedAt))} ago
                      </div>
                    </div>
                  </div>
                ))}
                {workspace.notes.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No notes yet. Create one using the + button in the sidebar.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

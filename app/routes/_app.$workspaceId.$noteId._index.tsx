import React, { useEffect, useState } from 'react';
import { usePageTitle } from '~/components/page-title-context';
import { NoteEditor } from '~/components/note-editor';
import { Suggestions } from '~/components/suggestions';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '~/components/ui/breadcrumb';
import { NavActions } from '~/components/nav-actions';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useRevalidator, Link } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { type Note, type Workspace } from "@prisma/client"
import { NoteTitle } from "~/components/note-title"
import { db } from "~/lib/db.server"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { noteId, workspaceId } = params
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
    include: {
      workspaces: {
        include: {
          notes: {
            select: {
              id: true,
              title: true,
              emoji: true,
              purpose: true,
              createdAt: true,
              updatedAt: true
            },
            orderBy: { createdAt: "desc" }
          }
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }

  const note = await db.note.findFirst({
    where: {
      id: noteId,
      workspaceId: workspaceId,
      userId: user.id,
    },
    include: {
      workspace: true,
      gradingCriteria: {
        select: {
          id: true,
          fileName: true,
          fileUrl: true,
          fileType: true,
          createdAt: true
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  })

  if (!note) {
    throw new Response("Note not found", { status: 404 })
  }

  return json({
    note,
    workspaces: user.workspaces,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    },
    session,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }, { headers: response.headers })
}

export default function NotePage() {
  const { note, user } = useLoaderData<typeof loader>()
  const { setTitle } = usePageTitle()
  const revalidator = useRevalidator()
  const [content, setContent] = React.useState(note.content || '')

  useEffect(() => {
    setTitle(note.title)
  }, [note.title, setTitle])

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <NoteTitle
                    id={note.id}
                    title={note.title}
                    emoji={note.emoji}
                  />
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <NavActions 
          documentId={note.id}
          documentTitle={note.title}
          documentEmoji={note.emoji}
          documentPurpose={note.purpose}
          workspaceId={note.workspaceId}
          author={{
            name: user.name,
            email: user.email,
            avatar: user.avatar
          }}
          createdAt={new Date(note.createdAt)}
          lastEdited={new Date(note.updatedAt)}
          content={content}
        />
      </header>
      <div className="flex-1 px-12 p-8 gap-8 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <NoteEditor
            key={note.id}
            noteId={note.id}
            initialContent={note.content}
            className="flex-1"
            onContentChange={setContent}
          />
        </div>
        <Suggestions
          noteId={note.id}
          content={note.content || ""}
          className="w-80 shrink-0"
        />
      </div>
    </div>
  )
}

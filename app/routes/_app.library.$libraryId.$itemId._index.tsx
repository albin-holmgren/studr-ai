import React, { useEffect } from 'react';
import { usePageTitle } from '~/components/page-title-context';
import { NoteEditor } from '~/components/note-editor';
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
import { useLoaderData, Link } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { LibraryTitle } from "~/components/library-title"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { itemId, libraryId } = params
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

  const item = await db.libraryItem.findFirst({
    where: {
      id: itemId,
      libraryId: libraryId,
      userId: user.id,
    },
    include: {
      library: true
    }
  })

  if (!item) {
    throw new Response("Item not found", { status: 404 })
  }

  return json({
    item,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }
  }, { headers: response.headers })
}

export default function LibraryItemPage() {
  const { item, user } = useLoaderData<typeof loader>()
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle(item.title)
  }, [item.title, setTitle])

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/library/${item.libraryId}`}>
                    <LibraryTitle
                      id={item.library.id}
                      name={item.library.name}
                      emoji={item.library.emoji}
                    />
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <NavActions 
          documentId={item.id}
          documentTitle={item.title}
          documentEmoji={item.emoji}
          workspaceId={item.libraryId}
          author={{
            name: user.name,
            email: user.email,
            avatar: user.avatar
          }}
          createdAt={new Date(item.createdAt)}
          lastEdited={new Date(item.updatedAt)}
        />
      </header>
      <div className="flex-1 px-12 p-8 gap-8 flex overflow-hidden">
        <NoteEditor
          noteId={item.id}
          initialContent={item.content}
          className="flex-1"
        />
      </div>
    </div>
  )
}

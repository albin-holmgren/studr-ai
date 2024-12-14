import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, useSubmit } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { useCallback, useEffect } from "react"
import { NoteEditor } from "~/components/note-editor"
import { db } from "~/lib/db.server"
import { usePageTitle } from "~/components/page-title-context"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { noteId } = params
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
      userId: user.id,
    },
  })

  if (!note) {
    throw new Response("Note not found", { status: 404 })
  }

  return json(
    { note },
    {
      headers: response.headers,
    }
  )
}

export default function NotePage() {
  const { note } = useLoaderData<typeof loader>()
  const submit = useSubmit()
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle(note.title)
  }, [note.title, setTitle])

  const handleChange = useCallback(
    (content: string) => {
      const formData = new FormData()
      formData.append("noteId", note.id)
      formData.append("content", content)
      submit(formData, {
        method: "post",
        action: "/api/note/update",
      })
    },
    [note.id, submit]
  )

  return (
    <div className="h-full">
      <NoteEditor content={note.content || ""} onChange={handleChange} />
    </div>
  )
}

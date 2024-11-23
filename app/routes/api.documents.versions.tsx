import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { supabase, response } = await requireAuth(request)
  const url = new URL(request.url)
  const documentId = url.searchParams.get("documentId")

  if (!documentId) {
    return json({ error: "Document ID is required" }, { status: 400 })
  }

  const { data: versions, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("version", { ascending: false })

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ versions }, { headers: response.headers })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, session, response } = await requireAuth(request)
  const formData = await request.formData()

  const documentId = formData.get("documentId") as string
  const title = formData.get("title") as string
  const content = formData.get("content")
  const emoji = formData.get("emoji") as string
  const version = parseInt(formData.get("version") as string)

  const { error } = await supabase
    .from("document_versions")
    .insert([
      {
        document_id: documentId,
        title,
        content: content ? JSON.parse(content as string) : {},
        emoji,
        version,
        user_id: session.user.id,
      },
    ])

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ success: true }, { headers: response.headers })
}
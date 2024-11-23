import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { supabase, response } = await requireAuth(request)
  const url = new URL(request.url)
  const documentId = url.searchParams.get("documentId")

  if (!documentId) {
    return json({ error: "Document ID is required" }, { status: 400 })
  }

  const { data: analytics, error } = await supabase
    .from("document_analytics")
    .select("*")
    .eq("document_id", documentId)
    .order("created_at", { ascending: false })

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ analytics }, { headers: response.headers })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, session, response } = await requireAuth(request)
  const formData = await request.formData()

  const documentId = formData.get("documentId") as string
  const action = formData.get("action") as string
  const metadata = formData.get("metadata")

  const { error } = await supabase
    .from("document_analytics")
    .insert([
      {
        document_id: documentId,
        user_id: session.user.id,
        action,
        metadata: metadata ? JSON.parse(metadata as string) : {},
      },
    ])

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ success: true }, { headers: response.headers })
}
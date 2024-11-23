import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"

export const loader = async ({ request }: ActionFunctionArgs) => {
  const { supabase, response } = await requireAuth(request)
  const url = new URL(request.url)
  const documentId = url.searchParams.get("documentId")

  if (!documentId) {
    return json({ error: "Document ID is required" }, { status: 400 })
  }

  const { data: shares, error } = await supabase
    .from("document_shares")
    .select("*, users(name, email, avatar_url)")
    .eq("document_id", documentId)

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ shares }, { headers: response.headers })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, response } = await requireAuth(request)
  const formData = await request.formData()

  const documentId = formData.get("documentId") as string
  const email = formData.get("email") as string
  const permission = formData.get("permission") as "view" | "edit" | "admin"

  // First, try to find the user by email
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  const { error } = await supabase
    .from("document_shares")
    .insert([
      {
        document_id: documentId,
        user_id: user?.id,
        email: user?.id ? null : email, // Store email only if user doesn't exist
        permission,
      },
    ])

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ success: true }, { headers: response.headers })
}
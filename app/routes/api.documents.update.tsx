import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, response } = await requireAuth(request)
  const formData = await request.formData()

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const content = formData.get("content")
  const emoji = formData.get("emoji") as string

  // Get current version
  const { data: currentDoc } = await supabase
    .from("documents")
    .select("version")
    .eq("id", id)
    .single()

  const { data, error } = await supabase
    .from("documents")
    .update({
      title,
      content: content ? JSON.parse(content as string) : {},
      emoji,
      version: (currentDoc?.version || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ document: data }, { headers: response.headers })
}
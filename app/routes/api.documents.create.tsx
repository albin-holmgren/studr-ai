import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, session, response } = await requireAuth(request)
  const formData = await request.formData()

  const title = formData.get("title") as string
  const content = formData.get("content")
  const workspaceId = formData.get("workspace_id") as string | null
  const emoji = formData.get("emoji") as string

  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        title,
        content: content ? JSON.parse(content as string) : {},
        workspace_id: workspaceId,
        emoji,
        user_id: session.user.id,
        version: 1,
      },
    ])
    .select()
    .single()

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ document: data }, { headers: response.headers })
}
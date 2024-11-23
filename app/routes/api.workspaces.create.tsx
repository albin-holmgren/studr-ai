import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, session, response } = await requireAuth(request)
  const formData = await request.formData()

  const name = formData.get("name") as string
  const emoji = formData.get("emoji") as string

  const { data, error } = await supabase
    .from("workspaces")
    .insert([
      {
        name,
        emoji,
        user_id: session.user.id,
      },
    ])
    .select()
    .single()

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ workspace: data }, { headers: response.headers })
}
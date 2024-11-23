import { json, type ActionFunctionArgs } from "@remix-run/node"
import { requireAuth } from "~/lib/auth.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { supabase, response } = await requireAuth(request)
  const formData = await request.formData()

  const id = formData.get("id") as string

  const { error } = await supabase
    .from("documents")
    .update({
      is_archived: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return json({ error: error.message }, { status: 400 })
  }

  return json({ success: true }, { headers: response.headers })
}
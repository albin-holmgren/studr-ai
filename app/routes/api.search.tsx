import { json } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { createSupabaseServerClient } from "~/lib/supabase.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const query = url.searchParams.get("q")
  
  if (!query) {
    return json({ documents: [], workspaces: [] })
  }

  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const [documentsResponse, workspacesResponse] = await Promise.all([
    supabase
      .from("documents")
      .select("id, title, emoji, updated_at")
      .textSearch("title", query)
      .limit(5),
    supabase
      .from("workspaces")
      .select("id, name, emoji")
      .textSearch("name", query)
      .limit(5),
  ])

  return json(
    {
      documents: documentsResponse.data || [],
      workspaces: workspacesResponse.data || [],
    },
    {
      headers: response.headers,
    }
  )
}

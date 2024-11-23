import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { requireAuth } from "~/lib/auth.server"
import { HomePage } from "~/components/pages/home"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase, response } = await requireAuth(request)

  // Get recent documents
  const { data: recentDocuments } = await supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(5)

  // Get starred documents
  const { data: starredDocuments } = await supabase
    .from("documents")
    .select("*")
    .eq("is_starred", true)
    .limit(5)

  return json(
    { recentDocuments, starredDocuments },
    { headers: response.headers }
  )
}

export default function Index() {
  const { recentDocuments, starredDocuments } = useLoaderData<typeof loader>()
  
  return <HomePage recentDocuments={recentDocuments} starredDocuments={starredDocuments} />
}
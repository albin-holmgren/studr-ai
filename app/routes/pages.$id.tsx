import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { requireAuth } from "~/lib/auth.server"
import { Editor } from "~/components/editor"
import { Layout } from "~/components/layout"
import { usePageTitle } from "~/hooks/use-page-title"
import { usePageEmoji } from "~/hooks/use-page-emoji"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { supabase, response } = await requireAuth(request)
  const { id } = params

  // Get document
  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single()

  if (!document) {
    throw new Response("Not Found", { status: 404 })
  }

  return json(
    { document },
    { headers: response.headers }
  )
}

export default function DocumentPage() {
  const { document } = useLoaderData<typeof loader>()
  const { title, setTitle } = usePageTitle(document.id)
  const { emoji, setEmoji } = usePageEmoji(document.id)
  
  return (
    <Layout 
      title={title || document.title} 
      emoji={emoji || document.emoji}
      onTitleChange={setTitle}
      onEmojiChange={setEmoji}
    >
      <Editor title={title || document.title} onTitleChange={setTitle} />
    </Layout>
  )
}
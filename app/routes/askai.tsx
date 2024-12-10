import { json } from "@remix-run/node"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { AiChat } from "~/components/ai-chat"
import { Layout } from "~/components/layout"
import { createSupabaseServerClient } from "~/lib/supabase.server"

export async function loader({ request }: LoaderFunctionArgs) {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Response("Unauthorized", { status: 401 })
  }

  // Get the latest conversation or create a new one
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(50)

  return json({ 
    env: {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
    messages: messages || [],
    user: {
      id: session.user.id,
      name: session.user.email,
      email: session.user.email,
    }
  })
}

export default function AskAiPage() {
  const { env, messages, user } = useLoaderData<typeof loader>()
  
  return (
    <Layout minimal user={user}>
      <div className="h-[calc(100vh-3.5rem)] overflow-hidden">
        <AiChat 
          initialMessages={messages} 
          userId={user.id} 
          hasOpenAI={env.hasOpenAI}
          supabaseUrl={env.supabaseUrl}
          supabaseAnonKey={env.supabaseAnonKey}
        />
      </div>
    </Layout>
  )
}
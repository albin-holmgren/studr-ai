import { createServerClient } from "@supabase/auth-helpers-remix"
import type { Database } from "./database.types"

export async function getDocuments(request: Request) {
  const response = new Response()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .order("updated_at", { ascending: false })

  return { documents, response }
}

export async function getWorkspaces(request: Request) {
  const response = new Response()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("*, documents(*)")
    .order("created_at", { ascending: false })

  return { workspaces, response }
}

export async function getUserProfile(request: Request, userId: string) {
  const response = new Response()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  return { profile, response }
}
import { redirect } from "@remix-run/node"
import { createSupabaseServerClient } from "./supabase.server"

export async function requireAuth(request: Request) {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw redirect("/auth/login", {
      headers: response.headers,
    })
  }

  return { session, response, supabase }
}

export async function getUser(request: Request) {
  const response = new Response()
  const supabase = createSupabaseServerClient({ request, response })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return { user: null, response }
  }

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", session.user.id)
    .single()

  return { user, response }
}
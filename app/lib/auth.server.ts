import { redirect } from "@remix-run/node"
import { createSupabaseServerClient } from "./supabase.server"
import { prisma } from "./prisma.server"

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

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id
    }
  })

  return { user, response }
}
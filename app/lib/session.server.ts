import { createServerClient } from "@supabase/auth-helpers-remix"
import { redirect } from "@remix-run/node"
import { prisma } from "./prisma.server"

export async function requireUser(request: Request) {
  const response = new Response()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    throw redirect("/login")
  }

  return user
}

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"

async function handleLogout(request: Request) {
  const response = new Response()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  )

  await supabase.auth.signOut()

  return redirect("/auth/login", {
    headers: response.headers,
  })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  return handleLogout(request)
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return handleLogout(request)
}
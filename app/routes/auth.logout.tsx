import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  await supabase.auth.signOut()

  return redirect("/auth/login", {
    headers: response.headers,
  })
}

export const loader = async () => redirect("/")
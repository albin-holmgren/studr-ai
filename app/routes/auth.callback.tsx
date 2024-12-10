import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const url = new URL(request.url)
  const code = url.searchParams.get("code")

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { request, response }
    )

    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError) {
      console.error("Auth error:", authError)
      return redirect("/auth/login", {
        headers: response.headers,
      })
    }

    if (authData.user) {
      // Check if user already exists in database
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .single()

      if (!existingUser) {
        // Create new user in database
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.user_metadata.name || authData.user.email?.split('@')[0],
            avatar_url: authData.user.user_metadata.avatar_url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (dbError) {
          console.error("Database error:", dbError)
          return redirect("/auth/login", {
            headers: response.headers,
          })
        }
      }
    }
  }

  return redirect("/", {
    headers: response.headers,
  })
}
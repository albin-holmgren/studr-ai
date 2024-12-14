import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

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
      try {
        // Check if user exists, if not create them
        const user = await db.user.upsert({
          where: { email: authData.user.email! },
          update: {
            name: authData.user.user_metadata.name || authData.user.email?.split('@')[0],
            avatar: authData.user.user_metadata.avatar_url,
            updatedAt: new Date(),
          },
          create: {
            email: authData.user.email!,
            name: authData.user.user_metadata.name || authData.user.email?.split('@')[0],
            avatar: authData.user.user_metadata.avatar_url,
          },
        })

        // Create a default workspace if user is new
        if (!user.workspaces?.length) {
          await db.workspace.create({
            data: {
              name: "My Workspace",
              emoji: "📝",
              userId: user.id,
            },
          })
        }

        return redirect("/", {
          headers: response.headers,
        })
      } catch (error) {
        console.error("Database error:", error)
        return redirect("/auth/login", {
          headers: response.headers,
        })
      }
    }
  }

  return redirect("/auth/login", {
    headers: response.headers,
  })
}
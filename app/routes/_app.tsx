import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { AppSidebar } from "~/components/app-sidebar"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
    include: {
      workspaces: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) {
    return json({ error: "User not found" }, { status: 404 })
  }

  return json(
    { user },
    {
      headers: response.headers,
    }
  )
}

export default function App() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="flex h-screen">
      <AppSidebar workspaces={user.workspaces} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

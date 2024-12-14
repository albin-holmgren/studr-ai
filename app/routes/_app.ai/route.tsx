import * as React from "react"
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"

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

export default function AIRoute() {
  const data = useLoaderData<typeof loader>()
  
  if ('error' in data) {
    return <div>Error: {data.error}</div>
  }

  return (
    <div className="flex h-screen">
      <main className="flex-1 p-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Your personal AI assistant powered by Codeium</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Outlet />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

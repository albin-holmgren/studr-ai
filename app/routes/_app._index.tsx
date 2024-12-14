import * as React from "react"
import { useLoaderData } from "@remix-run/react"
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { Plus, FileText, Brain, Trophy } from "lucide-react"
import { db } from "~/lib/db.server"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

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
        include: {
          notes: true
        },
        orderBy: { updatedAt: "desc" },
        take: 3
      }
    }
  })

  if (!user) {
    return json({ error: "User not found" }, { status: 404 })
  }

  return json({ user })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  if ('error' in data) {
    return <div>Error: {data.error}</div>
  }

  const features = [
    {
      title: "Smart Writing Assistant",
      description: "Get real-time suggestions and improvements as you write",
      icon: Brain,
    },
    {
      title: "Grade Optimization",
      description: "AI-powered feedback based on grading criteria",
      icon: Trophy,
    },
    {
      title: "Document Management",
      description: "Organize your academic work in smart workspaces",
      icon: FileText,
    },
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Welcome back, {data.user.name || 'Scholar'}! 👋</h1>
          <p className="text-muted-foreground mt-2">Let's create something amazing today.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </div>

      {/* Recent Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.user.workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{workspace.emoji}</span>
                {workspace.name}
              </CardTitle>
              <CardDescription>
                {workspace.notes?.length || 0} documents • Last updated{" "}
                {new Date(workspace.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Boost Your Academic Success</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <FileText className="h-6 w-6" />
            New Essay
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Brain className="h-6 w-6" />
            AI Review
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Trophy className="h-6 w-6" />
            Grade Check
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2">
            <Plus className="h-6 w-6" />
            Import Document
          </Button>
        </div>
      </div>
    </div>
  )
}

import {
  ArrowRight,
  Clock,
  FileText,
  LayoutDashboard,
  Plus,
  Star,
} from "lucide-react"
import { Link } from "@remix-run/react"

import { Button } from "~/components/ui/button-new"
import { Layout } from "~/components/layout"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"

interface HomePageProps {
  recentDocuments: Array<{
    id: string
    title: string
    emoji: string
    updated_at: string
  }>
  starredDocuments: Array<{
    id: string
    title: string
    emoji: string
    updated_at: string
  }>
  user: {
    name: string
    email: string
    avatar?: string | null
  }
}

export function HomePage({ recentDocuments = [], starredDocuments = [], user }: HomePageProps) {
  const quickActions = [
    {
      name: "New Document",
      description: "Create a new document",
      icon: FileText,
      href: "/documents/new",
    },
    {
      name: "New AI Chat",
      description: "Start a new AI conversation",
      icon: Plus,
      href: "/chat/new",
    },
    {
      name: "View Dashboard",
      description: "See your workspace overview",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
  ]

  return (
    <Layout user={user} minimal>
      <div className="space-y-10">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome back!</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Here's what's been happening in your workspace.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                variant="outline"
                className="h-auto flex-col items-start gap-3 p-6 hover:bg-muted"
                asChild
              >
                <Link to={action.href}>
                  <div className="flex w-full items-center gap-3">
                    <action.icon className="h-6 w-6" />
                    <span className="text-lg font-medium">{action.name}</span>
                    <ArrowRight className="ml-auto h-5 w-5" />
                  </div>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2">
          {/* Recent Pages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6" />
                <h2 className="text-2xl font-semibold tracking-tight">Recent Pages</h2>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[360px] rounded-lg border bg-card">
              <div className="space-y-1 p-6">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/pages/${doc.id}`}
                    className="flex flex-col gap-1.5 rounded-lg p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.emoji}</span>
                      <span className="font-medium">{doc.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Updated {new Date(doc.updated_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
                {recentDocuments.length === 0 && (
                  <div className="flex h-[280px] items-center justify-center text-center text-sm text-muted-foreground">
                    No recent pages
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Starred Pages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6" />
                <h2 className="text-2xl font-semibold tracking-tight">Starred Pages</h2>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[360px] rounded-lg border bg-card">
              <div className="space-y-1 p-6">
                {(starredDocuments || []).map((doc) => (
                  <Link
                    key={doc.id}
                    to={`/pages/${doc.id}`}
                    className="flex flex-col gap-1.5 rounded-lg p-3 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{doc.emoji}</span>
                      <span className="font-medium">{doc.title}</span>
                    </div>
                  </Link>
                ))}
                {(starredDocuments || []).length === 0 && (
                  <div className="flex h-[280px] items-center justify-center text-center text-sm text-muted-foreground">
                    No starred pages
                  </div>
                )}
                <Button
                  variant="outline"
                  className="mt-4 w-full justify-start gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Add to starred
                </Button>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <div className="space-y-4">
                {recentDocuments.slice(0, 2).map((doc, i) => (
                  <div key={doc.id}>
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">
                          You updated{" "}
                          <Link
                            to={`/pages/${doc.id}`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            {doc.title}
                          </Link>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(doc.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {i < recentDocuments.length - 1 && (
                      <Separator className="my-4" />
                    )}
                  </div>
                ))}
                {recentDocuments.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
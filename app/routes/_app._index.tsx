import * as React from "react"
import { useLoaderData, useNavigation, Link } from "@remix-run/react"
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { 
  Clock, 
  FileText, 
  Star,
  Library,
  FolderKanban,
  BookOpen
} from "lucide-react"
import { db } from "~/lib/db.server"
import { Button } from "~/components/ui/button"
import { Card } from "~/components/ui/card"

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
        take: 6
      },
      notes: {
        take: 12,
        orderBy: { updatedAt: "desc" }
      },
      libraryItems: {
        take: 6,
        orderBy: { updatedAt: "desc" }
      }
    }
  })

  if (!user) {
    return json({ error: "User not found" }, { status: 404 })
  }

  return json({ user })
}

export default function Index() {
  const navigation = useNavigation()
  const data = useLoaderData<typeof loader>()

  if ('error' in data) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-[400px] p-6">
          <h2 className="text-lg font-medium text-destructive">Error</h2>
          <p className="text-sm text-muted-foreground mt-2">{data.error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  const recentNotes = data.user.workspaces.flatMap(workspace => 
    workspace.notes?.map(note => ({
      ...note,
      workspace: workspace.name,
      workspaceEmoji: workspace.emoji || "📁",
      workspaceId: workspace.id,
      emoji: note.emoji || "📝",
      type: 'note'
    })) || []
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .slice(0, 6)

  const pinnedNotes = data.user.notes
    .filter(note => note.pinned)
    .map(note => {
      const workspace = data.user.workspaces.find(w => w.notes?.some(n => n.id === note.id))
      return {
        ...note,
        workspaceId: workspace?.id || '',
        workspace: workspace?.name || '',
        workspaceEmoji: workspace?.emoji || "📁",
        emoji: note.emoji || "📝"
      }
    })
    .slice(0, 6)

  const workspaces = data.user.workspaces

  return (
    
      <div className="w-full p-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-medium">Welcome back, {data.user.name || 'Scholar'}</h1>
            <p className="text-muted-foreground mt-1">Your academic excellence starts here</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <Card className="p-4 bg-background/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">{data.user.notes.length}</div>
                  <div className="text-xs text-muted-foreground">Total Notes</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-background/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <FolderKanban className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">{workspaces.length}</div>
                  <div className="text-xs text-muted-foreground">Workspaces</div>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-background/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Library className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">{data.user.libraryItems.length}</div>
                  <div className="text-xs text-muted-foreground">Libraries</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Pinned Notes */}
        {data.user.notes.filter(note => note.pinned).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4" />
                <h2 className="text-sm font-medium">Pinned</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedNotes.map((note) => (
                <Link
                  key={note.id}
                  to={note.workspaceId ? `/${note.workspaceId}/${note.id}` : '#'}
                  className="block"
                >
                  <Card className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className="text-xl">{note.emoji || "📝"}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{note.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {note.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-xs bg-secondary/50 px-2 py-1 rounded-md">
                            {new Intl.DateTimeFormat('en-US', {
                              month: 'short',
                              day: 'numeric'
                            }).format(new Date(note.updatedAt))}
                          </div>
                          <Star className="h-3 w-3 text-yellow-500" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent */}
        <div className="space-y-4">
          <div className="flex items-center">
            <Link 
              to={workspaces[0]?.id ? `/workspaces/${workspaces[0].id}` : '#'} 
              className="flex items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            >
              <Clock className="h-4 w-4" />
              <h2 className="text-sm font-medium">Recent</h2>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentNotes.map((note) => (
              <Link
                key={note.id}
                to={note.workspaceId ? `/${note.workspaceId}/${note.id}` : '#'}
                className="block"
              >
                <Card className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-xl">{note.emoji || "📝"}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{note.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{note.workspaceEmoji}</span>
                        <span className="truncate">{note.workspace}</span>
                      </div>
                      {note.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {note.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    
  )
}

import { ChevronRight, MoreHorizontal, Plus } from "lucide-react"
import { Link, useLocation } from "@remix-run/react"
import { type Note, type Workspace } from "@prisma/client"
import { Button } from "~/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "~/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { useState } from "react"
import { useNavigation, useFetcher, useLoaderData } from "@remix-run/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"
import { useFavorites } from "~/hooks/use-favorites"

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

export function NavWorkspace({
  workspaces,
}: {
  workspaces: {
    id: string
    name: string
    emoji: string
    createdAt: string
    updatedAt: string
    notes?: {
      id: string
      title: string
      emoji: string
      createdAt: string
      updatedAt: string
    }[]
  }[]
}) {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteTitle, setEditingNoteTitle] = useState<string | null>(null)
  const [showAllWorkspaces, setShowAllWorkspaces] = useState(false)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const fetcher = useFetcher()
  const workspaceFetcher = useFetcher()
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set())
  const pathname = useLocation().pathname
  const { favoriteIds } = useFavorites()
  const location = useLocation()

  const visibleWorkspaces = showAllWorkspaces ? workspaces : workspaces.slice(0, 5)
  const hasMoreWorkspaces = workspaces.length > 5

  const handleCreateNote = (workspaceId: string) => {
    const tempId = `temp-${Date.now()}`
    const optimisticNote = {
      id: tempId,
      title: "Untitled",
      emoji: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspaceId
    }
    
    // Automatically expand the workspace
    setExpandedWorkspaces(prev => new Set([...prev, workspaceId]))
    
    fetcher.submit(
      { title: "Untitled", workspaceId },
      { 
        method: "post", 
        action: "/api/note/create"
      }
    )
  }

  const handleUpdateNoteTitle = (noteId: string, title: string) => {
    setEditingNoteId(null)
    if (title.trim()) {
      fetcher.submit(
        { noteId, title },
        { method: "post", action: "/api/note/update" }
      )
    }
  }

  const handleCreateWorkspace = () => {
    const tempId = `temp-${Date.now()}`
    const optimisticWorkspace = {
      id: tempId,
      name: "Untitled Workspace",
      emoji: "📝",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: []
    }

    // Automatically expand the new workspace
    setExpandedWorkspaces(prev => new Set([...prev, tempId]))

    workspaceFetcher.submit(
      { name: "Untitled Workspace" },
      { 
        method: "post", 
        action: "/api/workspace/create"
      }
    )
  }

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces(prev => {
      const next = new Set(prev)
      if (next.has(workspaceId)) {
        next.delete(workspaceId)
      } else {
        next.add(workspaceId)
      }
      return next
    })
  }

  const handleStartNoteRename = (note: Note) => {
    setEditingNoteId(note.id)
    setEditingNoteTitle(note.title)
  }

  const handleNoteRename = () => {
    if (editingNoteId && editingNoteTitle) {
      handleUpdateNoteTitle(editingNoteId, editingNoteTitle)
    }
  }

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      fetcher.submit(
        { noteId },
        { method: "post", action: "/api/note/delete" }
      )
    }
  }

  return (
    <SidebarGroup>
      <div className="relative group/title">
        <SidebarGroupLabel className="rounded-sm hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30">
          Workspaces
        </SidebarGroupLabel>
        <div 
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md opacity-0 hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30 group-hover/title:opacity-100 hover:opacity-100 transition-opacity duration-200"
        >
          <button
            type="button"
            onClick={handleCreateWorkspace}
            title="New workspace"
            className="flex h-full w-full items-center justify-center"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <SidebarGroupContent>
        <SidebarMenu>
          {visibleWorkspaces?.map((workspace) => (
            <Collapsible key={workspace.id} open={expandedWorkspaces.has(workspace.id)} onOpenChange={() => toggleWorkspace(workspace.id)}>
              <SidebarMenuItem className="group/item">
                <SidebarMenuButton asChild>
                  <Link
                    to={`/${workspace.id}`}
                    className={cn("flex w-full items-center justify-between gap-1 rounded-sm px-1.5 py-1 hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30", {
                      "bg-zinc-200/40 dark:bg-zinc-800/40": location.pathname === `/${workspace.id}`,
                    })}
                  >
                    <div className="flex items-center gap-2">
                      <span>{workspace.emoji}</span>
                      <span>{workspace.name}</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction
                    className="left-1 opacity-0 group-hover/item:opacity-100 transition-opacity bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                    showOnHover
                  >
                    <ChevronRight className="size-3" />
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <SidebarMenuAction 
                  showOnHover
                  onClick={() => handleCreateNote(workspace.id)}
                >
                  <Plus />
                </SidebarMenuAction>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {(workspace.notes || []).map((note) => (
                    <SidebarMenuSubItem key={note.id}>
                      <SidebarMenuSubButton
                        asChild
                        isActive={location.pathname === `/${workspace.id}/${note.id}`}
                      >
                        <Link 
                          to={`/${workspace.id}/${note.id}`}
                          className={cn(
                            "w-full rounded-sm px-1.5 py-1 hover:bg-zinc-200/30 dark:hover:bg-zinc-800/30",
                            location.pathname === `/${workspace.id}/${note.id}` && "bg-zinc-200/40 dark:bg-zinc-800/40 font-medium"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span>{note.emoji || "📄"}</span>
                            <span>{note.title}</span>
                          </div>
                        </Link>
                      </SidebarMenuSubButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction showOnHover>
                            <MoreHorizontal />
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleStartNoteRename(note)}>
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteNote(note.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ))}
          {hasMoreWorkspaces && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                className="text-sidebar-foreground/70"
                onClick={() => setShowAllWorkspaces(!showAllWorkspaces)}
              >
                <MoreHorizontal />
                <span>{showAllWorkspaces ? 'Show Less' : 'More'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

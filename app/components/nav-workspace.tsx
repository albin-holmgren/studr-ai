import { ChevronRight, MoreHorizontal, Plus } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { useState } from "react"
import { useNavigation, useFetcher, Link, useLoaderData } from "@remix-run/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { slugify } from "~/lib/utils"

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
      createdAt: string
      updatedAt: string
    }[]
  }[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const fetcher = useFetcher()
  const workspaceFetcher = useFetcher()

  const handleCreateNote = (workspaceId: string) => {
    fetcher.submit(
      { title: "Untitled", workspaceId },
      { method: "post", action: "/api/note/create" }
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

  const handleCreateWorkspace = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    workspaceFetcher.submit(formData, { 
      method: "post", 
      action: "/api/workspace/create",
    })
    setIsOpen(false)
  }

  return (
    <SidebarGroup>
      <div className="relative group">
        <SidebarGroupLabel className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          Workspaces
        </SidebarGroupLabel>
        <div 
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md opacity-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover:opacity-100 hover:opacity-100"
        >
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            title="New workspace"
            className="flex h-full w-full items-center justify-center"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <workspaceFetcher.Form 
            action="/api/workspace/create"
            method="post"
            onSubmit={handleCreateWorkspace}
            className="space-y-4"
          >
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Workspace Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="My Workspace"
                className="mt-1"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={workspaceFetcher.state === "submitting"}>
                Create
              </Button>
            </div>
          </workspaceFetcher.Form>
        </DialogContent>
      </Dialog>

      <SidebarGroupContent>
        <SidebarMenu>
          {workspaces?.map((workspace) => (
            <Collapsible key={workspace.id}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <span>{workspace.emoji}</span>
                    <span>{workspace.name}</span>
                  </a>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction
                    className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
                    showOnHover
                  >
                    <ChevronRight />
                  </SidebarMenuAction>
                </CollapsibleTrigger>
                <SidebarMenuAction 
                  showOnHover
                  onClick={() => handleCreateNote(workspace.id)}
                >
                  <Plus />
                </SidebarMenuAction>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {(workspace.notes || []).map((note) => (
                      <SidebarMenuSubItem key={note.id} className="relative hover:bg-sidebar-accent/50 group/note">
                        <SidebarMenuSubButton asChild>
                          <Link
                            to={`/workspace/${slugify(note.title)}/${note.id}`}
                            className="relative flex items-center gap-2 px-2 py-1 text-sm"
                          >
                            <span>📝</span>
                            {editingNoteId === note.id ? (
                              <input
                                type="text"
                                defaultValue={note.title}
                                autoFocus
                                className="bg-transparent outline-none border-none"
                                onBlur={(e) => handleUpdateNoteTitle(note.id, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateNoteTitle(note.id, e.currentTarget.value)
                                  } else if (e.key === 'Escape') {
                                    setEditingNoteId(null)
                                  }
                                }}
                              />
                            ) : (
                              <span>{note.title}</span>
                            )}
                          </Link>
                        </SidebarMenuSubButton>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover/note:flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-6 w-6 rounded-sm inline-flex items-center justify-center hover:bg-sidebar-accent">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              className="w-36 ml-6 bg-sidebar" 
                              align="start"
                              alignOffset={0}
                              sideOffset={0}
                            >
                              <DropdownMenuItem
                                onClick={() => setEditingNoteId(note.id)}
                                className="focus:bg-sidebar-accent"
                              >
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to archive this note?")) {
                                    fetcher.submit(
                                      { noteId: note.id },
                                      { method: "post", action: "/api/note/archive" }
                                    )
                                  }
                                }}
                                className="text-destructive focus:bg-sidebar-accent focus:text-destructive"
                              >
                                Archive
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70">
              <MoreHorizontal />
              <span>More</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

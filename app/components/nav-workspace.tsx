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
import { Input } from "~/components/ui/input"
import { useEffect, useState } from "react"
import { useNavigation, useFetcher, useLoaderData } from "@remix-run/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"
import { useFavorites } from "~/hooks/use-favorites"
import toast, { Toaster } from 'react-hot-toast';

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
  const [localWorkspaces, setLocalWorkspaces] = useState(visibleWorkspaces)
  const hasMoreWorkspaces = workspaces.length > 5

  const handleCreateNote = (workspaceId: string) => {
    const tempId = `temp-${Date.now()}`; 
    const optimisticNote = {
      id: tempId,
      title: "Untitled",
      emoji: "📝",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workspaceId
    };
  
    setLocalWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) =>
        workspace.id === workspaceId
          ? { ...workspace, notes: [optimisticNote, ...(workspace.notes || [])] }
          : workspace
      )
    );
  
    fetcher.submit(
      { title: "Untitled", workspaceId },
      { 
        method: "post", 
        action: "/api/note/create"
      }
    )
  }

  const handleUpdateNoteTitle = (noteId: string, title: string) => {
    setLocalWorkspaces((prevWorkspaces) =>
      prevWorkspaces.map((workspace) => ({
        ...workspace,
        notes: workspace.notes?.map((note) =>
          note.id === noteId ? { ...note, title } : note
        ) || [],
      }))
    );
    fetcher.submit(
      { noteId, title },
      { method: "post", action: "/api/note/update" }
    );
    setEditingNoteId(null);
  }

  useEffect(() => {
    if (fetcher.data?.note) {
      setLocalWorkspaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) => ({
          ...workspace,
          notes: workspace.notes?.map((note) =>
            note.id === fetcher.data.note.id ? fetcher.data.note : note
          ) || [],
        }))
      );
    }
  }, [fetcher.data]);
  
  
  const handleCreateWorkspace = () => {
    const tempId = `temp-${Date.now()}`;
    const optimisticWorkspace = {
      id: tempId,
      name: "Untitled Workspace",
      emoji: "📝",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [] 
    };
  
    setLocalWorkspaces((prevWorkspaces) => [...prevWorkspaces, optimisticWorkspace]);
  
    workspaceFetcher.submit(
      { name: "Untitled Workspace" },
      { 
        method: "post", 
        action: "/api/workspace/create"
      }
    );
  };
  
  useEffect(() => {
    if (workspaceFetcher.data?.workspace) {
      setLocalWorkspaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) =>
          workspace.id === workspaceFetcher.data.workspace.id
            ? workspaceFetcher.data.workspace
            : workspace
        )
      );
    }
  }, [workspaceFetcher.data]);

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
  
  const handleShowMore = () => {
    setShowAllWorkspaces((prevState) => {
      const newState = !prevState;
      setLocalWorkspaces(newState ? workspaces : workspaces.slice(0, 5));  
      return newState;
    });
  };

  const handleNoteRename = (event: React.KeyboardEvent, noteId: string, newTitle: string) => {
    if (event.key === 'Enter' && newTitle.trim() !== "") {
      handleUpdateNoteTitle(noteId, newTitle)
    }
  }

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setLocalWorkspaces((prevWorkspaces) =>
        prevWorkspaces.map((workspace) => ({
          ...workspace,
          notes: workspace.notes.filter((note: any) => note.id !== noteId),
        }))
      );

      fetcher.submit({ noteId }, { method: "post", action: "/api/note/delete" });
    }
  };

  useEffect(() => {
    if (fetcher.data?.message) {
      toast.success(fetcher.data.message, {
        icon: false,
        style: { backgroundColor: 'black', color: 'white' , fontSize:'12px' },
      });
    }
  
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error, {
        style: { backgroundColor: 'red', color: 'white' },
      });
    }
  }, [fetcher.data]);

  return (
    <>
      <Toaster position="bottom-center" />
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
            {localWorkspaces?.map((workspace) => (
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
                      <SidebarMenuSubItem key={note.id} className="group/item relative">
                        <SidebarMenuSubButton
                          asChild
                          isActive={location.pathname === `/${workspace.id}/${note.id}`}
                        >
                          {editingNoteId === note.id ? (
                            <Input
                              value={editingNoteTitle || ""}
                              onChange={(e) => setEditingNoteTitle(e.target.value)}
                              onKeyDown={(e) => handleNoteRename(e, note.id, editingNoteTitle || "")}
                              onBlur={() => handleUpdateNoteTitle(note.id, editingNoteTitle || "")}
                              autoFocus
                            />
                          ) : (
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
                          )}
                        </SidebarMenuSubButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction
                              className="opacity-0 group-hover/item:opacity-100 transition-opacity absolute right-2 top-1/2 transform -translate-y-1/2"
                              showOnHover
                            >
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
                  onClick={handleShowMore}
                >
                  <MoreHorizontal />
                  <span>{showAllWorkspaces ? 'Show Less' : 'More'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

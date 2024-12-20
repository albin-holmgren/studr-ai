import { ChevronRight, MoreHorizontal, Plus } from "lucide-react"
import { Link, useLocation } from "@remix-run/react"
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
import { useNavigation, useFetcher } from "@remix-run/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { cn } from "~/lib/utils"

interface LibraryItem {
  id: string
  name: string
  emoji: string
  createdAt: string
  updatedAt: string
  items?: {
    id: string
    title: string
    emoji: string
    createdAt: string
    updatedAt: string
  }[]
}

export function NavLibrary({
  libraries = [],
}: {
  libraries: LibraryItem[]
}) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingItemTitle, setEditingItemTitle] = useState<string | null>(null)
  const [showAllLibraries, setShowAllLibraries] = useState(false)
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"
  const fetcher = useFetcher()
  const libraryFetcher = useFetcher()
  const [expandedLibraries, setExpandedLibraries] = useState<Set<string>>(new Set())
  const pathname = useLocation().pathname

  const visibleLibraries = showAllLibraries ? libraries : libraries.slice(0, 5)
  const hasMoreLibraries = libraries.length > 5

  const handleCreateItem = (libraryId: string) => {
    const tempId = `temp-${Date.now()}`
    const optimisticItem = {
      id: tempId,
      title: "Untitled",
      emoji: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      libraryId
    }
    
    setExpandedLibraries(prev => new Set([...prev, libraryId]))
    
    fetcher.submit(
      { title: "Untitled", libraryId },
      { 
        method: "post", 
        action: "/api/library/item/create"
      }
    )
  }

  const handleUpdateItemTitle = (itemId: string, title: string) => {
    setEditingItemId(null)
    if (title.trim()) {
      fetcher.submit(
        { itemId, title },
        { method: "post", action: "/api/library/item/update" }
      )
    }
  }

  const handleCreateLibrary = () => {
    const tempId = `temp-${Date.now()}`
    const optimisticLibrary = {
      id: tempId,
      name: "Untitled Library",
      emoji: "📚",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: []
    }

    setExpandedLibraries(prev => new Set([...prev, tempId]))

    libraryFetcher.submit(
      { name: "Untitled Library" },
      { 
        method: "post", 
        action: "/api/library/create"
      }
    )
  }

  const toggleLibrary = (libraryId: string) => {
    setExpandedLibraries(prev => {
      const next = new Set(prev)
      if (next.has(libraryId)) {
        next.delete(libraryId)
      } else {
        next.add(libraryId)
      }
      return next
    })
  }

  const handleStartItemRename = (item: LibraryItem["items"][0]) => {
    setEditingItemId(item.id)
    setEditingItemTitle(item.title)
  }

  const handleItemRename = () => {
    if (editingItemId && editingItemTitle) {
      handleUpdateItemTitle(editingItemId, editingItemTitle)
    }
  }

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      fetcher.submit(
        { itemId },
        { method: "post", action: "/api/library/item/delete" }
      )
    }
  }

  return (
    <SidebarGroup>
      <div className="relative group">
        <SidebarGroupLabel className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          Library
        </SidebarGroupLabel>
        <div 
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-md opacity-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200"
        >
          <button
            type="button"
            onClick={handleCreateLibrary}
            title="New library"
            className="flex h-full w-full items-center justify-center"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <SidebarGroupContent>
        <SidebarMenu>
          {visibleLibraries?.map((library) => (
            <Collapsible key={library.id} open={expandedLibraries.has(library.id)} onOpenChange={() => toggleLibrary(library.id)}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to={`/library/${library.id}`}
                    className={cn("group flex w-full items-center justify-between gap-1 rounded-lg px-2 py-2 hover:bg-sidebar-accent/50", {
                      "bg-sidebar-accent": pathname === `/library/${library.id}`,
                    })}
                  >
                    <div className="flex items-center gap-2">
                      <span>{library.emoji}</span>
                      <span>{library.name}</span>
                    </div>
                  </Link>
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
                  onClick={() => handleCreateItem(library.id)}
                >
                  <Plus />
                </SidebarMenuAction>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {(library.items || []).map((item) => (
                    <SidebarMenuSubItem key={item.id}>
                      <SidebarMenuSubButton asChild>
                        <Link 
                          to={`/library/${library.id}/source/${item.id}`}
                          className={cn(
                            "w-full",
                            pathname === `/library/${library.id}/source/${item.id}` && "font-medium"
                          )}
                        >
                          {editingItemId === item.id ? (
                            <Input
                              value={editingItemTitle || ""}
                              onChange={(e) => setEditingItemTitle(e.target.value)}
                              onBlur={handleItemRename}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleItemRename()
                                }
                                if (e.key === "Escape") {
                                  setEditingItemId(null)
                                  setEditingItemTitle(null)
                                }
                              }}
                              className="h-auto p-0 text-base shadow-none"
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{item.emoji}</span>
                              <span>{item.title}</span>
                            </div>
                          )}
                        </Link>
                      </SidebarMenuSubButton>
                      <SidebarMenuAction>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-6 w-6 p-0 hover:bg-background"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleStartItemRename(item)}
                            >
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuAction>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          ))}
          {hasMoreLibraries && (
            <SidebarMenuItem>
              <SidebarMenuButton 
                className="text-sidebar-foreground/70"
                onClick={() => setShowAllLibraries(!showAllLibraries)}
              >
                <MoreHorizontal />
                <span>{showAllLibraries ? 'Show Less' : 'More'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

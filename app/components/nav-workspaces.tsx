import * as React from "react"
import { Link, useNavigate } from "@remix-run/react"
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react"

import { AddLibraryItem } from "~/components/add-library-item"
import { usePageTitles } from "~/hooks/use-page-titles"
import { useWorkspaces } from "~/hooks/use-workspaces"
import { usePageEmoji } from "~/hooks/use-page-emoji"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "~/components/ui/sidebar"

const ITEMS_PER_PAGE = 5

interface Page {
  id: string
  name: string
  emoji: string
  pages?: Page[]
}

interface NavWorkspacesProps {
  onPageTitleChange?: (id: string, title: string) => void
}

function PageItem({ page, onPageTitleChange, basePath = "/pages" }: { 
  page: Page
  onPageTitleChange?: (id: string, title: string) => void
  basePath?: string 
}) {
  const navigate = useNavigate()
  const { getPageTitle } = usePageTitles()
  const { getEmoji } = usePageEmoji(page.id)
  const { addPage } = useWorkspaces()
  const [isPending, startTransition] = React.useTransition()
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = page.pages && page.pages.length > 0
  const title = getPageTitle(page.id, page.name)
  const emoji = getEmoji(page.id) || page.emoji

  const handleAddPage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(() => {
      const newPage = addPage(page.id)
      setIsOpen(true) // Open the parent to show the new page
      navigate(`${basePath}/${newPage.id}`)
    })
  }

  if (!hasChildren) {
    return (
      <SidebarMenuSubItem>
        <Link to={`${basePath}/${page.id}`} className="w-full">
          <SidebarMenuSubButton>
            <span>{emoji}</span>
            <span>{title}</span>
          </SidebarMenuSubButton>
        </Link>
      </SidebarMenuSubItem>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem className="pl-3">
        <Link to={`${basePath}/${page.id}`} className="w-full">
          <SidebarMenuButton>
            <span>{emoji}</span>
            <span>{title}</span>
          </SidebarMenuButton>
        </Link>
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
          onClick={handleAddPage}
          disabled={isPending}
        >
          <Plus />
        </SidebarMenuAction>
        <CollapsibleContent>
          <SidebarMenuSub>
            {page.pages?.map((subPage) => (
              <PageItem 
                key={subPage.id} 
                page={subPage} 
                onPageTitleChange={onPageTitleChange}
                basePath={basePath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function WorkspaceItem({ workspace, onPageTitleChange, basePath = "/pages", isExpanded = false }: {
  workspace: {
    id: string
    name: string
    emoji: string
    pages: Page[]
  }
  onPageTitleChange?: (id: string, title: string) => void
  basePath?: string
  isExpanded?: boolean
}) {
  const navigate = useNavigate()
  const { getPageTitle } = usePageTitles()
  const { getEmoji } = usePageEmoji(workspace.id)
  const { addPage } = useWorkspaces()
  const [isPending, startTransition] = React.useTransition()
  const [isOpen, setIsOpen] = React.useState(isExpanded)
  const title = getPageTitle(workspace.id, workspace.name)
  const emoji = getEmoji(workspace.id) || workspace.emoji

  React.useEffect(() => {
    if (isExpanded) {
      setIsOpen(true)
    }
  }, [isExpanded])

  const handleAddPage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startTransition(() => {
      const newPage = addPage(workspace.id)
      setIsOpen(true) // Open the workspace to show the new page
      navigate(`${basePath}/${newPage.id}`)
    })
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <Link to={`${basePath}/${workspace.id}`} className="w-full">
          <SidebarMenuButton>
            <span>{emoji}</span>
            <span>{title}</span>
          </SidebarMenuButton>
        </Link>
        {workspace.pages.length > 0 && (
          <CollapsibleTrigger asChild>
            <SidebarMenuAction
              className="left-2 bg-sidebar-accent text-sidebar-accent-foreground data-[state=open]:rotate-90"
              showOnHover
            >
              <ChevronRight />
            </SidebarMenuAction>
          </CollapsibleTrigger>
        )}
        <SidebarMenuAction 
          showOnHover
          onClick={handleAddPage}
          disabled={isPending}
        >
          <Plus />
        </SidebarMenuAction>
        <CollapsibleContent>
          <SidebarMenuSub>
            {workspace.pages.map((page) => (
              <PageItem 
                key={page.id} 
                page={page}
                onPageTitleChange={onPageTitleChange}
                basePath={basePath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavWorkspaces({ onPageTitleChange }: NavWorkspacesProps) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const [addLibraryOpen, setAddLibraryOpen] = React.useState(false)
  const { workspaces, addPage } = useWorkspaces()
  const [isPending, startTransition] = React.useTransition()
  const [visibleItems, setVisibleItems] = React.useState(ITEMS_PER_PAGE)

  const handleAddLibraryItem = (item: { type: "file" | "url"; data: File | string }) => {
    console.log("Adding library item:", item)
  }

  const handleCreatePage = React.useCallback(() => {
    startTransition(() => {
      const newPage = addPage()
      navigate(`/pages/${newPage.id}`)
    })
  }, [addPage, navigate])

  const handleLoadMore = () => {
    setVisibleItems(prev => prev + ITEMS_PER_PAGE)
  }

  // Get visible workspaces
  const visibleWorkspaces = workspaces.slice(0, visibleItems)
  const hasMore = visibleItems < workspaces.length

  return (
    <>
      <AddLibraryItem
        open={addLibraryOpen}
        onOpenChange={setAddLibraryOpen}
        onAdd={handleAddLibraryItem}
      />

      <SidebarGroup>
        <SidebarGroupLabel>Pages</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {visibleWorkspaces.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                workspace={workspace}
                onPageTitleChange={onPageTitleChange}
              />
            ))}
            <SidebarMenuItem>
              {hasMore ? (
                <SidebarMenuButton 
                  className="text-sidebar-foreground/70"
                  onClick={handleLoadMore}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>Show More ({workspaces.length - visibleItems} remaining)</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton 
                  className="text-sidebar-foreground/70"
                  onClick={handleCreatePage}
                  disabled={isPending}
                >
                  <Plus className="h-4 w-4" />
                  <span>{isPending ? "Creating..." : "Add Page"}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Library</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {visibleWorkspaces.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                workspace={workspace}
                onPageTitleChange={onPageTitleChange}
                basePath="/library"
              />
            ))}
            <SidebarMenuItem>
              {hasMore ? (
                <SidebarMenuButton 
                  className="text-sidebar-foreground/70"
                  onClick={handleLoadMore}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span>Show More ({workspaces.length - visibleItems} remaining)</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton
                  className="text-sidebar-foreground/70"
                  onClick={() => setAddLibraryOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Library</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
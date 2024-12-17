import { ArrowUpRight, Link, MoreHorizontal, Star, Trash2 } from "lucide-react"
import { Link as RouterLink, useLoaderData } from "@remix-run/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { useFavorites } from "~/hooks/use-favorites"
import { type loader } from "~/routes/_app.$workspaceId.$noteId._index"

export function NavFavorites() {
  const { isMobile } = useSidebar()
  const { favoriteIds, removeFavorite } = useFavorites()
  const { user } = useLoaderData<typeof loader>()
  
  // Find favorite notes from user's workspaces
  const favoriteNotes = user.workspaces
    .flatMap(workspace => workspace.notes)
    .filter(note => favoriteIds.includes(note.id))

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {favoriteNotes.map((note) => (
          <SidebarMenuItem key={note.id}>
            <SidebarMenuButton asChild>
              <RouterLink to={`/${note.workspaceId}/${note.id}`} title={note.title}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{note.emoji || "📄"}</span>
                  <span>{note.title}</span>
                </div>
              </RouterLink>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => removeFavorite(note.id)}>
                  <Star className="text-muted-foreground" />
                  <span>Remove from Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <RouterLink to={`/${note.workspaceId}/${note.id}`} target="_blank">
                    <ArrowUpRight className="text-muted-foreground" />
                    <span>Open in New Tab</span>
                  </RouterLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

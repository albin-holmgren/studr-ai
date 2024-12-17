import { ArrowUpRight, Link, MoreHorizontal, Star, Trash2 } from "lucide-react"
import { Link as RouterLink } from "@remix-run/react"

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

export function NavFavorites() {
  const { isMobile } = useSidebar()
  const { favorites, removeFavorite } = useFavorites()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Favorites</SidebarGroupLabel>
      <SidebarMenu>
        {favorites.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <RouterLink to={`/${item.workspaceId}/${item.id}`} title={item.title}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.emoji || "📄"}</span>
                  <span>{item.title}</span>
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
                <DropdownMenuItem onClick={() => removeFavorite(item.id)}>
                  <Star className="text-muted-foreground" />
                  <span>Remove from Favorites</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <RouterLink to={`/${item.workspaceId}/${item.id}`} target="_blank">
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

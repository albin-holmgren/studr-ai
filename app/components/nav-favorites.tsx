import * as React from "react"
import {
  ArrowUpRight,
  BookmarkX,
  Link,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { Link as RemixLink } from "@remix-run/react"

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
  useSidebar,
} from "~/components/ui/sidebar"
import { useBookmarks } from "~/hooks/use-bookmarks"
import { usePageEmoji } from "~/hooks/use-page-emoji"

export function NavFavorites() {
  const { isMobile } = useSidebar()
  const { bookmarks, removeBookmark } = useBookmarks()
  const { getEmoji } = usePageEmoji("")

  // Sort bookmarks alphabetically
  const sortedBookmarks = [...bookmarks].sort((a, b) => 
    a.name.localeCompare(b.name)
  )

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {sortedBookmarks.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild>
                <RemixLink to={item.url}>
                  <span>{getEmoji(item.id)}</span>
                  <span>{item.name}</span>
                </RemixLink>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align={isMobile ? "center" : "start"}
                  className="w-48"
                >
                  <DropdownMenuItem onClick={() => removeBookmark(item.id)}>
                    <BookmarkX className="text-muted-foreground" />
                    <span>Remove from Bookmarks</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <RemixLink to={item.url}>
                      <Link className="text-muted-foreground" />
                      <span>Copy Link</span>
                    </RemixLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ArrowUpRight className="text-muted-foreground" />
                      <span>Open in New Tab</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
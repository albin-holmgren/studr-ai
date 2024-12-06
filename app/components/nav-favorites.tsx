import * as React from "react"
import { Link as RemixLink } from "@remix-run/react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar"

import { useBookmarks } from "~/hooks/use-bookmarks"
import { usePageEmoji } from "~/hooks/use-page-emoji"

interface NavFavoritesProps {
  favorites: Array<{
    name: string
    url: string
    emoji: string
  }>
}

export function NavFavorites({ favorites }: NavFavoritesProps) {
  const { bookmarks } = useBookmarks()
  const { getEmoji } = usePageEmoji("")

  // Sort bookmarks alphabetically
  const sortedBookmarks = [...bookmarks].sort((a, b) => 
    a.name.localeCompare(b.name)
  )

  const favoritesList = sortedBookmarks.map((item) => ({
    name: item.name,
    url: item.url,
    emoji: getEmoji(item.id),
  }))

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {favoritesList.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <RemixLink to={item.url}>
                  <span className="mr-2">{item.emoji}</span>
                  <span className="truncate">{item.name}</span>
                </RemixLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
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

interface NavFavoritesProps {
  favorites?: Array<{
    name: string
    url: string
    emoji: string
  }>
}

export function NavFavorites({ favorites = [] }: NavFavoritesProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[#77777C]">
        Bookmarks
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {favorites.map((item) => (
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
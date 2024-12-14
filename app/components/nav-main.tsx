"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    badge?: string
  }[]
  onSearchClick?: () => void
}

export function NavMain({ items, onSearchClick }: NavMainProps) {
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild={item.title !== "Search"}
            onClick={item.title === "Search" ? onSearchClick : undefined}
            data-active={item.isActive}
          >
            {item.title === "Search" ? (
              <button className="flex w-full items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.badge && <span>{item.badge}</span>}
              </button>
            ) : (
              <a href={item.url} title={item.title} className="flex w-full items-center gap-2">
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.badge && <span>{item.badge}</span>}
              </a>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

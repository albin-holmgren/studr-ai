import * as React from "react"
import { Link } from "@remix-run/react"
import { Calendar, Settings2, Blocks, Trash2, MessageCircleQuestion } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

interface NavSecondaryProps {
  items?: Array<{
    title: string
    url: string
    icon: string
  }>
  className?: string
}

const icons = {
  Calendar,
  Settings2,
  Blocks,
  Trash2,
  MessageCircleQuestion,
}

const defaultItems = [
  {
    title: "Calendar",
    url: "#",
    icon: "Calendar",
  },
  {
    title: "Settings",
    url: "#",
    icon: "Settings2",
  },
  {
    title: "Templates",
    url: "#",
    icon: "Blocks",
  },
  {
    title: "Trash",
    url: "#",
    icon: "Trash2",
  },
  {
    title: "Help",
    url: "#",
    icon: "MessageCircleQuestion",
  },
]

export function NavSecondary({ items = defaultItems, className }: NavSecondaryProps) {
  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = icons[item.icon as keyof typeof icons]
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

import * as React from "react"
import { Link, useLocation } from "@remix-run/react"
import { Search, Sparkles, Home, Inbox,Settings } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "~/components/ui/sidebar"

interface NavMainProps {
  items?: Array<{
    title: string
    url: string
    icon: string
    isActive?: boolean
    badge?: string
  }>
}

const icons = {
  Search,
  Sparkles,
  Home,
  Inbox,
}

const items = [
  {
    title: "Search",
    url: "#",
    icon: "Search",
  },
  {
    title: "Ask AI",
    url: "/askai",
    icon: "Sparkles",
  },
  {
    title: "Home",
    url: "/",
    icon: "Home",
  },
  {
    title: "Archive",
    url: "#",
    icon: "Inbox",
  },
  {
    title: "Settings",
    url: "#",
    icon: "Settings",
  },
]

export function NavMain({ items: itemsProp = items }: NavMainProps) {
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [archiveOpen, setArchiveOpen] = React.useState(false)

  const items = itemsProp.map((item) => ({
    ...item,
    isActive: location.pathname === item.url,
  }))

  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = icons[item.icon as keyof typeof icons]
        return (
          <SidebarMenuItem key={item.title}>
            {item.title === "Search" ? (
              <SidebarMenuButton
                onClick={() => {
                  const event = new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                  })
                  document.dispatchEvent(event)
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
                <kbd className="ml-auto text-xs text-muted-foreground">
                  ⌘K
                </kbd>
              </SidebarMenuButton>
            ) : item.title === "Archive" ? (
              <SidebarMenuButton onClick={() => setArchiveOpen(true)}>
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : item.title === "Settings" ? (
              <SidebarMenuButton onClick={() => setSettingsOpen(true)}>
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild>
                <Link 
                  to={item.url}
                  className={item.isActive ? "data-[active=true]" : ""}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
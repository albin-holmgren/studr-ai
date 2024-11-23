import * as React from "react"
import { Link, useLocation } from "@remix-run/react"
import { Archive, Home, Search, Settings, Sparkles } from "lucide-react"

import { ArchiveCommand } from "~/components/archive-command"
import { SearchCommand } from "~/components/search-command"
import { SettingsCommand } from "~/components/settings-command"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

const items = [
  {
    title: "Search",
    url: "#",
    icon: Search,
    isSearch: true,
  },
  {
    title: "Ask AI",
    url: "/askai",
    icon: Sparkles,
  },
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Archive",
    url: "#",
    icon: Archive,
    isArchive: true,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    isSettings: true,
  },
]

export function NavMain() {
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [archiveOpen, setArchiveOpen] = React.useState(false)

  return (
    <>
      <SearchCommand />
      <ArchiveCommand open={archiveOpen} onOpenChange={setArchiveOpen} />
      <SettingsCommand open={settingsOpen} onOpenChange={setSettingsOpen} />
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {item.isSearch ? (
              <SidebarMenuButton
                onClick={() => {
                  const event = new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                  })
                  document.dispatchEvent(event)
                }}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : item.isArchive ? (
              <SidebarMenuButton onClick={() => setArchiveOpen(true)}>
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : item.isSettings ? (
              <SidebarMenuButton onClick={() => setSettingsOpen(true)}>
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild>
                <Link 
                  to={item.url}
                  className={location.pathname === item.url ? "data-[active=true]" : ""}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  )
}
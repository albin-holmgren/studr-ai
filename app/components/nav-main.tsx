import * as React from "react"
import { Link, useLocation, useNavigate } from "@remix-run/react"
import { Search, Sparkles, Home, Archive, Settings } from "lucide-react"

import { cn } from "~/lib/utils"
import { Badge } from "~/components/ui/badge"
import { 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarMenuBadge 
} from "~/components/ui/sidebar"
import { ArchiveCommand } from "~/components/archive-command"
import { SettingsDialog } from "~/components/settings-dialog"
import { SearchCommand } from "~/components/search-command"

interface NavMainProps {
  items?: Array<{
    title: string
    url?: string
    icon: string
    isActive?: boolean
    badge?: string
    onClick?: () => void
  }>
}

const icons = {
  Search,
  Sparkles,
  Home,
  Archive,
  Settings,
}

const items = [
  {
    title: "Search",
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
    icon: "Archive",
  },
  {
    title: "Settings",
    icon: "Settings",
  },
]

export function NavMain({ items: itemsProp = items }: NavMainProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showArchive, setShowArchive] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [showSearch, setShowSearch] = React.useState(false)

  return (
    <>
      <SidebarMenu>
        {itemsProp.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons]
          const isActive = item.url ? location.pathname === item.url : false

          return (
            <SidebarMenuItem key={item.title}>
              {item.url ? (
                <Link to={item.url}>
                  <SidebarMenuButton isActive={isActive}>
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                  </SidebarMenuButton>
                </Link>
              ) : (
                <SidebarMenuButton 
                  onClick={() => {
                    if (item.title === "Archive") setShowArchive(true)
                    if (item.title === "Settings") setShowSettings(true)
                    if (item.title === "Search") setShowSearch(true)
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                  {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
      <ArchiveCommand open={showArchive} onOpenChange={setShowArchive} />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
      <SearchCommand open={showSearch} onOpenChange={setShowSearch} />
    </>
  )
}
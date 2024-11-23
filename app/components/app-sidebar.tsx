import * as React from "react"
import {
  Archive,
  Home,
  Search,
  Settings,
  Sparkles,
} from "lucide-react"

import { NavFavorites } from "~/components/nav-favorites"
import { NavMain } from "~/components/nav-main"
import { NavWorkspaces } from "~/components/nav-workspaces"
import { TokenUsage } from "~/components/token-usage"
import { UserSwitcher } from "~/components/user-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar"

// This is sample data with nested pages
const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://github.com/shadcn.png",
  },
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onPageTitleChange?: (id: string, title: string) => void
}

export function AppSidebar({ onPageTitleChange, ...props }: AppSidebarProps) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <UserSwitcher user={data.user} />
        <NavMain />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites />
        <NavWorkspaces onPageTitleChange={onPageTitleChange} />
      </SidebarContent>
      <TokenUsage totalTokens={50000} usedTokens={25000} />
      <SidebarRail />
    </Sidebar>
  )
}
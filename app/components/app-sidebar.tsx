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
  SidebarFooter,
} from "~/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onPageTitleChange?: (id: string, title: string) => void
  user?: {
    id: string
    name: string
    email: string
    avatar?: string | null
    subscription?: any
  }
}

export function AppSidebar({ onPageTitleChange, user, ...props }: AppSidebarProps) {
  return (
    <Sidebar 
      className="bg-[#FAFAFA] text-[#3F3F45]" 
      {...props}
    >
      <SidebarHeader>
        {user && <UserSwitcher user={user} />}
        <NavMain />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites />
        <NavWorkspaces onPageTitleChange={onPageTitleChange} />
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <div className="flex flex-col gap-2">
            <TokenUsage userId={user.id} subscription={user.subscription} />
          </div>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  )
}
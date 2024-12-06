import * as React from "react"

import { NavFavorites } from "~/components/nav-favorites"
import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavWorkspaces } from "~/components/nav-workspaces"
import { TeamSwitcher } from "~/components/team-switcher"
import { cn } from "~/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}
interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface SidebarRailProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-screen w-[280px] flex-col border-r bg-sidebar",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

export function SidebarHeader({ className, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-2 border-b p-4", className)}
      {...props}
    />
  )
}

export function SidebarContent({ className, ...props }: SidebarContentProps) {
  return (
    <div
      className={cn("flex flex-1 flex-col gap-4 overflow-auto p-4", className)}
      {...props}
    />
  )
}

export function SidebarRail({ className, ...props }: SidebarRailProps) {
  return (
    <div
      className={cn(
        "absolute right-0 top-0 h-full w-1 bg-border opacity-0 transition-opacity hover:opacity-100",
        className
      )}
      {...props}
    />
  )
}

const sampleData = {
  teams: [
    {
      name: "Acme Inc",
      logo: "⚡️",
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: "🎵",
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: "⚡️",
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: "Search",
    },
    {
      title: "Ask AI",
      url: "#",
      icon: "Sparkles",
    },
    {
      title: "Home",
      url: "#",
      icon: "Home",
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: "Inbox",
      badge: "10",
    },
  ],
  navSecondary: [
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
  ],
  favorites: [
    {
      name: "Project Management",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker",
      url: "#",
      emoji: "💪",
    },
  ],
  workspaces: [
    {
      name: "Personal Life",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal",
          url: "#",
          emoji: "📔",
        },
        {
          name: "Health Tracker",
          url: "#",
          emoji: "🍏",
        },
      ],
    },
    {
      name: "Work",
      emoji: "💼",
      pages: [
        {
          name: "Projects",
          url: "#",
          emoji: "📊",
        },
        {
          name: "Meetings",
          url: "#",
          emoji: "👥",
        },
      ],
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onPageTitleChange?: (id: string, title: string) => void
}

export function AppSidebar({ onPageTitleChange, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sampleData.teams} />
        <NavMain items={sampleData.navMain} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={sampleData.favorites} />
        <NavWorkspaces workspaces={sampleData.workspaces} />
        <NavSecondary items={sampleData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

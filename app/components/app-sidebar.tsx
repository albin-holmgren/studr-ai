import * as React from "react"
import { useNavigate, useLocation } from "@remix-run/react"
import { useFetcher } from "@remix-run/react"
import type { User } from "@supabase/supabase-js"
import {
  Archive,
  AudioWaveform,
  Blocks,
  Calendar,
  Command,
  FileText,
  Home,
  Inbox,
  MessageCircleQuestion,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react"

import { NavFavorites } from "~/components/nav-favorites"
import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavWorkspace } from "~/components/nav-workspace"
import { NavLibrary } from "~/components/nav-library"
import { NavUser } from "./nav-user"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import { Sidebar, SidebarContent, SidebarHeader } from "~/components/ui/sidebar"
import { SearchCommand } from "~/components/search-command"
import SettingsPopup from "./settings-popup"
import { ArchivePopup } from "~/components/archive-popup"
import { InboxDrawer } from "~/components/inbox-drawer"
import TokenUsage from "./token-usage"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  workspaces: {
    id: string
    name: string
    emoji: string
    createdAt: string
    updatedAt: string
    notes?: {
      id: string
      title: string
      emoji: string
      createdAt: string
      updatedAt: string
    }[]
  }[]
  user: {
    id: string
    email: string
    name: string | null
    avatar: string | null
    workspaces: any[]
    libraries: {
      id: string
      name: string
      emoji: string
      createdAt: string
      updatedAt: string
      items: {
        id: string
        title: string
        emoji: string
        createdAt: string
        updatedAt: string
      }[]
    }[]
    subscriptionTier?: string
    tokenUsage?: {
      daily: number
    }
    notifications?: any[]
  }
  session: any
  supabase: any
}

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: Command,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Home",
      url: "/",
      icon: Home,
      isActive: true,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
    {
      title: "Archive",
      url: "#",
      icon: Archive,
    },
  ],
  favorites: [
    {
      name: "Project Management & Task Tracking",
      url: "#",
      emoji: "📊",
    },
    {
      name: "Family Recipe Collection & Meal Planning",
      url: "#",
      emoji: "🍳",
    },
    {
      name: "Fitness Tracker & Workout Routines",
      url: "#",
      emoji: "💪",
    },
    {
      name: "Book Notes & Reading List",
      url: "#",
      emoji: "📚",
    },
    {
      name: "Sustainable Gardening Tips & Plant Care",
      url: "#",
      emoji: "🌱",
    },
    {
      name: "Language Learning Progress & Resources",
      url: "#",
      emoji: "🗣️",
    },
    {
      name: "Home Renovation Ideas & Budget Tracker",
      url: "#",
      emoji: "🏠",
    },
    {
      name: "Personal Finance & Investment Portfolio",
      url: "#",
      emoji: "💰",
    },
    {
      name: "Movie & TV Show Watchlist with Reviews",
      url: "#",
      emoji: "🎬",
    },
    {
      name: "Daily Habit Tracker & Goal Setting",
      url: "#",
      emoji: "✅",
    },
  ],
  workspaces: [
    {
      name: "Personal Life Management",
      emoji: "🏠",
      pages: [
        {
          name: "Daily Journal & Reflection",
          url: "#",
          emoji: "📔",
        },
        {
          name: "Health & Wellness Tracker",
          url: "#",
          emoji: "🍏",
        },
        {
          name: "Personal Growth & Learning Goals",
          url: "#",
          emoji: "🌟",
        },
      ],
    },
    {
      name: "Professional Development",
      emoji: "💼",
      pages: [
        {
          name: "Career Objectives & Milestones",
          url: "#",
          emoji: "🎯",
        },
        {
          name: "Skill Acquisition & Training Log",
          url: "#",
          emoji: "🧠",
        },
        {
          name: "Networking Contacts & Events",
          url: "#",
          emoji: "🤝",
        },
      ],
    },
    {
      name: "Creative Projects",
      emoji: "🎨",
      pages: [
        {
          name: "Writing Ideas & Story Outlines",
          url: "#",
          emoji: "✍️",
        },
        {
          name: "Art & Design Portfolio",
          url: "#",
          emoji: "🖼️",
        },
        {
          name: "Music Composition & Practice Log",
          url: "#",
          emoji: "🎵",
        },
      ],
    },
    {
      name: "Home Management",
      emoji: "🏡",
      pages: [
        {
          name: "Household Budget & Expense Tracking",
          url: "#",
          emoji: "💰",
        },
        {
          name: "Home Maintenance Schedule & Tasks",
          url: "#",
          emoji: "🔧",
        },
        {
          name: "Family Calendar & Event Planning",
          url: "#",
          emoji: "📅",
        },
      ],
    },
    {
      name: "Travel & Adventure",
      emoji: "🧳",
      pages: [
        {
          name: "Trip Planning & Itineraries",
          url: "#",
          emoji: "🗺️",
        },
        {
          name: "Travel Bucket List & Inspiration",
          url: "#",
          emoji: "🌎",
        },
        {
          name: "Travel Journal & Photo Gallery",
          url: "#",
          emoji: "📸",
        },
      ],
    },
  ],
}

export function AppSidebar({
  workspaces,
  user,
  session,
  supabase,
  ...props
}: AppSidebarProps) {
  const [open, setOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [archiveOpen, setArchiveOpen] = React.useState(false)
  const [inboxOpen, setInboxOpen] = React.useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const fetcher = useFetcher<{
    results: Array<{
      id: string
      title: string
      content: string
      workspace: string
      emoji?: string
    }>
  }>()
  const archiveFetcher = useFetcher()
  const results = (fetcher.data?.results || []) as Array<{
    id: string
    title: string
    content: string
    workspace: string
    emoji?: string
  }>

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Load archived notes when archive popup opens
  React.useEffect(() => {
    if (archiveOpen) {
      archiveFetcher.load("/api/notes/archived");
    }
  }, [archiveOpen]);

  // Handle note restoration
  const handleRestoreNote = React.useCallback((noteId: string) => {
    archiveFetcher.submit(
      { noteId },
      { method: "POST", action: "/api/notes/restore" }
    );
  }, []);

  const runSearch = React.useCallback(
    (value: string) => {
      if (!value) return
      fetcher.load(`/api/search?q=${encodeURIComponent(value)}`)
    },
    [fetcher]
  )

  const navMainItems = React.useMemo(() => {
    return data.navMain.map(item => ({
      ...item,
      isActive: item.title === "Home" ? location.pathname === "/" : false,
      onClick: item.title === "Search" 
        ? () => setOpen(true)
        : item.title === "Inbox"
        ? () => setInboxOpen(true)
        : item.title === "Home"
        ? () => navigate("/")
        : undefined
    }));
  }, [navigate, location.pathname]);

  return (
    <>
      <Sidebar className="border-r-0" {...props}>
        <SidebarHeader>
          <NavUser
            user={{
              name: user?.name || user?.email?.split('@')[0] || 'Anonymous',
              email: user?.email || '',
              avatar: user?.avatar || ''
            }}
          />
          <div className="mt-4">
            <NavMain items={navMainItems} onSearchClick={() => setOpen(true)} />
          </div>
        </SidebarHeader>
        <SidebarContent className="flex flex-col h-full">
          <div className="flex-1">
            <NavFavorites favorites={data.favorites} />
            <NavWorkspace workspaces={workspaces} />
            {/* <NavLibrary libraries={user.libraries} /> */}
            <NavSecondary 
              items={data.navSecondary.map(item => ({
                ...item,
                onClick: item.title === "Settings" 
                  ? () => setSettingsOpen(true) 
                  : item.title === "Archive"
                  ? () => setArchiveOpen(true)
                  : item.title === "Inbox"
                  ? () => setInboxOpen(true)
                  : undefined
              }))} 
              className="mt-auto" 
            />
          </div>
          <div className="sticky bottom-0 z-10">
            <TokenUsage 
              subscriptionTier={user?.subscriptionTier} 
              usedTokens={user?.tokenUsage?.daily || 0} 
            />
          </div>
        </SidebarContent>
      </Sidebar>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search notes..."
          onValueChange={runSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Notes">
              {results.map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => {
                    setOpen(false)
                    navigate(`/notes/${result.id}`)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border">
                      {result.emoji || <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {result.workspace}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>

      <SettingsPopup open={settingsOpen} onOpenChange={setSettingsOpen} />
      
      <ArchivePopup 
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        archivedNotes={archiveFetcher.data?.notes || []}
        onRestoreNote={handleRestoreNote}
      />

      <InboxDrawer
        open={inboxOpen}
        onOpenChange={setInboxOpen}
      />
    </>
  )
}

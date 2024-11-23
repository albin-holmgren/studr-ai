import * as React from "react"
import { usePageEmoji } from "./use-page-emoji"
import { usePageTitles } from "./use-page-titles"

interface Page {
  id: string
  name: string
  emoji: string
  pages?: Page[]
}

interface Workspace {
  id: string
  name: string
  emoji: string
  pages: Page[]
}

// Helper function to sort items alphabetically by name
function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name))
}

// In-memory store for workspaces
let workspaces: Workspace[] = [
  {
    id: "daily-journal",
    name: "Daily Journal & Reflection",
    emoji: "📔",
    pages: [
      {
        id: "journal-2024",
        name: "2024 Entries",
        emoji: "📅",
        pages: [
          {
            id: "march-2024",
            name: "March 2024",
            emoji: "🌸",
          }
        ]
      }
    ]
  },
  {
    id: "health-tracker",
    name: "Health & Wellness Tracker",
    emoji: "🍏",
    pages: [
      {
        id: "workout-log",
        name: "Workout Log",
        emoji: "💪",
      },
      {
        id: "meal-planning",
        name: "Meal Planning",
        emoji: "🥗",
      }
    ]
  },
  {
    id: "project-notes",
    name: "Project Notes",
    emoji: "📝",
    pages: [
      {
        id: "active-projects",
        name: "Active Projects",
        emoji: "🎯",
      },
      {
        id: "archived-projects",
        name: "Archived Projects",
        emoji: "📦",
      }
    ]
  },
]

const listeners = new Set<() => void>()

function generateId() {
  return `page-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Recursively sort pages and their subpages
function sortPagesRecursively(pages: Page[]): Page[] {
  return sortByName(pages).map(page => ({
    ...page,
    pages: page.pages ? sortPagesRecursively(page.pages) : undefined
  }))
}

// Sort workspaces and their pages
function getSortedWorkspaces(): Workspace[] {
  return sortByName(workspaces).map(workspace => ({
    ...workspace,
    pages: sortPagesRecursively(workspace.pages)
  }))
}

// Helper to find and update a workspace or page by ID
function findAndUpdate(items: (Workspace | Page)[], parentId: string, update: (item: Workspace | Page) => void): boolean {
  for (const item of items) {
    if (item.id === parentId) {
      update(item)
      return true
    }
    if (item.pages) {
      if (findAndUpdate(item.pages, parentId, update)) {
        return true
      }
    }
  }
  return false
}

export function useWorkspaces() {
  const [data, setData] = React.useState(getSortedWorkspaces())
  const { setPageTitle } = usePageTitles()
  const { setEmoji } = usePageEmoji(data[0]?.id || '')

  React.useEffect(() => {
    const updateWorkspaces = () => {
      setData(getSortedWorkspaces())
    }
    
    listeners.add(updateWorkspaces)
    return () => {
      listeners.delete(updateWorkspaces)
    }
  }, [])

  const addPage = React.useCallback((parentId?: string) => {
    const newPage = {
      id: generateId(),
      name: "Untitled",
      emoji: "📄",
      pages: []
    }
    
    if (parentId) {
      // Add as a subpage
      findAndUpdate(workspaces, parentId, (parent) => {
        if (!parent.pages) {
          parent.pages = []
        }
        parent.pages.push(newPage)
      })
    } else {
      // Add as a new top-level workspace
      workspaces.push({
        ...newPage,
        pages: []
      })
    }

    // Initialize title and emoji
    setPageTitle(newPage.id, newPage.name)
    setEmoji(newPage.emoji)
    
    // Notify listeners
    listeners.forEach(listener => listener())
    
    return newPage
  }, [setPageTitle, setEmoji])

  return {
    workspaces: data,
    addPage,
  }
}
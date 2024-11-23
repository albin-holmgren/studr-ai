import * as React from "react"
import { usePageTitles } from "./use-page-titles"
import { usePageEmoji } from "./use-page-emoji"

interface Bookmark {
  id: string
  name: string
  emoji: string
  url: string
}

// Store bookmarks in memory
const bookmarks: Bookmark[] = []
const listeners = new Set<() => void>()

export function useBookmarks() {
  const [items, setItems] = React.useState<Bookmark[]>(bookmarks)
  const { getPageTitle } = usePageTitles()
  const { getEmoji } = usePageEmoji()

  // Update bookmarks whenever titles or emojis change
  React.useEffect(() => {
    const updateBookmarks = () => {
      bookmarks.forEach(bookmark => {
        bookmark.name = getPageTitle(bookmark.id, bookmark.name)
        bookmark.emoji = getEmoji(bookmark.id) || bookmark.emoji
      })
      setItems([...bookmarks])
    }
    
    listeners.add(updateBookmarks)
    updateBookmarks() // Initial update
    
    return () => {
      listeners.delete(updateBookmarks)
    }
  }, [getPageTitle, getEmoji])

  const addBookmark = React.useCallback((id: string) => {
    const title = getPageTitle(id, "Untitled")
    const emoji = getEmoji(id) || "📄"
    
    const bookmark: Bookmark = {
      id,
      name: title,
      emoji,
      url: `/pages/${id}`
    }

    const existingIndex = bookmarks.findIndex(b => b.id === id)
    if (existingIndex === -1) {
      bookmarks.push(bookmark)
    } else {
      bookmarks[existingIndex] = bookmark
    }
    
    // Immediately update state
    setItems([...bookmarks])
    // Notify other listeners
    listeners.forEach(listener => listener())
  }, [getPageTitle, getEmoji])

  const removeBookmark = React.useCallback((id: string) => {
    const index = bookmarks.findIndex(b => b.id === id)
    if (index !== -1) {
      bookmarks.splice(index, 1)
      // Immediately update state
      setItems([...bookmarks])
      // Notify other listeners
      listeners.forEach(listener => listener())
    }
  }, [])

  const isBookmarked = React.useCallback((id: string) => {
    return bookmarks.some(b => b.id === id)
  }, [])

  return {
    bookmarks: items,
    addBookmark,
    removeBookmark,
    isBookmarked
  }
}
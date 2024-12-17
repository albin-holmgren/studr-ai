import { useState, useCallback } from 'react'

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([])

  const isBookmarked = useCallback((id: string) => {
    return bookmarks.includes(id)
  }, [bookmarks])

  const addBookmark = useCallback((id: string) => {
    setBookmarks(prev => [...prev, id])
  }, [])

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(bookmarkId => bookmarkId !== id))
  }, [])

  return {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark
  }
}

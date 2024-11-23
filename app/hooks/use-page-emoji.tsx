import * as React from "react"

// Store page emojis in memory
const pageEmojis: Record<string, string> = {}
const listeners = new Set<() => void>()

export function usePageEmoji(id: string) {
  const [emoji, setEmojiState] = React.useState(pageEmojis[id] || "📄")

  React.useEffect(() => {
    const updateEmoji = () => {
      setEmojiState(pageEmojis[id] || "📄")
    }
    
    listeners.add(updateEmoji)
    return () => {
      listeners.delete(updateEmoji)
    }
  }, [id])

  const setEmoji = React.useCallback((newEmoji: string) => {
    pageEmojis[id] = newEmoji
    // Notify all listeners of the emoji change
    listeners.forEach(listener => listener())
  }, [id])

  const getEmoji = React.useCallback((pageId: string) => {
    return pageEmojis[pageId] || "📄"
  }, [])

  return {
    emoji,
    setEmoji,
    getEmoji
  }
}
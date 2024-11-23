import * as React from "react"

// Store page titles in memory
const pageTitles: Record<string, string> = {}
const listeners = new Set<() => void>()

export function usePageTitles() {
  const [titles, setTitles] = React.useState(pageTitles)

  React.useEffect(() => {
    const updateTitles = () => {
      setTitles({...pageTitles})
    }
    
    listeners.add(updateTitles)
    return () => {
      listeners.delete(updateTitles)
    }
  }, [])

  const setPageTitle = React.useCallback((id: string, title: string) => {
    pageTitles[id] = title
    // Notify all listeners of the title change
    listeners.forEach(listener => listener())
  }, [])

  const getPageTitle = React.useCallback((id: string, defaultTitle: string) => {
    return titles[id] || defaultTitle
  }, [titles])

  return {
    setPageTitle,
    getPageTitle
  }
}
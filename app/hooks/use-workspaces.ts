import { useCallback } from 'react'

export function useWorkspaces() {
  const addPage = useCallback((parentId?: string) => {
    // This is a placeholder implementation
    // In a real app, this would create a new page in the database
    const newId = `page-${Date.now()}`
    return { id: newId }
  }, [])

  return {
    addPage
  }
}

import * as React from "react"
import { usePageTitles } from "./use-page-titles"

export function usePageTitle(id: string) {
  const { getPageTitle, setPageTitle } = usePageTitles()
  const title = getPageTitle(id, "Untitled Page")

  return {
    title,
    setTitle: (newTitle: string) => setPageTitle(id, newTitle)
  }
}
"use client"

import * as React from "react"
import { useNavigate } from "@remix-run/react"
import { FileText, Search } from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"

interface SearchCommandProps {
  open: boolean
  setOpen: (open: boolean) => void
  results: Array<{
    id: string
    title: string
    content: string
    workspace: string
    emoji?: string
  }>
  onSearch: (query: string) => void
}

export function SearchCommand({ open, setOpen, results, onSearch }: SearchCommandProps) {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [setOpen, open])

  React.useEffect(() => {
    if (query) {
      onSearch(query)
    }
  }, [query, onSearch])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search notes..."
        value={query}
        onValueChange={setQuery}
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
  )
}
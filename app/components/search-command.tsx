import * as React from "react"
import { useNavigate } from "@remix-run/react"
import { FileText } from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command"
import { useDebouncedCallback } from "use-debounce"

interface SearchCommandProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface SearchResult {
  documents: Array<{
    id: string
    title: string
    emoji: string
    updated_at: string
  }>
}

export function SearchCommand({ open: controlledOpen, onOpenChange }: SearchCommandProps) {
  const navigate = useNavigate()
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult>({
    documents: [],
  })

  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = onOpenChange ?? setUncontrolledOpen

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, setOpen])

  const handleSearch = useDebouncedCallback(async (query: string) => {
    if (!query) {
      setResults({ documents: [] })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin'
      })
      if (response.ok) {
        const data = await response.json()
        setResults(data)
      } else {
        console.error('Search API endpoint returned an error:', response.status)
        setResults({ documents: [] })
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults({ documents: [] })
    } finally {
      setLoading(false)
    }
  }, 300)

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command className="rounded-lg border bg-white">
        <CommandInput 
          placeholder="Type a command or search..."
          onValueChange={handleSearch}
          className="h-11 border-none bg-white px-3"
        />
        <CommandList className="max-h-[300px] overflow-y-auto bg-white p-2">
          <CommandEmpty className="py-6 text-center text-sm">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>Searching...</span>
              </div>
            ) : (
              "No results found."
            )}
          </CommandEmpty>
          
          {results.documents.length > 0 && (
            <CommandGroup heading="Documents">
              {results.documents.map((doc) => (
                <CommandItem
                  key={doc.id}
                  onSelect={() => {
                    navigate(`/documents/${doc.id}`)
                    setOpen(false)
                  }}
                >
                  <span className="mr-2 flex h-4 w-4 items-center justify-center">
                    {doc.emoji || <FileText className="h-4 w-4" />}
                  </span>
                  <span>{doc.title}</span>
                  <CommandShortcut className="text-xs text-muted-foreground">
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem
              onSelect={() => {
                navigate("/documents/new")
                setOpen(false)
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>New Document</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
import * as React from "react"
import { useNavigate } from "@remix-run/react"
import {
  Calendar,
  CreditCard,
  FileText,
  FolderPlus,
  Hash,
  Settings,
  Tags,
  User,
  Folder,
} from "lucide-react"

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
import { DialogTitle } from "~/components/ui/dialog"
import { useDebouncedCallback } from "use-debounce"

interface SearchResult {
  documents: Array<{
    id: string
    title: string
    emoji: string
    updated_at: string
  }>
  workspaces: Array<{
    id: string
    name: string
    emoji: string
  }>
}

export function SearchCommand() {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [results, setResults] = React.useState<SearchResult>({
    documents: [],
    workspaces: [],
  })

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

  const handleSearch = useDebouncedCallback(async (query: string) => {
    if (!query) {
      setResults({ documents: [], workspaces: [] })
      return
    }

    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
    if (response.ok) {
      const data = await response.json()
      setResults(data)
    }
  }, 300)

  const handleCommand = (command: string) => {
    switch (command) {
      case "calendar":
        // Handle calendar action
        break
      case "new-project":
        navigate("/workspaces/new")
        break
      case "new-document":
        navigate("/pages/new")
        break
      case "profile":
        // Open settings dialog with profile section
        break
      case "billing":
        // Open settings dialog with billing section
        break
      case "settings":
        // Open settings dialog
        break
      case "add-tag":
        // Handle tag action
        break
      case "add-label":
        // Handle label action
        break
    }
    setOpen(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Search Commands</DialogTitle>
      <Command className="rounded-lg border shadow-md">
        <CommandInput 
          placeholder="Type a command or search..." 
          onValueChange={handleSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {(results.documents.length > 0 || results.workspaces.length > 0) && (
            <>
              {results.documents.length > 0 && (
                <CommandGroup heading="Documents">
                  {results.documents.map((doc) => (
                    <CommandItem
                      key={doc.id}
                      onSelect={() => {
                        navigate(`/pages/${doc.id}`)
                        setOpen(false)
                      }}
                    >
                      <span className="mr-2 text-lg">{doc.emoji}</span>
                      <span>{doc.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {results.workspaces.length > 0 && (
                <CommandGroup heading="Workspaces">
                  {results.workspaces.map((workspace) => (
                    <CommandItem
                      key={workspace.id}
                      onSelect={() => {
                        navigate(`/workspaces/${workspace.id}`)
                        setOpen(false)
                      }}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      <span>{workspace.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandSeparator />
            </>
          )}
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => handleCommand("calendar")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("new-project")}>
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>New Project</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("new-document")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>New Document</span>
              <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => handleCommand("profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("billing")}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("settings")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleCommand("add-tag")}>
              <Hash className="mr-2 h-4 w-4" />
              <span>Add Tag</span>
              <CommandShortcut>⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleCommand("add-label")}>
              <Tags className="mr-2 h-4 w-4" />
              <span>Add Label</span>
              <CommandShortcut>⌘L</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
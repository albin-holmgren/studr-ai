import * as React from "react"
import { Check, Search } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"

const availableLibraries = [
  {
    id: "ai-research",
    name: "AI Research Papers",
    emoji: "🤖",
    description: "Collection of AI and ML research papers",
  },
  {
    id: "web-dev",
    name: "Web Development Resources",
    emoji: "🌐",
    description: "Frontend and backend development guides",
  },
  {
    id: "ui-design",
    name: "UI Design Patterns",
    emoji: "🎨",
    description: "Common UI/UX design patterns and examples",
  },
]

interface LinkLibraryDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LinkLibraryDialog({ open, onOpenChange }: LinkLibraryDialogProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedLibraries, setSelectedLibraries] = React.useState<string[]>([])

  const filteredLibraries = availableLibraries.filter((library) =>
    library.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleLibrary = (libraryId: string) => {
    setSelectedLibraries((prev) =>
      prev.includes(libraryId)
        ? prev.filter((id) => id !== libraryId)
        : [...prev, libraryId]
    )
  }

  const handleSave = () => {
    // Here you would typically save the selected libraries
    console.log("Linking libraries:", selectedLibraries)
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Link Library</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search libraries..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredLibraries.map((library) => (
              <button
                key={library.id}
                onClick={() => toggleLibrary(library.id)}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                  selectedLibraries.includes(library.id)
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="text-2xl">{library.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{library.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {library.description}
                  </div>
                </div>
                {selectedLibraries.includes(library.id) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Link Selected ({selectedLibraries.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
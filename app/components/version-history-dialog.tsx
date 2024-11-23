import * as React from "react"
import { Check, Clock, RotateCcw } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useToast } from "~/components/ui/use-toast"

interface Version {
  id: string
  timestamp: Date
  author: {
    name: string
    avatar: string
  }
  changes: string[]
}

// Sample version history data
const versions: Version[] = [
  {
    id: "v1",
    timestamp: new Date(2024, 2, 15, 14, 30),
    author: {
      name: "John Doe",
      avatar: "https://github.com/shadcn.png",
    },
    changes: [
      "Updated project documentation",
      "Added new section on deployment",
    ],
  },
  {
    id: "v2",
    timestamp: new Date(2024, 2, 15, 10, 15),
    author: {
      name: "Jane Smith",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    changes: [
      "Fixed typos in introduction",
      "Restructured content hierarchy",
    ],
  },
  {
    id: "v3",
    timestamp: new Date(2024, 2, 14, 16, 45),
    author: {
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    changes: [
      "Initial document creation",
      "Added basic structure and content",
    ],
  },
]

interface VersionHistoryDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function VersionHistoryDialog({ open, onOpenChange }: VersionHistoryDialogProps) {
  const { toast } = useToast()
  const [selectedVersion, setSelectedVersion] = React.useState<string | null>(null)

  const handleRestore = () => {
    if (!selectedVersion) return

    // Here you would implement the actual restore functionality
    toast({
      description: "Version restored successfully",
    })
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-8">
              {versions.map((version) => (
                <div key={version.id} className="relative">
                  <button
                    onClick={() => setSelectedVersion(version.id)}
                    className={`w-full group rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
                      selectedVersion === version.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={version.author.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{version.author.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {version.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      {selectedVersion === version.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>

                    <div className="mt-2 space-y-1">
                      {version.changes.map((change, index) => (
                        <div
                          key={index}
                          className="text-sm text-muted-foreground"
                        >
                          • {change}
                        </div>
                      ))}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRestore}
            disabled={!selectedVersion}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restore Version
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
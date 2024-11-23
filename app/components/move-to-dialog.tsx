import * as React from "react"
import { ChevronRight, FolderTree, Plus } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useWorkspaces } from "~/hooks/use-workspaces"
import { useToast } from "~/components/ui/use-toast"

interface MoveToDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MoveToDialog({ open, onOpenChange }: MoveToDialogProps) {
  const { workspaces, addPage } = useWorkspaces()
  const { toast } = useToast()
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<string | null>(null)

  const handleMove = () => {
    if (!selectedWorkspace) return

    // Here you would implement the actual move functionality
    toast({
      description: "Page moved successfully",
    })
    onOpenChange?.(false)
  }

  const handleCreateWorkspace = () => {
    const newPage = addPage()
    setSelectedWorkspace(newPage.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move to</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace.id)}
                className={`w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                  selectedWorkspace === workspace.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div className="text-2xl">{workspace.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{workspace.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {workspace.pages.length} pages
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleCreateWorkspace}
          >
            <Plus className="h-4 w-4" />
            Create New Workspace
          </Button>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button onClick={handleMove} disabled={!selectedWorkspace}>
              <FolderTree className="mr-2 h-4 w-4" />
              Move
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
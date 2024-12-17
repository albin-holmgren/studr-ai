import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

interface LinkLibraryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LinkLibraryDialog({ open, onOpenChange }: LinkLibraryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link Library</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Library linking interface will be implemented here */}
          <div className="text-muted-foreground">
            Library linking functionality coming soon...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

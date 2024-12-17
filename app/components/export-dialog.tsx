import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Export options will be implemented here */}
          <div className="text-muted-foreground">
            Export functionality coming soon...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

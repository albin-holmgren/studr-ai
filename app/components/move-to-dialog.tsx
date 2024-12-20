import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

interface MoveToDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MoveToDialog({ open, onOpenChange }: MoveToDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Move interface will be implemented here */}
          <div className="text-muted-foreground">
            Move functionality coming soon...
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

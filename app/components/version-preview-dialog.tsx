import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"

interface VersionPreviewDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  version?: {
    title: string
    content: string | null
    emoji: string | null
    createdAt: string
    user: {
      name: string | null
      email: string
    }
  }
}

export function VersionPreviewDialog({
  open,
  onOpenChange,
  version,
}: VersionPreviewDialogProps) {
  if (!version) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span>Version from {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}</span>
              <span className="text-sm text-muted-foreground font-normal">
                by {version.user.name || version.user.email}
              </span>
            </DialogTitle>
            <button
              onClick={() => onOpenChange?.(false)}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{version.emoji}</span>
              <h2 className="text-2xl font-semibold">{version.title}</h2>
            </div>
            <div className="prose prose-sm max-w-none">
              {version.content}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

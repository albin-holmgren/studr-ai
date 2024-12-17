import * as React from "react"
import { useFetcher } from "@remix-run/react"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/utils/cn"

interface VersionHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string
}

interface HistoryEntry {
  id: string
  title: string
  content: string | null
  emoji: string | null
  createdAt: string
}

export function VersionHistoryDialog({ 
  open, 
  onOpenChange,
  documentId 
}: VersionHistoryDialogProps) {
  const fetcher = useFetcher<{ history: HistoryEntry[] }>()
  const [selectedVersion, setSelectedVersion] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open && documentId) {
      fetcher.load(`/api/note/${documentId}/history`)
    }
  }, [open, documentId])

  const handleRestore = (version: HistoryEntry) => {
    const formData = new FormData()
    formData.append("noteId", documentId)
    formData.append("title", version.title)
    if (version.content) {
      formData.append("content", version.content)
    }
    if (version.emoji) {
      formData.append("emoji", version.emoji)
    }

    fetcher.submit(formData, {
      method: "post",
      action: "/api/note/update"
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-5 gap-4 h-[500px]">
          <ScrollArea className="col-span-2 border rounded-md">
            <div className="p-4 space-y-2">
              {fetcher.state === "loading" ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : fetcher.data?.history.map((version) => (
                <button
                  key={version.id}
                  onClick={() => setSelectedVersion(version.id)}
                  className={cn(
                    "w-full p-3 text-left rounded-lg hover:bg-muted",
                    selectedVersion === version.id && "bg-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{version.emoji || "📝"}</span>
                    <span className="font-medium">{version.title}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {format(new Date(version.createdAt), "MMM d, yyyy h:mm a")}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
          <div className="col-span-3 border rounded-md p-4">
            {selectedVersion ? (
              <>
                {fetcher.data?.history.find(v => v.id === selectedVersion)?.content ? (
                  <div className="prose prose-sm max-w-none">
                    {fetcher.data?.history.find(v => v.id === selectedVersion)?.content}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No content in this version</div>
                )}
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => 
                      handleRestore(
                        fetcher.data!.history.find(v => v.id === selectedVersion)!
                      )
                    }
                  >
                    Restore this version
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a version to preview
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

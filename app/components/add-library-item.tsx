import * as React from "react"
import { FileUp, Globe, Upload } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

interface AddLibraryItemProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd?: (item: { type: "file" | "url"; data: File | string }) => void
}

export function AddLibraryItem({ open, onOpenChange, onAdd }: AddLibraryItemProps) {
  const [url, setUrl] = React.useState("")
  const [dragActive, setDragActive] = React.useState(false)
  const inputFileRef = React.useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    onAdd?.({ type: "file", data: file })
    onOpenChange(false)
  }

  const handleUrl = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      onAdd?.({ type: "url", data: url })
      setUrl("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Library</DialogTitle>
          <DialogDescription>
            Add files or URLs to your library for easy access.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">File Upload</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>
          <TabsContent value="file" className="mt-4">
            <div
              className={`relative grid gap-4 ${
                dragActive ? "cursor-copy" : "cursor-pointer"
              }`}
              onClick={() => inputFileRef.current?.click()}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div
                className={`flex min-h-[150px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  dragActive
                    ? "border-primary/50 bg-primary/5"
                    : "border-muted-foreground/25"
                }`}
              >
                <FileUp className="mb-4 h-8 w-8 text-muted-foreground" />
                <p className="mb-2 text-sm font-medium">
                  Drag & drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported file types: PDF, DOC, DOCX, TXT
                </p>
                <input
                  ref={inputFileRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleChange}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="url" className="mt-4">
            <form onSubmit={handleUrl} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      className="pl-8"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                  <Button type="submit">
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Add URL</span>
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
        <Separator />
        <div className="text-xs text-muted-foreground">
          <p>By adding items to the library, you agree to our terms of service.</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
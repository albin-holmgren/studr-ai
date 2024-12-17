import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { Calendar, Clock, FileText, GraduationCap, Upload, X } from "lucide-react"
import { ExternalLink, Loader2, RotateCcw, Eye } from "lucide-react"
import { Text, PenLine, Smile, Target, FileUp } from "lucide-react"
import { useFetcher } from "@remix-run/react"
import { cn } from "~/utils/cn"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs"
import { useToast } from "~/components/ui/use-toast"
import { WorkspaceEmojiPicker } from "./emoji-picker"
import { VersionPreviewDialog } from "~/components/version-preview-dialog"

interface InfoDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  documentId?: string
  documentTitle?: string
  documentEmoji?: string
  documentPurpose?: string
  gradingCriteria?: Array<{
    id: string
    fileName: string
    fileUrl: string
    fileType: string
    createdAt: Date
  }>
  onTitleChange?: (title: string) => void
  onEmojiChange?: (emoji: string) => void
  onPurposeChange?: (purpose: string) => void
  onGradingCriteriaUpload?: (files: FileList) => Promise<void>
  lastEdited?: Date
  createdAt?: Date
  author?: {
    name?: string | null
    email: string
    avatar?: string | null
  }
}

interface HistoryEntry {
  id: string
  title: string
  content: string | null
  emoji: string | null
  changeType: string
  changeSummary: string | null
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export function InfoDialog({ 
  open, 
  onOpenChange,
  documentId,
  documentTitle = "Untitled Document",
  documentEmoji = "📄",
  documentPurpose = "",
  gradingCriteria = [],
  onTitleChange,
  onEmojiChange,
  onPurposeChange,
  onGradingCriteriaUpload,
  lastEdited = new Date(),
  createdAt = new Date(),
  author,
}: InfoDialogProps) {
  const [files, setFiles] = React.useState<File[]>([])
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [localTitle, setLocalTitle] = React.useState(documentTitle)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const titleInputRef = React.useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const { show } = useToast()
  const fetcher = useFetcher<{ history: HistoryEntry[] }>()
  const restoreFetcher = useFetcher()
  const [selectedVersion, setSelectedVersion] = React.useState<HistoryEntry | null>(null)

  React.useEffect(() => {
    setLocalTitle(documentTitle)
  }, [documentTitle])

  React.useEffect(() => {
    if (open && documentId) {
      fetcher.load(`/api/note/${documentId}/history`)
    }
  }, [open, documentId, fetcher])

  React.useEffect(() => {
    if (restoreFetcher.state === "idle" && restoreFetcher.data?.note) {
      show({
        title: "Version restored",
        description: "The document has been restored to the selected version.",
      })
      // Refresh history after restore
      fetcher.load(`/api/note/${documentId}/history`)
    }
  }, [restoreFetcher.state, restoreFetcher.data, documentId, fetcher])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleTitleSubmit = () => {
    setIsEditingTitle(false)
    if (localTitle !== documentTitle) {
      onTitleChange?.(localTitle)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit()
    } else if (e.key === "Escape") {
      setIsEditingTitle(false)
      setLocalTitle(documentTitle)
    }
  }

  React.useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus()
      titleInputRef.current?.select()
    }
  }, [isEditingTitle])

  const timeAgo = (() => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastEdited.getTime()) / 1000 / 60)
    
    if (diffInMinutes < 1) return "just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return lastEdited.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  })()

  const handleFileChangeGradingCriteria = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    
    try {
      setIsUploading(true)
      await onGradingCriteriaUpload?.(e.target.files)
    } catch (error) {
      show({
        title: "Failed to upload grading criteria",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (!files?.length) return

    try {
      setIsUploading(true)
      await onGradingCriteriaUpload?.(files)
    } catch (error) {
      show({
        title: "Failed to upload grading criteria",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case "title_change":
        return <Text className="h-3.5 w-3.5 text-blue-500" />
      case "content_update":
        return <PenLine className="h-3.5 w-3.5 text-green-500" />
      case "emoji_change":
        return <Smile className="h-3.5 w-3.5 text-yellow-500" />
      case "purpose_update":
        return <Target className="h-3.5 w-3.5 text-purple-500" />
      case "grading_criteria_upload":
        return <FileUp className="h-3.5 w-3.5 text-orange-500" />
      default:
        return <Clock className="h-3.5 w-3.5 text-primary" />
    }
  }

  const getChangeSummary = (entry: HistoryEntry) => {
    switch (entry.changeType) {
      case "title_change":
        return `Changed title to "${entry.title}"`
      case "content_update":
        return "Updated document content"
      case "emoji_change":
        return `Changed emoji to ${entry.emoji}`
      case "purpose_update":
        return "Updated document purpose"
      case "grading_criteria_upload":
        return "Uploaded grading criteria"
      default:
        return entry.changeSummary || "Updated document"
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <div className="px-6 py-4 border-b bg-muted/40">
            <DialogHeader>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <WorkspaceEmojiPicker
                    emoji={documentEmoji}
                    onEmojiSelect={onEmojiChange || (() => {})}
                  />
                  {isEditingTitle ? (
                    <Input
                      ref={titleInputRef}
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      onBlur={handleTitleSubmit}
                      onKeyDown={handleTitleKeyDown}
                      className="h-auto border-none bg-transparent p-0 text-xl font-semibold focus-visible:ring-0"
                    />
                  ) : (
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className="text-xl font-semibold"
                    >
                      {localTitle}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Last edited {timeAgo}
                  </span>
                </div>
              </div>
            </DialogHeader>
          </div>

          <Tabs defaultValue="details" className="flex-1">
            <div className="px-6 border-b">
              <TabsList className="h-12 p-0 bg-transparent gap-4">
                <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0 relative h-full rounded-none font-normal data-[state=active]:font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:before:opacity-100">
                  Details
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0 relative h-full rounded-none font-normal data-[state=active]:font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:before:opacity-100">
                  History
                </TabsTrigger>
                <TabsTrigger value="backups" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0 relative h-full rounded-none font-normal data-[state=active]:font-medium before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary before:opacity-0 before:transition-opacity data-[state=active]:before:opacity-100">
                  Backups
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(85vh-15rem)]">
              <TabsContent value="details" className="p-6 m-0 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Author</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={author?.avatar || undefined} />
                          <AvatarFallback>
                            {author?.name?.charAt(0) || author?.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{author?.name || author?.email.split('@')[0]}</div>
                          <div className="text-sm text-muted-foreground">{author?.email}</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {createdAt.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Document Purpose</Label>
                    <textarea
                      className="mt-2 w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      placeholder="Describe the purpose of this document..."
                      value={documentPurpose}
                      onChange={(e) => onPurposeChange?.(e.target.value)}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      This purpose will help AI provide better suggestions to achieve your document goals.
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Grading Criteria</Label>
                  <div className="mt-4 space-y-4">
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer",
                        isDragging ? "border-primary bg-primary/10" : "hover:bg-muted/40",
                        isUploading && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <div className="flex flex-col items-center gap-3">
                        {isUploading ? (
                          <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                        ) : (
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        )}
                        <div className="space-y-1 text-center">
                          <div className="text-base">
                            <span className="font-medium text-primary">Upload Grading Criteria</span>
                            <span className="text-muted-foreground"> or drag and drop</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            PDF, Word, or Text files up to 10MB
                          </p>
                        </div>
                      </div>
                    </div>
                    {gradingCriteria.length > 0 && (
                      <div className="space-y-2">
                        {gradingCriteria.map((criteria) => (
                          <div
                            key={criteria.id}
                            className="flex items-center justify-between p-2 rounded-md border bg-muted/40"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{criteria.fileName}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(criteria.fileUrl, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChangeGradingCriteria}
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Upload your grading criteria to help AI provide suggestions that match your requirements.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="p-6 m-0">
                <div className="space-y-4">
                  {fetcher.state === "loading" ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <div className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </div>
                        <div className="h-3 bg-muted rounded w-20" />
                      </div>
                    ))
                  ) : fetcher.data?.history ? (
                    fetcher.data.history.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          {getChangeIcon(entry.changeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-medium text-sm flex items-center gap-2">
                                {entry.user.name || entry.user.email}
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground font-normal">
                                  {getChangeSummary(entry)}
                                </span>
                              </div>
                              {entry.changeSummary && (
                                <div className="text-sm text-muted-foreground mt-0.5">
                                  {entry.changeSummary}
                                </div>
                              )}
                            </div>
                            <time className="text-sm text-muted-foreground whitespace-nowrap">
                              {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                            </time>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No history available
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="backups" className="p-6 m-0">
                <div className="space-y-4">
                  {fetcher.state === "loading" ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <div className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                        </div>
                        <div className="h-3 bg-muted rounded w-20" />
                      </div>
                    ))
                  ) : fetcher.data?.history ? (
                    fetcher.data.history.map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 group">
                        <div className="p-1.5 rounded-full bg-primary/10">
                          <RotateCcw className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="font-medium text-sm">
                                Version from {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                              </div>
                              <div className="text-sm text-muted-foreground mt-0.5">
                                By {entry.user.name || entry.user.email}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => setSelectedVersion(entry)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Preview
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2"
                                onClick={() => {
                                  const restore = confirm("Are you sure you want to restore this version? This will overwrite your current version.")
                                  if (restore) {
                                    const formData = new FormData()
                                    formData.append("noteId", documentId!)
                                    formData.append("versionId", entry.id)
                                    restoreFetcher.submit(formData, {
                                      method: "POST",
                                      action: `/api/note/${documentId}/restore`,
                                    })
                                  }
                                }}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                Restore
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No backups available
                    </div>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>
      <VersionPreviewDialog
        open={!!selectedVersion}
        onOpenChange={(open) => !open && setSelectedVersion(null)}
        version={selectedVersion}
      />
    </>
  )
}

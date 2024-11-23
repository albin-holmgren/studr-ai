import * as React from "react"
import { Download, Upload, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Label } from "~/components/ui/label"
import { ScrollArea } from "~/components/ui/scroll-area"

interface Score {
  field: string
  score: number
  color: string
}

const scores: Score[] = [
  { field: "Clarity", score: 85, color: "bg-green-500" },
  { field: "Structure", score: 92, color: "bg-blue-500" },
  { field: "Relevance", score: 78, color: "bg-yellow-500" },
  { field: "Innovation", score: 88, color: "bg-purple-500" },
]

interface InfoDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function InfoDialog({ open, onOpenChange }: InfoDialogProps) {
  const [files, setFiles] = React.useState<File[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files))
    }
  }

  const overallScore = Math.round(
    scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Document Information</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(85vh-8rem)] pr-4">
          <div className="space-y-8">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Info</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Project Documentation</div>
                      <div className="text-sm text-muted-foreground">Created by John Doe</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">March 15, 2024</div>
                </div>
              </div>
            </div>

            {/* Purpose Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Purpose</h3>
              <Label>AI Goal</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter the purpose or goal..."
              />
            </div>

            {/* Grading Criteria Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Grading Criteria</h3>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Documents
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />

                {files.length > 0 && (
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-medium mb-2">Uploaded Documents</h4>
                    <ul className="space-y-2">
                      {files.map((file, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-center justify-between"
                        >
                          <span>{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-destructive hover:text-destructive"
                            onClick={() =>
                              setFiles(files.filter((_, i) => i !== index))
                            }
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Scoring Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Overall Score</h3>
              <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 p-6 text-center mb-8">
                <div className="text-6xl font-bold tracking-tighter mb-2">
                  {overallScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Performance Score
                </div>
              </div>

              <div className="space-y-4">
                {scores.map((score) => (
                  <div key={score.field}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{score.field}</span>
                      <span className="font-medium">{score.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${score.color} transition-all duration-500`}
                        style={{ width: `${score.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button className="w-full justify-center">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
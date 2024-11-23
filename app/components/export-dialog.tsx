import * as React from "react"
import {
  FileText,
  FileBarChart2,
  Download,
  GraduationCap,
  MessageSquareQuote,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { useToast } from "~/components/ui/use-toast"

const exportOptions = [
  {
    id: "pdf",
    name: "PDF",
    icon: FileText,
    action: () => "Document exported as PDF"
  },
  {
    id: "word",
    name: "Word Document",
    icon: FileText,
    action: () => "Document exported as Word"
  },
  {
    id: "analysis",
    name: "Analysis Report",
    icon: FileBarChart2,
    action: () => "Analysis report exported"
  },
  {
    id: "grade",
    name: "Grade Report",
    icon: GraduationCap,
    action: () => "Grade report exported"
  },
  {
    id: "argue",
    name: "Argumentation",
    icon: MessageSquareQuote,
    action: () => "Argumentation report exported"
  }
]

interface ExportDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { toast } = useToast()

  const handleExport = async (action: () => string) => {
    try {
      const message = action()
      toast({
        description: message,
      })
      onOpenChange?.(false)
    } catch (error) {
      toast({
        variant: "destructive",
        description: "An error occurred while exporting.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Export As</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {exportOptions.map((option) => {
            const Icon = option.icon
            return (
              <Button
                key={option.id}
                variant="ghost"
                className="w-full justify-between px-2 py-2 h-10"
                onClick={() => handleExport(option.action)}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span>{option.name}</span>
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </Button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
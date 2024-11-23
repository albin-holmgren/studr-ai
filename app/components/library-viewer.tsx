import * as React from "react"
import { FileText } from "lucide-react"

interface LibraryViewerProps {
  item: {
    name: string
    type: "url" | "file"
    content: string
  }
}

export function LibraryViewer({ item }: LibraryViewerProps) {
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [item])

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="rounded-lg border bg-card p-8 text-center shadow-sm">
          <div className="animate-spin text-muted-foreground">
            <FileText className="h-8 w-8" />
          </div>
          <p className="mt-4 font-medium">Loading document...</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Please wait while we prepare your content
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl rounded-lg border bg-card p-8 shadow-sm">
      <div className="prose prose-sm sm:prose-base dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: item.content }} />
      </div>
    </div>
  )
}
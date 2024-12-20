import * as React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "~/lib/utils"
import { UrlPreview } from "~/components/url-preview"

interface DocumentViewerProps {
  url?: string
  fileName?: string
  fileType?: string
  content?: string
  className?: string
  sourceId?: string
}

export function DocumentViewer({
  url,
  fileName,
  fileType,
  content,
  className,
  sourceId,
}: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError("Failed to load document")
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-destructive">
        {error}
      </div>
    )
  }

  // Handle URLs
  if (fileType === "url" && content) {
    let metadata = {}
    try {
      const parsedContent = JSON.parse(content)
      console.log("Parsed URL content:", parsedContent)
      
      // Ensure all fields are properly extracted
      metadata = {
        title: parsedContent.title,
        description: parsedContent.description,
        image: parsedContent.image,
        siteName: parsedContent.siteName,
        type: parsedContent.type,
        url: parsedContent.url,
        content: parsedContent.content,
        author: parsedContent.author,
        publishedTime: parsedContent.publishedTime,
      }
    } catch (error) {
      console.error("Error parsing URL metadata:", error)
    }

    return (
      <div className={cn("p-6", className)}>
        <UrlPreview metadata={metadata} itemId={sourceId!} />
      </div>
    )
  }

  // Handle PDFs
  if (fileType === "application/pdf" && url) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <iframe
          src={`${url}#toolbar=0`}
          className="h-full w-full"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    )
  }

  // Handle images
  if (fileType?.startsWith("image/") && url) {
    return (
      <div className={cn("relative flex h-full items-center justify-center", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        <img
          src={url}
          alt={fileName}
          className="max-h-full w-auto object-contain"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    )
  }

  // For unsupported file types
  return (
    <div className="flex h-full items-center justify-center p-4 text-muted-foreground">
      This file type ({fileType}) cannot be previewed directly.
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-primary hover:underline"
        >
          Download
        </a>
      )}
    </div>
  )
}

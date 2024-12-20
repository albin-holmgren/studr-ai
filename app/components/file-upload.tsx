'use client'

import * as React from "react"
import { useState } from "react"
import { File, Loader2, Upload } from "lucide-react"
import { cn } from "~/lib/utils"

interface FileUploadProps {
  className?: string
  onUpload?: (file: File) => Promise<void>
  maxSize?: number
  accept?: string
}

export function FileUpload({
  className,
  onUpload,
  maxSize = 50 * 1024 * 1024,
  accept = "*/*",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onUpload) return

    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)
      await onUpload(file)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (!file || !onUpload) return

    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    try {
      setIsUploading(true)
      setUploadError(null)
      await onUpload(file)
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError("Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        className
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={accept}
      />
      {isUploading ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Uploading file...
          </p>
        </>
      ) : (
        <>
          <Upload className="h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drop file here or click to select
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Maximum file size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </>
      )}
      {uploadError && (
        <p className="mt-2 text-sm text-destructive">{uploadError}</p>
      )}
    </div>
  )
}

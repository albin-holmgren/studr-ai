import * as React from "react"
import { useState } from "react"
import { Link2 } from "lucide-react"
import { cn } from "~/lib/utils"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"

interface UrlInputProps {
  className?: string
  onSubmit?: (url: string) => Promise<void>
}

export function UrlInput({ className, onSubmit }: UrlInputProps) {
  const [url, setUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim() || !onSubmit) return

    try {
      setIsSubmitting(true)
      setError(null)
      await onSubmit(url.trim())
      setUrl("")
    } catch (error) {
      console.error("URL submission error:", error)
      setError("Failed to add URL. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={cn("w-full max-w-md space-y-2", className)}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL here"
            className="pl-9"
            disabled={isSubmitting}
          />
        </div>
        <Button 
          type="submit" 
          variant="secondary" 
          size="sm"
          disabled={isSubmitting || !url.trim()}
        >
          Add
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  )
}

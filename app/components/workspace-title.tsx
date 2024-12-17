import { useState, useRef, useEffect } from "react"
import { useFetcher } from "@remix-run/react"
import { cn } from "~/lib/utils"
import { WorkspaceEmojiPicker } from "./emoji-picker"

interface WorkspaceTitleProps {
  id: string
  name: string
  emoji: string
  className?: string
}

export function WorkspaceTitle({ id, name, emoji, className }: WorkspaceTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fetcher = useFetcher()
  const optimisticName = fetcher.formData?.get("name") as string
  const optimisticEmoji = fetcher.formData?.get("emoji") as string

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  const handleEmojiSelect = (newEmoji: string) => {
    const formData = new FormData()
    formData.append("workspaceId", id)
    formData.append("name", optimisticName || name)
    formData.append("emoji", newEmoji)
    
    fetcher.submit(formData, {
      method: "post",
      action: "/api/workspace/rename"
    })
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <WorkspaceEmojiPicker
          emoji={optimisticEmoji || emoji}
          onEmojiSelect={handleEmojiSelect}
        />
        <fetcher.Form method="post" action="/api/workspace/rename">
          <input type="hidden" name="workspaceId" value={id} />
          <input type="hidden" name="emoji" value={optimisticEmoji || emoji} />
          <input
            ref={inputRef}
            name="name"
            type="text"
            defaultValue={name}
            onChange={(e) => {
              fetcher.submit(
                e.currentTarget.form,
                { replace: true }
              )
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={cn(
              "bg-transparent border-none p-0 font-medium focus:outline-none focus:ring-0",
              className
            )}
          />
        </fetcher.Form>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <WorkspaceEmojiPicker
        emoji={optimisticEmoji || emoji}
        onEmojiSelect={handleEmojiSelect}
      />
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className={cn(
          "text-left font-medium",
          className
        )}
      >
        {optimisticName || name}
      </button>
    </div>
  )
}

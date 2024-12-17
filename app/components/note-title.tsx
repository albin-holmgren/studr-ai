import { useState, useRef, useEffect } from "react"
import { useFetcher } from "@remix-run/react"
import { cn } from "~/lib/utils"
import { WorkspaceEmojiPicker } from "./emoji-picker"

interface NoteTitleProps {
  id: string
  title: string
  emoji: string
  className?: string
}

export function NoteTitle({ id, title, emoji, className }: NoteTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fetcher = useFetcher()
  const optimisticTitle = fetcher.formData?.get("title") as string
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
    formData.append("noteId", id)
    formData.append("title", optimisticTitle || title)
    formData.append("emoji", newEmoji)
    
    fetcher.submit(formData, {
      method: "post",
      action: "/api/note/rename"
    })
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    const formData = new FormData()
    formData.append("noteId", id)
    formData.append("title", newTitle)
    formData.append("emoji", optimisticEmoji || emoji)
    
    fetcher.submit(formData, {
      method: "post",
      action: "/api/note/rename"
    })
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <WorkspaceEmojiPicker
          emoji={optimisticEmoji || emoji}
          onEmojiSelect={handleEmojiSelect}
        />
        <fetcher.Form method="post" action="/api/note/rename">
          <input type="hidden" name="noteId" value={id} />
          <input type="hidden" name="emoji" value={optimisticEmoji || emoji} />
          <input
            ref={inputRef}
            name="title"
            type="text"
            defaultValue={optimisticTitle || title}
            onChange={handleTitleChange}
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
        {optimisticTitle || title}
      </button>
    </div>
  )
}

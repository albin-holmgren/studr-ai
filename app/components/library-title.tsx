import { useState } from "react"
import { useFetcher } from "@remix-run/react"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

interface LibraryTitleProps {
  id: string
  name: string
  emoji: string
  className?: string
}

export function LibraryTitle({ id, name, emoji, className }: LibraryTitleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(name)
  const fetcher = useFetcher()

  const handleSubmit = () => {
    if (editedName.trim() && editedName !== name) {
      fetcher.submit(
        { libraryId: id, name: editedName },
        { method: "post", action: "/api/library/update" }
      )
    }
    setIsEditing(false)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span>{emoji}</span>
      {isEditing ? (
        <Input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit()
            }
            if (e.key === "Escape") {
              setIsEditing(false)
              setEditedName(name)
            }
          }}
          className="h-auto p-0 text-base shadow-none"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="hover:underline"
        >
          {name}
        </button>
      )}
    </div>
  )
}

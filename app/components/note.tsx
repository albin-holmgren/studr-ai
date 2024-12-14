import { useState } from 'react'
import { TiptapEditor } from './note-editor'

interface NoteProps {
  initialContent?: string
  onSave?: (content: string) => void
}

export function Note({ initialContent = '', onSave }: NoteProps) {
  const [content, setContent] = useState(initialContent)

  const handleChange = (newContent: string) => {
    setContent(newContent)
    onSave?.(newContent)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TiptapEditor
        content={content}
        onChange={handleChange}
        className="min-h-[calc(100vh-6rem)]"
      />
    </div>
  )
}

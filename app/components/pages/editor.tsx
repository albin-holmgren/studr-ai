import * as React from "react"
import { Editor } from "~/components/editor"
import { Layout } from "~/components/layout"
import { usePageTitle } from "~/hooks/use-page-title"
import { usePageEmoji } from "~/hooks/use-page-emoji"

interface PageEditorProps {
  document: {
    id: string
    title: string
    emoji: string
  }
}

export function PageEditor({ document }: PageEditorProps) {
  const { title, setTitle } = usePageTitle(document.id)
  const { emoji, setEmoji } = usePageEmoji(document.id)
  
  return (
    <Layout 
      title={title || document.title} 
      emoji={emoji || document.emoji}
      onTitleChange={setTitle}
      onEmojiChange={setEmoji}
    >
      <Editor title={title || document.title} onTitleChange={setTitle} />
    </Layout>
  )
}
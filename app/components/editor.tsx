import * as React from "react"
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react"

import { AiSuggestions } from "~/components/ai-suggestions"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

const MenuButton = ({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}) => (
  <Button
    variant={isActive ? "secondary" : "ghost"}
    size="sm"
    className="h-7 w-7 p-0"
    onClick={onClick}
  >
    {children}
  </Button>
)

interface EditorProps {
  title?: string
  onTitleChange?: (title: string) => void
}

export function Editor({ title, onTitleChange }: EditorProps) {
  const [showSuggestions, setShowSuggestions] = React.useState(true)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading" && node.attrs.level === 1) {
            return "Untitled"
          }
          return "Start writing..."
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-full min-h-[500px]",
      },
    },
    onUpdate: ({ editor }) => {
      const firstHeading = editor.getJSON().content?.find(
        (node) => node.type === "heading" && node.attrs.level === 1
      )
      if (firstHeading && onTitleChange) {
        const title = firstHeading.content?.[0]?.text || "Untitled"
        onTitleChange(title)
      }
    },
  })

  React.useEffect(() => {
    if (editor && title && !editor.getText().trim()) {
      editor.commands.setContent([
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: title }],
        },
      ])
    }
  }, [editor, title])

  if (!editor) {
    return null
  }

  return (
    <div className="relative flex gap-8">
      <div className="relative min-h-[500px] w-full max-w-2xl border-none sm:mb-[calc(20vh)]">
        {editor && (
          <BubbleMenu
            className={cn(
              "flex w-fit divide-x divide-border overflow-hidden rounded-lg border border-border bg-background shadow-md"
            )}
            tippyOptions={{ duration: 100 }}
            editor={editor}
          >
            <div className="flex items-center gap-1 px-1">
              <MenuButton
                isActive={editor.isActive("heading", { level: 1 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                isActive={editor.isActive("heading", { level: 2 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                isActive={editor.isActive("heading", { level: 3 })}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 className="h-4 w-4" />
              </MenuButton>
            </div>

            <div className="flex items-center gap-1 px-1">
              <MenuButton
                isActive={editor.isActive("bold")}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                isActive={editor.isActive("italic")}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                isActive={editor.isActive("strike")}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Strikethrough className="h-4 w-4" />
              </MenuButton>
            </div>

            <div className="flex items-center gap-1 px-1">
              <MenuButton
                isActive={editor.isActive("bulletList")}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                isActive={editor.isActive("orderedList")}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
              >
                <ListOrdered className="h-4 w-4" />
              </MenuButton>
              <MenuButton
                isActive={editor.isActive("blockquote")}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
              >
                <Quote className="h-4 w-4" />
              </MenuButton>
            </div>
          </BubbleMenu>
        )}
        <EditorContent editor={editor} />
      </div>

      {showSuggestions && (
        <div className="relative hidden w-96 xl:block">
          <div className="fixed right-8 w-96">
            <AiSuggestions content={editor.getText()} />
          </div>
        </div>
      )}
    </div>
  )
}
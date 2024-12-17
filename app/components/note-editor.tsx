import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlock from '@tiptap/extension-code-block'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import ListItem from '@tiptap/extension-list-item'
import Underline from '@tiptap/extension-underline'
import { useFetcher } from '@remix-run/react'
import { cn } from '~/lib/utils'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListTodo,
  Quote,
  ImageIcon,
  Link as LinkIcon,
  Minus,
} from 'lucide-react'
import { EditorToolbar } from './editor-toolbar'

interface MenuButtonProps {
  onClick: () => void
  isActive?: boolean
  children: React.ReactNode
}

const MenuButton = ({ onClick, isActive, children }: MenuButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      'p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg',
      isActive && 'bg-gray-100 text-gray-900'
    )}
  >
    {children}
  </button>
)

interface FloatingMenuItemProps {
  onClick: () => void
  isActive: boolean
  icon: any
  label: string
}

const FloatingMenuItem = ({ onClick, isActive, icon: Icon, label }: FloatingMenuItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 w-48 p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg',
      isActive && 'bg-gray-100 text-gray-900'
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
)

interface TiptapEditorProps {
  content?: string
  onChange?: (content: string) => void
  className?: string
}

export function TiptapEditor({ content = '', onChange, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      ListItem,
      Underline,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: 'list-disc list-outside leading-3 -mt-2',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal list-outside leading-3 -mt-2',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-2',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'flex items-start my-4',
        },
      }),
      CodeBlock,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily,
      Highlight,
      Image,
      Link,
      HorizontalRule,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <EditorToolbar editor={editor} className="border-b" />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="h-full px-4 py-4">
          <EditorContent editor={editor} className="h-full" />
        </div>
      </div>
    </div>
  )
}

interface NoteEditorProps {
  initialContent?: string
  noteId: string
  className?: string
}

export function NoteEditor({ initialContent = '', noteId, className }: NoteEditorProps) {
  const [content, setContent] = React.useState(initialContent)
  const fetcher = useFetcher()

  const handleChange = (newContent: string) => {
    setContent(newContent)
    
    // Debounce the API call
    const formData = new FormData()
    formData.append('noteId', noteId)
    formData.append('content', newContent)
    
    fetcher.submit(formData, {
      method: 'post',
      action: '/api/note/update'
    })
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <TiptapEditor 
        content={content} 
        onChange={handleChange}
      />
    </div>
  )
}

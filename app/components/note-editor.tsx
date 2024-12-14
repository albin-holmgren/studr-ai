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
        nested: true,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'rounded-md bg-gray-200 p-5 font-mono font-medium text-gray-900',
        },
      }),
      Typography,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      HorizontalRule,
      Placeholder.configure({
        placeholder: 'Press "/" for commands...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-full',
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
    <div className={cn('flex flex-col gap-2', className)}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="prose max-w-none" />
    </div>
  )
}

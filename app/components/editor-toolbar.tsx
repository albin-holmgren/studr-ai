import { Editor } from '@tiptap/react'
import { Toolbar } from './ui/Toolbar'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Code2,
  Clock,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { AIDropdown } from './menus/TextMenu/components/AIDropdown'

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <Toolbar className="border rounded-md bg-white shadow-sm">
      <div className="flex items-center gap-1 px-1.5 py-1">
        <Toolbar.Button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(editor.isActive('bold') && 'bg-muted')}
          aria-label="Bold"
        >
          <Bold className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(editor.isActive('italic') && 'bg-muted')}
          aria-label="Italic"
        >
          <Italic className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(editor.isActive('underline') && 'bg-muted')}
          aria-label="Underline"
        >
          <Underline className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(editor.isActive('strike') && 'bg-muted')}
          aria-label="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={cn(editor.isActive('code') && 'bg-muted')}
          aria-label="Code"
        >
          <Code className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button
          onClick={() => {
            const url = window.prompt('Enter link URL')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={cn(editor.isActive('link') && 'bg-muted')}
          aria-label="Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={cn(editor.isActive('codeBlock') && 'bg-muted')}
          aria-label="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button
          onClick={() => {/* TODO: Add history button functionality */}}
          aria-label="History"
        >
          <Clock className="h-4 w-4" />
        </Toolbar.Button>
        <Toolbar.Button
          onClick={() => {/* TODO: Add more options functionality */}}
          aria-label="More Options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Toolbar.Button>
        <div className="w-px h-6 bg-border mx-1" />
        <AIDropdown editor={editor} />
      </div>
    </Toolbar>
  )
}

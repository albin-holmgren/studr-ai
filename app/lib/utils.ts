import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Editor } from '@tiptap/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '')       // Trim - from end of text
}

export function isTextSelected(editor: Editor): boolean {
  const { empty, content } = editor.state.selection
  return !empty && content().content.size > 0
}

export function isCustomNodeSelected(editor: Editor): boolean {
  const { empty, content } = editor.state.selection
  return !empty && content().content.size === 1 && !content().content.firstChild?.isText
}

// This is a dummy file, to make the project work without the AI extension.
import { Extension } from '@tiptap/core'

export type AiStorage = {
  isProcessing: boolean
}

export type Language = string

export const tryParseToTiptapHTML = (text: string) => {
  // Simple text content for now, you can enhance this to handle HTML if needed
  return text
}

export const Ai = Extension.create<AiStorage>({
  name: 'ai',

  addStorage() {
    return {
      isProcessing: false,
    }
  },

  addCommands() {
    return {
      aiProcess:
        (action: string, param?: string) =>
        ({ editor, state, dispatch }) => {
          const { from, to } = state.selection
          const text = state.doc.textBetween(from, to, ' ')

          if (!text) return false

          this.storage.isProcessing = true
          editor.setMeta('aiProcessing', true)

          fetch('/api/ai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              action,
              param,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.text) {
                editor
                  .chain()
                  .focus()
                  .deleteSelection()
                  .insertContent(data.text)
                  .run()
              }
            })
            .catch((error) => {
              console.error('Error processing AI request:', error)
            })
            .finally(() => {
              this.storage.isProcessing = false
              editor.setMeta('aiProcessing', false)
            })

          return true
        },
    }
  },
})

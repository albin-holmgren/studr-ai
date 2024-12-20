import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'
import { Button } from './ui/button'

interface EditorProps {
  content?: string
}

export function Editor({ content = '<p>Start writing...</p>' }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
      },
    },
  })

  const generateWithAI = async () => {
    if (!editor) return

    const currentContent = editor.getText()
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Continue writing the following text:\n\n${currentContent}`,
        }),
      })

      const data = await response.json()
      if (data.text) {
        editor.commands.insertContent(data.text)
      }
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="w-full">
      <div className="border rounded-lg p-4">
        <EditorContent editor={editor} />
      </div>
      <div className="mt-4">
        <Button
          onClick={generateWithAI}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isGenerating ? 'Generating...' : 'Continue with AI'}
        </Button>
      </div>
    </div>
  )
}

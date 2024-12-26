import { EditorContent } from '@tiptap/react'
import React, { useEffect, useRef, useState } from 'react'

// import '@/styles/index.css'
import '~/styles/index.css'
import { TextMenu } from '../menus/TextMenu'
import { ContentItemMenu } from '../menus/ContentItemMenu'
import * as Y from 'yjs'
import { TiptapCollabProvider } from '@hocuspocus/provider'
import { useBlockEditor } from '~/new-hooks/useBlockEditor'
import { TableColumnMenu, TableRowMenu } from '~/extensions/Table/menus'
import ImageBlockMenu from '~/extensions/ImageBlock/components/ImageBlockMenu'
import { useSidebar } from '~/new-hooks/useSidebar'
import { Sidebar } from '../Sidebar'
import { LinkMenu } from '../menus'
import { ColumnsMenu } from '~/extensions/MultiColumn/menus'
import { useParams } from '@remix-run/react'
import { Suggestions } from '../suggestions'

export const BlockEditor = ({
  aiToken,
  ydoc,
  provider,
}: {
  aiToken?: string
  ydoc: Y.Doc | null
  provider?: TiptapCollabProvider | null | undefined
}) => {
  const menuContainerRef = useRef(null)

  const leftSidebar = useSidebar();
  const { editor, users, collabState } = useBlockEditor({
    aiToken,
    ydoc,
    provider,
  });
  const { noteId } = useParams<{ noteId: string }>();
  const [newContent, setNewContent] = useState<string | undefined>();

  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        const content = editor.getJSON();
        const newcontent = content?.content?.[0].content?.[0].text;
        setNewContent(newcontent);
      };
      editor.on("update", handleUpdate);
      return () => {
        editor.off("update", handleUpdate);
      };
    }
  }, [editor]);
  if (!editor || !users) {
    return null;
  }

  return (
    <div className="flex h-full" ref={menuContainerRef}>
      <Sidebar isOpen={leftSidebar.isOpen} onClose={leftSidebar.close} editor={editor} />
      <div className="relative flex flex-col flex-1 h-full overflow-hidden">
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
        <ContentItemMenu editor={editor} />
        <LinkMenu editor={editor} appendTo={menuContainerRef} />
        <TextMenu editor={editor} />
        <ColumnsMenu editor={editor} appendTo={menuContainerRef} />
        <TableRowMenu editor={editor} appendTo={menuContainerRef} />
        <TableColumnMenu editor={editor} appendTo={menuContainerRef} />
        <ImageBlockMenu editor={editor} appendTo={menuContainerRef} />
      </div>
      <Suggestions
        noteId={noteId || ""}
        content={newContent || ""}
        className="w-80 shrink-0"
      />
    </div>
  )
}

export default BlockEditor

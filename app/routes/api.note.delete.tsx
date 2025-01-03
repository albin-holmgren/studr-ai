import { json } from '@remix-run/node';
import { prisma } from '~/lib/prisma.server';

export let action = async ({ request }: { request: Request }) => {
  const formData = new URLSearchParams(await request.text());
  const noteId = formData.get('noteId');

  if (!noteId) {
    return json({ error: 'Note ID is required' }, { status: 400 });
  }

  try {
    const noteToDelete = await prisma.note.findUnique({
      where: { id: noteId },
      select: { title: true },
    });

    if (!noteToDelete) {
      return json({ error: 'Note not found' }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id: noteId },
    });

    return json({
      message: `The note "${noteToDelete.title}" has been deleted.`,
      noteId,
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return json({ error: 'Failed to delete note' }, { status: 500 });
  }
};
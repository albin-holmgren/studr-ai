import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { db } from "~/lib/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const env = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  };

  const response = new Response();
  const supabase = createServerClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    request,
    response,
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const noteId = formData.get("noteId") as string;

  if (!noteId) {
    return json({ error: "Note ID is required" }, { status: 400 });
  }

  try {
    // Verify the note belongs to the user
    const note = await db.note.findFirst({
      where: {
        id: noteId,
        userId: session.user.id,
      },
    });

    if (!note) {
      return json({ error: "Note not found" }, { status: 404 });
    }

    // Restore the note
    await db.note.update({
      where: {
        id: noteId,
      },
      data: {
        archived: false,
      },
    });

    // Get updated list of archived notes
    const archivedNotes = await db.note.findMany({
      where: {
        userId: session.user.id,
        archived: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return json({ success: true, notes: archivedNotes });
  } catch (error) {
    console.error("Error restoring note:", error);
    return json(
      { error: "Failed to restore note" },
      { status: 500 }
    );
  }
}

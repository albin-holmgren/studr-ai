import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { createServerClient } from "@supabase/auth-helpers-remix";
import { db } from "~/lib/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
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

  try {
    const notes = await db.note.findMany({
      where: {
        userId: session.user.id,
        archived: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return json({ notes });
  } catch (error) {
    console.error("Error fetching archived notes:", error);
    return json(
      { error: "Failed to fetch archived notes" },
      { status: 500 }
    );
  }
}

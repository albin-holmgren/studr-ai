import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { db } from "~/lib/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return json({ results: [] });
  }

  const results = await db.note.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      content: true,
      workspace: {
        select: {
          name: true,
        },
      },
    },
    take: 5,
  });

  return json({
    results: results.map((result) => ({
      id: result.id,
      title: result.title,
      content: result.content,
      workspace: result.workspace.name,
    })),
  });
}

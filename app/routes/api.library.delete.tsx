import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const response = new Response()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Response("Unauthorized", { status: 401 })
  }

  const formData = await request.formData()
  const libraryId = formData.get("libraryId") as string

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }

  // Delete all items in the library first
  await db.libraryItem.deleteMany({
    where: {
      libraryId,
      userId: user.id,
    },
  })

  // Then delete the library itself
  await db.library.delete({
    where: {
      id: libraryId,
      userId: user.id,
    },
  })

  return json({ success: true }, {
    headers: response.headers,
  })
}

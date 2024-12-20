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
  const name = formData.get("name") as string
  const emoji = formData.get("emoji") as string | undefined

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }

  const library = await db.library.update({
    where: {
      id: libraryId,
      userId: user.id,
    },
    data: {
      name,
      ...(emoji && { emoji }),
    },
  })

  return json(library, {
    headers: response.headers,
  })
}

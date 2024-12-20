import { json, type ActionFunctionArgs } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { writeAsyncIterableToWritable } from "@remix-run/node"

async function streamToBuffer(stream: ReadableStream) {
  const chunks = []
  const reader = stream.getReader()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  
  return Buffer.concat(chunks)
}

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

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }

  const formData = await request.formData()
  const sourceId = formData.get("sourceId") as string
  const file = formData.get("file") as File
  
  if (!file) {
    throw new Response("No file uploaded", { status: 400 })
  }

  try {
    const buffer = await streamToBuffer(file.stream())
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from("library-files")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw new Response("Failed to upload file", { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from("library-files")
      .getPublicUrl(filePath)

    const source = await db.libraryItem.update({
      where: {
        id: sourceId,
        userId: user.id,
      },
      data: {
        fileUrl: publicUrl,
        fileName: file.name,
        fileType: file.type,
        updatedAt: new Date(),
      },
    })

    return json(source, {
      headers: response.headers,
    })
  } catch (error) {
    console.error("Error processing file:", error)
    throw new Response("Failed to process file", { status: 500 })
  }
}

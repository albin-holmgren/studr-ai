import { ActionFunctionArgs, json } from "@remix-run/node"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { supabaseAdmin } from "~/lib/supabase.server"

export async function action({ request, params }: ActionFunctionArgs) {
  const { noteId } = params
  if (!noteId) {
    return json({ error: "Note ID is required" }, { status: 400 })
  }

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
    return json({ error: "Unauthorized" }, { status: 401 })
  }

  const note = await db.note.findFirst({
    where: {
      id: noteId,
      userId: session.user.id,
    },
  })

  if (!note) {
    return json({ error: "Note not found" }, { status: 404 })
  }

  const formData = await request.formData()
  const files = formData.getAll("files") as File[]

  if (!files || files.length === 0) {
    return json({ error: "No files provided" }, { status: 400 })
  }

  try {
    const uploadPromises = files.map(async (file) => {
      const fileName = file.name
      const fileType = file.type
      const buffer = Buffer.from(await file.arrayBuffer())

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("grading-criteria")
        .upload(`${noteId}/${fileName}`, buffer, {
          contentType: fileType,
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: urlData } = await supabaseAdmin.storage
        .from("grading-criteria")
        .getPublicUrl(`${noteId}/${fileName}`)

      const gradingCriteria = await db.gradingCriteria.create({
        data: {
          fileName,
          fileType,
          fileUrl: urlData.publicUrl,
          noteId,
        },
      })

      return gradingCriteria
    })

    const results = await Promise.all(uploadPromises)
    return json({ success: true, gradingCriteria: results })
  } catch (error) {
    console.error("Error uploading files:", error)
    return json(
      { error: "Failed to upload files" },
      { status: 500 }
    )
  }
}

export default function GradingCriteriaUpload() {
  return null
}

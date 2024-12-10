import { json, redirect, type ActionFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { requireAuth } from "~/lib/auth.server"
import { prisma } from "~/lib/db.server"
import { nanoid } from "nanoid"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Layout } from "~/components/layout"

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await requireAuth(request)
  const formData = await request.formData()
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const parentId = formData.get("parentId") as string | null

  if (!title?.trim()) {
    return json({ error: "Title is required" }, { status: 400 })
  }

  try {
    const documentId = nanoid()
    const document = await prisma.document.create({
      data: {
        id: documentId,
        title,
        content: content ? JSON.parse(content) : {},
        userId: session.user.id,
        emoji: "📄",
        parentId: parentId && parentId !== "" ? parentId : null,
        isDeleted: false,
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        emoji: true,
        parentId: true,
      },
    })

    return json({ document })
  } catch (error) {
    console.error("Error creating document:", error)
    return json({ error: "Failed to create document" }, { status: 500 })
  }
}

export default function NewDocument() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === "submitting"

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-8">Create New Document</h1>
        <Form method="post" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Untitled"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <textarea
              id="content"
              name="content"
              className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Start writing..."
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Document"}
          </Button>
          {actionData?.error && (
            <p className="text-sm text-red-600">{actionData.error}</p>
          )}
        </Form>
      </div>
    </Layout>
  )
}

import * as React from "react"
import { json, redirect, type LoaderFunction, type ActionFunction } from "@remix-run/node"
import { useLoaderData, useNavigate, Form, useParams, useFetcher } from "@remix-run/react"
import { requireAuth } from "~/lib/auth.server"
import { prisma } from "~/lib/db.server"
import { Button } from "~/components/ui/button"
import { Layout } from "~/components/layout"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { DocumentTree } from "~/components/document-tree"
import { Editor } from "~/components/editor"
import { EmojiPicker } from "~/components/emoji-picker"
import type { User } from "~/lib/types";

interface LoaderData {
  error?: string;
  document?: {
    id: string;
    title: string;
    content: any;
    emoji: string;
    isStarred: boolean;
    isArchived: boolean;
    isDeleted: boolean;
    tags: string[];
    userId: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  user?: User;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const { session } = await requireAuth(request);
    const { id } = params;

    if (!id) {
      throw redirect("/documents");
    }

    const dbUser = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        notificationSettings: true,
        subscription: true
      }
    });

    if (!dbUser) {
      throw new Error("User not found");
    }

    const user: User = {
      id: dbUser.id,
      name: dbUser.name || "Anonymous User",
      email: dbUser.email,
      avatar: dbUser.avatarUrl,
      notificationSettings: dbUser.notificationSettings ? {
        emailNotifications: dbUser.notificationSettings.emailNotifications,
        studyReminders: dbUser.notificationSettings.studyReminders,
        marketingEmails: dbUser.notificationSettings.marketingEmails
      } : null,
      subscription: dbUser.subscription ? {
        plan: dbUser.subscription.plan,
        status: dbUser.subscription.status
      } : null
    };

    const document = await prisma.document.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        children: true,
      },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    return json({ document, user });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Error loading document:", error);
    return json({ error: "Failed to load document" }, { status: 500 });
  }
}

export const action: ActionFunction = async ({ request, params }: { request: any, params: any }) => {
  const { session } = await requireAuth(request)
  const { id } = params
  const formData = await request.formData()
  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const emoji = formData.get("emoji") as string
  const _action = formData.get("_action")

  if (_action === "delete") {
    await prisma.document.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        isArchived: true,
      },
    })

    return redirect("/")
  }

  if (!title?.trim()) {
    return json({ error: "Title is required" }, { status: 400 })
  }

  await prisma.document.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      title,
      content: content ? JSON.parse(content) : null,
      emoji,
    },
  })

  return json({ success: true })
}

export default function Document() {
  const { error, document, user } = useLoaderData<LoaderData>()
  const navigate = useNavigate()
  const params = useParams()
  const updateFetcher = useFetcher()
  const [localTitle, setLocalTitle] = React.useState(document?.title || "")
  const [localEmoji, setLocalEmoji] = React.useState(document?.emoji || "📄")

  // Update document when title or emoji changes
  const updateDocument = React.useCallback(
    (updates: { title?: string; emoji?: string }) => {
      if (!document) return

      const formData = new FormData()
      formData.append("documentId", document.id)
      if (updates.title) formData.append("title", updates.title)
      if (updates.emoji) formData.append("emoji", updates.emoji)

      updateFetcher.submit(formData, {
        method: "post",
        action: "/api/documents/update",
      })
    },
    [document, updateFetcher]
  )

  // If there's an error, show the error state
  if (error) {
    return (
      <Layout user={user}>
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-destructive">{error}</h1>
            <p className="mb-8 text-muted-foreground">
              The document you're looking for could not be found or you don't have access to it.
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!document) {
    return null
  }

  return (
    <Layout 
      user={user}
      onTitleChange={(title) => {
        setLocalTitle(title)
        updateDocument({ title })
      }}
      onEmojiChange={(emoji) => {
        setLocalEmoji(emoji)
        updateDocument({ emoji })
      }}
    >
      <div className="flex h-full flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-4">
            <EmojiPicker
              emoji={localEmoji}
              onEmojiSelect={(emoji) => {
                setLocalEmoji(emoji)
                updateDocument({ emoji })
              }}
            />
            <h1 className="text-xl font-semibold">{localTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Form method="post">
              <input type="hidden" name="action" value="delete" />
              <Button variant="destructive" size="sm" type="submit">
                Delete
              </Button>
            </Form>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <Editor
            title={localTitle}
            content={document.content}
            onTitleChange={(title) => {
              setLocalTitle(title)
              updateDocument({ title })
            }}
          />
        </div>
      </div>
    </Layout>
  )
}

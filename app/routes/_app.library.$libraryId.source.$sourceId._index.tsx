import React, { useEffect, useState, useCallback } from 'react';
import { usePageTitle } from '~/components/page-title-context';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '~/components/ui/breadcrumb';
import { NavActions } from '~/components/nav-actions';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link, useFetcher, useNavigate } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { FileUpload } from "~/components/file-upload"
import { DocumentViewer } from "~/components/document-viewer"
import { UrlInput } from "~/components/url-input"
import { File, Upload } from "lucide-react"
import { Button } from "~/components/ui/button";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { sourceId, libraryId } = params
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
    include: {
      libraries: {
        include: {
          items: true
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }

  const source = await db.libraryItem.findFirst({
    where: {
      id: sourceId,
      libraryId: libraryId,
      userId: user.id,
    },
    include: {
      library: true
    }
  })

  if (!source) {
    throw new Response("Source not found", { status: 404 })
  }

  return json({
    source,
    libraries: user.libraries,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }
  }, { headers: response.headers })
}

export default function SourcePage() {
  const { source } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = React.useRef(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (fetcher.state !== "idle") {
      console.log("Fetcher state:", fetcher.state)
      console.log("Fetcher data:", fetcher.data)
    }

    if (fetcher.state === "idle" && fetcher.data) {
      navigate(".", { replace: true })
    }
  }, [fetcher.state, fetcher.data, navigate])

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("sourceId", source.id)

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/library/source/upload",
      encType: "multipart/form-data",
    })
  }

  const handleUrlSubmit = async (url: string) => {
    console.log("Submitting URL:", url)
    const formData = new FormData()
    formData.append("url", url)
    formData.append("sourceId", source.id)
    console.log("Source ID:", source.id)

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/library/source/url",
      encType: "multipart/form-data",
    })
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current += 1
    if (dragCounter.current === 1) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await handleFileUpload(file)
  }, [handleFileUpload])

  return (
    <div
      className="flex-1 flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-background/60">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <Upload className="h-12 w-12 text-primary animate-pulse" />
              <p className="mt-2 text-lg font-medium">Drop to upload</p>
            </div>
          </div>
        </div>
      )}

      {source.fileUrl || source.fileType === "url" ? (
        <div className="flex-1 flex flex-col">
          <div className="flex h-12 items-center justify-end px-4">
            {source.fileUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(source.fileUrl, "_blank")}
              >
                Open in New Tab
              </Button>
            )}
          </div>
          
          <div className="flex-1">
            <DocumentViewer
              url={source.fileUrl}
              fileName={source.fileName || ""}
              fileType={source.fileType || ""}
              content={source.content || ""}
              sourceId={source.id}
              className="h-full"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <FileUpload
            onUpload={handleFileUpload}
            maxSize={50 * 1024 * 1024}
            accept="application/pdf,image/*"
          />
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or add url</span>
            </div>
          </div>
          <UrlInput onSubmit={handleUrlSubmit} />
        </div>
      )}
    </div>
  )
}

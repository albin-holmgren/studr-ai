import React, { useState, useCallback, useEffect } from 'react';
import { json, type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData, Link, useFetcher, useNavigate } from "@remix-run/react"
import { createServerClient } from "@supabase/auth-helpers-remix"
import { db } from "~/lib/db.server"
import { usePageTitle } from "~/components/page-title-context"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import { NavActions } from "~/components/nav-actions"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { formatDistanceToNow } from "date-fns"
import { LibraryTitle } from "~/components/library-title"
import { FileUpload } from "~/components/file-upload"
import { DocumentViewer } from "~/components/document-viewer"
import { UrlInput } from "~/components/url-input"
import { File, Upload, Globe, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { libraryId } = params
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

  const library = await db.library.findFirst({
    where: {
      id: libraryId,
      userId: user.id,
    },
    include: {
      items: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!library) {
    throw new Response("Library not found", { status: 404 })
  }

  return json({ 
    library,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    }
  })
}

export default function LibraryPage() {
  const { library } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = React.useRef(0)

  // Set the page title
  const { setTitle } = usePageTitle()
  React.useEffect(() => {
    setTitle(library.name)
  }, [library.name, setTitle])

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
    formData.append("libraryId", library.id)

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/library/item/upload",
      encType: "multipart/form-data",
    })
  }

  const handleUrlSubmit = async (url: string) => {
    console.log("Submitting URL:", url)
    const formData = new FormData()
    formData.append("url", url)
    formData.append("libraryId", library.id)
    console.log("Library ID:", library.id)

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/library/item/url",
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

      <div className="flex-1 flex flex-col">
        <div className="flex h-12 items-center justify-between px-4 border-b">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <LibraryTitle library={library} />
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <UrlInput libraryId={library.id} onSubmit={handleUrlSubmit} />
            <FileUpload libraryId={library.id} onUpload={handleFileUpload} />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const formData = new FormData()
                formData.append("libraryId", library.id)
                formData.append("type", "note")
                fetcher.submit(formData, {
                  method: "post",
                  action: "/api/library/item/create"
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
            <NavActions />
          </div>
        </div>

        <div className="flex-1">
          {library.items.length > 0 ? (
            <div className="space-y-1 p-4">
              {library.items.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/library/${library.id}/${item.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 group">
                    <div className="flex-shrink-0 text-muted-foreground">
                      {item.fileType === "url" ? (
                        <Globe className="h-5 w-5" />
                      ) : item.fileType ? (
                        <File className="h-5 w-5" />
                      ) : (
                        <File className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate group-hover:text-primary">
                        {item.title || "Untitled"}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                        {item.fileType === "url" && item.fileUrl && (
                          <>
                            <span>•</span>
                            <span className="truncate">{new URL(item.fileUrl).hostname.replace(/^www\./, '')}</span>
                          </>
                        )}
                        {item.fileType && item.fileType !== "url" && item.fileName && (
                          <>
                            <span>•</span>
                            <span className="truncate">{item.fileName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {item.fileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.preventDefault()
                          window.open(item.fileUrl, "_blank")
                        }}
                      >
                        Open in New Tab
                      </Button>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Upload className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No items yet</p>
              <p className="mt-1 text-sm">Drop files here or use the buttons above to add content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

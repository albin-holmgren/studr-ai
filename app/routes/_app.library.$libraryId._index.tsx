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
        <div className="flex h-12 items-center px-4 border-b">
          <SidebarTrigger />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg font-medium">Sources</h1>
            <Button
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
              Add source
            </Button>
          </div>

          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sm:pl-6">
                      Emoji
                    </th>
                    <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="relative py-3 pl-3 pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {library.items.length > 0 ? (
                    library.items.map((item) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-muted/30 cursor-pointer" 
                        onClick={() => navigate(`/library/${library.id}/${item.id}`)}
                      >
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="text-base">
                            {item.emoji || "📄"}
                          </div>
                        </td>
                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="text-muted-foreground">
                              {item.fileType === "url" ? (
                                <Globe className="h-3.5 w-3.5" />
                              ) : (
                                <File className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div className="font-medium">{item.title || "Untitled"}</div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-muted-foreground">
                          {item.fileType || "Note"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </td>
                        <td className="relative whitespace-nowrap py-3 pl-3 pr-6 text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation() // Prevent row click when clicking delete
                              const formData = new FormData()
                              formData.append("itemId", item.id)
                              fetcher.submit(formData, {
                                method: "post",
                                action: "/api/library/item/delete"
                              })
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No sources yet</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

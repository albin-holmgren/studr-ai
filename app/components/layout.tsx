import * as React from "react"
import { AppSidebar } from "~/components/app-sidebar"
import { EmojiPicker } from "~/components/emoji-picker"
import { NavActions } from "~/components/nav-actions"
import {
  Breadcrumb,
  BreadcrumbInput,
  BreadcrumbItem,
  BreadcrumbList,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"

interface LayoutProps {
  children: React.ReactNode
  title?: string
  emoji?: string
  onTitleChange?: (title: string) => void
  onEmojiChange?: (emoji: string) => void
  minimal?: boolean
}

export function Layout({ 
  children, 
  title, 
  emoji = "📄",
  onTitleChange, 
  onEmojiChange,
  minimal = false 
}: LayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar onPageTitleChange={onTitleChange} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center">
          {minimal ? (
            <div className="px-3">
              <SidebarTrigger />
            </div>
          ) : (
            <>
              <div className="flex flex-1 items-center gap-2 px-3">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="flex items-center gap-2">
                      <EmojiPicker value={emoji} onChange={onEmojiChange} />
                      <BreadcrumbInput 
                        value={title} 
                        onChange={onTitleChange}
                      />
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="ml-auto px-3">
                <NavActions />
              </div>
            </>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-4 px-4 py-10">
          <div className="mx-auto w-full max-w-3xl">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
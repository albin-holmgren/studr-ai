import * as React from "react"
import { AppSidebar } from "./app-sidebar"
import { EmojiPicker } from "./emoji-picker"
import { NavActions } from "./nav-actions"
import { Toaster } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbInput,
} from "./ui/breadcrumb"
import { Separator } from "./ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar"
import { TokenUsage } from "./token-usage"

interface LayoutProps {
  children: React.ReactNode
  onTitleChange?: (title: string) => void
  onEmojiChange?: (emoji: string) => void
  minimal?: boolean
  user?: {
    id: string
    name: string
    email: string
    avatar?: string | null
    subscription: any
  }
}

export function Layout({
  children,
  onTitleChange,
  onEmojiChange,
  minimal = false,
  user,
}: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="grid h-screen w-full grid-cols-[16rem,1fr]">
        <AppSidebar user={user} onPageTitleChange={onTitleChange} />
        <SidebarInset className="w-full">
          <div className="flex h-full w-full flex-col">
            {!minimal && (
              <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="flex items-center gap-2">
                    <EmojiPicker emoji={undefined} onEmojiSelect={onEmojiChange} />
                    <Separator orientation="vertical" className="h-6" />
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbInput
                            value=""
                            onChange={onTitleChange}
                            placeholder="Untitled"
                          />
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </div>
                <NavActions />
              </header>
            )}
            {minimal && (
              <div className="absolute left-4 top-4 z-10">
                <SidebarTrigger />
              </div>
            )}
            <main className="flex-1 overflow-auto">
              <div className="mx-auto w-full max-w-[1200px] px-8 py-8">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}
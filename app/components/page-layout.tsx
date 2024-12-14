import { ReactNode } from "react"
import { AppSidebar } from "./app-sidebar"
import { NavActions } from "./nav-actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./ui/breadcrumb"
import { Separator } from "./ui/separator"
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar"
import { usePageTitle } from "./page-title-context"

interface PageLayoutProps {
  workspaces: {
    id: string
    name: string
    emoji: string
    createdAt: string
    updatedAt: string
    notes?: {
      id: string
      title: string
      content?: string | null
      createdAt: string
      updatedAt: string
    }[]
  }[]
  children: ReactNode
}

export function PageLayout({ workspaces, children }: PageLayoutProps) {
  const { title } = usePageTitle()

  return (
    <SidebarProvider>
      <div className="grid h-screen grid-cols-[auto_1fr]">
        <AppSidebar workspaces={workspaces} />
        <div className="flex flex-col">
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      {title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-3">
              <NavActions />
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

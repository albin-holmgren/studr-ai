import * as React from "react"

interface SidebarContextValue {
  isCollapsed: boolean
  isMobile: boolean
  setIsCollapsed: (value: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const value = React.useMemo(
    () => ({
      isCollapsed,
      isMobile,
      setIsCollapsed,
    }),
    [isCollapsed, isMobile]
  )

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

import * as React from "react"
import {
  Bell,
  CircleUser,
  KeyRound,
  Settings as SettingsIcon,
} from "lucide-react"

import { AccountSettings } from "~/components/settings/account-settings"
import { AppSettings } from "~/components/settings/app-settings"
import { NotificationSettings } from "~/components/settings/notification-settings"
import { SecuritySettings } from "~/components/settings/security-settings"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

const personalSections = [
  {
    id: "account",
    label: "My Account",
    icon: CircleUser,
    component: AccountSettings,
  },
  {
    id: "settings",
    label: "My Settings",
    icon: SettingsIcon,
    component: AppSettings,
  },
  {
    id: "notifications",
    label: "My Notifications",
    icon: Bell,
    component: NotificationSettings,
  },
  {
    id: "security",
    label: "Security & Data",
    icon: KeyRound,
    component: SecuritySettings,
  },
]

interface SettingsCommandProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SettingsCommand({ open, onOpenChange }: SettingsCommandProps) {
  const [activeSection, setActiveSection] = React.useState("account")

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange?.(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const ActiveComponent =
    personalSections.find((s) => s.id === activeSection)?.component ||
    AccountSettings

  const activeTitle =
    personalSections.find((s) => s.id === activeSection)?.label || "Settings"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] h-[85vh] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{activeTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex h-full overflow-hidden rounded-xl">
          {/* Sidebar */}
          <div className="w-60 bg-muted/50 overflow-y-auto flex-shrink-0 rounded-l-xl border-r">
            <div className="px-2 pt-4 pb-4">
              <div className="px-2">
                <div className="text-[11px] font-semibold text-muted-foreground mb-1.5">
                  SETTINGS
                </div>
                <nav className="mt-4 space-y-0.5 px-1">
                  {personalSections.map((section) => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        className={`w-full flex items-center px-2 py-1.5 h-8 text-sm font-medium rounded-lg transition-colors ${
                          activeSection === section.id
                            ? "bg-background text-foreground hover:bg-background"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                        }`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <Icon className="h-4 w-4 mr-2 shrink-0" />
                        {section.label}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 bg-background rounded-r-xl">
            <div className="h-full overflow-y-auto">
              <div className="max-w-3xl mx-auto p-8">
                <ActiveComponent />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
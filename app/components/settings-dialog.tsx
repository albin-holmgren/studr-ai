import * as React from "react"
import {
  CircleUser,
  KeyRound,
  Settings as SettingsIcon,
  Bell,
  CreditCard,
} from "lucide-react"

import { cn } from "~/lib/utils"
import type { User } from "~/lib/types";
import { AccountSettings } from "~/components/settings/account-settings"
import { AppSettings } from "~/components/settings/app-settings"
import { BillingSettings } from "~/components/settings/billing-settings"
import { NotificationSettings } from "~/components/settings/notification-settings"
import { SecuritySettings } from "~/components/settings/security-settings"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

const personalSections = [
  {
    id: "account",
    label: "My Account",
    icon: CircleUser,
    component: AccountSettings,
  },
  {
    id: "security",
    label: "Security",
    icon: KeyRound,
    component: SecuritySettings,
  },
  {
    id: "billing",
    label: "Billing",
    icon: CreditCard,
    component: BillingSettings,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    component: NotificationSettings,
  },
]

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultSection?: string
  user: User
  subscription?: any
  tokensUsed?: number
}

export function SettingsDialog({
  open,
  onOpenChange,
  defaultSection = "account",
  user,
  subscription,
  tokensUsed,
}: SettingsDialogProps) {
  const [activeSection, setActiveSection] = React.useState(defaultSection)

  React.useEffect(() => {
    if (defaultSection) {
      setActiveSection(defaultSection)
    }
  }, [defaultSection])

  const renderContent = (tab: string) => {
    switch (tab) {
      case "account":
        return <AccountSettings user={user} />
      case "billing":
        return <BillingSettings subscription={subscription} tokensUsed={tokensUsed} />
      case "notifications":
        return <NotificationSettings user={user} />
      case "security":
        return <SecuritySettings />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1200px] h-[85vh] p-0 gap-0 bg-white">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="flex h-full overflow-hidden rounded-xl">
          {/* Sidebar */}
          <div className="w-60 bg-[#FAFAFA] overflow-y-auto flex-shrink-0 rounded-l-xl border-r">
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
                        className={cn(
                          "w-full flex items-center px-2 py-1.5 h-8 text-sm font-medium rounded-lg transition-colors",
                          activeSection === section.id
                            ? "bg-background text-foreground hover:bg-background"
                            : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                        )}
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
                {renderContent(activeSection)}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
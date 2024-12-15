"use client"

import * as React from "react"
import {
  CreditCard,
  LogOut,
  Settings,
  ChevronDown,
  UserPlus,
} from "lucide-react"
import { useNavigate } from "@remix-run/react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { Form } from "@remix-run/react"
import { ShareDialog } from "./share-dialog"
import SettingsPopup from "./settings-popup"
import { UpgradePopup } from "./upgrade-popup"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [upgradeOpen, setUpgradeOpen] = React.useState(false)
  const navigate = useNavigate()
  
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 w-full justify-start gap-2 px-2 cursor-pointer">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden text-left">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[240px] p-2" align="start">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">Free Plan</div>
            </div>
          </div>
          <DropdownMenuSeparator className="-mx-2" />
          <DropdownMenuItem className="gap-2 py-1.5 cursor-pointer" onSelect={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="gap-2 py-1.5 text-blue-500 font-medium cursor-pointer" 
            onSelect={() => setUpgradeOpen(true)}
          >
            <CreditCard className="h-4 w-4" />
            Upgrade to Pro
          </DropdownMenuItem>
          <DropdownMenuSeparator className="-mx-2" />
          <DropdownMenuItem 
            className="gap-2 py-1.5 cursor-pointer" 
            onSelect={() => setShareDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite Friends
          </DropdownMenuItem>
          <Form action="/auth/logout" method="post">
            <DropdownMenuItem className="gap-2 py-1.5 text-red-500 cursor-pointer" asChild>
              <button className="w-full flex items-center gap-2 cursor-pointer">
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </DropdownMenuItem>
          </Form>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <ShareDialog 
        open={shareDialogOpen} 
        onOpenChange={setShareDialogOpen} 
      />

      <SettingsPopup
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <UpgradePopup
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
      />
    </>
  )
}

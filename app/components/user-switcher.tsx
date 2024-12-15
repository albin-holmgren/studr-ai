"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Settings, LogOut, Plus, ChevronDown, CreditCard } from "lucide-react"

interface UserSwitcherProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
}

export function UserSwitcher({ user }: UserSwitcherProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-full justify-start gap-2 px-2">
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
        <DropdownMenuItem className="gap-2 py-1.5">
          <Settings className="h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-1.5 text-blue-500 font-medium">
          <CreditCard className="h-4 w-4" />
          Upgrade to Pro
        </DropdownMenuItem>
        <DropdownMenuSeparator className="-mx-2" />
        <DropdownMenuItem className="gap-2 py-1.5">
          <Plus className="h-4 w-4" />
          Add another account
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 py-1.5 text-red-500">
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

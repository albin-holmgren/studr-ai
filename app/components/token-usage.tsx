"use client"

import * as React from "react"
import { ArrowUpCircle } from "lucide-react"

import { Button } from "./ui/button"
import { UpgradePopup } from "./upgrade-popup"

interface TokenUsageProps {
  subscriptionTier?: string
  usedTokens: number
}

const FREE_DAILY_TOKENS = 2000

export default function TokenUsage({ subscriptionTier = "free", usedTokens }: TokenUsageProps) {
  const [upgradeOpen, setUpgradeOpen] = React.useState(false)
  
  // Don't show for pro users
  if (subscriptionTier === "pro") {
    return null
  }

  const percentage = Math.round((usedTokens / FREE_DAILY_TOKENS) * 100)
  const remaining = FREE_DAILY_TOKENS - usedTokens
  const isLow = percentage > 80

  return (
    <>
      <UpgradePopup open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <div className="border-t border-sidebar-border bg-sidebar p-4 shadow-[0_-1px_2px_rgba(0,0,0,0.1)]">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium uppercase tracking-wide text-sidebar-foreground/70">
              Daily Token Usage
            </span>
            <span className={`font-medium ${isLow ? "text-red-500" : "text-sidebar-foreground/70"}`}>
              {percentage}%
            </span>
          </div>
          
          <div className="relative h-1 overflow-hidden rounded-full bg-sidebar-accent">
            <div 
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                isLow ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-sidebar-foreground/70">
              {remaining.toLocaleString()} tokens remaining today
            </span>
            <Button 
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[11px] font-medium text-blue-500 hover:text-blue-600"
              onClick={() => setUpgradeOpen(true)}
            >
              <ArrowUpCircle className="mr-1 h-3 w-3" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

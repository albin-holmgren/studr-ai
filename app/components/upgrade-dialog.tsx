import * as React from "react"
import { Check, CreditCard, Infinity, Sparkles, Zap } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { cn } from "~/lib/utils"

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: 21,
    interval: "month",
    tokens: "Unlimited",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 17,
    interval: "year",
    tokens: "Unlimited",
    featured: true,
    savings: "Save 20%",
  },
]

const features = {
  free: [
    "50K AI tokens per month",
    "Basic AI assistance",
    "Standard response time",
    "Community support",
  ],
  pro: [
    "Unlimited AI tokens",
    "Advanced AI models & features",
    "Priority response time",
    "Real-time AI analysis",
    "Custom AI training",
    "Priority support",
    "Early access to new features",
    "API access",
  ],
}

interface UpgradeDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const [selectedPlan, setSelectedPlan] = React.useState("yearly")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold">Upgrade to Pro</div>
            <div className="mt-2 text-base font-normal text-muted-foreground">
              Unlock unlimited AI capabilities and take your work to the next level
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-8">
          {/* Plan Selection */}
          <div className="mb-8 flex justify-center gap-4">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={cn(
                  "group relative rounded-xl border px-6 py-3 text-left transition-all hover:border-primary/50",
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border",
                  plan.featured && "border-primary"
                )}
              >
                {plan.featured && (
                  <div className="absolute -top-2.5 right-4 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {plan.savings}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="text-lg font-medium">{plan.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${plan.price}/{plan.interval}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Plan Comparison */}
          <div className="mb-8 grid gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="rounded-xl border border-border p-6">
              <div className="mb-6">
                <div className="text-lg font-medium">Free</div>
                <div className="mt-2 text-3xl font-bold">$0</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  For individuals just getting started
                </div>
              </div>
              <div className="space-y-4">
                {features.free.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-xl border border-primary bg-primary/5 p-6">
              <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
              <div className="mb-6">
                <div className="text-lg font-medium">Pro</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold">
                    ${selectedPlan === "yearly" ? "17" : "21"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per {selectedPlan === "yearly" ? "year" : "month"}
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Everything in Free, plus...
                </div>
              </div>
              <div className="space-y-4">
                {features.pro.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="space-y-4">
            <Button className="w-full" size="lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Button>
            <div className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <Infinity className="h-3 w-3" />
              <span>Unlimited AI tokens with Pro plan</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
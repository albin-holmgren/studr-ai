import * as React from "react"
import { useFetcher } from "@remix-run/react"
import { Check, CreditCard, Infinity, Sparkles, Zap } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog"
import { cn } from "~/lib/utils"

const plans = [
  {
    id: "month",
    name: "Monthly",
    price: 21,
    interval: "month",
    tokens: "Unlimited",
  },
  {
    id: "year",
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
    "10,000 AI tokens per day",
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
  const [selectedPlan, setSelectedPlan] = React.useState("year")
  const fetcher = useFetcher();
  const isLoading = fetcher.state !== "idle";

  const handleUpgrade = async () => {
    try {
      const formData = new FormData();
      formData.append("interval", selectedPlan);

      const response = await fetch("/api/stripe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      // You might want to show a toast notification here
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#F7F7F7]">
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
            <button
              onClick={() => setSelectedPlan("month")}
              className={cn(
                "group relative rounded-xl border px-6 py-3 text-left transition-all",
                selectedPlan === "month"
                  ? "bg-white shadow-sm"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="text-lg font-medium">Monthly</div>
                <div className="text-sm text-muted-foreground">
                  $21/month
                </div>
              </div>
            </button>
            <button
              onClick={() => setSelectedPlan("year")}
              className={cn(
                "group relative rounded-xl border px-6 py-3 text-left transition-all",
                selectedPlan === "year"
                  ? "bg-white shadow-sm"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="absolute -top-2.5 right-4 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                Save 20%
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-medium">Yearly</div>
                <div className="text-sm text-muted-foreground">
                  $17/month
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Billed annually
              </div>
            </button>
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
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Limited AI conversations (100 tokens/day)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Basic code completion</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Standard response time</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Community support</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Basic file analysis</span>
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-xl border border-primary bg-white p-6">
              <div className="absolute -top-3 left-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
              <div className="mb-6">
                <div className="text-lg font-medium">Pro</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-3xl font-bold">
                    ${selectedPlan === "year" ? "17" : "21"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per month
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {selectedPlan === "year" ? "Billed annually ($204/year)" : "Billed monthly"}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Unlimited AI conversations</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Advanced code completion & suggestions</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Priority support with 24/7 access</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Advanced codebase analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Custom AI model fine-tuning</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Early access to new features</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">API access for custom integrations</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="space-y-4">
            <Button 
              className="w-full bg-black text-white hover:bg-black/90" 
              size="lg"
              onClick={handleUpgrade}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Upgrade"}
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
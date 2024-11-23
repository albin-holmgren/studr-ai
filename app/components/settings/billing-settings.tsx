import { CreditCard, Package } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"

const billingInfo = {
  plan: "Free",
  nextBilling: "No billing scheduled",
  paymentMethod: {
    type: "None",
    last4: "",
    expiry: "",
  },
  tokens: {
    used: 25000,
    total: 50000,
  },
}

export function BillingSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing & Subscription</h3>
        <p className="text-sm text-muted-foreground">
          Manage your billing information and subscription plan
        </p>
      </div>
      <Separator />

      {/* Current Plan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Current Plan</h4>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{billingInfo.plan}</p>
            </div>
          </div>
          <Button>Upgrade Plan</Button>
        </div>

        {/* Usage */}
        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-medium mb-3">AI Token Usage</h4>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {billingInfo.tokens.used.toLocaleString()} / {billingInfo.tokens.total.toLocaleString()} tokens used
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(billingInfo.tokens.used / billingInfo.tokens.total) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Resets on the 1st of each month
            </p>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Payment Method</h4>
          <p className="text-sm text-muted-foreground">
            {billingInfo.paymentMethod.type === "None" 
              ? "No payment method added" 
              : `${billingInfo.paymentMethod.type} ending in ${billingInfo.paymentMethod.last4}`}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Billing History</h4>
        <div className="rounded-lg border">
          <div className="p-4 text-center text-sm text-muted-foreground">
            No billing history available
          </div>
        </div>
      </div>
    </div>
  )
}
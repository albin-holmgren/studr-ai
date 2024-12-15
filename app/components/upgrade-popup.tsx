import * as React from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";

interface UpgradePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradePopup({ open, onOpenChange }: UpgradePopupProps) {
  const [billingInterval, setBillingInterval] = React.useState<"monthly" | "yearly">("monthly");
  const [error, setError] = React.useState<string | null>(null);

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        "3 workspaces",
        "Basic AI features",
        "Community support",
        "Standard themes",
      ],
    },
    {
      name: "Pro",
      description: "Best for power users",
      price: {
        monthly: 21,
        yearly: 17,
      },
      features: [
        "Unlimited workspaces",
        "Advanced AI features",
        "Priority support",
        "Custom themes",
        "API access",
        "Team collaboration",
        "Advanced analytics",
        "Custom export formats",
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <div className="px-2">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">
              Choose Your Plan
            </h2>
            <p className="text-sm text-muted-foreground">
              Simple, transparent pricing that grows with you
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-muted p-1 rounded-lg grid grid-cols-2 gap-1">
              <Button
                variant={billingInterval === "monthly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingInterval("monthly")}
                className="relative"
              >
                Monthly
              </Button>
              <Button
                variant={billingInterval === "yearly" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBillingInterval("yearly")}
                className="relative"
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-primary text-[10px] text-primary-foreground px-1.5 py-0.5 rounded-full">
                  -20%
                </span>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-xl border p-6 space-y-4",
                  plan.name === "Pro" &&
                    "border-primary/50 bg-primary/5 shadow-md"
                )}
              >
                {plan.name === "Pro" && (
                  <div className="absolute -top-3 -right-3">
                    <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-medium">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    ${plan.price[billingInterval]}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>
                  {billingInterval === "yearly" && plan.price.yearly > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ${plan.price.yearly * 12} billed yearly
                    </p>
                  )}
                </div>

                <Button
                  className={cn(
                    "w-full",
                    plan.name === "Pro" && "bg-primary hover:bg-primary/90"
                  )}
                  variant={plan.name === "Pro" ? "default" : "outline"}
                  onClick={async () => {
                    if (plan.name === "Free") {
                      onOpenChange(false);
                      return;
                    }

                    setError(null);

                    try {
                      const response = await fetch("/api/stripe", {
                        method: "POST",
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          action: "create-checkout",
                          productId: "prod_RNAVecdqDhEF4K",
                          billingInterval: billingInterval === "yearly" ? "year" : "month",
                        }),
                      });
                      
                      if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || 'Failed to create checkout session');
                      }
                      
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        throw new Error('No checkout URL received');
                      }
                    } catch (err) {
                      console.error('Checkout error:', err);
                      setError(err instanceof Error ? err.message : "Failed to start checkout");
                    }
                  }}
                >
                  {plan.name === "Free" ? "Current Plan" : "Upgrade"}
                </Button>

                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm gap-2">
                      <Check className={cn(
                        "h-4 w-4",
                        plan.name === "Pro" ? "text-primary" : "text-muted-foreground"
                      )} />
                      {feature}
                    </li>
                  ))}
                </ul>

                {error && (
                  <p className="text-sm text-destructive mt-2">{error}</p>
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground mt-8">
            All plans include automatic updates and community support.{" "}
            <a href="#" className="underline underline-offset-2">
              View our pricing policy
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

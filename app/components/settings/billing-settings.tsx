import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { CreditCard, AlertCircle, CheckCircle2, Infinity, Zap } from "lucide-react";

type SubscriptionType = {
  id: string;
  userId: string;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  status: string;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
};

interface BillingSettingsProps {
  subscription?: SubscriptionType;
  tokensUsed?: number;
}

export function BillingSettings({ 
  subscription, 
  tokensUsed = 0 
}: BillingSettingsProps) {
  const upgradeFetcher = useFetcher();
  const manageFetcher = useFetcher();
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month');

  const isLoading = upgradeFetcher.state !== "idle" || manageFetcher.state !== "idle";
  const isPro = subscription?.plan === "pro";
  const isActive = subscription?.status === "active";
  const isCanceled = subscription?.status === "canceled";

  const handleUpgrade = () => {
    upgradeFetcher.submit(
      { interval: selectedInterval },
      { method: "POST", action: "/api/stripe" }
    );
  };

  const handleManageSubscription = (action: 'cancel' | 'resume') => {
    manageFetcher.submit(
      { action },
      { method: "POST", action: "/api/subscription" }
    );
  };

  return (
    <div className="space-y-8">
      {/* Current Plan Card */}
      <div className="bg-background/60 p-6 rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Current Plan
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{isPro ? "Pro Plan" : "Free Plan"}</h3>
                {isPro && isActive && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    Active
                  </span>
                )}
                {isCanceled && (
                  <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                    Canceling
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isPro ? "Unlimited tokens" : "2,000 tokens per day"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {isPro ? (selectedInterval === 'month' ? "$21/month" : "$17/month") : "Free"}
              </p>
              {isPro && (
                <p className="text-sm text-gray-500 mt-1">
                  {isActive ? "Next billing date: Dec 10, 2024" : "Cancels at end of billing period"}
                </p>
              )}
            </div>
          </div>

          {isPro && isCanceled && (
            <div className="mb-6 p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-4 w-4 mt-1 flex-shrink-0" />
                <div className="text-sm">
                  Your subscription will be canceled at the end of the current billing period.
                  You can continue using Pro features until then.
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">
                Tokens used today
              </p>
              <p className="text-sm font-medium">
                {tokensUsed.toLocaleString()} / {isPro ? "∞" : "2,000"}
              </p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (tokensUsed / (isPro ? tokensUsed || 1 : 2000)) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {!isPro ? (
            <>
              <div className="flex justify-center gap-4 mb-6">
                <button
                  className={`relative px-6 py-3 rounded-xl transition-all ${
                    selectedInterval === 'month'
                      ? 'bg-white shadow-sm ring-1 ring-black'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedInterval('month')}
                >
                  <div className="font-medium">Monthly</div>
                  <div className="text-sm text-gray-500">$21/month</div>
                </button>
                <button
                  className={`relative px-6 py-3 rounded-xl transition-all ${
                    selectedInterval === 'year'
                      ? 'bg-white shadow-sm ring-1 ring-black'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedInterval('year')}
                >
                  <div className="absolute -top-2 right-2">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Save 20%
                    </span>
                  </div>
                  <div className="font-medium">Yearly</div>
                  <div className="text-sm text-gray-500">$17/month</div>
                </button>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-black text-white hover:bg-black/90"
                size="lg"
              >
                {isLoading ? "Processing..." : "Upgrade to Pro"}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => handleManageSubscription(isCanceled ? 'resume' : 'cancel')}
                variant="outline"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading
                  ? "Processing..."
                  : isCanceled
                  ? "Resume Subscription"
                  : "Cancel Subscription"}
              </Button>
              <div className="text-center text-sm text-gray-500">
                {isCanceled
                  ? "Your subscription will end at the current billing period"
                  : "You can cancel anytime. No refunds for partial months."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Comparison */}
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Plan Comparison</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1"></div>
            <div className="text-center">
              <h3 className="font-medium mb-2">Free</h3>
              <p className="text-2xl font-bold mb-4">$0</p>
            </div>
            <div className="text-center">
              <h3 className="font-medium mb-2">Pro</h3>
              <p className="text-2xl font-bold mb-4">
                {selectedInterval === 'month' ? "$21" : "$17"}
                <span className="text-sm font-normal text-gray-500">/mo</span>
              </p>
            </div>
            
            <div className="col-span-3 mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6 items-center py-4 border-t">
                  <div className="font-medium">Daily Token Limit</div>
                  <div className="text-center">2,000</div>
                  <div className="text-center">
                    <Infinity className="h-5 w-5 mx-auto text-gray-700" />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6 items-center py-4 border-t">
                  <div className="font-medium">Response Priority</div>
                  <div className="text-center text-gray-500">Standard</div>
                  <div className="text-center text-blue-500 font-medium">Priority</div>
                </div>

                <div className="grid grid-cols-3 gap-6 items-center py-4 border-t">
                  <div className="font-medium">Code Analysis</div>
                  <div className="text-center">Basic</div>
                  <div className="text-center">Advanced</div>
                </div>

                <div className="grid grid-cols-3 gap-6 items-center py-4 border-t">
                  <div className="font-medium">AI Model</div>
                  <div className="text-center">Standard</div>
                  <div className="text-center">Enhanced</div>
                </div>

                <div className="grid grid-cols-3 gap-6 items-center py-4 border-t">
                  <div className="font-medium">Support</div>
                  <div className="text-center">Community</div>
                  <div className="text-center">Priority 24/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      {isPro && (
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Payment Method</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-gray-500">
                  Expires 12/25
                </p>
              </div>
              <Button
                variant="outline"
                className="ml-auto"
                onClick={handleUpgrade}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
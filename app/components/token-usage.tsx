import * as React from "react";
import { ArrowUpCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { UpgradeDialog } from "./upgrade-dialog";

interface TokenUsageProps {
  userId: string;
  subscription: any;
}

export function TokenUsage({ userId, subscription }: TokenUsageProps) {
  const [usage, setUsage] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [upgradeOpen, setUpgradeOpen] = React.useState(false);

  const limit = 2000; // 2k tokens

  const fetchUsage = React.useCallback(async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/tokens?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch token usage");
      const data = await response.json();
      setUsage(data.tokens);

      // Show warning if usage is high
      if (data.tokens > limit * 0.9) {
        toast.warning("You're running low on tokens! Consider upgrading your plan.", {
          duration: 10000,
        });
      }
    } catch (error) {
      console.error("Error fetching token usage:", error);
      toast.error("Failed to fetch token usage");
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  React.useEffect(() => {
    if (userId) {
      fetchUsage();
      // Refresh every 5 minutes
      const interval = setInterval(fetchUsage, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchUsage, userId]);

  const percentage = Math.min((usage / limit) * 100, 100);
  const isLow = percentage > 80;

  return (
    <>
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <div className="border-t border-sidebar-border bg-sidebar p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium uppercase tracking-wide text-sidebar-foreground/70">
              Token Usage
            </span>
            <span className={`font-medium ${isLow ? "text-red-500" : "text-sidebar-foreground/70"}`}>
              {loading ? "..." : `${Math.round(percentage)}%`}
            </span>
          </div>
          
          <div className="relative h-1 overflow-hidden rounded-full bg-sidebar-accent">
            <div 
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${
                isLow ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.max(percentage, 1)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-sidebar-foreground/70">
              {loading ? "Loading..." : `${(limit - usage).toLocaleString()} tokens remaining`}
            </span>
            <Button 
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-[11px] font-medium text-blue-500 hover:text-blue-600"
              onClick={() => setUpgradeOpen(true)}
            >
              <ArrowUpCircle className="mr-1 h-3 w-3" />
              Upgrade
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
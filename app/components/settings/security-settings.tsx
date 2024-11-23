import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your security preferences.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="grid gap-2">
          <label htmlFor="current-password" className="text-sm font-medium">
            Current Password
          </label>
          <Input id="current-password" type="password" />
        </div>
        <div className="grid gap-2">
          <label htmlFor="new-password" className="text-sm font-medium">
            New Password
          </label>
          <Input id="new-password" type="password" />
        </div>
        <div className="grid gap-2">
          <label htmlFor="confirm-password" className="text-sm font-medium">
            Confirm New Password
          </label>
          <Input id="confirm-password" type="password" />
        </div>
        <Button>Update Password</Button>
      </div>
    </div>
  );
}
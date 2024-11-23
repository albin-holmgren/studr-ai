import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Button variant="outline">Enable</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive push notifications
            </p>
          </div>
          <Button variant="outline">Enable</Button>
        </div>
      </div>
    </div>
  );
}
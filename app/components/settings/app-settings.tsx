import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

export function AppSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">App Settings</h3>
        <p className="text-sm text-muted-foreground">
          Customize your app experience.
        </p>
      </div>
      <Separator />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Dark Mode</p>
            <p className="text-sm text-muted-foreground">
              Toggle dark mode on or off
            </p>
          </div>
          <Button variant="outline">Toggle</Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Compact Mode</p>
            <p className="text-sm text-muted-foreground">
              Make the UI more compact
            </p>
          </div>
          <Button variant="outline">Toggle</Button>
        </div>
      </div>
    </div>
  );
}
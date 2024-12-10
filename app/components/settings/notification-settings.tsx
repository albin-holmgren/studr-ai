import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { Label } from "~/components/ui/label";

interface NotificationSettingsProps {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    notificationSettings: {
      emailNotifications: boolean;
      studyReminders: boolean;
      marketingEmails: boolean;
    } | null;
  };
}

interface FetcherData {
  error?: string;
  success?: boolean;
}

const defaultSettings = {
  emailNotifications: true,
  studyReminders: true,
  marketingEmails: false,
};

export function NotificationSettings({ user }: NotificationSettingsProps) {
  const fetcher = useFetcher<FetcherData>();

  // If user is undefined, use default settings
  const initialSettings = user?.notificationSettings || defaultSettings;
  const [preferences, setPreferences] = useState(initialSettings);

  const handleToggle = (key: keyof typeof preferences) => {
    if (!user?.id) {
      toast.error("Please log in to update notification settings");
      return;
    }

    const newValue = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: newValue }));

    fetcher.submit(
      {
        intent: "updateNotifications",
        [key]: newValue.toString(),
      },
      { method: "POST", action: "/api/account" }
    );
  };

  if (fetcher.data?.error) {
    toast.error(fetcher.data.error);
  } else if (fetcher.data?.success) {
    toast.success("Notification preferences updated");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Manage how you receive notifications and updates.
        </p>
      </div>
      <Separator />
      
      <div className="bg-background/60 p-6 rounded-lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about your study sessions and progress.
              </p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
              disabled={fetcher.state === "submitting" || !user?.id}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Study Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about scheduled study sessions and deadlines.
              </p>
            </div>
            <Switch
              checked={preferences.studyReminders}
              onCheckedChange={() => handleToggle("studyReminders")}
              disabled={fetcher.state === "submitting" || !user?.id}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and promotional offers.
              </p>
            </div>
            <Switch
              checked={preferences.marketingEmails}
              onCheckedChange={() => handleToggle("marketingEmails")}
              disabled={fetcher.state === "submitting" || !user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
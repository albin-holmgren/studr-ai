import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "~/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface SecuritySettingsProps {
  user?: {
    id: string;
    email: string;
  };
}

interface FetcherData {
  error?: string;
  success?: boolean;
}

export function SecuritySettings({ user }: SecuritySettingsProps) {
  const fetcher = useFetcher<FetcherData>();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    fetcher.submit(
      {
        intent: "changePassword",
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      },
      { method: "POST", action: "/api/account" }
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (fetcher.data?.error) {
    toast.error(fetcher.data.error);
  } else if (fetcher.data?.success) {
    toast.success("Password updated successfully");
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Security</h3>
        <p className="text-sm text-muted-foreground">
          Update your password and manage your account security.
        </p>
      </div>
      <Separator />
      
      <div className="bg-background/60 p-6 rounded-lg">
        <div className="max-w-md space-y-4">
          <div className="space-y-1">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleInputChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={fetcher.state === "submitting"}
            className="min-w-[120px]"
          >
            {fetcher.state === "submitting" ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
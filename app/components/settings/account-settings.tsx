import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Camera, User } from "lucide-react";
import { Label } from "~/components/ui/label";

interface AccountSettingsProps {
  user?: {
    id: string;
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
}

interface FetcherData {
  error?: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    avatarUrl?: string | null;
  };
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const fetcher = useFetcher<FetcherData>();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    fetcher.submit(
      {
        intent: "updateProfile",
        name: formData.name,
        email: formData.email,
      },
      { method: "POST", action: "/api/account" }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("intent", "updateAvatar");

    fetcher.submit(formData, {
      method: "POST",
      action: "/api/account",
      encType: "multipart/form-data",
    });
  };

  if (fetcher.data?.error) {
    toast.error(fetcher.data.error);
  } else if (fetcher.data?.user) {
    toast.success("Profile updated successfully");
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal information and how it appears to others.
        </p>
      </div>
      <Separator />
      
      <div className="bg-background/60 p-6 rounded-lg">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-2 ring-border">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="bg-secondary">
                <User className="h-12 w-12 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 hover:bg-black/70"
            >
              <Camera className="h-8 w-8" />
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
              />
            </label>
          </div>
          
          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-medium">
                Display Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                className="max-w-md"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="max-w-md"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSaveChanges} 
            disabled={fetcher.state === "submitting"}
            className="min-w-[120px]"
          >
            {fetcher.state === "submitting" ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
"use client";

import * as React from "react";
import { Dialog, DialogContent } from './ui/dialog';
import { cn } from '~/lib/utils';
import {
  Bell,
  Globe,
  Settings,
  User,
  CreditCard,
  Wallet
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "~/components/ui/sidebar"
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useFetcher } from "@remix-run/react";
import { toast } from "sonner";
import {
  Dialog as AlertDialog,
  DialogContent as AlertDialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Check } from 'lucide-react';
import { UpgradePopup } from "~/components/upgrade-popup";

interface SettingsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const data = {
  account: [
    { name: "My Account", icon: User },
    { name: "My Notifications", icon: Bell },
    { name: "Language & Region", icon: Globe },
    
  ],
  workspace: [
    { name: "Upgrade Plan", icon: Wallet, className: "text-blue-500" },
    { name: "Billing", icon: CreditCard },
  ]
}

function SettingsPopup({ open, onOpenChange }: SettingsPopupProps) {
  const [selectedPage, setSelectedPage] = React.useState("My Account");
  const fetcher = useFetcher();
  const [userData, setUserData] = React.useState<{ name?: string; email?: string; avatar?: string; language?: string; region?: string; subscriptionTier?: string; subscriptionPeriodEnd?: string; paymentMethods?: any[]; payments?: any[] } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showEmailDialog, setShowEmailDialog] = React.useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsLoading(true);
      setError(null);
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setUserData(data);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setError('Failed to load user data');
          setIsLoading(false);
        });
    }
  }, [open]);

  const handleUpdateProfile = async (formData: FormData) => {
    setError(null);
    formData.append('action', 'updateProfile');
    fetcher.submit(formData, {
      method: 'PUT',
      action: '/api/user',
    });
  };

  const handleUpdateEmail = async (formData: FormData) => {
    setError(null);
    formData.append('action', 'updateEmail');
    fetcher.submit(formData, {
      method: 'PUT',
      action: '/api/user',
    });
    setShowEmailDialog(false);
  };

  const handleUpdatePassword = async (formData: FormData) => {
    setError(null);
    formData.append('action', 'updatePassword');
    fetcher.submit(formData, {
      method: 'PUT',
      action: '/api/user',
    });
    setShowPasswordDialog(false);
  };

  const handleDeleteAccount = async () => {
    setError(null);
    fetcher.submit(null, {
      method: 'DELETE',
      action: '/api/user',
    });
    setShowDeleteDialog(false);
  };

  const renderContent = () => {
    if (selectedPage === "My Account") {
      return (
        <div className="space-y-8">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
              {error}
            </div>
          )}
          <div>
            <h2 className="text-base font-medium mb-4">My Profile</h2>
            <div className="flex items-start gap-8">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl">
                {userData?.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{userData?.name?.[0]?.toUpperCase() || 'A'}</span>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <fetcher.Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleUpdateProfile(formData);
                  }}
                >
                  <div>
                    <label className="text-xs text-muted-foreground">Preferred name</label>
                    <Input
                      name="name"
                      defaultValue={userData?.name || ''}
                      className="max-w-md"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="submit"
                    disabled={fetcher.state === 'submitting' || isLoading}
                    className="mt-4 text-xs"
                  >
                    {fetcher.state === 'submitting' ? 'Saving...' : 'Save changes'}
                  </Button>
                </fetcher.Form>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-medium mb-4">Account Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between max-w-2xl">
                <div>
                  <h3 className="text-sm font-medium">Email</h3>
                  <p className="text-xs text-muted-foreground">{userData?.email || ''}</p>
                </div>
                <AlertDialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">Change email</Button>
                  </DialogTrigger>
                  <AlertDialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-base font-medium">Change Email</DialogTitle>
                      <DialogDescription className="text-xs">
                        Enter your new email address. You'll need to verify it before the change takes effect.
                      </DialogDescription>
                    </DialogHeader>
                    <fetcher.Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleUpdateEmail(formData);
                      }}
                      className="space-y-4"
                    >
                      <Input
                        name="email"
                        type="email"
                        placeholder="New email address"
                        required
                        className="text-xs"
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowEmailDialog(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="text-xs">
                          Update Email
                        </Button>
                      </DialogFooter>
                    </fetcher.Form>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="flex items-center justify-between max-w-2xl">
                <div>
                  <h3 className="text-sm font-medium">Password</h3>
                  <p className="text-xs text-muted-foreground">
                    Set a permanent password to login to your account.
                  </p>
                </div>
                <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">Change password</Button>
                  </DialogTrigger>
                  <AlertDialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-base font-medium">Change Password</DialogTitle>
                      <DialogDescription className="text-xs">
                        Enter your new password.
                      </DialogDescription>
                    </DialogHeader>
                    <fetcher.Form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleUpdatePassword(formData);
                      }}
                      className="space-y-4"
                    >
                      <Input
                        name="password"
                        type="password"
                        placeholder="New password"
                        required
                        minLength={6}
                        className="text-xs"
                      />
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPasswordDialog(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="text-xs">
                          Update Password
                        </Button>
                      </DialogFooter>
                    </fetcher.Form>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-medium mb-4 text-destructive">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between max-w-2xl">
                <div>
                  <h3 className="text-sm font-medium">Delete Account</h3>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="text-xs">Delete Account</Button>
                  </DialogTrigger>
                  <AlertDialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-base font-medium">Delete Account</DialogTitle>
                      <DialogDescription className="text-xs">
                        Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowDeleteDialog(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        className="text-xs"
                        onClick={handleDeleteAccount}
                      >
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (selectedPage === "Language & Region") {
      return (
        <div className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <h2 className="text-base font-medium">Language & Region</h2>
            <p className="text-xs text-muted-foreground">
              Customize your experience with your preferred language and region settings.
            </p>
          </div>

          <div className="space-y-6">
            <fetcher.Form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                formData.append('action', 'updateLocale');
                fetcher.submit(formData, {
                  method: 'PUT',
                  action: '/api/user',
                });
              }}
              className="space-y-6"
            >
              <div className="grid gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Display Language</label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {userData?.language === 'en' ? 'Currently English' : 'Coming Soon'}
                    </span>
                  </div>
                  <select
                    name="language"
                    defaultValue={userData?.language || 'en'}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="en">English (US)</option>
                    <option value="es" disabled>Español - Coming soon</option>
                    <option value="fr" disabled>Français - Coming soon</option>
                    <option value="de" disabled>Deutsch - Coming soon</option>
                    <option value="it" disabled>Italiano - Coming soon</option>
                    <option value="pt" disabled>Português - Coming soon</option>
                    <option value="ru" disabled>Русский - Coming soon</option>
                    <option value="zh" disabled>中文 - Coming soon</option>
                    <option value="ja" disabled>日本語 - Coming soon</option>
                    <option value="ko" disabled>한국어 - Coming soon</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    Choose the language you'd like to see in the interface. More languages coming soon.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Region</label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {userData?.region || 'US'}
                    </span>
                  </div>
                  <select
                    name="region"
                    defaultValue={userData?.region || 'US'}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <optgroup label="Americas">
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="BR">Brazil</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="GB">United Kingdom</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="ES">Spain</option>
                      <option value="IT">Italy</option>
                    </optgroup>
                    <optgroup label="Asia Pacific">
                      <option value="AU">Australia</option>
                      <option value="JP">Japan</option>
                      <option value="KR">South Korea</option>
                      <option value="CN">China</option>
                      <option value="IN">India</option>
                    </optgroup>
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    Select your region to get the most relevant content and features.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-[11px] text-muted-foreground">
                  Changes will take effect immediately
                </p>
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={fetcher.state === 'submitting'}
                  className="text-xs"
                >
                  {fetcher.state === 'submitting' ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Saving...
                    </div>
                  ) : 'Save preferences'}
                </Button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      );
    } else if (selectedPage === "Billing") {
      return (
        <div className="space-y-6">
          {error && (
            <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <h2 className="text-base font-medium">Payment Methods</h2>
            <p className="text-xs text-muted-foreground">
              Manage your payment methods and view transaction history
            </p>
          </div>

          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-card text-card-foreground">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Cards</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/stripe", {
                          method: "POST",
                          body: new URLSearchParams({
                            action: "portal",
                          }),
                        });
                        const data = await response.json();
                        if (data.url) {
                          window.location.href = data.url;
                        }
                      } catch (err) {
                        setError("Failed to open billing portal");
                      }
                    }}
                  >
                    Manage Payment Methods
                  </Button>
                </div>

                <div className="space-y-3">
                  {userData?.paymentMethods?.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs font-medium">•••• {method.last4}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                          </p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                  {(!userData?.paymentMethods || userData.paymentMethods.length === 0) && (
                    <div className="text-xs text-muted-foreground text-center py-3">
                      No payment methods added
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-card text-card-foreground">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Payment History</h3>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-2 font-medium">Date</th>
                        <th className="px-4 py-2 font-medium">Amount</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium">Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-muted/30">
                      {userData?.payments?.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-2">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                          </td>
                          <td className="px-4 py-2">
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full",
                              payment.status === "succeeded" 
                                ? "bg-green-500/10 text-green-500"
                                : "bg-yellow-500/10 text-yellow-500"
                            )}>
                              {payment.status === "succeeded" ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {payment.stripeInvoiceId && (
                              <Button 
                                variant="ghost" 
                                size="xs" 
                                className="h-6 text-[11px]"
                                onClick={async () => {
                                  try {
                                    const response = await fetch("/api/stripe", {
                                      method: "POST",
                                      body: new URLSearchParams({
                                        action: "invoice",
                                        invoiceId: payment.stripeInvoiceId,
                                      }),
                                    });
                                    const data = await response.json();
                                    if (data.url) {
                                      window.open(data.url, '_blank');
                                    }
                                  } catch (err) {
                                    setError("Failed to download invoice");
                                  }
                                }}
                              >
                                Download
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {(!userData?.payments || userData.payments.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            No payment history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Upgrade CTA */}
            {userData?.subscriptionTier !== "pro" && (
              <div className="bg-primary/5 p-6 space-y-3 rounded-md">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Upgrade to Pro</h3>
                  <p className="text-xs text-muted-foreground">
                    Get access to unlimited workspaces and advanced features
                  </p>
                </div>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowUpgradeDialog(true)}
                >
                  Upgrade Now
                </Button>
              </div>
            )}

            <div className="text-[11px] text-muted-foreground">
              Need help? Contact our support team at support@example.com
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[85vh] md:max-w-[1000px]">
        <div className="sr-only">Settings</div>
        <div className="sr-only">Customize your settings here.</div>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden w-60 md:flex">
            <SidebarContent className="pt-4">
              <SidebarGroup>
                <div className="mb-1 px-4">
                  <h3 className="text-xs font-medium text-muted-foreground">Account</h3>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.account.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === selectedPage}
                          onClick={() => setSelectedPage(item.name)}
                        >
                          <button className={cn(
                            "flex w-full items-center gap-2 px-4",
                            item.className
                          )}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-3">
                <div className="mb-1 px-4">
                  <h3 className="text-xs font-medium text-muted-foreground">Workspace</h3>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.workspace.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === selectedPage}
                          onClick={() => {
                            if (item.name === "Upgrade Plan") {
                              setShowUpgradeDialog(true);
                            } else {
                              setSelectedPage(item.name);
                            }
                          }}
                        >
                          <button className={cn(
                            "flex w-full items-center gap-2 px-4",
                            item.className
                          )}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[85vh] flex-1 flex-col overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Settings</span>
                  <span className="text-muted-foreground">/</span>
                  <span>{selectedPage}</span>
                </div>
              </div>
            </header>
            <div className="flex flex-1 flex-col overflow-y-auto p-6">
              {renderContent()}
            </div>
          </main>
        </SidebarProvider>
        <div className="px-6 py-2">
          {renderContent()}
        </div>

        <UpgradePopup 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog} 
        />
      </DialogContent>
    </Dialog>
  );
}

export default SettingsPopup;

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Bell, X, CheckCheck } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "~/components/ui/alert";

interface InboxDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InboxDrawer({ open, onOpenChange }: InboxDrawerProps) {
  const [notifications, setNotifications] = React.useState([
    {
      id: "1",
      title: "Welcome to Studr AI",
      description: "Get started by creating your first workspace",
      timestamp: new Date(),
      read: false,
    },
    {
      id: "2",
      title: "Pro Plan Trial",
      description: "Your 14-day pro plan trial has started",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="w-[400px]">
        <DrawerHeader className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <DrawerTitle className="text-[14px] font-medium">Notifications</DrawerTitle>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </DrawerHeader>
        
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="p-4 space-y-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <Alert
                  key={notification.id}
                  className="group relative hover:bg-muted/50 py-2.5"
                  variant={notification.read ? "default" : "destructive"}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <AlertTitle className="text-[14px] font-medium leading-tight">
                        {notification.title}
                      </AlertTitle>
                      <AlertDescription className="text-xs text-muted-foreground font-normal leading-normal">
                        {notification.description}
                      </AlertDescription>
                      <div className="flex items-center gap-2 pt-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(notification.timestamp)}
                        </span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 text-[11px] px-1.5"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={() => clearNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </Alert>
              ))
            )}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}

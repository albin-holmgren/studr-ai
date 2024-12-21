import * as React from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Archive, Clock, Search, File, Globe } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ArchivedItem {
  id: string;
  title: string;
  emoji?: string | null;
  content: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ArchivePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedItems?: ArchivedItem[];
  onRestoreItem: (itemId: string) => void;
}

export function ArchivePopup({ 
  open, 
  onOpenChange, 
  archivedItems = [], 
  onRestoreItem 
}: ArchivePopupProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredItems = React.useMemo(() => {
    if (!searchQuery) return archivedItems;
    
    const query = searchQuery.toLowerCase();
    return archivedItems.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.content?.toLowerCase().includes(query)
    );
  }, [archivedItems, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Archive</h2>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archived items..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {!filteredItems?.length ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <Archive className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No matching archived items found" : "No archived items yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col space-y-2 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-muted-foreground">
                          {item.fileType === "url" ? (
                            <Globe className="h-4 w-4" />
                          ) : (
                            <File className="h-4 w-4" />
                          )}
                        </div>
                        <h3 className="font-medium">{item.title}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRestoreItem(item.id)}
                      >
                        Restore
                      </Button>
                    </div>
                    {item.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Archived {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

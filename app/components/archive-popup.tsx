import * as React from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Archive, Clock, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

interface ArchivePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  archivedNotes: Array<{
    id: string;
    title: string;
    content: string | null;
    workspaceId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  onRestoreNote: (noteId: string) => void;
}

export function ArchivePopup({ 
  open, 
  onOpenChange, 
  archivedNotes,
  onRestoreNote 
}: ArchivePopupProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  
  const filteredNotes = React.useMemo(() => {
    if (!searchQuery) return archivedNotes;
    
    const query = searchQuery.toLowerCase();
    return archivedNotes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content?.toLowerCase().includes(query)
    );
  }, [archivedNotes, searchQuery]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Archive className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Archived Notes</h2>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search archived notes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-center">
                <Archive className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No matching archived notes found" : "No archived notes yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex flex-col space-y-2 p-4 rounded-lg border bg-card"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{note.title}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRestoreNote(note.id)}
                      >
                        Restore
                      </Button>
                    </div>
                    {note.content && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.content}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Archived {formatDate(note.updatedAt)}
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

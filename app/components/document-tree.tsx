import * as React from "react";
import { ChevronRight, Plus, File } from "lucide-react";
import { cn } from "~/lib/utils";
import { useFetcher, useNavigate, useLocation } from "@remix-run/react";
import { Button } from "./ui/button";

interface Document {
  id: string;
  title: string;
  emoji: string;
  children?: Document[];
  parentId: string | null;
}

interface FetcherData {
  error?: string;
  document?: {
    id: string;
    title: string;
    emoji: string;
    parentId: string | null;
  };
}

interface DocumentTreeProps {
  documents: Document[];
  activeDocumentId?: string;
  level?: number;
  parentId?: string | null;
}

export function DocumentTree({ 
  documents, 
  activeDocumentId, 
  level = 0,
  parentId = null 
}: DocumentTreeProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const fetcher = useFetcher<FetcherData>();

  // Filter documents for current level
  const currentLevelDocs = documents.filter(doc => doc.parentId === parentId);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const newExpanded = { ...prev };
      newExpanded[id] = !prev[id];
      return newExpanded;
    });
  };

  const createNewDocument = async (parentId: string | null) => {
    if (isCreating) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      fetcher.submit(
        { 
          title: "Untitled",
          parentId: parentId || "",
          emoji: "📄"
        },
        { method: "POST", action: "/documents/new" }
      );
    } catch (error) {
      setError("Failed to create document");
      console.error("Error creating document:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle fetcher states
  React.useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.error) {
        setError(fetcher.data.error);
        setIsCreating(false);
        return;
      }

      const newDoc = fetcher.data.document;
      if (!newDoc?.id) {
        setError("Failed to create document: Invalid response");
        setIsCreating(false);
        return;
      }

      setIsCreating(false);
      setError(null);
      navigate(`/documents/${newDoc.id}`);
    }
  }, [fetcher.state, fetcher.data, navigate]);

  // Expand parent of active document
  React.useEffect(() => {
    if (activeDocumentId) {
      const activeDoc = documents.find(doc => doc.id === activeDocumentId);
      if (activeDoc?.parentId) {
        setExpanded(prev => {
          const newExpanded = { ...prev };
          if (activeDoc.parentId) {
            newExpanded[activeDoc.parentId] = true;
          }
          return newExpanded;
        });
      }
    }
  }, [activeDocumentId, documents]);

  return (
    <div className="space-y-1">
      {error && (
        <div className="mb-2 px-2 py-1 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {currentLevelDocs.map((doc) => {
        const isExpanded = expanded[doc.id];
        const hasChildren = documents.some(d => d.parentId === doc.id);
        const isActive = doc.id === activeDocumentId;

        return (
          <div key={doc.id} className="group">
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5",
                isActive ? "bg-accent" : "hover:bg-accent/50",
                "group cursor-pointer"
              )}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(doc.id);
                }}
                className={cn(
                  "flex h-4 w-4 items-center justify-center",
                  !hasChildren && "invisible"
                )}
              >
                <ChevronRight
                  className={cn(
                    "h-3 w-3 shrink-0 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
              </button>

              <div
                className="flex flex-1 items-center gap-2 min-w-0 outline-none"
                onClick={() => {
                  if (doc.id === activeDocumentId) return;
                  navigate(`/documents/${doc.id}`);
                }}
                role="button"
                tabIndex={0}
              >
                <span className="shrink-0">{doc.emoji}</span>
                <span className="truncate text-sm">{doc.title}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 shrink-0 opacity-0",
                  "group-hover:opacity-100",
                  "transition-opacity duration-200"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  createNewDocument(doc.id);
                }}
                disabled={isCreating}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {isExpanded && hasChildren && (
              <div className="ml-3 mt-1 border-l pl-3">
                <DocumentTree
                  documents={documents}
                  activeDocumentId={activeDocumentId}
                  level={level + 1}
                  parentId={doc.id}
                />
              </div>
            )}
          </div>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "mt-2 w-full justify-start gap-2",
          "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => createNewDocument(parentId)}
        disabled={isCreating}
      >
        <Plus className="h-4 w-4" />
        <span>New Page</span>
      </Button>
    </div>
  );
}

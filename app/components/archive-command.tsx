import * as React from "react"
import {
  Archive,
  ArrowUpRight,
  Clock,
  FileText,
  Folder,
  MoreHorizontal,
  Search,
  Star,
  Tags,
  Trash2,
} from "lucide-react"
import { useFetcher, useNavigate } from "@remix-run/react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Input } from "~/components/ui/input"
import { Separator } from "~/components/ui/separator"
import { useToast } from "~/components/ui/use-toast"

const filters = [
  { id: "all", name: "All Items", icon: Archive },
  { id: "recent", name: "Recent", icon: Clock },
  { id: "starred", name: "Starred", icon: Star },
  { id: "trash", name: "Trash", icon: Trash2 },
]

interface Document {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  isStarred: boolean
  tags: string[]
}

interface ArchiveCommandProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ArchiveCommand({ open, onOpenChange }: ArchiveCommandProps) {
  const [activeFilter, setActiveFilter] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [items, setItems] = React.useState<Document[]>([])
  const fetcher = useFetcher()
  const navigate = useNavigate()
  const { toast } = useToast()
  const debouncedSearch = React.useRef<NodeJS.Timeout>()

  // Load items when filter or search changes
  React.useEffect(() => {
    clearTimeout(debouncedSearch.current)
    debouncedSearch.current = setTimeout(() => {
      const url = `/api/archive-items?filter=${activeFilter}&q=${searchQuery}`
      fetcher.load(url)
    }, 300)
    
    return () => clearTimeout(debouncedSearch.current)
  }, [activeFilter, searchQuery])

  // Update items when data is loaded
  React.useEffect(() => {
    if (fetcher.data?.items) {
      setItems(fetcher.data.items)
    }
  }, [fetcher.data])

  const handleAction = async (action: string, documentId: string) => {
    const form = new FormData()
    form.append("_action", action)
    form.append("documentId", documentId)

    fetcher.submit(form, { method: "post", action: "/api/archive" })

    toast({
      title: "Success",
      description: `Document ${action}d successfully`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 outline-none bg-white">
        <DialogHeader className="px-4 pb-4 pt-5">
          <DialogTitle>Archive</DialogTitle>
          <Input
            placeholder="Search archived documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </DialogHeader>
        <div className="border-t border-border px-2 py-3">
          <div className="space-x-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                size="sm"
                variant={activeFilter === filter.id ? "secondary" : "ghost"}
                className="gap-2"
                onClick={() => setActiveFilter(filter.id)}
              >
                <filter.icon className="h-4 w-4" />
                {filter.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="max-h-[50vh] overflow-y-auto px-2 py-4">
          {items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No archived documents found.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Updated {new Date(item.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/documents/${item.id}`)}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {activeFilter === "trash" ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleAction("restore", item.id)}
                            >
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleAction("delete", item.id)}
                            >
                              Delete Permanently
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleAction("unarchive", item.id)}
                            >
                              Unarchive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleAction("delete", item.id)}
                            >
                              Move to Trash
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
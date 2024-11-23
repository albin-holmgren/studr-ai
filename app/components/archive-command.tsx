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

const archivedItems = [
  {
    id: 1,
    name: "Project Documentation",
    type: "document",
    date: "2024-03-10",
    icon: FileText,
    tags: ["Important", "Work"],
  },
  {
    id: 2,
    name: "Design Assets",
    type: "folder",
    date: "2024-03-09",
    icon: Folder,
    tags: ["Design", "Assets"],
  },
  {
    id: 3,
    name: "Meeting Notes",
    type: "document",
    date: "2024-03-08",
    icon: FileText,
    tags: ["Work", "Notes"],
  },
  {
    id: 4,
    name: "Research Papers",
    type: "folder",
    date: "2024-03-07",
    icon: Folder,
    tags: ["Research"],
  },
  {
    id: 5,
    name: "Product Roadmap",
    type: "document",
    date: "2024-03-06",
    icon: FileText,
    tags: ["Product", "Planning"],
  },
]

const filters = [
  { id: "all", name: "All Items", icon: Archive },
  { id: "recent", name: "Recent", icon: Clock },
  { id: "starred", name: "Starred", icon: Star },
  { id: "trash", name: "Trash", icon: Trash2 },
]

interface ArchiveCommandProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ArchiveCommand({ open, onOpenChange }: ArchiveCommandProps) {
  const [activeFilter, setActiveFilter] = React.useState("all")
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "a" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange?.(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const filteredItems = archivedItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeTitle = filters.find((f) => f.id === activeFilter)?.name || "Archive"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{activeTitle}</DialogTitle>
        </DialogHeader>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r p-4 flex flex-col gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Archive</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search archives..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Separator />
            <nav className="space-y-1">
              {filters.map((filter) => {
                const Icon = filter.icon
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      activeFilter === filter.id
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {filter.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  {activeFilter === "all"
                    ? "All Archives"
                    : filters.find((f) => f.id === activeFilter)?.name}
                </h3>
                <Button variant="outline" size="sm">
                  <Tags className="h-4 w-4 mr-2" />
                  Manage Tags
                </Button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1">
              <div className="grid gap-2">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Archive className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">No items found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h4 className="text-sm font-medium">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {item.date}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <div className="flex items-center gap-1">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-secondary"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <ArrowUpRight className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="h-4 w-4 mr-2" />
                              Star
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
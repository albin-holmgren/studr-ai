import * as React from "react"
import { Check, Copy, Crown, Globe, HelpCircle, Search, Users } from "lucide-react"
import { useFetcher } from "@remix-run/react"
import { useDebounce } from "~/hooks/use-debounce"
import { useUser } from "~/hooks/use-user"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"

interface User {
  id: string
  name: string | null
  email: string
  avatar: string | null
}

interface NoteAccess {
  id: string
  userId: string
  role: string
  user: User
}

interface ShareDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  note: {
    id: string
  }
  initialAccess?: NoteAccess[]
  defaultLinkAccess?: "viewer" | "editor" | "admin"
}

export function ShareDialog({ 
  open, 
  onOpenChange, 
  note,
  initialAccess = [],
  defaultLinkAccess = "viewer",
}: ShareDialogProps) {
  const currentUser = useUser()
  const [copied, setCopied] = React.useState(false)
  const [linkAccess, setLinkAccess] = React.useState(defaultLinkAccess)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<User[]>([])
  const [access, setAccess] = React.useState<NoteAccess[]>(initialAccess)
  const debouncedSearch = useDebounce(searchQuery, 300)
  const fetcher = useFetcher()
  const searchFetcher = useFetcher()
  const accessFetcher = useFetcher()
  const inviteFetcher = useFetcher()

  React.useEffect(() => {
    if (fetcher.data?.note?.access) {
      setAccess(fetcher.data.note.access)
    }
  }, [fetcher.data])

  React.useEffect(() => {
    if (debouncedSearch.length > 0) {
      searchFetcher.load(`/api/users/search?q=${encodeURIComponent(debouncedSearch)}`)
    } else {
      setSearchResults([])
    }
  }, [debouncedSearch])

  React.useEffect(() => {
    if (searchFetcher.data?.users) {
      setSearchResults(searchFetcher.data.users)
    }
  }, [searchFetcher.data])

  const copyLink = () => {
    const shareUrl = new URL(window.location.href)
    shareUrl.searchParams.set("access", linkAccess)
    navigator.clipboard.writeText(shareUrl.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLinkAccessChange = (newAccess: string) => {
    setLinkAccess(newAccess as "viewer" | "editor" | "admin")
    fetcher.submit(
      {
        noteId: note.id,
        action: "updateLinkAccess",
        access: newAccess,
      },
      {
        method: "POST",
        action: "/api/note-access",
      }
    )
  }

  const handleRoleChange = (userId: string, newRole: string) => {
    if (!["viewer", "editor", "admin"].includes(newRole)) {
      return
    }

    accessFetcher.submit(
      {
        noteId: note.id,
        userId,
        role: newRole,
        action: "update",
      },
      { method: "POST", action: "/api/note-access" }
    )
  }

  const handleRemoveAccess = (userId: string) => {
    // Don't allow removing owner's access
    if (userId === currentUser.id) {
      return
    }

    accessFetcher.submit(
      {
        noteId: note.id,
        userId,
        action: "remove",
      },
      { method: "POST", action: "/api/note-access" }
    )
  }

  const handleInvite = (userId: string, role: string = "viewer") => {
    inviteFetcher.submit(
      {
        noteId: note.id,
        userId,
        role,
        action: "add",
      },
      { method: "POST", action: "/api/note-access" }
    )
    setSearchQuery("")
    setSearchResults([])
  }

  const getAvatarUrl = (user: User) => {
    return user.avatar || `https://avatar.vercel.sh/${user.email}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Link sharing section */}
          <div className="rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h3 className="text-sm font-medium">Share via link</h3>
                  <p className="text-sm text-muted-foreground">
                    Anyone with the link can {linkAccess === "admin" ? "manage" : linkAccess} this document
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={linkAccess}
                  onChange={(e) => handleLinkAccessChange(e.target.value)}
                >
                  <option value="viewer">Can view</option>
                  <option value="editor">Can edit</option>
                  <option value="admin">Can manage</option>
                </select>
                <Button variant="outline" size="sm" onClick={copyLink}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy link
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Share with people section */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Share with people</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Invite people to view or edit this document</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full z-10 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between rounded-sm p-2 hover:bg-accent"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={getAvatarUrl(user)}
                              alt=""
                              className="h-6 w-6 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInvite(user.id)}
                          >
                            Invite
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button disabled={searchQuery.length === 0}>
                  <Users className="mr-2 h-4 w-4" />
                  Invite people
                </Button>
              </div>
            </div>

            <div className="rounded-lg border">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-medium text-muted-foreground">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-muted-foreground">
                      Access
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-medium text-muted-foreground">
                      Last active
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Owner row */}
                  <tr className="bg-muted/30 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentUser?.avatar || `https://avatar.vercel.sh/${currentUser?.email}`}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{currentUser?.name || "Anonymous"}</div>
                          <div className="text-sm text-muted-foreground">
                            {currentUser?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Crown className="h-4 w-4 text-amber-500" />
                        Owner
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Active now
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm">
                      {/* No actions for owner */}
                    </td>
                  </tr>

                  {/* Other users */}
                  {access.map((item) => (
                    <tr key={item.id} className="transition-colors hover:bg-muted/30">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarUrl(item.user)}
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{item.user.name || "Anonymous"}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.user.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <select
                                className="h-9 w-[110px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                value={item.role}
                                onChange={(e) => handleRoleChange(item.user.id, e.target.value)}
                                disabled={item.user.id === currentUser.id || accessFetcher.state === "submitting"}
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                              </select>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Change user's access level</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            item.user.id === currentUser.id ? "bg-green-500" : "bg-gray-300"
                          }`} />
                          {item.user.id === currentUser.id ? "Active now" : "Unknown"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveAccess(item.user.id)}
                          disabled={item.user.id === currentUser.id || accessFetcher.state === "submitting"}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import * as React from "react"
import { Check, Copy, Crown, Plus, Search } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"

const owner = {
  name: "You",
  email: "you@example.com",
  role: "Owner",
  lastActive: "Active now",
  avatar: "https://github.com/shadcn.png",
}

const people = [
  {
    name: "Lindsay Walton",
    email: "lindsay.walton@example.com",
    role: "Editor",
    lastActive: "2 hours ago",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Tom Cook",
    email: "tom.cook@example.com",
    role: "Viewer",
    lastActive: "3 days ago",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
  {
    name: "Whitney Francis",
    email: "whitney.francis@example.com",
    role: "Editor",
    lastActive: "1 week ago",
    avatar: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
]

interface ShareDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Link sharing section */}
          <div className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Share via link</h3>
                <p className="text-sm text-muted-foreground">Anyone with the link can view</p>
              </div>
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

          {/* Share with people section */}
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-medium">Share with people</h3>
              <div className="mt-2 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
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
                  <tr className="bg-muted/30">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={owner.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{owner.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {owner.email}
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
                      {owner.lastActive}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm">
                      {/* No actions for owner */}
                    </td>
                  </tr>

                  {/* Other users */}
                  {people.map((person) => (
                    <tr key={person.email}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={person.avatar}
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                          <div>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {person.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <select
                          className="w-24 rounded-md border-0 bg-transparent py-1.5 text-sm ring-1 ring-inset ring-border focus:ring-2 focus:ring-inset focus:ring-ring"
                          defaultValue={person.role.toLowerCase()}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground">
                        {person.lastActive}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
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
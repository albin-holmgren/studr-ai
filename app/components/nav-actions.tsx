"use client"

import * as React from "react"
import { useParams, Link, useNavigate } from "@remix-run/react"
import {
  Archive,
  Copy,
  CornerUpLeft,
  FileText,
  FolderTree,
  GalleryVerticalEnd,
  Info,
  BookOpen,
  Link as LinkIcon,
  MoreHorizontal,
  Share2,
  Sparkles,
  Download,
  Star,
  StarOff,
} from "lucide-react"

import { DocumentAIChat } from "~/components/document-ai-chat"
import { ExportDialog } from "~/components/export-dialog"
import { InfoDialog } from "~/components/info-dialog"
import { LinkLibraryDialog } from "~/components/link-library-dialog"
import { MoveToDialog } from "~/components/move-to-dialog"
import { ShareDialog } from "~/components/share-dialog"
import { VersionHistoryDialog } from "~/components/version-history-dialog"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { useWorkspaces } from "~/hooks/use-workspaces"
import { useToast } from "~/hooks/use-toast"
import { useFavorites } from "~/hooks/use-favorites"

interface NavActionsProps {
  documentId: string
  documentTitle: string
  documentEmoji?: string
  workspaceId: string
}

const linkedLibraries = [
  {
    id: "react-docs",
    name: "React Documentation",
    emoji: "📚",
  },
  {
    id: "design-system",
    name: "Design System Guidelines",
    emoji: "🎨",
  },
]

const data = [
  [
    {
      label: "Copy Link",
      icon: LinkIcon,
      action: async () => {
        await navigator.clipboard.writeText(window.location.href)
        return "Link copied to clipboard"
      }
    },
    {
      label: "Duplicate",
      icon: Copy,
      action: (id: string, addPage: (parentId?: string) => { id: string }) => {
        const newPage = addPage()
        return { id: newPage.id, message: "Page duplicated successfully" }
      }
    },
    {
      label: "Move to",
      icon: FolderTree,
      dialog: "moveTo"
    },
  ],
  [
    {
      label: "Undo",
      icon: CornerUpLeft,
      action: () => {
        // Here you would implement undo functionality
        return "Changes undone"
      }
    },
    {
      label: "Version History",
      icon: GalleryVerticalEnd,
      dialog: "versionHistory"
    },
    {
      label: "Export",
      icon: Download,
      dialog: "export"
    },
  ],
  [
    {
      label: "Move to Archive",
      icon: Archive,
      className: "text-destructive hover:text-destructive",
      action: () => {
        // Here you would implement archive functionality
        return "Page moved to archive"
      }
    },
  ],
  [
    {
      label: "Favorite",
      icon: StarOff,
      action: () => {
        // Here you would implement favorite functionality
        return "Page favorited"
      }
    },
  ],
]

export function NavActions({ 
  documentId, 
  documentTitle, 
  documentEmoji,
  workspaceId 
}: NavActionsProps) {
  const { toast } = useToast()
  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { addPage } = useWorkspaces()
  const navigate = useNavigate()
  const [showShareDialog, setShowShareDialog] = React.useState(false)
  const [showInfoDialog, setShowInfoDialog] = React.useState(false)
  const [showAIChat, setShowAIChat] = React.useState(false)
  const [showLinkLibrary, setShowLinkLibrary] = React.useState(false)
  const [showMoveToDialog, setShowMoveToDialog] = React.useState(false)
  const [showVersionHistory, setShowVersionHistory] = React.useState(false)
  const [showExportDialog, setShowExportDialog] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  const isNoteFavorite = isFavorite(documentId)

  const toggleFavorite = () => {
    if (isNoteFavorite) {
      removeFavorite(documentId)
      toast({
        description: "Removed from favorites",
      })
    } else {
      addFavorite({
        id: documentId,
        title: documentTitle,
        emoji: documentEmoji || "",
        workspaceId,
      })
      toast({
        description: "Added to favorites",
      })
    }
  }

  const handleAction = async (action: any, dialog?: string) => {
    if (dialog) {
      switch (dialog) {
        case "moveTo":
          setShowMoveToDialog(true)
          return
        case "versionHistory":
          setShowVersionHistory(true)
          return
        case "export":
          setShowExportDialog(true)
          return
      }
      return
    }

    if (!action) return

    try {
      if (typeof action === 'function') {
        const result = await action(documentId, addPage)
        
        if (typeof result === 'string') {
          toast({
            description: result,
          })
        } else if (result?.id) {
          navigate(`/pages/${result.id}`)
          toast({
            description: result.message,
          })
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "An error occurred while performing this action.",
      })
    }
  }

  React.useEffect(() => {
    setIsOpen(true)
  }, [])

  return (
    <>
      <ShareDialog open={showShareDialog} onOpenChange={setShowShareDialog} />
      <InfoDialog open={showInfoDialog} onOpenChange={setShowInfoDialog} />
      <DocumentAIChat open={showAIChat} onOpenChange={setShowAIChat} documentTitle={documentTitle} />
      <LinkLibraryDialog open={showLinkLibrary} onOpenChange={setShowLinkLibrary} />
      <MoveToDialog open={showMoveToDialog} onOpenChange={setShowMoveToDialog} />
      <VersionHistoryDialog open={showVersionHistory} onOpenChange={setShowVersionHistory} />
      <ExportDialog open={showExportDialog} onOpenChange={setShowExportDialog} />
      <div className="flex items-center gap-2 text-sm">
        <div className="hidden font-medium text-muted-foreground md:inline-block">
          Edit Oct 08
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowInfoDialog(true)}
          >
            <Info className="h-4 w-4" />
            <span className="sr-only">Info</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowAIChat(true)}
          >
            <Sparkles className="h-4 w-4" />
            <span className="sr-only">Ask AI</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
              >
                <BookOpen className="h-4 w-4" />
                <span className="sr-only">Library</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <h4 className="text-sm font-medium">Linked Libraries</h4>
                <p className="text-xs text-muted-foreground">
                  Libraries connected to this document
                </p>
              </div>
              <DropdownMenuSeparator />
              {linkedLibraries.map((library) => (
                <DropdownMenuItem key={library.id} asChild>
                  <Link to={`/library/${library.id}`} className="flex items-center gap-2">
                    <span className="text-base">{library.emoji}</span>
                    <span>{library.name}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setShowLinkLibrary(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Link Library
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={toggleFavorite}
          >
            <Star className={`h-4 w-4 ${isNoteFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
            <span className="sr-only">
              {isNoteFavorite ? "Remove from favorites" : "Add to favorites"}
            </span>
          </Button>
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 data-[state=open]:bg-accent"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 overflow-hidden rounded-lg p-0"
            align="end"
          >
            <Sidebar collapsible="none" className="bg-transparent">
              <SidebarContent>
                {data.map((group, index) => (
                  <SidebarGroup key={index} className="border-b last:border-none">
                    <SidebarGroupContent className="gap-0">
                      <SidebarMenu>
                        {group.map((item, index) => (
                          <SidebarMenuItem key={index}>
                            <SidebarMenuButton 
                              className={item.className}
                              onClick={() => handleAction(item.action, item.dialog)}
                            >
                              <item.icon /> <span>{item.label}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                ))}
              </SidebarContent>
            </Sidebar>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}

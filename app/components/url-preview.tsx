import * as React from "react"
import { ExternalLink, Globe, Copy, Check, Clock, Calendar, ChevronRight } from "lucide-react"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { format } from "date-fns"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { Separator } from "~/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "~/components/ui/breadcrumb"
import { WorkspaceEmojiPicker } from "~/components/emoji-picker"
import { Input } from "~/components/ui/input"
import { useFetcher } from "@remix-run/react"

interface UrlPreviewProps {
  metadata: {
    title?: string
    description?: string
    image?: string
    siteName?: string
    type?: string
    url: string
    content?: string
    publishedTime?: string
    author?: string
    readingTime?: number
  }
  className?: string
  itemId: string
}

interface ContentSection {
  title: string
  content: string[]
}

// Helper function to get emoji based on content type and context
function getContentEmoji(type?: string, title?: string, content?: string) {
  // Convert to lowercase for easier matching
  const lowerType = type?.toLowerCase() || ""
  const lowerTitle = title?.toLowerCase() || ""
  const lowerContent = content?.toLowerCase() || ""
  const combinedText = `${lowerTitle} ${lowerContent}`

  console.log("Analyzing content for emoji:", {
    type: lowerType,
    title: lowerTitle,
    contentPreview: lowerContent.slice(0, 100),
    combinedText: combinedText.slice(0, 100)
  })

  // Animals and Nature
  if (combinedText.includes("frog") || combinedText.includes("amphibian")) return "🐸"
  if (combinedText.includes("bird") || combinedText.includes("avian")) return "🦜"
  if (combinedText.includes("fish") || combinedText.includes("marine")) return "🐠"
  if (combinedText.includes("insect") || combinedText.includes("butterfly")) return "🦋"
  if (combinedText.includes("plant") || combinedText.includes("flower")) return "🌺"

  // Technology and Space
  if (combinedText.includes("spacex") || combinedText.includes("rocket") || combinedText.includes("spacecraft")) return "🚀"
  if (combinedText.includes("nasa") || combinedText.includes("space station")) return "🛸"
  if (combinedText.includes("satellite") || combinedText.includes("orbit")) return "🛰️"
  if (combinedText.includes("telescope") || combinedText.includes("astronomy")) return "🔭"
  if (combinedText.includes("mars") || combinedText.includes("planet")) return "🪐"

  // AI and Technology
  if (combinedText.includes("artificial intelligence") || combinedText.includes(" ai ")) return "🤖"
  if (combinedText.includes("machine learning") || combinedText.includes("neural network")) return "🧠"
  if (combinedText.includes("blockchain") || combinedText.includes("crypto")) return "⛓️"
  if (combinedText.includes("programming") || combinedText.includes("coding")) return "💻"
  if (combinedText.includes("database") || combinedText.includes("data science")) return "📊"

  // Science and Research
  if (combinedText.includes("research") || combinedText.includes("study")) return "🔬"
  if (combinedText.includes("chemistry") || combinedText.includes("molecule")) return "⚗️"
  if (combinedText.includes("physics") || combinedText.includes("quantum")) return "⚛️"
  if (combinedText.includes("biology") || combinedText.includes("genome")) return "🧬"
  if (combinedText.includes("math") || combinedText.includes("algorithm")) return "📐"

  // Business and Finance
  if (combinedText.includes("startup") || combinedText.includes("entrepreneur")) return "🚀"
  if (combinedText.includes("finance") || combinedText.includes("stock")) return "📈"
  if (combinedText.includes("business") || combinedText.includes("company")) return "💼"
  if (combinedText.includes("investment") || combinedText.includes("venture")) return "💰"
  if (combinedText.includes("market") || combinedText.includes("economy")) return "📊"

  // Media and Entertainment
  if (combinedText.includes("movie") || combinedText.includes("film")) return "🎬"
  if (combinedText.includes("music") || combinedText.includes("song")) return "🎵"
  if (combinedText.includes("game") || combinedText.includes("gaming")) return "🎮"
  if (combinedText.includes("book") || combinedText.includes("reading")) return "📚"
  if (combinedText.includes("art") || combinedText.includes("design")) return "🎨"

  // Content Types (fallback to basic types if no specific context found)
  if (lowerType.includes("video")) return "🎥"
  if (lowerType.includes("audio") || lowerType.includes("podcast")) return "🎧"
  if (lowerType.includes("image") || lowerType.includes("photo")) return "📸"
  if (lowerType.includes("document") || lowerType.includes("pdf")) return "📄"
  
  // General Content Types
  if (combinedText.includes("guide") || combinedText.includes("tutorial")) return "📚"
  if (combinedText.includes("news") || combinedText.includes("breaking")) return "📰"
  if (combinedText.includes("review") || combinedText.includes("rating")) return "⭐"
  if (combinedText.includes("recipe") || combinedText.includes("cooking")) return "🍳"
  if (combinedText.includes("weather") || combinedText.includes("climate")) return "🌤️"
  
  // Default emoji for articles/blog posts
  return "📝"
}

export function UrlPreview({ metadata, className, itemId }: UrlPreviewProps) {
  const [copied, setCopied] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [sections, setSections] = React.useState<ContentSection[]>([])
  const [isStructuring, setIsStructuring] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const scrollTimeout = React.useRef<NodeJS.Timeout>()
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedTitle, setEditedTitle] = React.useState(metadata.title || "Untitled")
  const fetcher = useFetcher()
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Get the initial emoji from metadata or optimistic update
  const initialEmoji = React.useMemo(() => {
    console.log("Calculating initial emoji from metadata:", {
      type: metadata.type,
      title: metadata.title,
      contentPreview: metadata.content?.slice(0, 100)
    })
    return getContentEmoji(metadata.type, metadata.title, metadata.content)
  }, [metadata.type, metadata.title, metadata.content])
  
  const [currentEmoji, setCurrentEmoji] = React.useState(initialEmoji)
  
  // Track optimistic updates
  const optimisticTitle = fetcher.formData?.get("title") as string
  const optimisticEmoji = fetcher.formData?.get("emoji") as string
  
  // Update currentEmoji when optimisticEmoji changes
  React.useEffect(() => {
    if (optimisticEmoji) {
      console.log("Updating emoji from optimistic update:", optimisticEmoji)
      setCurrentEmoji(optimisticEmoji)
    }
  }, [optimisticEmoji])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    const formData = new FormData()
    formData.append("itemId", itemId)
    formData.append("title", newTitle)
    formData.append("emoji", optimisticEmoji || currentEmoji)
    
    fetcher.submit(formData, {
      method: "post",
      action: "/api/library/item/update"
    })
  }

  const handleEmojiSelect = (newEmoji: string) => {
    console.log("Emoji selected:", newEmoji)
    setCurrentEmoji(newEmoji)
    const formData = new FormData()
    formData.append("itemId", itemId)
    formData.append("emoji", newEmoji)
    fetcher.submit(formData, {
      method: "post",
      action: "/api/library/item/update"
    })
  }

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  // Process content and calculate stats
  const stats = React.useMemo(() => {
    if (!metadata.content) return null

    const wordCount = metadata.content.split(/\s+/).filter(Boolean).length
    const charCount = metadata.content.length
    const readingTime = Math.ceil(wordCount / 200)

    return {
      words: wordCount,
      characters: charCount,
      readingTime,
    }
  }, [metadata.content])

  // Generate table of contents
  React.useEffect(() => {
    if (!metadata.content) return

    setIsStructuring(true)
    fetch('/api/structure-content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: metadata.content,
        title: metadata.title,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.sections) {
          setSections(data.sections)
        }
      })
      .catch(error => {
        console.error('Error creating table of contents:', error)
        // Fallback to simple structure
        const paragraphs = metadata.content?.split('\n').filter(Boolean) || []
        setSections([{
          title: metadata.title || 'Content',
          content: paragraphs
        }])
      })
      .finally(() => setIsStructuring(false))
  }, [metadata.content, metadata.title])

  // Memoize content classification
  const classifyParagraph = React.useCallback((paragraph: string) => {
    const isList = paragraph.startsWith('•') || 
      paragraph.startsWith('-') || 
      /^\d+\./.test(paragraph)

    const isQuote = paragraph.startsWith('"') && 
      paragraph.endsWith('"')

    return { isList, isQuote }
  }, [])

  // Debounced scroll handler
  const handleScroll = React.useCallback(() => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current)
    }

    scrollTimeout.current = setTimeout(() => {
      if (contentRef.current) {
        setIsScrolled(contentRef.current.scrollTop > 10)
      }
    }, 100)
  }, [])

  React.useEffect(() => {
    const element = contentRef.current
    if (!element) return

    element.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      element.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [handleScroll])

  const copyUrl = React.useCallback(() => {
    navigator.clipboard.writeText(metadata.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [metadata.url])

  const hostname = React.useMemo(() => {
    try {
      return new URL(metadata.url).hostname
    } catch {
      return ""
    }
  }, [metadata.url])

  return (
    <div className={cn(
      "relative h-full bg-background select-text",
      className
    )}>
      {/* Fixed Header */}
      <div 
        className={cn(
          "absolute inset-x-0 top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "transition-[box-shadow,border-color] duration-200",
          isScrolled ? "border-b shadow-sm" : "border-b border-transparent"
        )}
        style={{ margin: 0 }}
      >
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4 bg-border" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <div className="flex items-center gap-2">
                    <WorkspaceEmojiPicker
                      emoji={optimisticEmoji || currentEmoji}
                      onEmojiSelect={handleEmojiSelect}
                    />
                  </div>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  {isEditing ? (
                    <fetcher.Form method="post" action="/api/library/item/update">
                      <input type="hidden" name="itemId" value={itemId} />
                      <input type="hidden" name="emoji" value={optimisticEmoji || currentEmoji} />
                      <Input
                        ref={inputRef}
                        name="title"
                        type="text"
                        defaultValue={optimisticTitle || editedTitle}
                        onChange={handleTitleChange}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur()
                          } else if (e.key === "Escape") {
                            setEditedTitle(metadata.title || "Untitled")
                            setIsEditing(false)
                          }
                        }}
                        className="h-7 px-2 text-base bg-transparent border-none focus:outline-none focus:ring-0"
                        autoFocus
                      />
                    </fetcher.Form>
                  ) : (
                    <BreadcrumbPage 
                      className="line-clamp-1 hover:cursor-pointer hover:bg-accent px-2 py-1 rounded-md"
                      onClick={() => {
                        setIsEditing(true)
                        setTimeout(() => inputRef.current?.focus(), 0)
                      }}
                    >
                      {optimisticTitle || editedTitle}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1 text-gray-500">
                    {metadata.siteName || new URL(metadata.url).hostname.replace(/^www\./, '')}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-4 py-2 border-t flex items-center gap-4 text-xs text-muted-foreground">
          {stats && (
            <>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{stats.readingTime} min read</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>{stats.words.toLocaleString()} words</span>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <span>{stats.characters.toLocaleString()} characters</span>
            </>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex h-full">
        {/* Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain pb-safe will-change-scroll min-w-0"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarGutter: 'stable',
          }}
        >
          {/* Header Spacer */}
          <div className="h-[85px] shrink-0" />

          {/* Main Content */}
          <div className="px-4 md:px-16 py-8">
            <div className="max-w-3xl mx-auto">
              {/* Title Section */}
              <div className="mb-8">
                <h1 
                  data-heading="true"
                  data-level="1"
                  className="text-2xl font-semibold tracking-tight mb-4"
                >
                  {metadata.title || "Untitled"}
                </h1>
                {metadata.description && (
                  <div className="text-muted-foreground text-sm leading-relaxed">
                    {metadata.description}
                  </div>
                )}
              </div>

              {/* Preview Image */}
              {metadata.image && (
                <div className="mb-8">
                  <div className="aspect-[2/1] rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={metadata.image} 
                      alt={metadata.title || "Preview"} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              {isStructuring ? (
                <div className="py-12 text-center text-muted-foreground animate-pulse">
                  Structuring content...
                </div>
              ) : sections.length > 0 ? (
                <div className="space-y-12">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h2 
                        data-heading="true"
                        data-level="2"
                        className="text-lg font-medium mb-6"
                      >
                        {section.title}
                      </h2>
                      <div className="space-y-4">
                        {section.content.map((paragraph, index) => {
                          const { isList, isQuote } = classifyParagraph(paragraph)

                          return (
                            <div 
                              key={index}
                              className={cn(
                                "text-sm leading-relaxed",
                                "transform-gpu",
                                isQuote && "pl-4 border-l-2 border-muted italic"
                              )}
                            >
                              {isList ? (
                                <div className="flex gap-2">
                                  <span className="text-muted-foreground">•</span>
                                  <span>{paragraph.replace(/^[•\-]\s*/, '')}</span>
                                </div>
                              ) : (
                                <p className={cn(
                                  "leading-7",
                                  isQuote ? "text-muted-foreground" : ""
                                )}>
                                  {paragraph}
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  No content available
                </div>
              )}

              {/* URL Footer */}
              <div className="mt-8 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Source URL</p>
                    <code className="text-xs break-all">
                      {metadata.url}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyUrl}
                    className="shrink-0 h-8"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="hidden lg:block sticky top-[85px] ml-8 w-64 flex-shrink-0 h-[calc(100vh-85px)]">
          <div className="overflow-y-auto h-full py-8 pr-8">
            <div className="text-sm font-medium mb-4 text-foreground/70">
              On this page
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  const titleEl = contentRef.current?.querySelector('[data-level="1"]')
                  titleEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="flex items-center w-full text-sm py-1 px-2 hover:bg-muted rounded-md text-muted-foreground"
              >
                <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground/50" />
                <span className="truncate text-left">
                  {metadata.title || "Untitled"}
                </span>
              </button>
              {!isStructuring && sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const sectionEl = contentRef.current?.querySelectorAll('[data-level="2"]')[index]
                    sectionEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="flex items-center w-full text-sm py-1 px-2 pl-4 hover:bg-muted rounded-md text-muted-foreground"
                >
                  <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground/50" />
                  <span className="truncate text-left">
                    {section.title}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}

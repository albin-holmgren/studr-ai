import * as React from "react"
import { Send, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "~/lib/utils"
import { useFetcher } from "@remix-run/react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Sheet, SheetContent } from "~/components/ui/sheet"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  status?: "sending" | "sent"
}

interface DocumentAIChatProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  documentTitle?: string
}

export function DocumentAIChat({ open, onOpenChange, documentTitle }: DocumentAIChatProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      content: `I'm here to help you with "${documentTitle || 'this document'}". What would you like to know?`,
      role: "assistant",
      timestamp: new Date(),
      status: "sent",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const fetcher = useFetcher()

  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: String(Date.now()),
      content: input,
      role: "user",
      timestamp: new Date(),
      status: "sending",
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsTyping(true)

    // Send to API
    const formData = new FormData()
    formData.append("message", input)
    formData.append("documentTitle", documentTitle || "")
    
    fetcher.submit(formData, {
      method: "post",
      action: "/api/chat",
    })
  }

  React.useEffect(() => {
    if (fetcher.data && !fetcher.data.error) {
      setMessages((prev) => 
        prev.map(msg => 
          msg.status === "sending" ? { ...msg, status: "sent" as const } : msg
        )
      )
      
      setIsTyping(false)
      const aiResponse: Message = {
        id: String(Date.now()),
        content: fetcher.data.response,
        role: "assistant",
        timestamp: new Date(),
        status: "sent",
      }
      setMessages((prev) => [...prev, aiResponse])
    }
  }, [fetcher.data])

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent 
        side="right" 
        className="w-[400px] p-0 border-l shadow-2xl bg-gradient-to-b from-background to-muted/30"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="AI Assistant" className="h-5 w-5" />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onOpenChange?.(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={cn("flex gap-3", 
                      message.role === "assistant" ? "justify-start" : "justify-end"
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center">
                        <img src="/favicon.ico" alt="AI" className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "group relative flex max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                        message.role === "assistant"
                          ? "bg-muted/75 backdrop-blur"
                          : "text-muted-foreground"
                      )}
                    >
                      <div className="prose prose-sm dark:prose-invert">
                        {message.content}
                      </div>
                      <div className="absolute -bottom-5 right-0 flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.role === "user" && message.status === "sent" && (
                          <div className="h-3 w-3">✓</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center">
                      <img src="/favicon.ico" alt="AI" className="h-4 w-4" />
                    </div>
                    <div className="flex max-w-[85%] items-center gap-1 rounded-2xl bg-muted/75 px-4 py-2.5 backdrop-blur">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/50" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about this document..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-muted/50 border-muted-foreground/20"
              />
              <Button 
                type="submit"
                className="shadow-none"
                disabled={!input.trim() || fetcher.state === "submitting"}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

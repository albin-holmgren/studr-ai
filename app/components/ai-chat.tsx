import * as React from "react"
import { Bot, Send, Sparkles, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { v4 as uuidv4 } from "uuid"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { ScrollArea } from "~/components/ui/scroll-area"
import { useFetcher } from "@remix-run/react"
import { createClient } from "@supabase/supabase-js"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
  user_id: string
  conversation_id: string
}

interface AiChatProps {
  initialMessages?: Message[]
  userId?: string
  hasOpenAI: boolean
  supabaseUrl: string
  supabaseAnonKey: string
}

export function AiChat({ 
  initialMessages = [], 
  userId, 
  hasOpenAI,
  supabaseUrl,
  supabaseAnonKey,
}: AiChatProps) {
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [input, setInput] = React.useState("")
  const [isExpanded, setIsExpanded] = React.useState(initialMessages.length > 0)
  const [isLoading, setIsLoading] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const formRef = React.useRef<HTMLFormElement>(null)
  const conversationId = React.useRef(uuidv4())

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const handleSend = async () => {
    if (!input.trim() || isLoading || !hasOpenAI) return

    setIsLoading(true)
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: "user",
      created_at: new Date().toISOString(),
      user_id: userId || 'anonymous',
      conversation_id: conversationId.current,
    }

    try {
      // Save user message to Supabase
      await supabase.from("chat_messages").insert(userMessage)
      setMessages((prev) => [...prev, userMessage])
      setInput("")
      setIsExpanded(true)

      // Get AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      const aiMessage: Message = {
        id: uuidv4(),
        content: data.reply,
        role: "assistant",
        created_at: new Date().toISOString(),
        user_id: userId || 'anonymous',
        conversation_id: conversationId.current,
      }

      // Save AI message to Supabase
      await supabase.from("chat_messages").insert(aiMessage)
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: uuidv4(),
        content: "I'm sorry, I encountered an error while processing your request. Please try again.",
        role: "assistant",
        created_at: new Date().toISOString(),
        user_id: userId || 'anonymous',
        conversation_id: conversationId.current,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
    if (!isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [messages, isExpanded])

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div 
            key="chat"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-8">
              <div className="mx-auto max-w-2xl space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "assistant" ? "justify-start" : "justify-end"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`group relative flex max-w-xl rounded-lg px-3 py-2 text-sm ${
                        message.role === "assistant"
                          ? "bg-muted"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <div className="prose prose-sm dark:prose-invert">
                        {message.content}
                      </div>
                      <div
                        className={`absolute -top-5 right-0 hidden whitespace-nowrap text-xs text-muted-foreground group-hover:block`}
                      >
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    className="flex justify-start gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex max-w-xl items-center rounded-lg bg-muted px-3 py-2 text-sm">
                      <div className="flex gap-1">
                        <span className="animate-bounce">•</span>
                        <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>•</span>
                        <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>•</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        ) : (
          <motion.div 
            key="input"
            className="flex flex-1 items-center justify-center p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-full max-w-2xl px-4">
              <div className="text-center mb-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">How can I help you today?</h1>
                <p className="text-lg text-muted-foreground">
                  Ask me anything - I'm here to assist with your questions
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 blur-3xl -z-10" />
                <form
                  ref={formRef}
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="relative flex gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-1 rounded-lg border shadow-lg"
                >
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button type="submit" disabled={isLoading}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          >
            <div className="mx-auto max-w-2xl p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  ref={inputRef}
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
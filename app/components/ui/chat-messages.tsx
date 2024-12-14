import * as React from "react"
import { Bot, User } from "lucide-react"
import { cn } from "~/lib/utils"

export interface Message {
  id: string
  text: string
  type: "user" | "ai"
  timestamp: Date
}

interface ChatMessagesProps {
  messages: Message[]
  className?: string
}

export function ChatMessages({ messages, className }: ChatMessagesProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex items-start gap-3 text-sm",
            message.type === "user" ? "justify-end" : "justify-start"
          )}
        >
          {message.type === "ai" && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
          )}
          <div
            className={cn(
              "rounded-lg px-4 py-2 max-w-[80%]",
              message.type === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
          {message.type === "user" && (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

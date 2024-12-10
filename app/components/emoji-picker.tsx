import * as React from "react"
import { Smile } from "lucide-react"

import { Button } from "~/components/ui/button-new"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    emojis: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘"]
  },
  {
    name: "Objects",
    emojis: ["📝", "📚", "📖", "📓", "📔", "📒", "📕", "📗", "📘", "📙", "📌", "📍", "📎", "🔍", "💡"]
  },
  {
    name: "Symbols",
    emojis: ["❤️", "💫", "⭐", "🌟", "✨", "💥", "💢", "💦", "💨", "🕊️", "🔥", "✅", "❌", "❓", "❗"]
  },
]

interface EmojiPickerProps {
  emoji?: string
  onEmojiSelect?: (emoji: string) => void
}

export function EmojiPicker({ emoji = "📄", onEmojiSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleEmojiSelect = (selectedEmoji: string) => {
    onEmojiSelect?.(selectedEmoji)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-auto p-0 text-xl hover:bg-transparent focus-visible:ring-0"
        >
          {emoji || <Smile className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="grid gap-4 p-4">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Pick an emoji</h4>
            <p className="text-xs text-muted-foreground">
              Select an emoji to represent this page
            </p>
          </div>
          <div className="grid gap-2">
            {EMOJI_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-2">
                <h5 className="text-xs font-medium text-muted-foreground">
                  {category.name}
                </h5>
                <div className="grid grid-cols-8 gap-2">
                  {category.emojis.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
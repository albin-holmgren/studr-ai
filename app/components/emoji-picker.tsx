import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import EmojiPicker from "emoji-picker-react"
import type { EmojiClickData } from "emoji-picker-react"

interface EmojiPickerProps {
  emoji: string
  onEmojiSelect: (emoji: string) => void
  className?: string
}

export function WorkspaceEmojiPicker({ emoji, onEmojiSelect, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="text-base hover:opacity-70 transition-opacity"
          aria-label="Pick emoji"
        >
          {emoji}
        </button>
      </PopoverTrigger>
      {open && (
        <PopoverContent className="p-0 w-auto border-none shadow-lg" sideOffset={5}>
          <div className="emoji-picker-container">
            <EmojiPicker
              onEmojiClick={(emojiData: EmojiClickData) => {
                onEmojiSelect(emojiData.emoji)
                setOpen(false)
              }}
              searchPlaceholder="Search emoji..."
              width={300}
              height={400}
              previewConfig={{
                defaultEmoji: "1f4dd",
                defaultCaption: "Pick an emoji for your workspace",
              }}
              skinTonesDisabled
              lazyLoadEmojis
              theme="light"
            />
          </div>
        </PopoverContent>
      )}
    </Popover>
  )
}

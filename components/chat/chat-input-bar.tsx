"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Coins,
  Dices,
  SendHorizontal,
  Smile,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputBarProps {
  channelName: string
  onSendMessage: (content: string, type?: "text" | "dice" | "coin") => void
  disabled?: boolean
}

const QUICK_EMOJIS = ["🎉", "🔥", "😂", "🚀", "❤️", "🎮", "👀", "☕"]

export function ChatInputBar({
  channelName,
  onSendMessage,
  disabled = false,
}: ChatInputBarProps) {
  const [text, setText] = React.useState("")
  const [showEmojiRow, setShowEmojiRow] = React.useState(false)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return

    // Check slash commands
    if (trimmed === "/roll" || trimmed.startsWith("/roll ")) {
      const sides = parseInt(trimmed.replace("/roll", "").trim(), 10) || 100
      const result = Math.floor(Math.random() * sides) + 1
      onSendMessage(`🎲 Rolled a **${result}** (1-${sides})!`, "dice")
      setText("")
      return
    }

    if (trimmed === "/flip" || trimmed === "/coin") {
      const outcome = Math.random() > 0.5 ? "Heads 🪙" : "Tails 🪙"
      onSendMessage(`🪙 Flipped coin and got **${outcome}**!`, "coin")
      setText("")
      return
    }

    if (trimmed === "/shrug") {
      onSendMessage(`¯\\_(ツ)_/¯`, "text")
      setText("")
      return
    }

    if (trimmed === "/tableflip") {
      onSendMessage(`(╯°□°)╯︵ ┻━┻`, "text")
      setText("")
      return
    }

    onSendMessage(trimmed, "text")
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleRollDice = () => {
    const roll = Math.floor(Math.random() * 100) + 1
    onSendMessage(`🎲 Rolled a **${roll}** out of 100!`, "dice")
  }

  const handleFlipCoin = () => {
    const outcome = Math.random() > 0.5 ? "Heads 🪙" : "Tails 🪙"
    onSendMessage(`🪙 Flipped coin and got **${outcome}**!`, "coin")
  }

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  return (
    <div className="border-t border-border bg-card/60 p-3 backdrop-blur-xs">
      {/* Quick fun action pills bar */}
      <div className="mb-2 flex items-center justify-between gap-2 overflow-x-auto text-xs">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRollDice}
            disabled={disabled}
            className="h-7 cursor-pointer gap-1 px-2.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 shadow-2xs"
            title="Roll a 100-sided die"
          >
            <Dices className="size-3.5" />
            <span>Roll 1-100</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFlipCoin}
            disabled={disabled}
            className="h-7 cursor-pointer gap-1 px-2.5 text-[11px] font-medium text-sky-600 dark:text-sky-400 border-sky-500/30 hover:bg-sky-500/10 shadow-2xs"
            title="Flip a coin"
          >
            <Coins className="size-3.5" />
            <span>Flip Coin</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiRow(!showEmojiRow)}
            className="h-7 cursor-pointer gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Smile className="size-3.5" />
            <span className="hidden sm:inline">Emojis</span>
          </Button>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="size-3 text-amber-500" />
          <span>Tips: Try <code>/roll</code>, <code>/flip</code>, <code>/shrug</code></span>
        </div>
      </div>

      {/* Emoji drawer */}
      {showEmojiRow && (
        <div className="mb-2 flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1.5 animate-in fade-in-50">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="flex size-7 cursor-pointer items-center justify-center rounded text-base transition-transform hover:scale-125 hover:bg-muted"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main input & send container */}
      <div className="relative flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 shadow-2xs focus-within:ring-2 focus-within:ring-primary/40">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName} anonymously... پیام ناشناس بنویسید (Enter to send)`}
          rows={1}
          dir="auto"
          disabled={disabled}
          className="font-vazirmatn max-h-28 min-h-[26px] w-full resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
        />

        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={cn(
            "size-8 shrink-0 rounded-lg p-0 transition-transform cursor-pointer",
            text.trim() ? "scale-100 opacity-100" : "scale-95 opacity-50"
          )}
          title="Send anonymous message"
        >
          <SendHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  )
}

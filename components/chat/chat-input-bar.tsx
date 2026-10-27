"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import type { ChatReplyPreview, AnonUser } from "@/lib/chat-data"
import type { SessionUser } from "@/lib/auth"
import {
  Coins,
  Dices,
  Reply,
  SendHorizontal,
  Smile,
  Sparkles,
  User,
  UserCheck,
  VenetianMask,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputBarProps {
  channelName: string
  onSendMessage: (
    content: string,
    type?: "text" | "dice" | "coin",
    replyTo?: ChatReplyPreview,
    isAnonymous?: boolean
  ) => void
  replyingTo?: ChatReplyPreview | null
  onCancelReply?: () => void
  accountUser?: SessionUser | null
  anonUser: AnonUser
  isAnonymousMode: boolean
  onToggleAnonymousMode: () => void
  disabled?: boolean
}

const QUICK_EMOJIS = ["🎉", "🔥", "😂", "🚀", "❤️", "🎮", "👀", "☕", "👍", "✨"]

export function ChatInputBar({
  channelName,
  onSendMessage,
  replyingTo,
  onCancelReply,
  accountUser,
  anonUser,
  isAnonymousMode,
  onToggleAnonymousMode,
  disabled = false,
}: ChatInputBarProps) {
  const [text, setText] = React.useState("")
  const [showEmojiRow, setShowEmojiRow] = React.useState(false)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)

  // Focus textarea when replyingTo changes
  React.useEffect(() => {
    if (replyingTo) {
      inputRef.current?.focus()
    }
  }, [replyingTo])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return

    const currentReply = replyingTo || undefined

    // Check slash commands
    if (trimmed === "/roll" || trimmed.startsWith("/roll ")) {
      const sides = parseInt(trimmed.replace("/roll", "").trim(), 10) || 100
      const result = Math.floor(Math.random() * sides) + 1
      onSendMessage(
        `🎲 Rolled a **${result}** (1-${sides})!`,
        "dice",
        currentReply,
        isAnonymousMode
      )
      setText("")
      onCancelReply?.()
      return
    }

    if (trimmed === "/flip" || trimmed === "/coin") {
      const outcome = Math.random() > 0.5 ? "Heads 🪙" : "Tails 🪙"
      onSendMessage(
        `🪙 Flipped coin and got **${outcome}**!`,
        "coin",
        currentReply,
        isAnonymousMode
      )
      setText("")
      onCancelReply?.()
      return
    }

    if (trimmed === "/shrug") {
      onSendMessage(`¯\\_(ツ)_/¯`, "text", currentReply, isAnonymousMode)
      setText("")
      onCancelReply?.()
      return
    }

    if (trimmed === "/tableflip") {
      onSendMessage(`(╯°□°)╯︵ ┻━┻`, "text", currentReply, isAnonymousMode)
      setText("")
      onCancelReply?.()
      return
    }

    onSendMessage(trimmed, "text", currentReply, isAnonymousMode)
    setText("")
    onCancelReply?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else if (e.key === "Escape" && replyingTo) {
      e.preventDefault()
      onCancelReply?.()
    }
  }

  const handleRollDice = () => {
    const roll = Math.floor(Math.random() * 100) + 1
    onSendMessage(
      `🎲 Rolled a **${roll}** out of 100!`,
      "dice",
      replyingTo || undefined,
      isAnonymousMode
    )
    onCancelReply?.()
  }

  const handleFlipCoin = () => {
    const outcome = Math.random() > 0.5 ? "Heads 🪙" : "Tails 🪙"
    onSendMessage(
      `🪙 Flipped coin and got **${outcome}**!`,
      "coin",
      replyingTo || undefined,
      isAnonymousMode
    )
    onCancelReply?.()
  }

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  return (
    <div className="border-t border-border bg-card/85 p-2.5 sm:p-3 backdrop-blur-md">
      {/* Telegram-style Replying To Bar */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border-l-4 border-sky-500 bg-sky-500/10 px-3 py-2 text-xs backdrop-blur-xs animate-in fade-in-50 slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-400">
              <Reply className="size-3.5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sky-600 dark:text-sky-400 truncate text-[11.5px]">
                Reply to {replyingTo.senderName}
              </span>
              <span
                className="text-muted-foreground truncate text-[11px] font-vazirmatn"
                dir="auto"
              >
                {replyingTo.content}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancelReply}
            className="size-6 text-muted-foreground hover:text-foreground shrink-0 cursor-pointer rounded-full"
            title="Cancel reply (Esc)"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Identity mode toggle & quick actions */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left: Identity Switcher (Anonymous vs Real Account) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleAnonymousMode}
            className={cn(
              "flex h-7 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium transition-all shadow-2xs",
              isAnonymousMode
                ? "border-pink-500/40 bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20"
                : "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20"
            )}
            title="Click to toggle between Anonymous Mode and Real Account Profile"
          >
            {isAnonymousMode ? (
              <>
                <VenetianMask className="size-3.5 text-pink-500" />
                <span>
                  Posting as: <strong>{anonUser.name}</strong> (Anon)
                </span>
                <span className="text-[10px] opacity-70 underline ml-0.5">
                  Switch
                </span>
              </>
            ) : (
              <>
                <UserCheck className="size-3.5 text-sky-500" />
                <span>
                  Posting as:{" "}
                  <strong>
                    {accountUser ? accountUser.name : "My Real Profile"}
                  </strong>{" "}
                  {accountUser?.username && `(@${accountUser.username})`}
                </span>
                <span className="text-[10px] opacity-70 underline ml-0.5">
                  Switch
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right: Fun actions (Dice, Coin, Emojis) */}
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
            <span>Roll</span>
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
            <span>Coin</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiRow(!showEmojiRow)}
            className="h-7 cursor-pointer gap-1 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Smile className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Emoji drawer */}
      {showEmojiRow && (
        <div className="mb-2 flex items-center gap-1 rounded-xl border border-border bg-muted/40 p-1.5 animate-in fade-in-50">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-base transition-transform hover:scale-125 hover:bg-muted"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main input & send container */}
      <div className="relative flex items-end gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-2xs focus-within:ring-2 focus-within:ring-primary/40">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            replyingTo
              ? `Reply to ${replyingTo.senderName}...`
              : isAnonymousMode
                ? `Message #${channelName} anonymously as ${anonUser.name}...`
                : `Message #${channelName} as ${accountUser?.name || "your account"}...`
          }
          rows={1}
          dir="auto"
          disabled={disabled}
          className="font-vazirmatn max-h-28 min-h-[26px] w-full resize-none bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
        />

        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          className={cn(
            "size-8 shrink-0 rounded-full p-0 transition-all cursor-pointer",
            text.trim()
              ? "scale-100 bg-primary text-primary-foreground opacity-100 shadow-xs"
              : "scale-95 opacity-40"
          )}
          title="Send message"
        >
          <SendHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import type { ChatMessage, AnonUser } from "@/lib/chat-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Coins,
  Dices,
  SmilePlus,
} from "lucide-react"

const POPULAR_REACTIONS = ["🔥", "❤️", "😂", "🎮", "🚀", "👍", "🎉"]

interface ChatMessageItemProps {
  message: ChatMessage
  currentUser: AnonUser
  onToggleReaction: (messageId: string, emoji: string) => void
}

export function ChatMessageItem({
  message,
  currentUser,
  onToggleReaction,
}: ChatMessageItemProps) {
  const isMe = message.senderId === currentUser.id
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

  const timeFormatted = React.useMemo(() => {
    try {
      const d = new Date(message.createdAt)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    } catch {
      return ""
    }
  }, [message.createdAt])

  const reactions = message.reactions || {}
  const reactionKeys = Object.keys(reactions).filter(
    (k) => Array.isArray(reactions[k]) && reactions[k].length > 0
  )

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40",
        isMe && "bg-primary/[0.03]"
      )}
    >
      {/* Sender Avatar */}
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-base shadow-2xs select-none",
          message.senderColor || "from-violet-500 to-purple-600"
        )}
      >
        <span>{message.senderAvatar}</span>
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-vazirmatn text-xs font-bold text-foreground" dir="auto">
            {message.senderName}
          </span>
          {isMe && (
            <Badge
              variant="outline"
              className="text-[9px] px-1 py-0 h-4 border-primary/40 text-primary font-mono"
            >
              You
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground font-mono">
            {timeFormatted}
          </span>
        </div>

        {/* Message Content Render */}
        <div
          dir="auto"
          className="font-vazirmatn mt-1 text-[13px] text-foreground/90 leading-relaxed break-words"
        >
          {message.type === "dice" ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-700 dark:text-amber-300 font-medium">
              <Dices className="size-4 text-amber-500 animate-spin" />
              <span>{message.content}</span>
            </div>
          ) : message.type === "coin" ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-sky-700 dark:text-sky-300 font-medium">
              <Coins className="size-4 text-sky-500 animate-bounce" />
              <span>{message.content}</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Reaction Badges */}
        {reactionKeys.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {reactionKeys.map((emoji) => {
              const users = reactions[emoji] || []
              const hasReacted = users.includes(currentUser.id)
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onToggleReaction(message.id, emoji)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all",
                    hasReacted
                      ? "border-primary bg-primary/15 text-primary font-bold shadow-2xs scale-105"
                      : "border-border bg-card/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={`${users.length} reaction${users.length > 1 ? "s" : ""}`}
                >
                  <span>{emoji}</span>
                  <span className="font-mono text-[11px]">{users.length}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Hover Reaction Bar */}
      <div className="absolute right-3 top-2 hidden items-center gap-0.5 rounded-lg border border-border bg-background/95 p-0.5 shadow-xs backdrop-blur-xs group-hover:flex">
        {POPULAR_REACTIONS.slice(0, 4).map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onToggleReaction(message.id, emoji)}
            className="flex size-6 cursor-pointer items-center justify-center rounded text-xs transition-transform hover:scale-125 hover:bg-muted"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="size-6 text-muted-foreground hover:text-foreground"
            title="More reactions"
          >
            <SmilePlus className="size-3.5" />
          </Button>

          {showEmojiPicker && (
            <div className="absolute right-0 top-8 z-30 flex gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-md">
              {POPULAR_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onToggleReaction(message.id, emoji)
                    setShowEmojiPicker(false)
                  }}
                  className="flex size-7 cursor-pointer items-center justify-center rounded text-sm transition-transform hover:scale-125 hover:bg-muted"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

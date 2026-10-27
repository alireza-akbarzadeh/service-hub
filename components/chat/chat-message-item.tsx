"use client"

import * as React from "react"
import type { ChatMessage, AnonUser } from "@/lib/chat-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CheckCheck,
  Coins,
  Copy,
  Check,
  Dices,
  Reply,
  SmilePlus,
} from "lucide-react"

const POPULAR_REACTIONS = ["🔥", "❤️", "😂", "👍", "🚀", "🎉"]

interface ChatMessageItemProps {
  message: ChatMessage
  currentUser: AnonUser
  accountUserId?: string
  onToggleReaction: (messageId: string, emoji: string) => void
  onReply?: (message: ChatMessage) => void
  onScrollToMessage?: (messageId: string) => void
  isHighlighted?: boolean
}

export function ChatMessageItem({
  message,
  currentUser,
  accountUserId,
  onToggleReaction,
  onReply,
  onScrollToMessage,
  isHighlighted = false,
}: ChatMessageItemProps) {
  const isMe =
    message.senderId === currentUser.id ||
    (Boolean(accountUserId) && message.senderId === accountUserId)
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)

  const timeFormatted = React.useMemo(() => {
    try {
      const d = new Date(message.createdAt)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    } catch {
      return ""
    }
  }, [message.createdAt])

  const handleCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(message.content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 1500)
    }
  }

  const reactions = message.reactions || {}
  const reactionKeys = Object.keys(reactions).filter(
    (k) => Array.isArray(reactions[k]) && reactions[k].length > 0
  )

  return (
    <div
      id={`msg-${message.id}`}
      className={cn(
        "group relative flex w-full items-end gap-2 px-3 py-1 sm:px-6 transition-all duration-300",
        isMe ? "justify-end" : "justify-start",
        isHighlighted && "bg-primary/10 rounded-xl"
      )}
    >
      {/* Sender Avatar for incoming messages on the left */}
      {!isMe && (
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm shadow-xs select-none self-end mb-1",
            message.senderColor || "from-violet-500 to-purple-600"
          )}
          title={message.senderName}
        >
          <span>{message.senderAvatar}</span>
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={cn(
          "relative flex flex-col max-w-[85%] sm:max-w-[72%] md:max-w-[62%] lg:max-w-[52%] shadow-xs transition-all",
          isMe ? "items-end" : "items-start"
        )}
      >
        {/* Telegram Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-3.5 py-2 text-[13.5px] leading-relaxed transition-all duration-300",
            isMe
              ? "bg-primary text-primary-foreground rounded-br-xs dark:bg-sky-600 dark:text-white"
              : "bg-card border border-border/80 text-card-foreground rounded-bl-xs dark:bg-slate-900/90",
            isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          {/* Sender Name */}
          {!isMe ? (
            <div className="mb-1 flex items-center gap-1.5 font-vazirmatn text-[11px] font-bold text-sky-600 dark:text-sky-400 select-none">
              <span>{message.senderName}</span>
              {message.senderUsername && (
                <span className="font-mono text-[9.5px] font-normal text-muted-foreground">
                  @{message.senderUsername}
                </span>
              )}
              {message.isAnonymous === false && (
                <span className="rounded bg-sky-500/15 border border-sky-500/30 px-1 py-0 text-[8.5px] text-sky-600 dark:text-sky-300 font-medium">
                  Verified
                </span>
              )}
            </div>
          ) : message.isAnonymous === false ? (
            <div className="mb-0.5 flex items-center gap-1 font-vazirmatn text-[10px] text-white/80 select-none">
              <span className="font-medium">You (@{message.senderUsername || "account"})</span>
            </div>
          ) : null}

          {/* Quoted Reply Preview inside bubble */}
          {message.replyTo && (
            <button
              type="button"
              onClick={() => onScrollToMessage?.(message.replyTo!.id)}
              className={cn(
                "mb-1.5 flex w-full cursor-pointer flex-col rounded-md border-l-3 px-2.5 py-1 text-left text-xs transition-opacity hover:opacity-90",
                isMe
                  ? "border-white/80 bg-black/15 text-white/90"
                  : "border-primary/80 bg-muted/60 text-foreground dark:bg-muted/30"
              )}
              title="Jump to original message"
            >
              <div className="flex items-center gap-1 font-semibold text-[11px]">
                <Reply className="size-3 shrink-0" />
                <span className="truncate">{message.replyTo.senderName}</span>
              </div>
              <p className="truncate text-[11px] opacity-85 font-vazirmatn" dir="auto">
                {message.replyTo.content}
              </p>
            </button>
          )}

          {/* Message Content */}
          <div dir="auto" className="font-vazirmatn break-words">
            {message.type === "dice" ? (
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-1 font-medium",
                  isMe
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                )}
              >
                <Dices className="size-4 animate-spin text-amber-400" />
                <span>{message.content}</span>
              </div>
            ) : message.type === "coin" ? (
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-1 font-medium",
                  isMe
                    ? "border-white/30 bg-white/15 text-white"
                    : "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300"
                )}
              >
                <Coins className="size-4 animate-bounce text-sky-300" />
                <span>{message.content}</span>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
          </div>

          {/* Time & Double Checkmark footer */}
          <div
            className={cn(
              "mt-0.5 flex items-center justify-end gap-1 font-mono text-[10px] select-none",
              isMe ? "text-white/80 dark:text-white/80" : "text-muted-foreground"
            )}
          >
            <span>{timeFormatted}</span>
            {isMe && (
              <span title="Delivered">
                <CheckCheck className="size-3 text-sky-200 dark:text-sky-200" />
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges below the bubble */}
        {reactionKeys.length > 0 && (
          <div
            className={cn(
              "mt-1 flex flex-wrap gap-1",
              isMe ? "justify-end" : "justify-start"
            )}
          >
            {reactionKeys.map((emoji) => {
              const users = reactions[emoji] || []
              const hasReacted = users.includes(currentUser.id)
              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onToggleReaction(message.id, emoji)}
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-all shadow-2xs",
                    hasReacted
                      ? "border-primary bg-primary/20 text-primary font-bold scale-105"
                      : "border-border bg-card/90 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  title={`${users.length} reaction${users.length > 1 ? "s" : ""}`}
                >
                  <span>{emoji}</span>
                  <span className="font-mono text-[10.5px]">{users.length}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Telegram Hover Floating Action Bar */}
        <div
          className={cn(
            "absolute -top-3.5 hidden items-center gap-0.5 rounded-full border border-border bg-background/95 px-1 py-0.5 shadow-md backdrop-blur-md group-hover:flex z-10",
            isMe ? "right-2" : "left-2"
          )}
        >
          {/* Reply Button */}
          <button
            type="button"
            onClick={() => onReply?.(message)}
            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Reply to message"
          >
            <Reply className="size-3.5" />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title={isCopied ? "Copied!" : "Copy message"}
          >
            {isCopied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>

          <div className="h-3 w-px bg-border/80 mx-0.5" />

          {/* Quick Reaction Emojis */}
          {POPULAR_REACTIONS.slice(0, 3).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onToggleReaction(message.id, emoji)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-xs transition-transform hover:scale-125 hover:bg-muted"
            >
              {emoji}
            </button>
          ))}

          {/* More Emojis */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              title="More reactions"
            >
              <SmilePlus className="size-3.5" />
            </button>

            {showEmojiPicker && (
              <div
                className={cn(
                  "absolute top-8 z-30 flex gap-1 rounded-xl border border-border bg-popover p-1.5 shadow-lg",
                  isMe ? "right-0" : "left-0"
                )}
              >
                {POPULAR_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onToggleReaction(message.id, emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-sm transition-transform hover:scale-125 hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Outgoing Avatar on the right */}
      {isMe && (
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm shadow-xs select-none self-end mb-1",
            currentUser.color || "from-violet-500 to-purple-600"
          )}
          title="You"
        >
          <span>{currentUser.avatar}</span>
        </div>
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import {
  type ChatChannel,
  type ChatMessage,
  type ChatReplyPreview,
  type AnonUser,
  INITIAL_CHANNELS,
  INITIAL_MESSAGES,
  generateRandomAnonUser,
} from "@/lib/chat-data"
import {
  chatAudio,
  requestDesktopNotification,
  hasDesktopNotificationPermission,
  triggerDesktopNotification,
} from "@/lib/chat-audio"
import { ChannelSidebar } from "./channel-sidebar"
import { ChatMessageItem } from "./chat-message-item"
import { ChatInputBar } from "./chat-input-bar"
import { CreateChannelDialog } from "./create-channel-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowDown,
  ArrowLeft,
  ChevronDown,
  Menu,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_USER_KEY = "anon_chat_identity_v1"
const STORAGE_SOUND_KEY = "anon_chat_sound_enabled"

function formatChatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const today = new Date()
    if (d.toDateString() === today.toDateString()) return "Today"
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday"
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return ""
  }
}

export function AnonChatView() {
  // 1. User Persona State
  const [user, setUser] = React.useState<AnonUser>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_USER_KEY)
        if (saved) return JSON.parse(saved)
      } catch {
        // Fallback
      }
    }
    return generateRandomAnonUser()
  })

  // Sound preference
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true)
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(false)

  // 2. Channels & Active Channel State
  const [channels, setChannels] = React.useState<ChatChannel[]>(INITIAL_CHANNELS)
  const [activeChannelId, setActiveChannelId] = React.useState<string>("general")
  const [unreadCounts, setUnreadCounts] = React.useState<Record<string, number>>({})
  const [isCreateChannelOpen, setIsCreateChannelOpen] = React.useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = React.useState(false)

  // 3. Messages & Reply State
  const [messages, setMessages] = React.useState<ChatMessage[]>(() =>
    INITIAL_MESSAGES.filter((m) => m.channelId === "general")
  )
  const [isLoadingMessages, setIsLoadingMessages] = React.useState<boolean>(false)
  const [replyingTo, setReplyingTo] = React.useState<ChatReplyPreview | null>(null)
  const [highlightedMessageId, setHighlightedMessageId] = React.useState<string | null>(null)

  // 4. Telegram-style Auto-scroll & Floating button state
  const [showScrollBottom, setShowScrollBottom] = React.useState(false)
  const [unreadBelowCount, setUnreadBelowCount] = React.useState(0)
  const isNearBottomRef = React.useRef(true)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const chatScrollContainerRef = React.useRef<HTMLDivElement>(null)
  const broadcastChannelRef = React.useRef<BroadcastChannel | null>(null)
  const latestMessageTimeRef = React.useRef<string | null>(null)

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_USER_KEY)
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      } else {
        const fresh = generateRandomAnonUser()
        setUser(fresh)
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fresh))
      }

      const savedSound = localStorage.getItem(STORAGE_SOUND_KEY)
      if (savedSound !== null) {
        setSoundEnabled(savedSound === "true")
      }

      setNotificationsEnabled(hasDesktopNotificationPermission())
    } catch {
      // Ignored
    }
  }, [])

  // Multi-tab BroadcastChannel sync
  React.useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const bc = new BroadcastChannel("anon_chat_tab_sync")
      broadcastChannelRef.current = bc

      bc.onmessage = (event) => {
        const { type, payload } = event.data || {}
        if (type === "NEW_MESSAGE" && payload) {
          const newMsg = payload as ChatMessage
          if (newMsg.channelId === activeChannelId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })

            if (soundEnabled && newMsg.senderId !== user.id) {
              chatAudio.playIncomingMessage()
            }

            // Auto scroll if near bottom
            if (isNearBottomRef.current) {
              setTimeout(() => scrollToBottom("smooth"), 50)
            } else if (newMsg.senderId !== user.id) {
              setUnreadBelowCount((c) => c + 1)
            }
          } else {
            setUnreadCounts((prev) => ({
              ...prev,
              [newMsg.channelId]: (prev[newMsg.channelId] || 0) + 1,
            }))
          }
        } else if (type === "NEW_CHANNEL" && payload) {
          const newChan = payload as ChatChannel
          setChannels((prev) => {
            if (prev.some((c) => c.id === newChan.id)) return prev
            return [...prev, newChan]
          })
        }
      }

      return () => {
        bc.close()
      }
    }
  }, [activeChannelId, soundEnabled, user.id])

  // Save user changes
  const handleUpdateUser = (updatedUser: AnonUser) => {
    setUser(updatedUser)
    try {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(updatedUser))
    } catch {
      // Ignored
    }
  }

  // Toggle sound
  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_SOUND_KEY, String(next))
      } catch {}
      return next
    })
  }

  // Request notifications
  const handleRequestNotification = async () => {
    const granted = await requestDesktopNotification()
    setNotificationsEnabled(granted)
    if (granted) {
      triggerDesktopNotification(
        "Anon Chat Alerts Active!",
        "You will be alerted when new anonymous messages arrive."
      )
    }
  }

  // Fetch Channels on mount
  React.useEffect(() => {
    async function loadChannels() {
      try {
        const res = await fetch("/api/chat/channels")
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setChannels(data.data)
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live channels:", err)
      }
    }
    loadChannels()
  }, [])

  // Fetch Messages for active channel
  React.useEffect(() => {
    let isCancelled = false
    setIsLoadingMessages(true)
    setReplyingTo(null)

    async function loadMessages() {
      try {
        const res = await fetch(
          `/api/chat/messages?channelId=${encodeURIComponent(activeChannelId)}`
        )
        if (res.ok) {
          const data = await res.json()
          if (!isCancelled && data.success && Array.isArray(data.data)) {
            setMessages(data.data)
            if (data.data.length > 0) {
              latestMessageTimeRef.current =
                data.data[data.data.length - 1].createdAt
            }
          }
        }
      } catch (err) {
        console.warn("Failed to load channel messages:", err)
      } finally {
        if (!isCancelled) {
          setIsLoadingMessages(false)
          // Clear unread for active channel
          setUnreadCounts((prev) => ({ ...prev, [activeChannelId]: 0 }))
          setTimeout(() => scrollToBottom("auto"), 60)
        }
      }
    }

    loadMessages()

    return () => {
      isCancelled = true
    }
  }, [activeChannelId])

  // Polling loop for active & background messages
  React.useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/chat/messages?channelId=${encodeURIComponent(activeChannelId)}`
        )
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            const incoming: ChatMessage[] = data.data

            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id))
              const brandNew = incoming.filter((m) => !existingIds.has(m.id))

              if (brandNew.length > 0) {
                const containsOthers = brandNew.some((m) => m.senderId !== user.id)
                if (containsOthers) {
                  if (soundEnabled) {
                    chatAudio.playIncomingMessage()
                  }
                  if (notificationsEnabled && document.hidden) {
                    const last = brandNew[brandNew.length - 1]
                    triggerDesktopNotification(
                      `#${activeChannelId} • ${last.senderName}`,
                      last.content
                    )
                  }

                  // Auto scroll if user was near bottom
                  if (isNearBottomRef.current) {
                    setTimeout(() => scrollToBottom("smooth"), 60)
                  } else {
                    setUnreadBelowCount((c) => c + brandNew.length)
                  }
                }
                return [...prev, ...brandNew]
              }
              return prev
            })
          }
        }
      } catch {
        // Polling network blip
      }
    }, 2800)

    return () => clearInterval(timer)
  }, [activeChannelId, soundEnabled, notificationsEnabled, user.id])

  // Scroll Helper
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior })
    setUnreadBelowCount(0)
    setShowScrollBottom(false)
    isNearBottomRef.current = true
  }

  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } =
      chatScrollContainerRef.current
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    const isNear = distanceToBottom < 100
    isNearBottomRef.current = isNear
    setShowScrollBottom(!isNear)
    if (isNear) {
      setUnreadBelowCount(0)
    }
  }

  // Handle Reply to a message
  const handleReply = (msg: ChatMessage) => {
    setReplyingTo({
      id: msg.id,
      senderName: msg.senderName,
      content:
        msg.content.length > 100
          ? msg.content.slice(0, 100) + "…"
          : msg.content,
      senderAvatar: msg.senderAvatar,
    })
  }

  // Jump to quoted message
  const handleScrollToMessage = (messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
      setHighlightedMessageId(messageId)
      setTimeout(() => setHighlightedMessageId(null), 2200)
    }
  }

  // Send Message Handler
  const handleSendMessage = async (
    content: string,
    type: "text" | "dice" | "coin" = "text",
    replyTo?: ChatReplyPreview
  ) => {
    if (!content.trim()) return

    // Sound effect
    if (soundEnabled) {
      if (type === "dice" || type === "coin") {
        chatAudio.playDiceRoll()
      } else {
        chatAudio.playOutgoingMessage()
      }
    }

    // Optimistic message
    const tempId = `optimistic_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 6)}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      channelId: activeChannelId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderColor: user.color,
      content,
      type,
      replyTo: replyTo || undefined,
      reactions: {},
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMessage])
    setReplyingTo(null)

    // Always auto-scroll immediately on user send
    setTimeout(() => scrollToBottom("smooth"), 50)

    // Broadcast to other tabs
    broadcastChannelRef.current?.postMessage({
      type: "NEW_MESSAGE",
      payload: optimisticMessage,
    })

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelId: activeChannelId,
          senderId: user.id,
          senderName: user.name,
          senderAvatar: user.avatar,
          senderColor: user.color,
          content,
          type,
          replyTo: replyTo || undefined,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          // Replace optimistic ID with real ID
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? json.data : m))
          )
        }
      }
    } catch (err) {
      console.warn("Failed to persist message:", err)
    }
  }

  // Toggle Reaction Handler
  const handleToggleReaction = async (messageId: string, emoji: string) => {
    // Optimistic toggle
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg
        const reactions = { ...(msg.reactions || {}) }
        const userList = reactions[emoji] || []
        if (userList.includes(user.id)) {
          reactions[emoji] = userList.filter((id) => id !== user.id)
          if (reactions[emoji].length === 0) delete reactions[emoji]
        } else {
          reactions[emoji] = [...userList, user.id]
        }
        return { ...msg, reactions }
      })
    )

    try {
      await fetch("/api/chat/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          emoji,
          senderId: user.id,
        }),
      })
    } catch (err) {
      console.warn("Reaction toggle error:", err)
    }
  }

  // Handle Channel Created
  const handleChannelCreated = (newChannel: ChatChannel) => {
    setChannels((prev) => [...prev, newChannel])
    setActiveChannelId(newChannel.id)
    broadcastChannelRef.current?.postMessage({
      type: "NEW_CHANNEL",
      payload: newChannel,
    })
  }

  const activeChannel =
    channels.find((c) => c.id === activeChannelId) || channels[0]

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top Application Navbar */}
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden size-8 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            {isMobileSidebarOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </Button>

          {/* Back to Home Link */}
          <Link href="/">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs font-medium cursor-pointer shadow-2xs hover:bg-muted"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Services</span>
            </Button>
          </Link>

          {/* Active Channel Title Info */}
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-xs font-bold">
              #
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="font-vazirmatn text-sm font-bold text-foreground"
                  dir="auto"
                >
                  {activeChannel ? activeChannel.name : "general"}
                </span>
                <Badge
                  variant="outline"
                  className="hidden sm:inline-flex text-[10px] px-1.5 py-0 capitalize border-border"
                >
                  {activeChannel?.category || "general"}
                </Badge>
              </div>
              {activeChannel?.topic && (
                <p
                  className="font-vazirmatn hidden md:block truncate text-[11px] text-muted-foreground max-w-sm lg:max-w-md"
                  dir="auto"
                >
                  {activeChannel.topic}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right side stats & quick controls */}
        <div className="flex items-center gap-2">
          {/* Squad status badge */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px]">
              Anonymous Squad Online
            </span>
          </div>

          {/* Quick Sound Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggleSound}
            className="size-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
            title={
              soundEnabled
                ? "Mute notification sounds"
                : "Enable notification sounds"
            }
          >
            {soundEnabled ? (
              <Volume2 className="size-4 text-emerald-500" />
            ) : (
              <VolumeX className="size-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Chat Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <ChannelSidebar
            channels={channels}
            activeChannelId={activeChannelId}
            onSelectChannel={setActiveChannelId}
            onOpenCreateChannel={() => setIsCreateChannelOpen(true)}
            unreadCounts={unreadCounts}
            user={user}
            onUpdateUser={handleUpdateUser}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            notificationsEnabled={notificationsEnabled}
            onRequestNotificationPermission={handleRequestNotification}
          />
        </div>

        {/* Mobile Sidebar Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-50 w-72 max-w-[80vw] bg-sidebar h-full shadow-2xl">
              <ChannelSidebar
                channels={channels}
                activeChannelId={activeChannelId}
                onSelectChannel={(id) => {
                  setActiveChannelId(id)
                  setIsMobileSidebarOpen(false)
                }}
                onOpenCreateChannel={() => {
                  setIsCreateChannelOpen(true)
                  setIsMobileSidebarOpen(false)
                }}
                unreadCounts={unreadCounts}
                user={user}
                onUpdateUser={handleUpdateUser}
                soundEnabled={soundEnabled}
                onToggleSound={handleToggleSound}
                notificationsEnabled={notificationsEnabled}
                onRequestNotificationPermission={handleRequestNotification}
              />
            </div>
          </div>
        )}

        {/* Center Chat Content Area - Telegram Style Pattern */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] bg-slate-50/70 dark:bg-slate-950/60">
          {/* Channel banner info pill */}
          {activeChannel?.description && (
            <div className="border-b border-border/60 bg-background/80 px-4 py-1.5 text-xs text-muted-foreground flex items-center justify-between backdrop-blur-xs z-10">
              <span className="font-vazirmatn truncate" dir="auto">
                {activeChannel.description}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground/70 shrink-0">
                <Sparkles className="size-3 text-amber-500" />
                Telegram Style
              </span>
            </div>
          )}

          {/* Messages Feed Container */}
          <div
            ref={chatScrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-1 py-4 sm:px-2 space-y-1.5"
          >
            {isLoadingMessages && messages.length === 0 ? (
              <div className="flex h-full items-center justify-center p-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span>Loading anonymous messages...</span>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-card border border-border shadow-xs text-3xl">
                  💬
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  Welcome to #{activeChannel ? activeChannel.name : "channel"}
                </h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  No messages yet. Send your first message, roll dice, or flip a
                  coin!
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const prevMsg = messages[index - 1]
                const showDateSeparator =
                  !prevMsg ||
                  new Date(msg.createdAt).toDateString() !==
                    new Date(prevMsg.createdAt).toDateString()

                return (
                  <React.Fragment key={msg.id}>
                    {/* Telegram Date Separator Pill */}
                    {showDateSeparator && (
                      <div className="flex justify-center my-3 select-none">
                        <span className="rounded-full bg-muted/90 dark:bg-slate-800/90 border border-border/60 px-3.5 py-1 text-[11px] font-medium text-muted-foreground shadow-2xs backdrop-blur-xs">
                          {formatChatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}

                    <ChatMessageItem
                      message={msg}
                      currentUser={user}
                      onToggleReaction={handleToggleReaction}
                      onReply={handleReply}
                      onScrollToMessage={handleScrollToMessage}
                      isHighlighted={highlightedMessageId === msg.id}
                    />
                  </React.Fragment>
                )
              })
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Floating Scroll to Bottom pill */}
          {showScrollBottom && (
            <div className="absolute bottom-20 right-6 z-20 animate-in fade-in-50 slide-in-from-bottom-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => scrollToBottom("smooth")}
                className="relative h-9 gap-1.5 rounded-full border-border bg-background/95 px-3.5 text-xs font-semibold shadow-lg backdrop-blur-md hover:bg-muted cursor-pointer hover:scale-105 transition-transform"
              >
                <span>Latest</span>
                <ChevronDown className="size-4 text-sky-500" />
                {unreadBelowCount > 0 && (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadBelowCount > 9 ? "9+" : unreadBelowCount}
                  </span>
                )}
              </Button>
            </div>
          )}

          {/* Chat Input Bar with Reply Banner */}
          <ChatInputBar
            channelName={activeChannel ? activeChannel.name : "channel"}
            onSendMessage={handleSendMessage}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        </main>
      </div>

      {/* Create Channel Dialog */}
      <CreateChannelDialog
        open={isCreateChannelOpen}
        onOpenChange={setIsCreateChannelOpen}
        onChannelCreated={handleChannelCreated}
      />
    </div>
  )
}

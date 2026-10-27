"use client"

import * as React from "react"
import Link from "next/link"
import {
  type ChatChannel,
  type ChatMessage,
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
  ArrowLeft,
  ChevronDown,
  Hash,
  Menu,
  MessageSquare,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_USER_KEY = "anon_chat_identity_v1"
const STORAGE_SOUND_KEY = "anon_chat_sound_enabled"

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

  // 3. Messages State
  const [messages, setMessages] = React.useState<ChatMessage[]>(() =>
    INITIAL_MESSAGES.filter((m) => m.channelId === "general")
  )
  const [isLoadingMessages, setIsLoadingMessages] = React.useState<boolean>(false)
  const [showScrollBottom, setShowScrollBottom] = React.useState(false)

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
      triggerDesktopNotification("Anon Chat Alerts Active!", "You will be alerted when new anonymous messages arrive.")
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

    async function loadMessages() {
      try {
        const res = await fetch(`/api/chat/messages?channelId=${encodeURIComponent(activeChannelId)}`)
        if (res.ok) {
          const data = await res.json()
          if (!isCancelled && data.success && Array.isArray(data.data)) {
            setMessages(data.data)
            if (data.data.length > 0) {
              latestMessageTimeRef.current = data.data[data.data.length - 1].createdAt
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
          scrollToBottom("auto")
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
        const res = await fetch(`/api/chat/messages?channelId=${encodeURIComponent(activeChannelId)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.data)) {
            const incoming: ChatMessage[] = data.data

            setMessages((prev) => {
              // Check if there are new messages
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
  }

  const handleScroll = () => {
    if (!chatScrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = chatScrollContainerRef.current
    const isUp = scrollHeight - scrollTop - clientHeight > 140
    setShowScrollBottom(isUp)
  }

  // Send Message Handler
  const handleSendMessage = async (content: string, type: "text" | "dice" | "coin" = "text") => {
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
    const tempId = `optimistic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    const optimisticMessage: ChatMessage = {
      id: tempId,
      channelId: activeChannelId,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      senderColor: user.color,
      content,
      type,
      reactions: {},
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, optimisticMessage])
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

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0]

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
            {isMobileSidebarOpen ? <X className="size-4" /> : <Menu className="size-4" />}
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
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-mono text-xs font-bold">
              #
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
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
                <p className="hidden md:block truncate text-[11px] text-muted-foreground max-w-sm lg:max-w-md">
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
            <span className="font-medium text-[11px]">Anonymous Squad Online</span>
          </div>

          {/* Quick Sound Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggleSound}
            className="size-8 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
            title={soundEnabled ? "Mute notification sounds" : "Enable notification sounds"}
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

        {/* Center Chat Content Area */}
        <main className="flex flex-1 flex-col overflow-hidden bg-background">
          {/* Channel banner info pill */}
          {activeChannel?.description && (
            <div className="border-b border-border/60 bg-muted/20 px-4 py-1.5 text-xs text-muted-foreground flex items-center justify-between">
              <span className="truncate">{activeChannel.description}</span>
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground/70 shrink-0">
                <Sparkles className="size-3 text-amber-500" />
                Live Channels
              </span>
            </div>
          )}

          {/* Messages Feed */}
          <div
            ref={chatScrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto divide-y divide-border/20 py-2"
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
                <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 text-2xl">
                  💬
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">
                  Welcome to #{activeChannel ? activeChannel.name : "channel"}
                </h3>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  This room is quiet right now. Send the first anonymous message or roll the dice!
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  currentUser={user}
                  onToggleReaction={handleToggleReaction}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Scroll to Bottom pill */}
          {showScrollBottom && (
            <div className="absolute bottom-20 right-6 z-10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => scrollToBottom("smooth")}
                className="h-8 gap-1.5 rounded-full border-border bg-background/90 px-3 text-xs shadow-md backdrop-blur-xs hover:bg-muted cursor-pointer"
              >
                <span>Latest messages</span>
                <ChevronDown className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Chat Input Bar */}
          <ChatInputBar
            channelName={activeChannel ? activeChannel.name : "channel"}
            onSendMessage={handleSendMessage}
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

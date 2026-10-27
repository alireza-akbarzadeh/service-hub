"use client"

import * as React from "react"
import type { ChatChannel, AnonUser } from "@/lib/chat-data"
import { AnonIdentityCard } from "./anon-identity-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  BellOff,
  Coffee,
  Flame,
  Gamepad2,
  Hash,
  MessageSquare,
  Music,
  Plus,
  Search,
  Sparkles,
  Terminal,
  Tv,
  Volume2,
  VolumeX,
} from "lucide-react"
import { cn } from "@/lib/utils"

const ICON_MAP: Record<string, React.ElementType> = {
  Gamepad2,
  MessageSquare,
  Terminal,
  Sparkles,
  Coffee,
  Flame,
  Music,
  Tv,
  Hash,
}

interface ChannelSidebarProps {
  channels: ChatChannel[]
  activeChannelId: string
  onSelectChannel: (channelId: string) => void
  onOpenCreateChannel: () => void
  unreadCounts: Record<string, number>
  user: AnonUser
  onUpdateUser: (user: AnonUser) => void
  soundEnabled: boolean
  onToggleSound: () => void
  notificationsEnabled: boolean
  onRequestNotificationPermission: () => void
}

export function ChannelSidebar({
  channels,
  activeChannelId,
  onSelectChannel,
  onOpenCreateChannel,
  unreadCounts,
  user,
  onUpdateUser,
  soundEnabled,
  onToggleSound,
  notificationsEnabled,
  onRequestNotificationPermission,
}: ChannelSidebarProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredChannels = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [
    { id: "general", label: "General" },
    { id: "gaming", label: "Gaming" },
    { id: "tech", label: "Tech" },
    { id: "fun", label: "Fun" },
    { id: "custom", label: "Custom" },
  ]

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-sidebar md:w-64 lg:w-72 shrink-0">
      {/* Top: Anonymous Persona Card */}
      <div className="border-b border-border p-3">
        <AnonIdentityCard
          user={user}
          onUpdateUser={onUpdateUser}
          soundEnabled={soundEnabled}
        />
      </div>

      {/* Channel Header & Controls */}
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Channels ({channels.length})
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenCreateChannel}
          className="h-7 cursor-pointer gap-1 px-2 text-xs font-medium text-foreground hover:bg-muted shadow-2xs"
          title="Create a new channel (e.g. game, general)"
        >
          <Plus className="size-3.5" />
          <span>New</span>
        </Button>
      </div>

      {/* Channel Filter Search */}
      <div className="px-3 py-1.5">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels..."
            className="h-8 pl-8 text-xs bg-muted/30"
          />
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {filteredChannels.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No channels found.
          </div>
        ) : (
          categories.map((cat) => {
            const catChannels = filteredChannels.filter(
              (c) => (c.category || "general") === cat.id
            )
            if (catChannels.length === 0) return null

            return (
              <div key={cat.id} className="space-y-0.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {cat.label}
                </div>
                {catChannels.map((channel) => {
                  const IconComp = ICON_MAP[channel.icon] || Hash
                  const isActive = channel.id === activeChannelId
                  const unread = unreadCounts[channel.id] || 0

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => onSelectChannel(channel.id)}
                      className={cn(
                        "group flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconComp
                          className={cn(
                            "size-4 shrink-0 transition-transform group-hover:scale-110",
                            isActive ? "text-primary-foreground" : "text-muted-foreground"
                          )}
                        />
                        <span className="truncate">#{channel.name}</span>
                      </div>

                      {unread > 0 && !isActive && (
                        <Badge
                          variant="destructive"
                          className="size-5 shrink-0 p-0 flex items-center justify-center text-[10px] font-bold rounded-full animate-bounce"
                        >
                          {unread > 99 ? "99+" : unread}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })
        )}
      </div>

      {/* Footer Controls: Notification & Audio Toggles */}
      <div className="border-t border-border p-3 space-y-2 bg-muted/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            {soundEnabled ? (
              <Volume2 className="size-3.5 text-emerald-500" />
            ) : (
              <VolumeX className="size-3.5 text-muted-foreground" />
            )}
            Sound Effects
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleSound}
            className="h-7 px-2 text-xs font-semibold cursor-pointer"
          >
            {soundEnabled ? "On" : "Muted"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            {notificationsEnabled ? (
              <Bell className="size-3.5 text-sky-500" />
            ) : (
              <BellOff className="size-3.5 text-muted-foreground" />
            )}
            Desktop Alerts
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRequestNotificationPermission}
            className={cn(
              "h-7 px-2 text-xs font-semibold cursor-pointer",
              notificationsEnabled ? "text-sky-500" : "text-muted-foreground"
            )}
          >
            {notificationsEnabled ? "Enabled" : "Enable"}
          </Button>
        </div>
      </div>
    </aside>
  )
}

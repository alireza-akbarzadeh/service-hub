"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Gamepad2,
  Hash,
  MessageSquare,
  Sparkles,
  Terminal,
  Coffee,
  Flame,
  Music,
  Plus,
  Tv,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatChannel } from "@/lib/chat-data"

const CHANNEL_ICONS = [
  { id: "Gamepad2", label: "Gaming", icon: Gamepad2 },
  { id: "MessageSquare", label: "General", icon: MessageSquare },
  { id: "Terminal", label: "Tech", icon: Terminal },
  { id: "Sparkles", label: "Fun", icon: Sparkles },
  { id: "Coffee", label: "Lounge", icon: Coffee },
  { id: "Flame", label: "Hype", icon: Flame },
  { id: "Music", label: "Music", icon: Music },
  { id: "Tv", label: "Media", icon: Tv },
]

const CATEGORIES: { id: ChatChannel["category"]; label: string }[] = [
  { id: "general", label: "General" },
  { id: "gaming", label: "Gaming" },
  { id: "tech", label: "Tech & Dev" },
  { id: "fun", label: "Fun & Memes" },
  { id: "custom", label: "Custom" },
]

interface CreateChannelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChannelCreated: (channel: ChatChannel) => void
}

export function CreateChannelDialog({
  open,
  onOpenChange,
  onChannelCreated,
}: CreateChannelDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [topic, setTopic] = React.useState("")
  const [category, setCategory] = React.useState<ChatChannel["category"]>("gaming")
  const [selectedIcon, setSelectedIcon] = React.useState("Gamepad2")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const cleanSlug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/^-+|-+$/g, "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cleanSlug) {
      setErrorMessage("Please enter a valid channel name")
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/chat/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanSlug,
          description: description.trim(),
          topic: topic.trim(),
          category,
          icon: selectedIcon,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to create channel")
        setIsSubmitting(false)
        return
      }

      onChannelCreated(data.data)
      setName("")
      setDescription("")
      setTopic("")
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      setErrorMessage("Network error creating channel")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-4 text-primary" />
            <span>Create New Channel</span>
          </DialogTitle>
          <DialogDescription>
            Create an anonymous room for discussions, gaming, or team fun.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-2">
          {errorMessage && (
            <div className="rounded-lg bg-destructive/15 border border-destructive/20 p-2.5 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-foreground">Channel Name</label>
            <div className="relative mt-1 flex items-center">
              <span className="absolute left-3 text-muted-foreground font-mono text-sm">#</span>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setErrorMessage(null)
                }}
                placeholder="e.g. game-room or general-fun"
                className="pl-7 font-mono text-xs"
                required
                maxLength={32}
              />
            </div>
            {cleanSlug && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Will be created as: <code className="font-semibold text-foreground">#{cleanSlug}</code>
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Category</label>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setCategory(cat.id)
                    if (cat.id === "gaming") setSelectedIcon("Gamepad2")
                    if (cat.id === "general") setSelectedIcon("MessageSquare")
                    if (cat.id === "tech") setSelectedIcon("Terminal")
                    if (cat.id === "fun") setSelectedIcon("Sparkles")
                  }}
                  className={cn(
                    "cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                    category === cat.id
                      ? "border-primary bg-primary text-primary-foreground shadow-2xs"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Icon</label>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {CHANNEL_ICONS.map((item) => {
                const IconComponent = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIcon(item.id)}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border p-2 text-xs transition-all",
                      selectedIcon === item.id
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-card hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <IconComponent className="size-3.5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground">Description & Topic</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about? (optional) توضیحات کانال"
              className="mt-1 text-xs font-vazirmatn"
              dir="auto"
              maxLength={120}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !cleanSlug}>
              {isSubmitting ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  Megaphone,
  Plus,
  Radio,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react"
import * as React from "react"

export type AnnouncementSeverity = "info" | "warning" | "critical" | "success"

export interface AnnouncementItem {
  id: string
  title: string
  message: string
  severity: AnnouncementSeverity
  author: string
  timestamp: string
  active: boolean
}

const DEFAULT_ANNOUNCEMENT: AnnouncementItem = {
  id: "announcement-prod-intranet-notice",
  title: "Iran Intranet Direct Connection Advisory",
  message:
    "Direct Iran network or company VPN is required to reach internal microservices (172.31.* and *.hasti.co). Commercial foreign VPNs will encounter timeouts.",
  severity: "warning",
  author: "Platform Architecture",
  timestamp: new Date().toISOString(),
  active: true,
}

const STORAGE_KEY = "service_hub_announcement"
const DISMISSED_KEY = "service_hub_dismissed_announcement_id"

interface AnnouncementBannerProps {
  teamName?: string
}

export function AnnouncementBanner({ teamName }: AnnouncementBannerProps) {
  const [announcement, setAnnouncement] =
    React.useState<AnnouncementItem | null>(null)
  const [isDismissed, setIsDismissed] = React.useState(true)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)

  // Form states for broadcasting
  const [formTitle, setFormTitle] = React.useState("")
  const [formMessage, setFormMessage] = React.useState("")
  const [formSeverity, setFormSeverity] =
    React.useState<AnnouncementSeverity>("warning")
  const [formAuthor, setFormAuthor] = React.useState(
    teamName || "Platform Team"
  )

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const currentAnnouncement: AnnouncementItem = stored
        ? JSON.parse(stored)
        : DEFAULT_ANNOUNCEMENT

      setAnnouncement(currentAnnouncement)

      const dismissedId = localStorage.getItem(DISMISSED_KEY)
      if (
        dismissedId === currentAnnouncement.id ||
        !currentAnnouncement.active
      ) {
        setIsDismissed(true)
      } else {
        setIsDismissed(false)
      }
    } catch {
      setAnnouncement(DEFAULT_ANNOUNCEMENT)
      setIsDismissed(false)
    }

    // Listen to storage events across tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue)
          setAnnouncement(updated)
          const dismissedId = localStorage.getItem(DISMISSED_KEY)
          setIsDismissed(dismissedId === updated.id || !updated.active)
        } catch {
          // ignore
        }
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const handleDismiss = () => {
    if (!announcement) return
    setIsDismissed(true)
    try {
      localStorage.setItem(DISMISSED_KEY, announcement.id)
    } catch {
      // ignore
    }
  }

  const handleOpenBroadcastModal = () => {
    if (announcement) {
      setFormTitle(announcement.title)
      setFormMessage(announcement.message)
      setFormSeverity(announcement.severity)
      setFormAuthor(teamName || announcement.author || "Platform Team")
    } else {
      setFormTitle("")
      setFormMessage("")
      setFormSeverity("info")
      setFormAuthor(teamName || "Platform Team")
    }
    setIsDialogOpen(true)
  }

  const handlePublishBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim() || !formMessage.trim()) return

    const newAnnouncement: AnnouncementItem = {
      id: `announcement-${Date.now()}`,
      title: formTitle.trim(),
      message: formMessage.trim(),
      severity: formSeverity,
      author: formAuthor.trim() || "Platform Team",
      timestamp: new Date().toISOString(),
      active: true,
    }

    setAnnouncement(newAnnouncement)
    setIsDismissed(false)

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnnouncement))
      localStorage.removeItem(DISMISSED_KEY) // Reset dismissed state for new announcement
    } catch {
      // ignore
    }

    setIsDialogOpen(false)
  }

  const handleClearBroadcast = () => {
    if (!announcement) return
    const disabled = { ...announcement, active: false }
    setAnnouncement(disabled)
    setIsDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(disabled))
    } catch {
      // ignore
    }
    setIsDialogOpen(false)
  }

  const getSeverityStyles = (severity: AnnouncementSeverity) => {
    switch (severity) {
      case "critical":
        return {
          border: "border-destructive/40",
          bg: "bg-destructive/10",
          text: "text-destructive",
          icon: (
            <AlertCircle className="size-4 shrink-0 animate-pulse text-destructive" />
          ),
          badgeVariant: "destructive" as const,
          label: "Incident / Critical",
        }
      case "warning":
        return {
          border: "border-amber-500/40",
          bg: "bg-amber-500/10",
          text: "text-amber-700 dark:text-amber-300",
          icon: <AlertTriangle className="size-4 shrink-0 text-amber-500" />,
          badgeVariant: "outline" as const,
          label: "Maintenance / Notice",
        }
      case "success":
        return {
          border: "border-emerald-500/40",
          bg: "bg-emerald-500/10",
          text: "text-emerald-700 dark:text-emerald-300",
          icon: <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />,
          badgeVariant: "outline" as const,
          label: "Release / Green",
        }
      case "info":
      default:
        return {
          border: "border-sky-500/40",
          bg: "bg-sky-500/10",
          text: "text-sky-700 dark:text-sky-300",
          icon: <Info className="size-4 shrink-0 text-sky-500" />,
          badgeVariant: "outline" as const,
          label: "Announcement",
        }
    }
  }

  const styles = announcement ? getSeverityStyles(announcement.severity) : null

  return (
    <>
      {/* Broadcast Banner if not dismissed and active */}
      {!isDismissed && announcement && announcement.active && styles && (
        <div
          className={cn(
            "relative flex animate-in flex-col items-start justify-between gap-3 rounded-xl border p-3 text-xs shadow-xs transition-all duration-200 fade-in-0 sm:flex-row sm:items-center sm:px-4",
            styles.border,
            styles.bg,
            styles.text
          )}
        >
          <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
            {styles.icon}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold tracking-tight text-foreground">
                  {announcement.title}
                </span>
                <Badge
                  variant={styles.badgeVariant}
                  className="px-1.5 py-0 font-mono text-[10px] uppercase"
                >
                  {announcement.severity}
                </Badge>
                <span className="text-[11px] opacity-75">
                  by {announcement.author}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                {announcement.message}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-end sm:self-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenBroadcastModal}
              className="h-7 cursor-pointer px-2 text-[11px] font-medium opacity-80 hover:opacity-100"
            >
              <Megaphone className="mr-1 size-3" />
              <span>Broadcast</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="size-7 cursor-pointer opacity-70 hover:opacity-100"
              title="Dismiss notice"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Broadcast Dialog for Team Members */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Radio className="size-4 animate-pulse text-primary" />
              <span>Team Announcement Broadcast</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Broadcast a real-time banner across the Service Catalog for
              maintenance notices, deployment alerts, or VPN advisories.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePublishBroadcast} className="space-y-3.5 py-2">
            {/* Severity Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Notice Severity
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(
                  [
                    "info",
                    "warning",
                    "critical",
                    "success",
                  ] as AnnouncementSeverity[]
                ).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFormSeverity(sev)}
                    className={cn(
                      "cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-all",
                      formSeverity === sev
                        ? "border-primary bg-primary font-bold text-primary-foreground shadow-xs"
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Headline / Title
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Staging DB Migration Window"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Detailed Message
              </label>
              <textarea
                required
                rows={3}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Explain the scheduled window, affected services, or network instructions..."
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Sender / Team Name
              </label>
              <input
                type="text"
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="e.g. Platform Team, DevOps, Security"
                className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden"
              />
            </div>

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              {announcement?.active && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleClearBroadcast}
                  className="mr-auto cursor-pointer gap-1.5 text-xs"
                >
                  <Trash2 className="size-3.5" />
                  <span>Clear Notice</span>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="cursor-pointer gap-1.5 text-xs font-semibold"
              >
                <Send className="size-3.5" />
                <span>Publish Broadcast</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

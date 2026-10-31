"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ExternalLink,
  Flame,
  GitPullRequest,
  Info,
  Megaphone,
  Radio,
  Trash2,
  Video,
  X,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  initialSystemNotifications,
  getStoredReadIds,
  saveStoredReadIds,
  getStoredDismissedIds,
  saveStoredDismissedIds,
  type AppNotification,
  type NotificationCategory,
} from "@/lib/notifications-data"
import type { Service } from "@/lib/db/schema"

interface NotificationCenterProps {
  services?: Service[]
  onInspectServiceByName?: (name: string) => void
  className?: string
}

export function NotificationCenter({
  services,
  onInspectServiceByName,
  className,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<AppNotification[]>([])
  const [activeFilter, setActiveFilter] = React.useState<
    "all" | "unread" | "incident" | "request"
  >("all")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Hydrate notifications from storage and initial fixtures
  React.useEffect(() => {
    const readIds = new Set(getStoredReadIds())
    const dismissedIds = new Set(getStoredDismissedIds())

    // Base fixtures with read/dismissed state applied
    let baseList: AppNotification[] = initialSystemNotifications
      .filter((n) => !dismissedIds.has(n.id))
      .map((n) => ({
        ...n,
        read: n.read || readIds.has(n.id),
      }))

    // Dynamically inject live incident alerts from passed services (degraded / maintenance)
    if (services && services.length > 0) {
      services.forEach((s) => {
        if (s.status === "degraded" || s.status === "maintenance") {
          const autoId = `live-service-${s.id}-${s.status}`
          if (!dismissedIds.has(autoId)) {
            const alreadyExists = baseList.some((item) => item.id === autoId)
            if (!alreadyExists) {
              baseList.unshift({
                id: autoId,
                title: `${s.name} is ${s.status.toUpperCase()}`,
                description: `Service has reported ${s.status} status. Check recent telemetry logs and endpoint availability.`,
                category: "incident",
                severity: s.status === "degraded" ? "warning" : "info",
                timestamp: "Live Alert",
                read: readIds.has(autoId),
                serviceName: s.name,
                actionLabel: "Inspect Service",
              })
            }
          }
        }
      })
    }

    setNotifications(baseList)
  }, [services])

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Mark single notification as read
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const readIds = new Set(getStoredReadIds())
    readIds.add(id)
    saveStoredReadIds(Array.from(readIds))

    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    const readIds = new Set(getStoredReadIds())
    notifications.forEach((n) => readIds.add(n.id))
    saveStoredReadIds(Array.from(readIds))

    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  // Dismiss single notification
  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const dismissedIds = new Set(getStoredDismissedIds())
    dismissedIds.add(id)
    saveStoredDismissedIds(Array.from(dismissedIds))

    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }

  // Clear all read notifications
  const handleClearRead = () => {
    const dismissedIds = new Set(getStoredDismissedIds())
    const readItems = notifications.filter((n) => n.read)
    readItems.forEach((n) => dismissedIds.add(n.id))
    saveStoredDismissedIds(Array.from(dismissedIds))

    setNotifications((prev) => prev.filter((item) => !item.read))
  }

  // Handle clicking on an item
  const handleNotificationClick = (item: AppNotification) => {
    handleMarkAsRead(item.id)

    if (item.serviceName && onInspectServiceByName) {
      onInspectServiceByName(item.serviceName)
      setIsOpen(false)
      return
    }

    if (item.actionUrl) {
      if (item.actionUrl.startsWith("http")) {
        window.open(item.actionUrl, "_blank", "noopener,noreferrer")
      } else {
        window.location.href = item.actionUrl
      }
      setIsOpen(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  // Filtered notifications
  const filteredNotifications = React.useMemo(() => {
    switch (activeFilter) {
      case "unread":
        return notifications.filter((n) => !n.read)
      case "incident":
        return notifications.filter((n) => n.category === "incident")
      case "request":
        return notifications.filter((n) => n.category === "request")
      default:
        return notifications
    }
  }, [notifications, activeFilter])

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "incident":
        return <Flame className="size-3.5 text-rose-500" />
      case "request":
        return <GitPullRequest className="size-3.5 text-violet-500" />
      case "meeting":
        return <Video className="size-3.5 text-emerald-500" />
      case "announcement":
        return <Megaphone className="size-3.5 text-sky-500" />
      default:
        return <Info className="size-3.5 text-primary" />
    }
  }

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      {/* Trigger Button with Badge Counter & Pulse */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-medium shadow-2xs transition-colors",
          isOpen
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title={
          unreadCount > 0
            ? `Notifications & System Alerts (${unreadCount} unread)`
            : "Notifications & System Alerts"
        }
      >
        <div className="relative">
          <Bell className="size-3.5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
            </span>
          )}
        </div>

        <span className="hidden xl:inline">Alerts</span>

        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold font-mono text-rose-600 dark:text-rose-400">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown Menu Window */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-84 sm:w-96 rounded-xl border border-border bg-card/95 text-card-foreground shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="size-3.5" />
              </div>
              <span className="text-xs font-semibold tracking-tight">
                Notifications & Alerts
              </span>
              {unreadCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-rose-500/30 bg-rose-500/10 text-[10px] font-mono text-rose-600 dark:text-rose-400 px-1.5 py-0"
                >
                  {unreadCount} unread
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-6 gap-1 px-1.5 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="size-3" />
                  <span className="hidden sm:inline">Mark all read</span>
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="size-6 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 border-b border-border/60 bg-muted/20 px-3 py-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={cn(
                "rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer",
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              className={cn(
                "rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer",
                activeFilter === "unread"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("incident")}
              className={cn(
                "rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer",
                activeFilter === "incident"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Incidents
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("request")}
              className={cn(
                "rounded-md px-2 py-0.5 font-medium transition-colors cursor-pointer",
                activeFilter === "request"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              PRs & Requests
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <BellOff className="size-8 stroke-1 text-muted-foreground/60 mb-2" />
                <p className="text-xs font-medium">All caught up!</p>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                  No notifications matching the selected filter.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={cn(
                    "group relative flex items-start gap-2.5 p-3 text-xs cursor-pointer transition-colors hover:bg-muted/50",
                    !item.read ? "bg-primary/5" : "opacity-85"
                  )}
                >
                  {/* Category icon */}
                  <div className="mt-0.5 shrink-0 rounded-md border border-border/80 bg-background p-1.5 shadow-2xs">
                    {getCategoryIcon(item.category)}
                  </div>

                  {/* Body */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4
                        className={cn(
                          "truncate text-xs font-semibold tracking-tight",
                          !item.read ? "text-foreground font-bold" : "text-muted-foreground"
                        )}
                      >
                        {item.title}
                      </h4>
                      <span className="shrink-0 text-[10px] text-muted-foreground font-mono">
                        {item.timestamp}
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {item.description}
                    </p>

                    {/* Action Pill / Label */}
                    <div className="flex items-center justify-between pt-1">
                      {item.actionLabel ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline">
                          <span>{item.actionLabel}</span>
                          <ArrowRight className="size-2.5" />
                        </span>
                      ) : (
                        <span />
                      )}

                      {/* Read / Dismiss controls */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {!item.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(item.id, e)}
                            className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="size-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDismiss(item.id, e)}
                          className="size-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Dismiss notification"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unread dot */}
                  {!item.read && (
                    <div className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3.5 py-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <Link
                href="/requests"
                onClick={() => setIsOpen(false)}
                className="hover:text-foreground hover:underline transition-colors font-medium"
              >
                Requests Board
              </Link>
              <span>•</span>
              <Link
                href="/calendar"
                onClick={() => setIsOpen(false)}
                className="hover:text-foreground hover:underline transition-colors font-medium"
              >
                Schedule
              </Link>
            </div>

            {notifications.some((n) => n.read) && (
              <button
                type="button"
                onClick={handleClearRead}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Trash2 className="size-2.5" />
                <span>Clear read</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


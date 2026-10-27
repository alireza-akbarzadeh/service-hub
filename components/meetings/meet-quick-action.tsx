"use client"

import * as React from "react"
import Link from "next/link"
import { useMeetings } from "@/hooks/use-meetings"
import { useCs2Match } from "@/hooks/use-cs2-match"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  CalendarDays,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Gamepad2,
  Plus,
  Sparkles,
  Video,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MeetQuickActionProps {
  variant?: "button" | "sidebar-item" | "pill"
  className?: string
}

export function MeetQuickAction({
  variant = "pill",
  className,
}: MeetQuickActionProps) {
  const { meetings, selectedMeeting, countdownText, isLiveNow } = useMeetings()
  const { config: cs2Config, formattedCountdown: cs2Countdown, copyConnect, copied: cs2Copied } = useCs2Match()
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // Find next upcoming active meeting
  const nextMeeting = selectedMeeting || meetings.find((m) => m.isActive) || meetings[0]

  const handleLaunchInstantMeet = () => {
    if (typeof window !== "undefined") {
      window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer")
    }
    setOpen(false)
  }

  const handleJoinMeeting = (url: string) => {
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer")
    }
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {variant === "sidebar-item" ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80",
            open && "bg-muted",
            className
          )}
          title="Meet Quick Actions (Instant Google Meet, Next Standup, CS2 Match)"
        >
          <div className="relative flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Video className="size-3.5" />
            {isLiveNow && (
              <span className="absolute -top-0.5 -right-0.5 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            )}
          </div>
          <span className="truncate">Meet Quick Action</span>
          {isLiveNow ? (
            <Badge className="ml-auto bg-emerald-500 text-[9px] px-1 py-0 text-white animate-pulse">
              LIVE
            </Badge>
          ) : nextMeeting ? (
            <Badge
              variant="outline"
              className="ml-auto border-emerald-500/30 text-[9px] font-mono px-1 py-0 text-emerald-600 dark:text-emerald-400"
            >
              {nextMeeting.tehranTime}
            </Badge>
          ) : null}
        </button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(!open)}
          className={cn(
            "h-8 cursor-pointer gap-2 px-2.5 text-xs font-medium shadow-2xs transition-all",
            isLiveNow
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
              : "text-foreground hover:bg-muted",
            open && "bg-muted ring-2 ring-primary/20",
            className
          )}
          title="Meet Quick Actions & Sync"
        >
          <div className="relative flex items-center justify-center">
            <Video className="size-3.5 text-emerald-500" />
            {isLiveNow && (
              <span className="absolute -top-1 -right-1 flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            )}
          </div>
          <span className="font-semibold hidden sm:inline">Meet</span>
          {isLiveNow ? (
            <Badge className="bg-emerald-500 text-white text-[9px] px-1 py-0 animate-pulse">
              Live Now
            </Badge>
          ) : nextMeeting ? (
            <span className="font-mono text-[11px] text-muted-foreground hidden md:inline">
              {nextMeeting.tehranTime}
            </span>
          ) : null}
        </Button>
      )}

      {/* Popover Dropdown Content */}
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-border/80 bg-card/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Video className="size-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  Meet Quick Actions
                </span>
              </div>
              <Link
                href="/calendar"
                onClick={() => setOpen(false)}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Full Calendar
                <ExternalLink className="size-2.5" />
              </Link>
            </div>

            {/* Quick Action 1: Instant Google Meet */}
            <Button
              type="button"
              onClick={handleLaunchInstantMeet}
              className="w-full justify-start gap-2 h-9 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Start Instant Google Meet</span>
              <ExternalLink className="size-3 ml-auto opacity-75" />
            </Button>

            {/* Quick Action 2: Next Scheduled Meeting */}
            {nextMeeting && (
              <div className="rounded-xl border border-border/70 bg-muted/40 p-2.5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Next Scheduled
                  </span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-mono px-1 py-0",
                      isLiveNow
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 animate-pulse"
                        : "border-border text-foreground"
                    )}
                  >
                    {isLiveNow ? "🟢 LIVE" : `⏱️ ${countdownText || nextMeeting.tehranTime}`}
                  </Badge>
                </div>

                <div className="font-semibold text-foreground text-xs truncate">
                  {nextMeeting.title}
                </div>

                <div className="text-[10.5px] text-muted-foreground flex items-center gap-2">
                  <span>{nextMeeting.platform}</span>
                  <span>•</span>
                  <span>{nextMeeting.tehranTime} Tehran</span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleJoinMeeting(nextMeeting.meetUrl)}
                  className="w-full h-7 text-xs font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer mt-1"
                >
                  <Video className="size-3 mr-1.5" />
                  Join Meeting Link
                </Button>
              </div>
            )}

            {/* Quick Action 3: CS2 Squad Match (5:10 PM) */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-[11px]">
                  <Gamepad2 className="size-3.5" />
                  CS2 Match @ 17:10
                </span>
                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                  {cs2Countdown}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <code className="text-[10px] font-mono text-foreground/80 truncate">
                  connect {cs2Config.address}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => copyConnect(true)}
                  className="size-6 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 shrink-0 cursor-pointer"
                  title="Copy connect command"
                >
                  {cs2Copied ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Footer Link to Dedicated Page */}
            <div className="pt-1">
              <Link
                href="/calendar"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-background/60 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <CalendarDays className="size-3.5 text-primary" />
                <span>Open Dedicated Calendar & Sync Hub</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

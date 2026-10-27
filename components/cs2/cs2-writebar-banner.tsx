"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  BellOff,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Crosshair,
  Edit3,
  ExternalLink,
  Flame,
  Gamepad2,
  Radio,
  Sparkles,
  Terminal,
  Volume2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useCs2Match } from "@/hooks/use-cs2-match"
import { Cs2EditDialog } from "./cs2-edit-dialog"

interface Cs2WritebarBannerProps {
  className?: string
  compact?: boolean
}

export function Cs2WritebarBanner({
  className,
  compact = false,
}: Cs2WritebarBannerProps) {
  const {
    config,
    isMatchNow,
    isUrgent,
    formattedCountdown,
    remainingSecs,
    copied,
    soundEnabled,
    isEditing,
    setIsEditing,
    copyConnect,
    toggleSound,
    updateConfig,
    testAlert,
    notificationBanner,
    setNotificationBanner,
  } = useCs2Match()

  const [isExpanded, setIsExpanded] = React.useState(!compact)

  return (
    <>
      {/* Toast Notification Alert when someone updates the IP or at match time */}
      {notificationBanner && (
        <div className="mb-2 flex items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-red-500/20 px-3.5 py-2.5 text-xs text-foreground shadow-lg backdrop-blur-md animate-in fade-in-50 slide-in-from-bottom-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500/30 text-amber-500 animate-bounce">
              🎮
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-amber-600 dark:text-amber-400 text-xs">
                CS2 Squad Alert
              </span>
              <span className="text-[11.5px] font-medium text-foreground/90 truncate">
                {notificationBanner}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyConnect(true)}
              className="h-6 px-2 text-[10.5px] border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 cursor-pointer"
            >
              Copy Connect
            </Button>
            <button
              type="button"
              onClick={() => setNotificationBanner(null)}
              className="text-muted-foreground hover:text-foreground text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Active CS2 Match Strip attached to Write Bar */}
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border transition-all duration-300 shadow-sm",
          isMatchNow
            ? "border-red-500/60 bg-gradient-to-r from-red-600/20 via-orange-500/20 to-amber-600/20 animate-pulse ring-1 ring-red-500/40"
            : isUrgent
              ? "border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/15 ring-1 ring-amber-500/30"
              : "border-border/70 bg-gradient-to-r from-amber-500/10 via-card to-background hover:border-amber-500/40",
          className
        )}
      >
        {/* Animated glowing top border highlight */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[2px] transition-all",
            isMatchNow
              ? "bg-gradient-to-r from-red-500 via-amber-400 to-red-500 animate-pulse"
              : "bg-gradient-to-r from-amber-500/40 via-orange-500/60 to-amber-500/40"
          )}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 p-2 sm:px-3 sm:py-2">
          {/* Left: Active Icon, Title & Live Countdown Animation */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500 shadow-2xs">
              <Gamepad2 className="size-4" />
              {/* Radar pulse ping when match is imminent or live */}
              {(isMatchNow || isUrgent) && (
                <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-red-500" />
                </span>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11.5px] font-bold tracking-tight text-foreground flex items-center gap-1">
                  CS2 Match
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    @{config.targetTime || "17:10"} (5:10 PM)
                  </span>
                </span>

                {isMatchNow ? (
                  <Badge className="bg-red-500 text-white font-mono text-[9.5px] px-1.5 py-0 animate-bounce">
                    🚨 LIVE NOW
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-[10px] font-bold px-1.5 py-0 tabular-nums shadow-2xs",
                      isUrgent
                        ? "border-amber-500/60 bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse"
                        : "border-border/80 bg-background/50 text-foreground/80"
                    )}
                  >
                    ⏱️ {formattedCountdown}
                  </Badge>
                )}
              </div>

              {/* Server note/map subtitle */}
              <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                {config.notes || "5v5 Squad Casual/Competitive"} • Office Squad
              </span>
            </div>
          </div>

          {/* Right: Server IP pill, 1-Click Copy, Edit Button */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Server IP Pill with 1-click copy */}
            <div className="flex items-center rounded-lg border border-amber-500/30 bg-background/70 px-2 py-1 shadow-2xs text-xs font-mono backdrop-blur-xs">
              <Crosshair className="size-3 text-amber-500 mr-1.5 shrink-0 hidden xs:inline" />
              <span className="font-semibold text-foreground text-[11px] tabular-nums select-all mr-1.5">
                {config.address || "172.24.129.12"}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => copyConnect(true)}
                className="size-5 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 rounded-md cursor-pointer text-muted-foreground"
                title={`Click to copy: "connect ${config.address}"`}
              >
                {copied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>

            {/* Quick Edit IP Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 px-2 text-[11px] font-medium gap-1 border-border/80 hover:border-amber-500/40 hover:bg-amber-500/10 cursor-pointer text-foreground"
              title="Edit CS2 server IP address and notify everyone"
            >
              <Edit3 className="size-3 text-amber-500" />
              <span className="hidden xs:inline">Edit IP</span>
            </Button>

            {/* Audio Alarm Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleSound}
              className={cn(
                "size-7 rounded-md cursor-pointer transition-colors",
                soundEnabled
                  ? "text-amber-600 dark:text-amber-400 hover:bg-amber-500/15"
                  : "text-muted-foreground hover:bg-muted"
              )}
              title={soundEnabled ? "Match sound alert enabled" : "Sound alert muted"}
            >
              {soundEnabled ? (
                <Bell className="size-3.5" />
              ) : (
                <BellOff className="size-3.5" />
              )}
            </Button>

            {/* Collapse/Expand Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="size-7 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              title={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded Quick Info Strip */}
        {isExpanded && (
          <div className="border-t border-border/50 bg-background/40 px-3 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              <Terminal className="size-3 text-sky-500" />
              <span>
                Console:{" "}
                <code className="text-amber-600 dark:text-amber-400 font-semibold select-all">
                  connect {config.address}
                </code>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={testAlert}
                className="text-[10.5px] text-muted-foreground hover:text-amber-500 underline cursor-pointer"
                title="Test sound fanfare & desktop notification"
              >
                Test 5:10 Alert
              </button>

              <span className="text-[10px] text-muted-foreground/60">•</span>

              <span className="text-[10.5px] text-muted-foreground">
                Updated by{" "}
                <strong className="text-foreground">
                  {config.updatedBy || "System"}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog Modal */}
      <Cs2EditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        config={config}
        onSave={updateConfig}
      />
    </>
  )
}

"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Bell,
  BellRing,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Laptop,
  Plus,
  Radio,
  Send,
  Sparkles,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react"

export interface FrontendMeeting {
  id: string
  title: string
  tehranTime: string // "HH:MM" in 24h
  durationMins: number
  platform: "Google Meet" | "Zoom" | "Teams"
  meetUrl: string
  agenda: string
  attendees: string
}

const DEFAULT_MEETINGS: FrontendMeeting[] = [
  {
    id: "standup",
    title: "Daily Frontend Standup",
    tehranTime: "10:30",
    durationMins: 30,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Blockers, active PRs, Next.js & service integration",
    attendees: "Frontend Squad & QA",
  },
  {
    id: "arch-review",
    title: "Frontend Architecture & Code Review",
    tehranTime: "14:00",
    durationMins: 45,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Component refactoring, latency optimizations & state design",
    attendees: "Tech Leads & Engineers",
  },
  {
    id: "design-sync",
    title: "UI/UX Design System Sync",
    tehranTime: "16:15",
    durationMins: 30,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Figma tokens handoff, theme adjustments, responsive layout",
    attendees: "Designers & Frontend Squad",
  },
]

/**
 * Play an alert chime using Web Audio API synthesis (no external audio files needed)
 */
function playChimeSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = "sine"
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15) // A5

    osc2.type = "triangle"
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15)
    osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.35) // D6

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(ctx.currentTime)
    osc2.start(ctx.currentTime + 0.15)
    osc1.stop(ctx.currentTime + 0.3)
    osc2.stop(ctx.currentTime + 0.6)
  } catch (err) {
    console.warn("Audio notification failed:", err)
  }
}

export function FrontendMeetingsPanel() {
  const [meetings, setMeetings] = React.useState<FrontendMeeting[]>(DEFAULT_MEETINGS)
  const [activeMeetingId, setActiveMeetingId] = React.useState<string>("standup")
  const [permission, setPermission] = React.useState<NotificationPermission>("default")
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true)
  const [countdownText, setCountdownText] = React.useState<string>("")
  const [isLiveNow, setIsLiveNow] = React.useState<boolean>(false)
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false)
  const [testNotificationSent, setTestNotificationSent] = React.useState<boolean>(false)

  // Custom meeting modal/state
  const [isAddingMeeting, setIsAddingMeeting] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState("")
  const [newTime, setNewTime] = React.useState("11:00")
  const [newDuration, setNewDuration] = React.useState(30)
  const [newUrl, setNewUrl] = React.useState("https://meet.google.com/new")

  // Check initial notification permission
  React.useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const selectedMeeting =
    meetings.find((m) => m.id === activeMeetingId) || meetings[0]

  // Calculate live countdown to selected meeting in Tehran time
  React.useEffect(() => {
    function computeCountdown() {
      if (!selectedMeeting) return

      const now = new Date()
      // Get current Tehran time components
      const tehranStr = now.toLocaleString("en-US", { timeZone: "Asia/Tehran" })
      const tehranDate = new Date(tehranStr)

      const [mH, mM] = selectedMeeting.tehranTime.split(":").map(Number)
      const meetStart = new Date(tehranDate)
      meetStart.setHours(mH, mM, 0, 0)

      const meetEnd = new Date(meetStart)
      meetEnd.setMinutes(meetStart.getMinutes() + selectedMeeting.durationMins)

      const diffStartMs = meetStart.getTime() - tehranDate.getTime()
      const diffEndMs = meetEnd.getTime() - tehranDate.getTime()

      if (diffStartMs <= 0 && diffEndMs > 0) {
        setIsLiveNow(true)
        const elapsedMins = Math.floor(Math.abs(diffStartMs) / 60000)
        setCountdownText(`Happening NOW (${elapsedMins}m in)`)
      } else if (diffStartMs > 0) {
        setIsLiveNow(false)
        const totalSecs = Math.floor(diffStartMs / 1000)
        const hours = Math.floor(totalSecs / 3600)
        const mins = Math.floor((totalSecs % 3600) / 60)
        const secs = totalSecs % 60

        if (hours > 0) {
          setCountdownText(`${hours}h ${mins}m ${secs}s`)
        } else {
          setCountdownText(`${mins}m ${secs}s`)
        }
      } else {
        setIsLiveNow(false)
        setCountdownText("Completed today")
      }
    }

    computeCountdown()
    const timer = setInterval(computeCountdown, 1000)
    return () => clearInterval(timer)
  }, [selectedMeeting])

  // Request browser push notification permission
  async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("This browser does not support desktop notifications.")
      return
    }

    try {
      const res = await Notification.requestPermission()
      setPermission(res)
      if (res === "granted") {
        sendPushAlert(
          "Notifications Enabled! 🔔",
          "You will receive push reminders for upcoming Frontend meetings."
        )
      }
    } catch (e) {
      console.error("Error requesting notification permission:", e)
    }
  }

  // Trigger push alert helper
  function sendPushAlert(title: string, body: string, url?: string) {
    if (soundEnabled) {
      playChimeSound()
    }

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notif = new Notification(title, {
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        })
        notif.onclick = () => {
          window.focus()
          if (url) {
            window.open(url, "_blank")
          }
        }
      } catch {
        // Fallback or service worker required on some platforms
      }
    }
  }

  // Handle "Test Push Notification" button
  function handleTestPush() {
    setTestNotificationSent(true)
    sendPushAlert(
      `Frontend Meeting Alert: ${selectedMeeting.title} 🚀`,
      `Starting at ${selectedMeeting.tehranTime} IRST (${countdownText}). Click to join Google Meet!`,
      selectedMeeting.meetUrl
    )
    setTimeout(() => setTestNotificationSent(false), 2500)
  }

  function handleCopyMeetingUrl() {
    if (!selectedMeeting) return
    navigator.clipboard.writeText(selectedMeeting.meetUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleAddCustomMeeting(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newM: FrontendMeeting = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      tehranTime: newTime,
      durationMins: Number(newDuration) || 30,
      platform: "Google Meet",
      meetUrl: newUrl.trim() || "https://meet.google.com/new",
      agenda: "Custom squad sync",
      attendees: "Frontend Squad",
    }

    setMeetings((prev) => [...prev, newM])
    setActiveMeetingId(newM.id)
    setIsAddingMeeting(false)
    setNewTitle("")

    sendPushAlert(
      "Meeting Scheduled! 📅",
      `"${newM.title}" is scheduled for ${newM.tehranTime} Tehran Time.`
    )
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Header & Push Notification Controller Strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex size-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-500">
            <Radio className="size-3.5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-foreground">Frontend Sync & Push</h3>
            <p className="text-[10px] text-muted-foreground">Tehran Engineering Schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Sound Mute/Unmute */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
            title={soundEnabled ? "Mute chime sound" : "Enable chime sound"}
          >
            {soundEnabled ? (
              <Volume2 className="size-3.5 text-sky-500" />
            ) : (
              <VolumeX className="size-3.5 text-muted-foreground" />
            )}
          </Button>

          {/* Push Notification Toggle Button */}
          {permission === "granted" ? (
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
              title="Browser push notifications are active"
            >
              <Bell className="size-3 text-emerald-500" />
              <span>Push Active</span>
            </Badge>
          ) : (
            <Button
              size="xs"
              variant="outline"
              onClick={requestNotificationPermission}
              className="h-7 cursor-pointer gap-1 text-[10px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
              title="Enable native desktop browser notifications"
            >
              <BellRing className="size-3 text-amber-500" />
              <span>Enable Push</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Active Meeting Card */}
      {selectedMeeting && (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border p-3.5 shadow-xs transition-all",
            isLiveNow
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-sky-500/30 bg-linear-to-br from-sky-500/10 via-card to-background"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant={isLiveNow ? "default" : "secondary"}
                  className={cn(
                    "px-1.5 py-0 font-mono text-[9px] uppercase tracking-wider",
                    isLiveNow && "bg-emerald-600 text-white animate-pulse"
                  )}
                >
                  {isLiveNow ? "● Live In-Progress" : "Upcoming Sync"}
                </Badge>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {selectedMeeting.durationMins} mins
                </span>
              </div>
              <h4 className="mt-1 text-sm font-bold text-foreground">
                {selectedMeeting.title}
              </h4>
            </div>

            {/* Time & Countdown Display */}
            <div className="text-right">
              <div className="font-mono text-xs font-bold text-primary">
                {selectedMeeting.tehranTime} IRST
              </div>
              <div
                className={cn(
                  "font-mono text-[11px] font-semibold",
                  isLiveNow
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                )}
              >
                {countdownText}
              </div>
            </div>
          </div>

          {/* Agenda & Attendees */}
          <div className="mt-2.5 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="size-3 text-primary shrink-0" />
              <span className="truncate text-[11px]">{selectedMeeting.attendees}</span>
            </div>
            <p className="line-clamp-2 text-[11px] text-foreground/80">
              {selectedMeeting.agenda}
            </p>
          </div>

          {/* Action Buttons: Join Call, Copy Link, Send Test Notification */}
          <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-border/60 pt-2.5">
            <div className="flex items-center gap-1">
              <a
                href={selectedMeeting.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>Join Meeting</span>
                <ExternalLink className="size-3" />
              </a>

              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyMeetingUrl}
                className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
                title="Copy Meeting URL"
              >
                {copiedLink ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </Button>
            </div>

            {/* Test Push Notification Button */}
            <Button
              variant="outline"
              size="xs"
              onClick={handleTestPush}
              className={cn(
                "h-7 cursor-pointer gap-1 text-[10px] font-medium shadow-2xs",
                testNotificationSent && "border-emerald-500 text-emerald-600"
              )}
              title="Test real push notification and audio chime"
            >
              <Send className="size-2.5" />
              <span>{testNotificationSent ? "Push Sent!" : "Test Push"}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Meeting Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-semibold text-muted-foreground mr-1">
          Syncs:
        </span>
        {meetings.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMeetingId(m.id)}
            className={cn(
              "rounded-lg border px-2 py-1 text-[11px] font-medium transition-all cursor-pointer",
              activeMeetingId === m.id
                ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{m.tehranTime}</span>
            <span className="ml-1 opacity-75 truncate max-w-[80px] inline-block align-bottom">
              {m.title.replace("Frontend ", "")}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setIsAddingMeeting(!isAddingMeeting)}
          className="rounded-lg border border-dashed border-border px-1.5 py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer"
          title="Schedule custom frontend meeting"
        >
          <Plus className="size-3" />
        </button>
      </div>

      {/* Add Custom Meeting Form Drawer/Accordion */}
      {isAddingMeeting && (
        <form
          onSubmit={handleAddCustomMeeting}
          className="rounded-xl border border-border bg-card p-3 text-xs space-y-2.5 shadow-xs"
        >
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>Schedule Custom Frontend Sync</span>
            <button
              type="button"
              onClick={() => setIsAddingMeeting(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground block mb-0.5">
              Meeting Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Frontend Sprint Demo"
              className="h-7 w-full rounded border border-border bg-background px-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground block mb-0.5">
                Tehran Time (IRST)
              </label>
              <input
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="h-7 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-0.5">
                Duration (mins)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="h-7 w-full rounded border border-border bg-background px-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground block mb-0.5">
              Meeting URL
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="h-7 w-full rounded border border-border bg-background px-2 text-xs font-mono"
            />
          </div>

          <div className="flex justify-end gap-1.5 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsAddingMeeting(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="xs">
              Save Sync
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

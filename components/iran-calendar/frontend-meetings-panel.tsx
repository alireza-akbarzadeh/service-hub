"use client"

import * as React from "react"
import { useMeetings } from "@/hooks/use-meetings"
import type { FrontendMeeting } from "@/app/api/meetings/route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Bell,
  BellRing,
  Calendar,
  Check,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Plus,
  Radio,
  Send,
  Trash2,
  Users,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react"

export function FrontendMeetingsPanel() {
  const {
    meetings,
    activeMeetingId,
    setActiveMeetingId,
    selectedMeeting,
    permission,
    requestPermission,
    soundEnabled,
    setSoundEnabled,
    countdownText,
    isLiveNow,
    sendPushNotification,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    toggleMeetingActive,
  } = useMeetings()

  const [copiedLink, setCopiedLink] = React.useState<boolean>(false)
  const [testNotificationSent, setTestNotificationSent] = React.useState<boolean>(false)

  // Dialog states for Create and Edit
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingMeeting, setEditingMeeting] = React.useState<FrontendMeeting | null>(null)

  // Form states
  const [formTitle, setFormTitle] = React.useState("")
  const [formTime, setFormTime] = React.useState("10:30")
  const [formDuration, setFormDuration] = React.useState(30)
  const [formPlatform, setFormPlatform] = React.useState<"Google Meet" | "Zoom" | "Teams" | "Custom">("Google Meet")
  const [formMeetUrl, setFormMeetUrl] = React.useState("https://meet.google.com/new")
  const [formAgenda, setFormAgenda] = React.useState("")
  const [formAttendees, setFormAttendees] = React.useState("Frontend Squad & QA")
  const [formNotifyBeforeMins, setFormNotifyBeforeMins] = React.useState(5)

  function openCreateDialog() {
    setFormTitle("")
    setFormTime("10:30")
    setFormDuration(30)
    setFormPlatform("Google Meet")
    setFormMeetUrl("https://meet.google.com/new")
    setFormAgenda("")
    setFormAttendees("Frontend Squad & QA")
    setFormNotifyBeforeMins(5)
    setIsCreateOpen(true)
  }

  function openEditDialog(m: FrontendMeeting) {
    setEditingMeeting(m)
    setFormTitle(m.title)
    setFormTime(m.tehranTime)
    setFormDuration(m.durationMins)
    setFormPlatform(m.platform)
    setFormMeetUrl(m.meetUrl)
    setFormAgenda(m.agenda)
    setFormAttendees(m.attendees)
    setFormNotifyBeforeMins(m.notifyBeforeMins || 5)
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim()) return

    addMeeting({
      title: formTitle.trim(),
      tehranTime: formTime,
      durationMins: Number(formDuration) || 30,
      platform: formPlatform,
      meetUrl: formMeetUrl.trim() || "https://meet.google.com/new",
      agenda: formAgenda.trim() || "Frontend Engineering Sync",
      attendees: formAttendees.trim() || "Frontend Squad",
      notifyBeforeMins: Number(formNotifyBeforeMins) || 5,
      isActive: true,
    })

    setIsCreateOpen(false)
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingMeeting || !formTitle.trim()) return

    updateMeeting(editingMeeting.id, {
      title: formTitle.trim(),
      tehranTime: formTime,
      durationMins: Number(formDuration) || 30,
      platform: formPlatform,
      meetUrl: formMeetUrl.trim() || "https://meet.google.com/new",
      agenda: formAgenda.trim() || "Frontend Engineering Sync",
      attendees: formAttendees.trim() || "Frontend Squad",
      notifyBeforeMins: Number(formNotifyBeforeMins) || 5,
    })

    setEditingMeeting(null)
  }

  function handleCopyMeetingUrl() {
    if (!selectedMeeting) return
    navigator.clipboard.writeText(selectedMeeting.meetUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  function handleTestPush() {
    if (!selectedMeeting) return
    setTestNotificationSent(true)
    sendPushNotification(
      `Frontend Meeting Alert: ${selectedMeeting.title} 🚀`,
      `Starting at ${selectedMeeting.tehranTime} IRST (${countdownText}). Click to open ${selectedMeeting.platform}!`,
      selectedMeeting.meetUrl
    )
    setTimeout(() => setTestNotificationSent(false), 2500)
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
            <h3 className="text-xs font-bold text-foreground">Frontend Meeting Controls</h3>
            <p className="text-[10px] text-muted-foreground">Configurable API & Browser Storage</p>
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

          {/* Push Notification Toggle */}
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
              onClick={requestPermission}
              className="h-7 cursor-pointer gap-1 text-[10px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
              title="Enable native desktop browser notifications"
            >
              <BellRing className="size-3 text-amber-500" />
              <span>Enable Push</span>
            </Button>
          )}

          {/* New Meeting Button */}
          <Button
            size="xs"
            onClick={openCreateDialog}
            className="h-7 cursor-pointer gap-1 text-[10px] shadow-xs"
            title="Create a new meeting"
          >
            <Plus className="size-3" />
            <span>New</span>
          </Button>
        </div>
      </div>

      {/* Main Active Meeting Card */}
      {selectedMeeting ? (
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
                <Badge variant="outline" className="px-1 py-0 font-mono text-[9px]">
                  {selectedMeeting.platform}
                </Badge>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {selectedMeeting.durationMins}m
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
            {selectedMeeting.agenda && (
              <p className="line-clamp-2 text-[11px] text-foreground/80">
                {selectedMeeting.agenda}
              </p>
            )}
          </div>

          {/* Action Buttons: Join Call, Copy Link, Edit, Test Push */}
          <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-border/60 pt-2.5">
            <div className="flex items-center gap-1">
              <a
                href={selectedMeeting.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-2xs hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>Join Call</span>
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

              <Button
                variant="outline"
                size="icon"
                onClick={() => openEditDialog(selectedMeeting)}
                className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
                title="Edit this meeting"
              >
                <Edit2 className="size-3" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`Delete meeting "${selectedMeeting.title}"?`)) {
                    deleteMeeting(selectedMeeting.id)
                  }
                }}
                className="size-7 cursor-pointer text-muted-foreground hover:text-destructive"
                title="Delete this meeting"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>

            {/* Test Push Button */}
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
      ) : (
        <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          No active frontend meetings configured. Click "+ New" above to schedule one.
        </div>
      )}

      {/* Meeting Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-semibold text-muted-foreground mr-1">
          Configured ({meetings.length}):
        </span>
        {meetings.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMeetingId(m.id)}
            className={cn(
              "group relative flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all cursor-pointer",
              activeMeetingId === m.id
                ? "border-primary bg-primary/10 text-primary font-bold shadow-2xs"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="font-mono">{m.tehranTime}</span>
            <span className="opacity-80 truncate max-w-[90px]">{m.title}</span>
          </button>
        ))}
      </div>

      {/* Create Meeting Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Schedule Frontend Meeting</DialogTitle>
              <DialogDescription>
                Configure an actual meeting schedule. Persisted in browser and synchronized via API.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Meeting Title *
                </label>
                <Input
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Daily Frontend Standup"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Tehran Time (IRST) *
                  </label>
                  <Input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Duration (Minutes) *
                  </label>
                  <Input
                    type="number"
                    min={5}
                    max={240}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Platform
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Teams">Microsoft Teams</option>
                    <option value="Custom">Custom Portal</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Notify Before
                  </label>
                  <select
                    value={formNotifyBeforeMins}
                    onChange={(e) => setFormNotifyBeforeMins(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value={2}>2 minutes before</option>
                    <option value={5}>5 minutes before</option>
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Meeting Link URL *
                </label>
                <Input
                  required
                  type="url"
                  value={formMeetUrl}
                  onChange={(e) => setFormMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Agenda & Topics
                </label>
                <Input
                  value={formAgenda}
                  onChange={(e) => setFormAgenda(e.target.value)}
                  placeholder="e.g. Blockers, PR approvals, service endpoints..."
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Attendees
                </label>
                <Input
                  value={formAttendees}
                  onChange={(e) => setFormAttendees(e.target.value)}
                  placeholder="e.g. Frontend Squad & QA"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save & Activate Meeting
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Modal */}
      <Dialog open={!!editingMeeting} onOpenChange={(open) => !open && setEditingMeeting(null)}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Meeting Configuration</DialogTitle>
              <DialogDescription>
                Update the schedule, link, or notification timing for this meeting.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Meeting Title *
                </label>
                <Input
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Tehran Time (IRST) *
                  </label>
                  <Input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Duration (Minutes) *
                  </label>
                  <Input
                    type="number"
                    min={5}
                    max={240}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Platform
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as any)}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="Teams">Microsoft Teams</option>
                    <option value="Custom">Custom Portal</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block font-medium text-foreground">
                    Notify Before
                  </label>
                  <select
                    value={formNotifyBeforeMins}
                    onChange={(e) => setFormNotifyBeforeMins(Number(e.target.value))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
                  >
                    <option value={2}>2 minutes before</option>
                    <option value={5}>5 minutes before</option>
                    <option value={10}>10 minutes before</option>
                    <option value={15}>15 minutes before</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Meeting Link URL *
                </label>
                <Input
                  required
                  type="url"
                  value={formMeetUrl}
                  onChange={(e) => setFormMeetUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Agenda & Topics
                </label>
                <Input
                  value={formAgenda}
                  onChange={(e) => setFormAgenda(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-foreground">
                  Attendees
                </label>
                <Input
                  value={formAttendees}
                  onChange={(e) => setFormAttendees(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingMeeting(null)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Update Meeting
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

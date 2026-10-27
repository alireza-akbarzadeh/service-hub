"use client"

import * as React from "react"
import Link from "next/link"
import { useMeetings } from "@/hooks/use-meetings"
import type { FrontendMeeting } from "@/lib/meetings-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IranClockCalendar } from "@/components/iran-calendar/iran-clock-calendar"
import { Cs2WritebarBanner } from "@/components/cs2/cs2-writebar-banner"
import {
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Flame,
  Gamepad2,
  Globe2,
  Plus,
  Radio,
  Search,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Users,
  Video,
  Volume2,
  VolumeX,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function CalendarMeetingsView() {
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

  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [copiedInviteId, setCopiedInviteId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [platformFilter, setPlatformFilter] = React.useState<string>("all")
  const [testNotificationSent, setTestNotificationSent] = React.useState(false)

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

  // Quick Instant Google Meet
  const handleLaunchInstantMeet = () => {
    if (typeof window !== "undefined") {
      window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer")
    }
  }

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
      agenda: formAgenda.trim(),
      attendees: formAttendees.trim(),
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
      agenda: formAgenda.trim(),
      attendees: formAttendees.trim(),
      notifyBeforeMins: Number(formNotifyBeforeMins) || 5,
    })

    setEditingMeeting(null)
  }

  function handleCopyMeetLink(id: string, url: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    }
  }

  function handleCopyInvite(m: FrontendMeeting) {
    if (navigator?.clipboard) {
      const invite = `📅 **${m.title}**\n⏰ Time: ${m.tehranTime} (Tehran Time / IRST)\n⏳ Duration: ${m.durationMins} mins\n👥 Attendees: ${m.attendees}\n🔗 Link: ${m.meetUrl}\n📝 Agenda: ${m.agenda || "Discussion & alignment"}`
      navigator.clipboard.writeText(invite)
      setCopiedInviteId(m.id)
      setTimeout(() => setCopiedInviteId(null), 1500)
    }
  }

  // Filter meetings
  const filteredMeetings = React.useMemo(() => {
    return meetings.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.attendees.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPlatform =
        platformFilter === "all" || m.platform.toLowerCase() === platformFilter.toLowerCase()
      return matchesSearch && matchesPlatform
    })
  }, [meetings, searchQuery, platformFilter])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/85 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="size-4" />
            </div>
            <h1 className="text-sm font-bold tracking-tight">
              Calendar, Meetings & Iran Sync Hub
            </h1>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleLaunchInstantMeet}
            className="h-8 gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-xs cursor-pointer text-xs"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Instant Meet</span>
            <ExternalLink className="size-3 opacity-75" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCreateDialog}
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <Calendar className="size-3.5 text-primary" />
            <span>Schedule Meeting</span>
          </Button>
        </div>
      </header>

      {/* Main Content: Split Grid with Iranian Clock/Calendar and Advanced Meetings Hub */}
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Hero: CS2 5:10 PM Squad Match Active Banner */}
        <Cs2WritebarBanner />

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 cols): Advanced Meeting Hub */}
          <div className="lg:col-span-7 space-y-5">
            {/* Spotlight Card: Next / Active Meeting */}
            {selectedMeeting && (
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all",
                  isLiveNow
                    ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 via-card to-background ring-1 ring-emerald-500/30"
                    : "border-border/80 bg-gradient-to-br from-primary/5 via-card to-background"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Video className="size-4" />
                    </span>
                    <div>
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {isLiveNow ? "🟢 Meeting In Progress" : "⏱️ Upcoming Scheduled Meeting"}
                      </span>
                      <h2 className="text-base font-bold text-foreground">
                        {selectedMeeting.title}
                      </h2>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs font-bold px-2 py-0.5 shadow-2xs",
                      isLiveNow
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-pulse"
                        : "border-primary/30 text-primary bg-primary/10"
                    )}
                  >
                    {isLiveNow ? "LIVE NOW" : countdownText || `At ${selectedMeeting.tehranTime}`}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Tehran Time</span>
                    <span className="font-mono font-bold text-foreground text-sm">
                      {selectedMeeting.tehranTime} IRST
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Duration</span>
                    <span className="font-bold text-foreground text-sm">
                      {selectedMeeting.durationMins} minutes
                    </span>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
                    <span className="text-[10px] text-muted-foreground block mb-0.5">Platform</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {selectedMeeting.platform}
                    </span>
                  </div>
                </div>

                {selectedMeeting.agenda && (
                  <div className="mt-3 rounded-xl border border-border/50 bg-muted/20 p-3 text-xs">
                    <span className="text-[10.5px] font-semibold text-muted-foreground block mb-1">Agenda:</span>
                    <p className="text-foreground/90 font-medium leading-relaxed">
                      {selectedMeeting.agenda}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="size-3.5 text-primary" />
                    <span>{selectedMeeting.attendees}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyInvite(selectedMeeting)}
                      className="h-8 gap-1.5 text-xs cursor-pointer"
                    >
                      {copiedInviteId === selectedMeeting.id ? (
                        <>
                          <Check className="size-3.5 text-emerald-500" />
                          <span>Copied Invite!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="size-3.5" />
                          <span>Copy Invitation</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          window.open(selectedMeeting.meetUrl, "_blank", "noopener,noreferrer")
                        }
                      }}
                      className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs cursor-pointer"
                    >
                      <Video className="size-3.5" />
                      <span>Join Meeting Link</span>
                      <ExternalLink className="size-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Meetings Management Header & Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Scheduled Meetings ({filteredMeetings.length})
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Daily & Recurring
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-48">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search meetings..."
                    className="h-8 text-xs bg-muted/40 pl-7"
                  />
                  <Search className="size-3.5 text-muted-foreground absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Notifications & Sound Toggles */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                  title={soundEnabled ? "Mute audio alarms" : "Enable audio alarms"}
                >
                  {soundEnabled ? <Volume2 className="size-3.5 text-amber-500" /> : <VolumeX className="size-3.5" />}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={requestPermission}
                  className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
                  title="Enable Web Push notifications"
                >
                  {permission === "granted" ? <BellRing className="size-3.5 text-emerald-500" /> : <Bell className="size-3.5" />}
                </Button>
              </div>
            </div>

            {/* List of Meetings */}
            <div className="space-y-3">
              {filteredMeetings.map((m) => {
                const isSelected = m.id === activeMeetingId
                return (
                  <div
                    key={m.id}
                    onClick={() => setActiveMeetingId(m.id)}
                    className={cn(
                      "group relative rounded-xl border p-4 transition-all cursor-pointer shadow-2xs hover:shadow-xs",
                      isSelected
                        ? "border-emerald-500/60 bg-emerald-500/5 shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/30",
                      !m.isActive && "opacity-60"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg shadow-2xs",
                            m.platform === "Google Meet"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-primary/15 text-primary"
                          )}
                        >
                          <Video className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-xs text-foreground truncate">
                            {m.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-mono font-bold text-foreground/80">
                              {m.tehranTime} IRST
                            </span>
                            <span>•</span>
                            <span>{m.durationMins}m</span>
                            <span>•</span>
                            <span>{m.platform}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyMeetLink(m.id, m.meetUrl)
                          }}
                          className="size-7 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
                          title="Copy meeting URL"
                        >
                          {copiedId === m.id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditDialog(m)
                          }}
                          className="size-7 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
                          title="Edit meeting"
                        >
                          <Edit2 className="size-3" />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteMeeting(m.id)
                          }}
                          className="size-7 rounded-md cursor-pointer text-muted-foreground hover:text-destructive"
                          title="Delete meeting"
                        >
                          <Trash2 className="size-3" />
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (typeof window !== "undefined") {
                              window.open(m.meetUrl, "_blank", "noopener,noreferrer")
                            }
                          }}
                          className="h-7 px-2.5 text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 cursor-pointer ml-1"
                        >
                          Join
                          <ExternalLink className="size-2.5 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {m.agenda && (
                      <div className="mt-2 text-[11px] text-muted-foreground line-clamp-1 border-t border-border/40 pt-1.5">
                        {m.agenda}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column (5 cols): Iran Live Clock, Jalali Calendar & CS2 Card */}
          <div className="lg:col-span-5 space-y-5">
            <IranClockCalendar />
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="size-4 text-emerald-500" />
              Schedule New Frontend Meeting
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a daily or recurring team meeting with automatic Tehran time sync and desktop push alarms.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-3.5 py-1 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Meeting Title</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Daily Frontend Standup & Alignment"
                className="text-xs bg-muted/40"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Time (Tehran Time)</label>
                <Input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="font-mono text-xs bg-muted/40"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Duration (Minutes)</label>
                <Input
                  type="number"
                  min={5}
                  max={240}
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value))}
                  className="text-xs bg-muted/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Platform</label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value as "Google Meet")}
                  className="w-full h-9 rounded-md border border-input bg-muted/40 px-3 text-xs"
                >
                  <option value="Google Meet">Google Meet</option>
                  <option value="Zoom">Zoom</option>
                  <option value="Teams">Microsoft Teams</option>
                  <option value="Custom">Custom Link</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Remind Before (Mins)</label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={formNotifyBeforeMins}
                  onChange={(e) => setFormNotifyBeforeMins(Number(e.target.value))}
                  className="text-xs bg-muted/40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Meeting URL</label>
              <Input
                value={formMeetUrl}
                onChange={(e) => setFormMeetUrl(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="font-mono text-xs bg-muted/40"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Attendees</label>
              <Input
                value={formAttendees}
                onChange={(e) => setFormAttendees(e.target.value)}
                placeholder="Frontend Squad, QA, Platform Lead"
                className="text-xs bg-muted/40"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Agenda / Topics</label>
              <Input
                value={formAgenda}
                onChange={(e) => setFormAgenda(e.target.value)}
                placeholder="Blockers, release milestones, code reviews..."
                className="text-xs bg-muted/40"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Create Meeting
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Meeting Modal */}
      {editingMeeting && (
        <Dialog open={!!editingMeeting} onOpenChange={() => setEditingMeeting(null)}>
          <DialogContent className="max-w-md border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Edit2 className="size-4 text-emerald-500" />
                Edit Meeting Details
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 py-1 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Meeting Title</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="text-xs bg-muted/40"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Time (Tehran Time)</label>
                  <Input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="font-mono text-xs bg-muted/40"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Duration (Minutes)</label>
                  <Input
                    type="number"
                    min={5}
                    max={240}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="text-xs bg-muted/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Meeting URL</label>
                <Input
                  value={formMeetUrl}
                  onChange={(e) => setFormMeetUrl(e.target.value)}
                  className="font-mono text-xs bg-muted/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Attendees</label>
                <Input
                  value={formAttendees}
                  onChange={(e) => setFormAttendees(e.target.value)}
                  className="text-xs bg-muted/40"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Agenda</label>
                <Input
                  value={formAgenda}
                  onChange={(e) => setFormAgenda(e.target.value)}
                  className="text-xs bg-muted/40"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingMeeting(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

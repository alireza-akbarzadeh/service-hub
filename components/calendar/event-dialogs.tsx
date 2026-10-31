"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  Share2,
  Trash2,
  Users,
  Video,
  Check,
  Edit2,
  Sparkles,
} from "lucide-react"
import {
  type CalendarEvent,
  type CalendarEventType,
  EVENT_TYPE_CONFIG,
  calculateEndTime,
} from "@/lib/calendar-events-data"

interface CreateEditEventDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: CalendarEvent) => void
  initialDate?: string
  initialTime?: string
  editingEvent?: CalendarEvent | null
}

export function CreateEditEventDialog({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialTime = "10:30",
  editingEvent,
}: CreateEditEventDialogProps) {
  const [title, setTitle] = React.useState("")
  const [date, setDate] = React.useState("2026-10-31")
  const [startTime, setStartTime] = React.useState("10:30")
  const [durationMins, setDurationMins] = React.useState(30)
  const [type, setType] = React.useState<CalendarEventType>("meeting")
  const [platform, setPlatform] = React.useState<"Google Meet" | "Zoom" | "Teams" | "Custom">("Google Meet")
  const [meetUrl, setMeetUrl] = React.useState("https://meet.google.com/new")
  const [agenda, setAgenda] = React.useState("")
  const [attendees, setAttendees] = React.useState("Frontend Squad & QA")
  const [notifyBeforeMins, setNotifyBeforeMins] = React.useState(5)

  React.useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title)
      setDate(editingEvent.date)
      setStartTime(editingEvent.startTime)
      setDurationMins(editingEvent.durationMins)
      setType(editingEvent.type)
      setPlatform(editingEvent.platform)
      setMeetUrl(editingEvent.meetUrl)
      setAgenda(editingEvent.agenda)
      setAttendees(editingEvent.attendees)
      setNotifyBeforeMins(editingEvent.notifyBeforeMins)
    } else {
      setTitle("")
      setDate(initialDate || new Date().toISOString().split("T")[0])
      setStartTime(initialTime || "10:30")
      setDurationMins(30)
      setType("meeting")
      setPlatform("Google Meet")
      setMeetUrl("https://meet.google.com/new")
      setAgenda("")
      setAttendees("Frontend Squad & QA")
      setNotifyBeforeMins(5)
    }
  }, [editingEvent, initialDate, initialTime, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const endTime = calculateEndTime(startTime, Number(durationMins) || 30)
    const event: CalendarEvent = {
      id: editingEvent ? editingEvent.id : `event-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      date,
      startTime,
      durationMins: Number(durationMins) || 30,
      endTime,
      type,
      platform,
      meetUrl: meetUrl.trim() || "https://meet.google.com/new",
      agenda: agenda.trim(),
      attendees: attendees.trim(),
      notifyBeforeMins: Number(notifyBeforeMins) || 5,
    }

    onSave(event)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <span>{editingEvent ? "Edit Scheduled Event" : "Schedule New Event / Meeting"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure date, time, meeting URL, and agenda for the engineering workspace.
            </DialogDescription>
          </DialogHeader>

          {/* Event Category Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Event Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {(
                [
                  { id: "meeting", label: "Meeting" },
                  { id: "deployment", label: "Release" },
                  { id: "sprint", label: "Sprint" },
                  { id: "oncall", label: "On-Call" },
                  { id: "gaming", label: "CS2" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setType(cat.id)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium cursor-pointer transition-all text-center ${
                    type === cat.id
                      ? `${EVENT_TYPE_CONFIG[cat.id].bgClass} ${EVENT_TYPE_CONFIG[cat.id].borderClass} ${EVENT_TYPE_CONFIG[cat.id].textClass} font-bold shadow-2xs`
                      : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Event Title</label>
            <Input
              required
              placeholder="e.g. Daily Frontend Standup, Production Deploy, Sprint Planning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Date (YYYY-MM-DD)</label>
              <Input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Start Time (IRST / 24h)</label>
              <Input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Duration (Mins)</label>
              <select
                value={durationMins}
                onChange={(e) => setDurationMins(Number(e.target.value))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Platform & Meet URL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Platform</label>
              <select
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value as "Google Meet" | "Zoom" | "Teams" | "Custom")
                }
                className="w-full h-9 rounded-md border border-input bg-transparent px-2.5 py-1 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Teams">Microsoft Teams</option>
                <option value="Custom">Custom Link</option>
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-foreground">Meeting / Action URL</label>
              <Input
                placeholder="https://meet.google.com/..."
                value={meetUrl}
                onChange={(e) => setMeetUrl(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          {/* Agenda & Attendees */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Agenda / Runbook Notes</label>
            <textarea
              rows={2}
              placeholder="Outline discussion points, pull requests to review, or release instructions..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Attendees / Team Squad</label>
            <Input
              placeholder="e.g. Frontend Squad, QA, DevOps Team"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="cursor-pointer bg-primary text-primary-foreground font-semibold"
            >
              {editingEvent ? "Save Changes" : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EventDetailDialogProps {
  event: CalendarEvent | null
  isOpen: boolean
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (id: string) => void
}

export function EventDetailDialog({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: EventDetailDialogProps) {
  const [copiedUrl, setCopiedUrl] = React.useState(false)
  const [copiedInvite, setCopiedInvite] = React.useState(false)

  if (!event) return null

  const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.meeting

  const handleCopyUrl = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(event.meetUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    }
  }

  const handleCopyInvite = () => {
    if (navigator?.clipboard) {
      const invite = `📅 **${event.title}**\n🗓️ Date: ${event.date}\n⏰ Time: ${event.startTime} - ${event.endTime} (Tehran Time / IRST)\n⏳ Duration: ${event.durationMins}m\n👥 Attendees: ${event.attendees}\n🔗 URL: ${event.meetUrl}\n📝 Agenda: ${event.agenda || "General engineering sync"}`
      navigator.clipboard.writeText(invite)
      setCopiedInvite(true)
      setTimeout(() => setCopiedInvite(false), 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`${config.badgeClass} text-[10px] font-mono px-2 py-0.5`}>
              {config.label.toUpperCase()}
            </Badge>
            <span className="text-xs font-mono font-bold text-muted-foreground">
              {event.platform}
            </span>
          </div>
          <DialogTitle className="text-base font-bold text-foreground">
            {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3.5 py-2 text-xs">
          {/* Time & Date Card */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3 space-y-1.5">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Clock className="size-4 text-primary" />
              <span>
                {event.startTime} – {event.endTime} ({event.durationMins} minutes)
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px] pl-6">
              <Calendar className="size-3.5" />
              <span>{event.date} (Tehran IRST)</span>
            </div>
          </div>

          {/* Agenda */}
          {event.agenda && (
            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider block">
                Agenda & Runbook:
              </span>
              <p className="rounded-lg border border-border/60 bg-card p-2.5 text-foreground/90 font-medium leading-relaxed">
                {event.agenda}
              </p>
            </div>
          )}

          {/* Attendees */}
          {event.attendees && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-3.5 text-primary shrink-0" />
              <span className="font-medium text-foreground">{event.attendees}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 mr-auto">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyUrl}
              className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Copy meeting link"
            >
              {copiedUrl ? <Check className="size-3.5 text-emerald-500" /> : <LinkIcon className="size-3.5" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopyInvite}
              className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Copy invite text"
            >
              {copiedInvite ? <Check className="size-3.5 text-emerald-500" /> : <Share2 className="size-3.5" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                onClose()
                onEdit(event)
              }}
              className="size-8 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Edit event"
            >
              <Edit2 className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                onDelete(event.id)
                onClose()
              }}
              className="size-8 cursor-pointer text-muted-foreground hover:text-destructive"
              title="Delete event"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          {event.meetUrl && (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open(event.meetUrl, "_blank", "noopener,noreferrer")
                }
              }}
              className="cursor-pointer gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs"
            >
              <Video className="size-3.5" />
              <span>Join Video Call</span>
              <ExternalLink className="size-3" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


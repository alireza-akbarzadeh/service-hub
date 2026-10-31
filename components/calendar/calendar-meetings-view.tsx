"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { DashboardBottomBar } from "@/components/dashboard/dashboard-bottom-bar"
import {
  type CalendarEvent,
  type CalendarEventType,
  EVENT_TYPE_CONFIG,
  GREGORIAN_MONTH_NAMES,
  INITIAL_CALENDAR_EVENTS,
  generateMonthGrid,
  formatDateKey,
} from "@/lib/calendar-events-data"
import { gregorianToJalali } from "@/components/iran-calendar/jalali-utils"
import { MonthView } from "@/components/calendar/month-view"
import { WeekView } from "@/components/calendar/week-view"
import { AgendaView } from "@/components/calendar/agenda-view"
import { CreateEditEventDialog, EventDetailDialog } from "@/components/calendar/event-dialogs"
import {
  ArrowLeft,
  Bell,
  BellRing,
  Calendar,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Plus,
  Radio,
  Search,
  Sparkles,
  Users,
  Video,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "frontend_squad_calendar_events_v2"

export function CalendarMeetingsView() {
  // Calendar state: Year and Month (1-indexed)
  const [currentYear, setCurrentYear] = React.useState<number>(2026)
  const [currentMonth, setCurrentMonth] = React.useState<number>(10) // October
  const [activeDateKey, setActiveDateKey] = React.useState<string>("2026-10-31")

  // Views: month | week | agenda
  const [activeView, setActiveView] = React.useState<"month" | "week" | "agenda">("month")

  // Dual Calendar mode toggle (English + Jalali vs English only)
  const [showDualCalendar, setShowDualCalendar] = React.useState<boolean>(true)

  // Events state with localStorage persistence
  const [events, setEvents] = React.useState<CalendarEvent[]>(() => {
    if (typeof window === "undefined") return INITIAL_CALENDAR_EVENTS
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return INITIAL_CALENDAR_EVENTS
  })

  // Selected event for detail dialog
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState<boolean>(false)

  // Create / Edit modal state
  const [isCreateOpen, setIsCreateOpen] = React.useState<boolean>(false)
  const [createInitialDate, setCreateInitialDate] = React.useState<string>("2026-10-31")
  const [createInitialTime, setCreateInitialTime] = React.useState<string>("10:30")
  const [editingEvent, setEditingEvent] = React.useState<CalendarEvent | null>(null)

  // Search & Filters
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedTypes, setSelectedTypes] = React.useState<Set<CalendarEventType>>(
    new Set(["meeting", "deployment", "sprint", "oncall", "gaming"])
  )

  // Audio chimes & Push notifications
  const [soundEnabled, setSoundEnabled] = React.useState<boolean>(true)
  const [hasNotifPermission, setHasNotifPermission] = React.useState<boolean>(false)

  // World Clocks state (updates every second)
  const [worldTimes, setWorldTimes] = React.useState({
    tehran: "15:35",
    utc: "12:05",
    newYork: "08:05",
    tokyo: "21:05",
  })

  React.useEffect(() => {
    const updateTimes = () => {
      const now = new Date()
      const formatTime = (timeZone: string) =>
        now.toLocaleTimeString("en-GB", { timeZone, hour: "2-digit", minute: "2-digit" })

      setWorldTimes({
        tehran: formatTime("Asia/Tehran"),
        utc: formatTime("UTC"),
        newYork: formatTime("America/New_York"),
        tokyo: formatTime("Asia/Tokyo"),
      })
    }
    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [])

  // Persist events to localStorage
  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents))
      } catch {}
    }
  }

  // Navigation handlers
  const handlePrev = () => {
    if (activeView === "month" || activeView === "agenda") {
      if (currentMonth === 1) {
        setCurrentMonth(12)
        setCurrentYear((y) => y - 1)
      } else {
        setCurrentMonth((m) => m - 1)
      }
    } else {
      // Week view: move 7 days back
      const [y, m, d] = activeDateKey.split("-").map(Number)
      const prevDate = new Date(y, m - 1, d - 7)
      const newKey = formatDateKey(
        prevDate.getFullYear(),
        prevDate.getMonth() + 1,
        prevDate.getDate()
      )
      setActiveDateKey(newKey)
      setCurrentYear(prevDate.getFullYear())
      setCurrentMonth(prevDate.getMonth() + 1)
    }
  }

  const handleNext = () => {
    if (activeView === "month" || activeView === "agenda") {
      if (currentMonth === 12) {
        setCurrentMonth(1)
        setCurrentYear((y) => y + 1)
      } else {
        setCurrentMonth((m) => m + 1)
      }
    } else {
      // Week view: move 7 days forward
      const [y, m, d] = activeDateKey.split("-").map(Number)
      const nextDate = new Date(y, m - 1, d + 7)
      const newKey = formatDateKey(
        nextDate.getFullYear(),
        nextDate.getMonth() + 1,
        nextDate.getDate()
      )
      setActiveDateKey(newKey)
      setCurrentYear(nextDate.getFullYear())
      setCurrentMonth(nextDate.getMonth() + 1)
    }
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentYear(today.getFullYear())
    setCurrentMonth(today.getMonth() + 1)
    setActiveDateKey(
      formatDateKey(today.getFullYear(), today.getMonth() + 1, today.getDate())
    )
  }

  // Toggle category filters
  const toggleTypeFilter = (type: CalendarEventType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        if (next.size > 1) next.delete(type) // Don't allow empty
      } else {
        next.add(type)
      }
      return next
    })
  }

  // Filtered Events
  const filteredEvents = React.useMemo(() => {
    return events.filter((ev) => {
      const matchesType = selectedTypes.has(ev.type)
      const matchesSearch =
        !searchQuery.trim() ||
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.attendees.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [events, selectedTypes, searchQuery])

  // Generate Month Grid
  const monthGrid = React.useMemo(() => {
    return generateMonthGrid(currentYear, currentMonth, true)
  }, [currentYear, currentMonth])

  // Generate Week Days for activeDateKey
  const weekDays = React.useMemo(() => {
    const [y, m, d] = activeDateKey.split("-").map(Number)
    const activeDate = new Date(y, m - 1, d)
    let dayOfWeek = activeDate.getDay() // 0=Sun..6=Sat
    // Convert to Monday start
    const mondayOffset = (dayOfWeek + 6) % 7
    const mondayDate = new Date(y, m - 1, d - mondayOffset)

    return Array.from({ length: 7 }, (_, i) => {
      const cur = new Date(
        mondayDate.getFullYear(),
        mondayDate.getMonth(),
        mondayDate.getDate() + i
      )
      const key = formatDateKey(cur.getFullYear(), cur.getMonth() + 1, cur.getDate())
      const today = new Date()
      const isToday =
        today.getFullYear() === cur.getFullYear() &&
        today.getMonth() === cur.getMonth() &&
        today.getDate() === cur.getDate()

      return {
        dateKey: key,
        day: cur.getDate(),
        month: cur.getMonth() + 1,
        year: cur.getFullYear(),
        isCurrentMonth: cur.getMonth() + 1 === currentMonth,
        isToday,
        dayOfWeek: cur.getDay(),
        jalali: gregorianToJalali(cur.getFullYear(), cur.getMonth() + 1, cur.getDate()),
      }
    })
  }, [activeDateKey, currentMonth])

  // Current Jalali header reference
  const currentJalali = React.useMemo(() => {
    return gregorianToJalali(currentYear, currentMonth, 15)
  }, [currentYear, currentMonth])

  // Next upcoming meeting / live meeting
  const upcomingNextEvent = React.useMemo(() => {
    return (
      events.find((e) => e.type === "meeting" || e.type === "sprint") ||
      events[0]
    )
  }, [events])

  // Instant Google Meet launcher
  const handleLaunchInstantMeet = () => {
    if (typeof window !== "undefined") {
      window.open("https://meet.google.com/new", "_blank", "noopener,noreferrer")
    }
  }

  // Handle save from dialog
  const handleSaveEvent = (saved: CalendarEvent) => {
    const exists = events.some((e) => e.id === saved.id)
    if (exists) {
      saveEvents(events.map((e) => (e.id === saved.id ? saved : e)))
    } else {
      saveEvents([saved, ...events])
    }
  }

  const handleDeleteEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none selection:bg-primary/20 overflow-x-clip">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Hub</span>
          </Link>

          <Separator orientation="vertical" className="h-4" />

          {/* Page Title & Breadcrumb */}
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
              <CalendarDays className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight">
                Team Calendar & Sprints
              </h1>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono px-1.5 py-0"
              >
                English & Iran Sync
              </Badge>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Dual Calendar Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDualCalendar(!showDualCalendar)}
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-medium shadow-2xs hover:bg-muted"
            title="Toggle English & Jalali dual date badges"
          >
            <Globe className="size-3.5 text-primary" />
            <span className="hidden md:inline">
              {showDualCalendar ? "Dual: English + Jalali" : "English Only"}
            </span>
          </Button>

          {/* Instant Google Meet Launcher */}
          <Button
            type="button"
            size="sm"
            onClick={handleLaunchInstantMeet}
            className="h-8 gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-xs cursor-pointer text-xs"
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">Instant Meet</span>
            <ExternalLink className="size-3 opacity-80" />
          </Button>

          {/* New Event Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingEvent(null)
              setCreateInitialDate(activeDateKey)
              setCreateInitialTime("10:30")
              setIsCreateOpen(true)
            }}
            className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-xs bg-primary text-primary-foreground"
          >
            <Calendar className="size-3.5" />
            <span className="hidden sm:inline">Schedule Event</span>
          </Button>

          <Separator orientation="vertical" className="h-4" />
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Full-Screen Layout */}
      <main className="w-full max-w-[1920px] mx-auto flex-1 flex flex-col p-3 sm:p-5 lg:p-6 space-y-4 pb-16">
        {/* Calendar Controls & Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
          {/* Left: Month Navigation & Today */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8 text-xs font-semibold px-3 cursor-pointer shadow-2xs"
            >
              Today
            </Button>

            <div className="flex items-center border border-border rounded-lg bg-muted/20">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                className="size-8 cursor-pointer rounded-r-none hover:bg-muted"
                title="Previous month"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="size-8 cursor-pointer rounded-l-none hover:bg-muted"
                title="Next month"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="flex items-baseline gap-2 pl-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {GREGORIAN_MONTH_NAMES[currentMonth - 1]} {currentYear}
              </h2>
              {showDualCalendar && (
                <span className="text-xs font-mono font-medium text-muted-foreground hidden sm:inline">
                  • {currentJalali.monthNameFa} {currentJalali.jy} ({currentJalali.monthNameEn})
                </span>
              )}
            </div>
          </div>

          {/* Right: View Switcher (Month, Week, Agenda) & Search */}
          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center rounded-xl border border-border/80 bg-muted/30 p-1 text-xs">
              {[
                { id: "month", label: "Month" },
                { id: "week", label: "Week" },
                { id: "agenda", label: "Agenda" },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveView(v.id as any)}
                  className={cn(
                    "cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-colors",
                    activeView === v.id
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Event Search */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="absolute top-2 left-2.5 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search meetings & events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Panel Workspace: Left Sidebar + Central Full-Screen Calendar Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[640px]">
          {/* Left Sidebar (3 Cols) */}
          <div className="lg:col-span-3 space-y-4 flex flex-col">
            {/* Next Up Spotlight Card */}
            {upcomingNextEvent && (
              <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-card to-background p-4 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Radio className="size-3.5 text-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Next Scheduled Event
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] text-primary bg-primary/10 border-primary/30">
                    {upcomingNextEvent.startTime} IRST
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">
                    {upcomingNextEvent.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {upcomingNextEvent.agenda || "Regular team synchronization and sprint tracking."}
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {upcomingNextEvent.durationMins}m • {upcomingNextEvent.platform}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.open(upcomingNextEvent.meetUrl, "_blank", "noopener,noreferrer")
                      }
                    }}
                    className="h-7 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs gap-1"
                  >
                    <Video className="size-3" />
                    Join
                  </Button>
                </div>
              </div>
            )}

            {/* Event Category Filter Toggles */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="size-3.5 text-primary" />
                <span>Event Types & Calendars</span>
              </span>

              <div className="space-y-1.5 pt-1">
                {(
                  [
                    { id: "meeting", label: "Team Meetings" },
                    { id: "deployment", label: "Releases & Deploys" },
                    { id: "sprint", label: "Sprint Milestones" },
                    { id: "oncall", label: "On-Call & Infra Ops" },
                    { id: "gaming", label: "CS2 Squad Match" },
                  ] as const
                ).map((cat) => {
                  const cfg = EVENT_TYPE_CONFIG[cat.id]
                  const isChecked = selectedTypes.has(cat.id)
                  const count = events.filter((e) => e.type === cat.id).length

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleTypeFilter(cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors",
                        isChecked
                          ? "border-border bg-muted/40 text-foreground"
                          : "border-transparent bg-transparent text-muted-foreground/60 hover:bg-muted/20"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: isChecked ? cfg.dotColor : "#6b7280" }}
                        />
                        <span>{cat.label}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-border/60">
                        {count}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* World Clocks & Timezone Sync Card */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-2.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>Global Team Timezones</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Tehran (IRST)</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {worldTimes.tehran}
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">UTC / London</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {worldTimes.utc}
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">New York (EDT)</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {worldTimes.newYork}
                  </span>
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/20 p-2">
                  <span className="text-[10px] text-muted-foreground block font-medium">Tokyo (JST)</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {worldTimes.tokyo}
                  </span>
                </div>
              </div>
            </div>

            {/* CS2 Squad Match Reminder Banner */}
            <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-card to-background p-3.5 shadow-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-500 flex items-center gap-1">
                  <Flame className="size-3" />
                  Daily CS2 Squad Match
                </span>
                <span className="text-xs font-bold text-foreground block">
                  17:10 IRST Match Launch
                </span>
              </div>
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  if (navigator?.clipboard) {
                    navigator.clipboard.writeText("connect 185.143.234.12:27015; password squad2026")
                  }
                }}
                className="text-[10px] font-mono cursor-pointer border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/15"
                title="Copy CS2 private server console connect command"
              >
                Copy IP
              </Button>
            </div>
          </div>

          {/* Central Main Calendar Canvas (9 Cols) */}
          <div className="lg:col-span-9 flex flex-col min-h-[580px]">
            {activeView === "month" && (
              <MonthView
                gridCells={monthGrid}
                events={filteredEvents}
                showDualCalendar={showDualCalendar}
                onSelectEvent={(ev) => {
                  setSelectedEvent(ev)
                  setIsDetailOpen(true)
                }}
                onCreateOnDate={(dateKey) => {
                  setEditingEvent(null)
                  setCreateInitialDate(dateKey)
                  setCreateInitialTime("10:30")
                  setIsCreateOpen(true)
                }}
              />
            )}

            {activeView === "week" && (
              <WeekView
                weekDays={weekDays}
                events={filteredEvents}
                showDualCalendar={showDualCalendar}
                onSelectEvent={(ev) => {
                  setSelectedEvent(ev)
                  setIsDetailOpen(true)
                }}
                onCreateAtTime={(dateKey, time) => {
                  setEditingEvent(null)
                  setCreateInitialDate(dateKey)
                  setCreateInitialTime(time)
                  setIsCreateOpen(true)
                }}
              />
            )}

            {activeView === "agenda" && (
              <AgendaView
                events={filteredEvents}
                onSelectEvent={(ev) => {
                  setSelectedEvent(ev)
                  setIsDetailOpen(true)
                }}
                onCreateEvent={() => {
                  setEditingEvent(null)
                  setCreateInitialDate(activeDateKey)
                  setCreateInitialTime("10:30")
                  setIsCreateOpen(true)
                }}
              />
            )}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreateEditEventDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveEvent}
        initialDate={createInitialDate}
        initialTime={createInitialTime}
        editingEvent={editingEvent}
      />

      <EventDetailDialog
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={(ev) => {
          setEditingEvent(ev)
          setIsCreateOpen(true)
        }}
        onDelete={handleDeleteEvent}
      />

      {/* Bottom Telemetry & Quick Dock Bar */}
      <DashboardBottomBar branchName="master" />
    </div>
  )
}

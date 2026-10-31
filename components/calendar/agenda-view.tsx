"use client"

import * as React from "react"
import {
  type CalendarEvent,
  EVENT_TYPE_CONFIG,
} from "@/lib/calendar-events-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ExternalLink, Users, Video } from "lucide-react"
import { cn } from "@/lib/utils"

interface AgendaViewProps {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
  onCreateEvent: () => void
}

export function AgendaView({
  events,
  onSelectEvent,
  onCreateEvent,
}: AgendaViewProps) {
  // Group events by date
  const groupedEvents = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    // Sort chronologically
    const sorted = [...events].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date)
      if (cmp !== 0) return cmp
      return a.startTime.localeCompare(b.startTime)
    })

    sorted.forEach((ev) => {
      if (!map.has(ev.date)) {
        map.set(ev.date, [])
      }
      map.get(ev.date)!.push(ev)
    })

    return Array.from(map.entries())
  }, [events])

  if (groupedEvents.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-card/40 rounded-2xl border border-border">
        <Calendar className="size-12 text-muted-foreground/40 mb-3" />
        <h3 className="text-base font-semibold text-foreground">No events found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No scheduled events match your current filter criteria or search query.
        </p>
        <Button
          size="sm"
          onClick={onCreateEvent}
          className="mt-4 cursor-pointer text-xs font-semibold"
        >
          Create New Event
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
      {groupedEvents.map(([dateKey, dayEvents]) => {
        const [yStr, mStr, dStr] = dateKey.split("-")
        const dateObj = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, parseInt(dStr, 10))
        const isToday =
          new Date().toISOString().split("T")[0] === dateKey

        return (
          <div
            key={dateKey}
            className="rounded-2xl border border-border bg-card/60 p-4 shadow-2xs space-y-3"
          >
            {/* Date Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">
                  {dateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {isToday && (
                  <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-mono px-1.5 py-0">
                    TODAY
                  </Badge>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
              </span>
            </div>

            {/* Event Cards */}
            <div className="space-y-2">
              {dayEvents.map((ev) => {
                const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.meeting
                return (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] font-mono px-1.5 py-0", cfg.badgeClass)}
                        >
                          {cfg.label}
                        </Badge>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                          {ev.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-mono font-semibold text-foreground/85">
                          <Clock className="size-3 text-primary" />
                          {ev.startTime} - {ev.endTime} ({ev.durationMins}m)
                        </span>
                        <span>•</span>
                        <span>{ev.platform}</span>
                        {ev.attendees && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {ev.attendees}
                            </span>
                          </>
                        )}
                      </div>

                      {ev.agenda && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 pt-0.5">
                          {ev.agenda}
                        </p>
                      )}
                    </div>

                    {/* Join Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      {ev.meetUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (typeof window !== "undefined") {
                              window.open(ev.meetUrl, "_blank", "noopener,noreferrer")
                            }
                          }}
                          className="h-7 px-2.5 text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 cursor-pointer"
                        >
                          <Video className="size-3 mr-1" />
                          Join Call
                          <ExternalLink className="size-2.5 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}


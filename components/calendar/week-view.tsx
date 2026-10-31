"use client"

import * as React from "react"
import {
  type CalendarEvent,
  type CalendarDayCell,
  EVENT_TYPE_CONFIG,
  getEventsForDate,
} from "@/lib/calendar-events-data"
import { cn } from "@/lib/utils"

interface WeekViewProps {
  weekDays: CalendarDayCell[]
  events: CalendarEvent[]
  showDualCalendar: boolean
  onSelectEvent: (event: CalendarEvent) => void
  onCreateAtTime: (dateKey: string, time: string) => void
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8) // 08:00 to 22:00

export function WeekView({
  weekDays,
  events,
  showDualCalendar,
  onSelectEvent,
  onCreateAtTime,
}: WeekViewProps) {
  // Current time marker calculation (assuming Tehran local time or browser time)
  const [currentMinuteTop, setCurrentMinuteTop] = React.useState<number | null>(null)

  React.useEffect(() => {
    const updateTimeMarker = () => {
      const now = new Date()
      const hour = now.getHours()
      const mins = now.getMinutes()
      if (hour >= 8 && hour <= 22) {
        const totalMinutes = (hour - 8) * 60 + mins
        const topPx = (totalMinutes / (14 * 60)) * (14 * 56) // 56px per hour
        setCurrentMinuteTop(topPx)
      } else {
        setCurrentMinuteTop(null)
      }
    }
    updateTimeMarker()
    const interval = setInterval(updateTimeMarker, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card/40 rounded-2xl border border-border overflow-hidden select-none shadow-xs">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b border-border bg-muted/40 font-mono text-xs font-semibold py-2">
        {/* Time gutter corner */}
        <div className="text-center text-muted-foreground text-[10px] uppercase flex items-center justify-center">
          IRST
        </div>
        {weekDays.map((wd) => (
          <div
            key={wd.dateKey}
            className={cn(
              "flex flex-col items-center justify-center border-l border-border/50 py-1",
              wd.isToday && "text-primary font-bold"
            )}
          >
            <span className="text-[11px] font-medium text-muted-foreground">
              {new Date(wd.year, wd.month - 1, wd.day).toLocaleDateString("en-US", {
                weekday: "short",
              })}
            </span>
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  "size-6 flex items-center justify-center rounded-full text-xs font-bold",
                  wd.isToday
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-foreground"
                )}
              >
                {wd.day}
              </span>
              {showDualCalendar && (
                <span className="text-[10px] text-muted-foreground">
                  {wd.jalali.jd} {wd.jalali.monthNameEn.slice(0, 3)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Grid Body */}
      <div className="flex-1 overflow-y-auto relative">
        <div className="grid grid-cols-8 relative divide-x divide-border/50">
          {/* Time axis labels */}
          <div className="divide-y divide-border/40 text-[10px] font-mono text-muted-foreground text-center">
            {HOURS.map((hour) => (
              <div key={hour} className="h-14 flex items-start justify-center pt-1">
                {String(hour).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* 7 Day Columns */}
          {weekDays.map((wd, dayIdx) => {
            const dayEvents = getEventsForDate(wd.dateKey, events)

            return (
              <div
                key={wd.dateKey}
                className={cn(
                  "relative divide-y divide-border/40",
                  wd.isToday ? "bg-primary/5" : "bg-transparent"
                )}
              >
                {/* 14 Hour slots */}
                {HOURS.map((hour) => {
                  const hourStr = `${String(hour).padStart(2, "0")}:00`
                  return (
                    <div
                      key={hour}
                      onClick={() => onCreateAtTime(wd.dateKey, hourStr)}
                      className="h-14 hover:bg-muted/30 cursor-pointer transition-colors relative group"
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 text-[9px] font-mono text-muted-foreground bg-muted rounded px-1">
                        + {hourStr}
                      </span>
                    </div>
                  )
                })}

                {/* Current Time Indicator on today's column */}
                {wd.isToday && currentMinuteTop !== null && (
                  <div
                    className="absolute inset-x-0 z-20 pointer-events-none flex items-center"
                    style={{ top: `${currentMinuteTop}px` }}
                  >
                    <div className="size-2 rounded-full bg-rose-500 -ml-1 ring-2 ring-background" />
                    <div className="h-[2px] w-full bg-rose-500 shadow-xs" />
                  </div>
                )}

                {/* Positioned Event Cards */}
                {dayEvents.map((ev) => {
                  const [hStr, mStr] = ev.startTime.split(":")
                  const startH = parseInt(hStr, 10)
                  const startM = parseInt(mStr, 10) || 0
                  if (startH < 8 || startH > 22) return null

                  const topMins = (startH - 8) * 60 + startM
                  const topPx = (topMins / 60) * 56
                  const heightPx = Math.max((ev.durationMins / 60) * 56, 24)

                  const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.meeting

                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvent(ev)
                      }}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                      }}
                      className={cn(
                        "absolute inset-x-1 z-10 rounded-lg p-1.5 border text-xs cursor-pointer shadow-xs transition-transform hover:scale-[1.02] flex flex-col justify-between overflow-hidden",
                        cfg.bgClass,
                        cfg.borderClass,
                        cfg.textClass
                      )}
                    >
                      <div className="flex items-center justify-between gap-1 leading-tight">
                        <span className="font-bold truncate text-[11px]">{ev.title}</span>
                        <span className="font-mono text-[9px] opacity-80 shrink-0">
                          {ev.startTime}
                        </span>
                      </div>
                      {heightPx >= 42 && ev.agenda && (
                        <p className="text-[10px] opacity-85 truncate font-normal">
                          {ev.agenda}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

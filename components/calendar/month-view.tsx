"use client"

import * as React from "react"
import {
  type CalendarEvent,
  type CalendarDayCell,
  EVENT_TYPE_CONFIG,
  GREGORIAN_WEEKDAYS,
  getEventsForDate,
} from "@/lib/calendar-events-data"
import { Plus, Video, Radio, Flame, Sparkles, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MonthViewProps {
  gridCells: CalendarDayCell[]
  events: CalendarEvent[]
  showDualCalendar: boolean
  onSelectEvent: (event: CalendarEvent) => void
  onCreateOnDate: (dateKey: string) => void
}

export function MonthView({
  gridCells,
  events,
  showDualCalendar,
  onSelectEvent,
  onCreateOnDate,
}: MonthViewProps) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-card/40 rounded-2xl border border-border overflow-hidden select-none shadow-xs">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center font-mono text-xs font-semibold py-2.5">
        {GREGORIAN_WEEKDAYS.map((wd) => (
          <div
            key={wd.short}
            className={cn(
              "flex flex-col items-center justify-center",
              wd.isWeekend ? "text-amber-500/80" : "text-muted-foreground"
            )}
          >
            <span className="font-bold">{wd.short}</span>
            <span className="hidden sm:inline text-[10px] font-normal opacity-70">
              {wd.long}
            </span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border/60 overflow-y-auto">
        {gridCells.map((cell) => {
          const dayEvents = getEventsForDate(cell.dateKey, events)
          const isWeekend = cell.dayOfWeek === 0 || cell.dayOfWeek === 6

          return (
            <div
              key={cell.dateKey}
              onClick={() => onCreateOnDate(cell.dateKey)}
              className={cn(
                "group relative min-h-[96px] sm:min-h-[110px] p-1.5 transition-colors cursor-pointer flex flex-col justify-between",
                !cell.isCurrentMonth
                  ? "bg-muted/10 opacity-45"
                  : isWeekend
                  ? "bg-muted/5 hover:bg-muted/25"
                  : "bg-card/30 hover:bg-muted/30"
              )}
            >
              {/* Day Cell Header */}
              <div className="flex items-center justify-between gap-1">
                {/* Date Numbers: English + Dual Jalali */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-semibold font-mono transition-transform group-hover:scale-105",
                      cell.isToday
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-foreground"
                    )}
                  >
                    {cell.day}
                  </span>

                  {showDualCalendar && (
                    <span
                      className="text-[10px] font-mono text-muted-foreground/80 tracking-tight"
                      title={`${cell.jalali.jd} ${cell.jalali.monthNameFa} ${cell.jalali.jy}`}
                    >
                      {cell.jalali.jd} {cell.jalali.monthNameEn.slice(0, 3)}
                    </span>
                  )}
                </div>

                {/* Hover Add Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateOnDate(cell.dateKey)
                  }}
                  className="opacity-0 group-hover:opacity-100 size-5 flex items-center justify-center rounded-md bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer shadow-2xs"
                  title={`Add event on ${cell.dateKey}`}
                >
                  <Plus className="size-3" />
                </button>
              </div>

              {/* Day Event Chips */}
              <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                {dayEvents.slice(0, 3).map((ev) => {
                  const cfg = EVENT_TYPE_CONFIG[ev.type] || EVENT_TYPE_CONFIG.meeting
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectEvent(ev)
                      }}
                      className={cn(
                        "w-full text-left rounded-md px-1.5 py-0.5 text-[11px] font-medium border flex items-center gap-1.5 truncate cursor-pointer transition-all shadow-2xs hover:scale-[1.01]",
                        cfg.bgClass,
                        cfg.borderClass,
                        cfg.textClass
                      )}
                      title={`${ev.startTime} - ${ev.title}`}
                    >
                      <span
                        className="size-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: cfg.dotColor }}
                      />
                      <span className="font-mono text-[9.5px] opacity-85 shrink-0">
                        {ev.startTime}
                      </span>
                      <span className="truncate">{ev.title}</span>
                    </button>
                  )
                })}

                {/* Overflow count */}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground pl-1 block">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


"use client"

import * as React from "react"
import {
  gregorianToJalali,
  jalaliToGregorian,
  getDaysInJalaliMonth,
  getDayStatus,
  toPersianDigits,
  getTehranCurrentTime,
  WEEKDAYS_FA,
  JALALI_MONTH_NAMES_FA,
  JALALI_MONTH_NAMES_EN,
  type JalaliDate,
  type DayStatus,
} from "./jalali-utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe2,
  CheckCircle2,
  Coffee,
} from "lucide-react"

export function IranClockCalendar() {
  // Initial calculation
  const [initialData] = React.useState(() => getTehranCurrentTime())

  // Live current time in Tehran
  const [now, setNow] = React.useState<Date | null>(null)
  const [tehranTime, setTehranTime] = React.useState(() => ({
    hours: initialData.hours,
    minutes: initialData.minutes,
    seconds: initialData.seconds,
    timeString: initialData.timeString,
    isPm: initialData.hours >= 12,
  }))

  // Selected date & viewing month
  const [viewJalaliYear, setViewJalaliYear] = React.useState<number>(initialData.jalali.jy)
  const [viewJalaliMonth, setViewJalaliMonth] = React.useState<number>(initialData.jalali.jm) // 1-12
  const [selectedJalaliDay, setSelectedJalaliDay] = React.useState<number | null>(initialData.jalali.jd)

  // Current today's Jalali date
  const [todayJalali, setTodayJalali] = React.useState<JalaliDate>(initialData.jalali)
  const [todayStatus, setTodayStatus] = React.useState<DayStatus>(initialData.status)

  // Update clock every second
  React.useEffect(() => {
    function updateTime() {
      const current = getTehranCurrentTime()
      setNow(new Date())
      setTehranTime({
        hours: current.hours,
        minutes: current.minutes,
        seconds: current.seconds,
        timeString: current.timeString,
        isPm: current.hours >= 12,
      })
      setTodayJalali(current.jalali)
      setTodayStatus(current.status)
    }

    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  function handlePrevMonth() {
    if (viewJalaliMonth === 1) {
      setViewJalaliYear((y) => y - 1)
      setViewJalaliMonth(12)
    } else {
      setViewJalaliMonth((m) => m - 1)
    }
    setSelectedJalaliDay(null)
  }

  function handleNextMonth() {
    if (viewJalaliMonth === 12) {
      setViewJalaliYear((y) => y + 1)
      setViewJalaliMonth(1)
    } else {
      setViewJalaliMonth((m) => m + 1)
    }
    setSelectedJalaliDay(null)
  }

  function handleJumpToToday() {
    if (todayJalali) {
      setViewJalaliYear(todayJalali.jy)
      setViewJalaliMonth(todayJalali.jm)
      setSelectedJalaliDay(todayJalali.jd)
    }
  }

  // Calculate calendar grid for viewJalaliYear and viewJalaliMonth
  const daysInMonth = getDaysInJalaliMonth(viewJalaliYear, viewJalaliMonth)
  const firstDayOfViewMonth = jalaliToGregorian(viewJalaliYear, viewJalaliMonth, 1)
  const startDayOfWeek = firstDayOfViewMonth.dayOfWeek // 0: Shanbeh, ..., 6: Jomeh

  // Selected day details
  const selectedDayInfo = React.useMemo(() => {
    if (!selectedJalaliDay) return null
    const g = jalaliToGregorian(viewJalaliYear, viewJalaliMonth, selectedJalaliDay)
    const j = gregorianToJalali(g.gy, g.gm, g.gd)
    const status = getDayStatus(j.jy, j.jm, j.jd, j.dayOfWeek)
    return {
      jalali: j,
      gregorian: g,
      status,
    }
  }, [viewJalaliYear, viewJalaliMonth, selectedJalaliDay])

  // Office Hours calculation (09:00 - 17:30 Tehran time)
  const workHoursPercentage = React.useMemo(() => {
    const minutesPassed = tehranTime.hours * 60 + tehranTime.minutes
    const startMinutes = 9 * 60 // 09:00
    const endMinutes = 17 * 60 + 30 // 17:30
    if (minutesPassed < startMinutes) return 0
    if (minutesPassed > endMinutes) return 100
    return Math.round(((minutesPassed - startMinutes) / (endMinutes - startMinutes)) * 100)
  }, [tehranTime.hours, tehranTime.minutes])

  const isWorkingHours =
    tehranTime.hours >= 9 &&
    (tehranTime.hours < 17 || (tehranTime.hours === 17 && tehranTime.minutes <= 30))

  // Collapsible state for calendar section (stored in browser localStorage)
  const [isCalendarCollapsed, setIsCalendarCollapsed] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("service_hub_calendar_collapsed") === "true"
    } catch {}
    return false
  })

  const toggleCalendarCollapse = () => {
    setIsCalendarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem("service_hub_calendar_collapsed", String(next))
      } catch {}
      return next
    })
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Calendar Section Header with Collapse / Expand Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="size-3.5 text-amber-500" />
          <span className="text-xs font-bold text-foreground">Iranian Time & Calendar</span>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={toggleCalendarCollapse}
          className="h-6 cursor-pointer gap-1 px-2 text-[10px] font-medium text-muted-foreground hover:text-foreground shadow-2xs"
          title={isCalendarCollapsed ? "Expand Calendar" : "Collapse Calendar like sidebar"}
        >
          <span>{isCalendarCollapsed ? "Expand Calendar" : "Collapse"}</span>
          <ChevronRight
            className={cn(
              "size-3 transition-transform duration-200",
              !isCalendarCollapsed && "rotate-90"
            )}
          />
        </Button>
      </div>

      {/* Collapsed Compact Strip View */}
      {isCalendarCollapsed ? (
        <div
          onClick={toggleCalendarCollapse}
          className="group flex cursor-pointer items-center justify-between rounded-xl border border-border/80 bg-linear-to-r from-amber-500/10 via-card to-background p-3 shadow-2xs transition-all hover:border-amber-500/40 hover:shadow-xs"
        >
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 shadow-2xs">
              <Clock className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tabular-nums text-foreground">
                  {tehranTime.timeString}
                </span>
                <Badge
                  variant="outline"
                  className="px-1 py-0 font-mono text-[9px] border-amber-500/30 text-amber-600 dark:text-amber-400"
                >
                  IRST
                </Badge>
              </div>
              <div className="font-vazirmatn text-xs font-bold text-foreground/80">
                {todayJalali
                  ? `${todayJalali.weekdayNameFa} ${toPersianDigits(todayJalali.jd)} ${todayJalali.monthNameFa}`
                  : "Tehran"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {todayStatus && (
              <Badge
                variant="outline"
                className={cn(
                  "font-vazirmatn text-[10px] font-bold px-1.5 py-0.5",
                  todayStatus.isOffDay
                    ? "border-rose-500/40 text-rose-600 dark:text-rose-400 bg-rose-500/10"
                    : todayStatus.isHalfDay
                      ? "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                      : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                )}
              >
                {todayStatus.isOffDay ? "تعطیل" : todayStatus.isHalfDay ? "نیمه‌وقت" : "کاری"}
              </Badge>
            )}
            <ChevronRight className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </div>
      ) : (
        <>
          {/* Exact Tehran Digital Clock Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-amber-500/10 via-card to-background p-4 shadow-sm">
            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium">
                <Globe2 className="size-3.5 text-amber-500 animate-spin-slow" />
                <span>Tehran, Iran</span>
              </div>
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 font-mono text-[10px] text-amber-600 dark:text-amber-400"
              >
                IRST (UTC+03:30)
              </Badge>
            </div>

        {/* Big Live Digital Clock Display */}
        <div className="mt-3 flex items-baseline justify-between">
          <div className="font-mono text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl tabular-nums">
            {tehranTime.timeString}
          </div>
          <div className="flex flex-col items-end">
            <span className="font-mono text-xs font-semibold text-primary">
              {tehranTime.isPm ? "PM (ب.ظ)" : "AM (ق.ظ)"}
            </span>
            <span className="font-vazirmatn text-xs font-bold text-muted-foreground">
              {toPersianDigits(tehranTime.timeString)}
            </span>
          </div>
        </div>

        {/* Jalali & Gregorian Date Subtitles */}
        <div className="mt-3 border-t border-border/60 pt-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <CalendarIcon className="size-3.5 text-primary" />
              <span className="font-vazirmatn text-xs font-bold">
                {todayJalali
                  ? `${todayJalali.weekdayNameFa} ${toPersianDigits(todayJalali.jd)} ${todayJalali.monthNameFa} ${toPersianDigits(todayJalali.jy)}`
                  : "Loading..."}
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {now
                ? now.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* On / Off Day Status Card */}
      {todayStatus && (
        <div
          className={cn(
            "rounded-xl border p-3 shadow-2xs transition-all",
            todayStatus.isOffDay
              ? "border-rose-500/30 bg-rose-500/10"
              : todayStatus.isHalfDay
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-emerald-500/30 bg-emerald-500/10"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-lg shadow-2xs",
                  todayStatus.isOffDay
                    ? "bg-rose-500 text-white"
                    : todayStatus.isHalfDay
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-500 text-white"
                )}
              >
                {todayStatus.isOffDay ? (
                  <Coffee className="size-4" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "font-vazirmatn text-xs font-extrabold",
                      todayStatus.isOffDay
                        ? "text-rose-600 dark:text-rose-400"
                        : todayStatus.isHalfDay
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {todayStatus.statusLabelFa}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ({todayStatus.statusLabel})
                  </span>
                </div>
                <p className="font-vazirmatn text-[11px] text-muted-foreground">
                  {todayStatus.description}
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 font-vazirmatn text-[10px] font-bold",
                todayStatus.isOffDay
                  ? "border-rose-500/40 text-rose-600 dark:text-rose-400"
                  : todayStatus.isHalfDay
                    ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                    : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {todayStatus.isOffDay ? "تعطیل" : todayStatus.isHalfDay ? "نیمه‌وقت" : "کاری"}
            </Badge>
          </div>

          {/* Working Hours Bar (active on regular work days) */}
          {!todayStatus.isOffDay && (
            <div className="mt-3 border-t border-border/50 pt-2 text-[11px]">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 text-primary" />
                  {isWorkingHours ? "Office hours active (09:00 - 17:30)" : "Outside office hours"}
                </span>
                <span className="font-mono text-[10px] font-semibold">
                  {workHoursPercentage}% of day
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${workHoursPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Persian Monthly Calendar Grid */}
      <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
        {/* Month Navigation Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="font-vazirmatn text-sm font-bold text-foreground">
              {JALALI_MONTH_NAMES_FA[viewJalaliMonth - 1]}{" "}
              <span className="font-vazirmatn text-primary">
                {toPersianDigits(viewJalaliYear)}
              </span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              ({JALALI_MONTH_NAMES_EN[viewJalaliMonth - 1]} / {viewJalaliYear})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleJumpToToday}
              className="h-6 px-1.5 font-vazirmatn text-[10px] font-semibold text-muted-foreground hover:text-foreground"
              title="Jump to today"
            >
              امروز (Today)
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="size-6 cursor-pointer"
              title="Previous Month"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="size-6 cursor-pointer"
              title="Next Month"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Weekday Names Header */}
        <div className="mt-2 grid grid-cols-7 gap-1 text-center font-medium">
          {WEEKDAYS_FA.map((w, idx) => (
            <div
              key={w.name}
              className={cn(
                "py-1 font-vazirmatn text-xs font-bold",
                idx === 6
                  ? "text-rose-500 font-extrabold"
                  : idx === 5
                    ? "text-amber-500"
                    : "text-muted-foreground"
              )}
              title={`${w.name} (${w.en})`}
            >
              {w.short}
            </div>
          ))}
        </div>

        {/* Days of Month Grid with Vazirmatn Persian numerals */}
        <div className="mt-1 grid grid-cols-7 gap-1">
          {/* Empty cells before start of month */}
          {Array.from({ length: startDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-7.5 rounded-md" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1
            const dayOfWeek = (startDayOfWeek + idx) % 7
            const isFriday = dayOfWeek === 6
            const isThursday = dayOfWeek === 5
            const isToday =
              todayJalali &&
              todayJalali.jy === viewJalaliYear &&
              todayJalali.jm === viewJalaliMonth &&
              todayJalali.jd === dayNum

            const isSelected = selectedJalaliDay === dayNum

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedJalaliDay(dayNum)}
                className={cn(
                  "relative flex h-7.5 items-center justify-center rounded-lg font-vazirmatn text-xs font-semibold transition-all cursor-pointer",
                  isSelected
                    ? "bg-primary font-bold text-primary-foreground shadow-xs ring-2 ring-primary/40"
                    : isToday
                      ? "border border-amber-500 bg-amber-500/15 font-bold text-amber-600 dark:text-amber-400"
                      : isFriday
                        ? "text-rose-500 font-bold hover:bg-rose-500/10"
                        : isThursday
                          ? "text-amber-600 dark:text-amber-400 hover:bg-muted"
                          : "text-foreground hover:bg-muted"
                )}
                title={`روز ${dayNum} ${JALALI_MONTH_NAMES_FA[viewJalaliMonth - 1]} ${isFriday ? "(تعطیل رسمی)" : ""}`}
              >
                <span className="leading-none">{toPersianDigits(dayNum)}</span>
                {isToday && (
                  <span className="absolute bottom-0.5 size-1 rounded-full bg-amber-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Day Info Footer */}
        {selectedDayInfo && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border/70 bg-muted/30 px-2.5 py-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 font-vazirmatn">
              <span className="font-bold text-foreground">
                {selectedDayInfo.jalali.weekdayNameFa} {toPersianDigits(selectedDayInfo.jalali.jd)}{" "}
                {selectedDayInfo.jalali.monthNameFa}:
              </span>
              <span
                className={cn(
                  "font-bold",
                  selectedDayInfo.status.isOffDay
                    ? "text-rose-600 dark:text-rose-400"
                    : selectedDayInfo.status.isHalfDay
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                )}
              >
                {selectedDayInfo.status.statusLabelFa}
              </span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              {selectedDayInfo.gregorian.gy}/{selectedDayInfo.gregorian.gm}/
              {selectedDayInfo.gregorian.gd}
            </span>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}

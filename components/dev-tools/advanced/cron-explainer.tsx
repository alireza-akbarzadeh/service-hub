"use client"

import * as React from "react"
import {
  Clock,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Gamepad2,
  CalendarDays,
  Play,
  RotateCcw,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const CRON_PRESETS = [
  {
    name: "CS2 5:10 PM Daily Match Alert 🎮",
    expression: "10 17 * * *",
    description: "Triggers every single day at exactly 17:10 (5:10 PM)",
    highlight: true,
  },
  {
    name: "Every 5 Minutes",
    expression: "*/5 * * * *",
    description: "Runs every 5 minutes continuously",
  },
  {
    name: "Hourly at Minute 0",
    expression: "0 * * * *",
    description: "Runs once per hour at the start of the hour",
  },
  {
    name: "Weekdays at 9:00 AM",
    expression: "0 9 * * 1-5",
    description: "Runs at 09:00 AM Monday through Friday",
  },
  {
    name: "Daily at Midnight (00:00)",
    expression: "0 0 * * *",
    description: "Runs every night at 12:00 AM",
  },
  {
    name: "Every Sunday at Midnight",
    expression: "0 0 * * 0",
    description: "Weekly maintenance schedule",
  },
  {
    name: "1st of Every Month",
    expression: "0 0 1 * *",
    description: "Monthly invoicing & report rollups",
  },
]

export function CronExplainer() {
  const [minute, setMinute] = React.useState<string>("10")
  const [hour, setHour] = React.useState<string>("17")
  const [dayOfMonth, setDayOfMonth] = React.useState<string>("*")
  const [month, setMonth] = React.useState<string>("*")
  const [dayOfWeek, setDayOfWeek] = React.useState<string>("*")

  const [copied, setCopied] = React.useState<boolean>(false)

  const cronExpression = `${minute || "*"} ${hour || "*"} ${dayOfMonth || "*"} ${month || "*"} ${dayOfWeek || "*"}`

  // Human readable explainer generator
  const humanReadable = React.useMemo(() => {
    try {
      const parts = [minute, hour, dayOfMonth, month, dayOfWeek]
      if (cronExpression === "10 17 * * *") {
        return "At 17:10 (5:10 PM) every day — Match time for Counter-Strike 2 squad! 🎮"
      }
      if (cronExpression === "* * * * *") return "Every minute, every day"
      if (cronExpression === "*/5 * * * *") return "Every 5 minutes, 24/7"
      if (cronExpression === "*/15 * * * *") return "Every 15 minutes, 24/7"
      if (cronExpression === "0 * * * *") return "Every hour at minute 0"
      if (cronExpression === "0 0 * * *") return "At midnight (00:00) every day"
      if (cronExpression === "0 9 * * 1-5") return "At 09:00 AM, Monday through Friday"

      let desc = "Runs: "

      // Minute part
      if (minute === "*") desc += "every minute"
      else if (minute.startsWith("*/")) desc += `every ${minute.replace("*/", "")} minutes`
      else desc += `at minute ${minute}`

      // Hour part
      if (hour === "*") desc += " of every hour"
      else if (hour.startsWith("*/")) desc += ` every ${hour.replace("*/", "")} hours`
      else desc += ` on hour ${hour}:00`

      // Day of month
      if (dayOfMonth !== "*") desc += `, on day ${dayOfMonth} of the month`

      // Month
      if (month !== "*") desc += `, in month ${month}`

      // Day of week
      if (dayOfWeek === "1-5") desc += ", Monday through Friday"
      else if (dayOfWeek === "0" || dayOfWeek === "7") desc += ", on Sunday"
      else if (dayOfWeek === "6") desc += ", on Saturday"
      else if (dayOfWeek !== "*") desc += `, on weekday ${dayOfWeek}`

      return desc
    } catch {
      return "Custom cron schedule"
    }
  }, [cronExpression, minute, hour, dayOfMonth, month, dayOfWeek])

  // Calculate simulated next 5 executions
  const nextRuns = React.useMemo(() => {
    const runs: string[] = []
    const now = new Date()

    try {
      // Approximate next 5 runs based on hour/minute
      let targetHour = parseInt(hour, 10)
      let targetMin = parseInt(minute, 10)

      if (isNaN(targetHour)) targetHour = now.getHours()
      if (isNaN(targetMin)) targetMin = now.getMinutes()

      const current = new Date(now)
      for (let i = 0; i < 5; i++) {
        if (hour === "*" && minute === "*") {
          current.setMinutes(current.getMinutes() + 1)
        } else if (minute.startsWith("*/")) {
          const step = parseInt(minute.replace("*/", ""), 10) || 5
          current.setMinutes(current.getMinutes() + step)
        } else if (hour === "*") {
          current.setMinutes(targetMin)
          if (current <= now) current.setHours(current.getHours() + 1)
          else if (i > 0) current.setHours(current.getHours() + 1)
        } else {
          current.setHours(targetHour, targetMin, 0, 0)
          if (current <= now && i === 0) {
            current.setDate(current.getDate() + 1)
          } else if (i > 0) {
            current.setDate(current.getDate() + 1)
          }
        }

        runs.push(
          current.toLocaleString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
        )
      }
    } catch {
      runs.push("Calculating next runtimes...")
    }

    return runs
  }, [hour, minute])

  const handleCopy = () => {
    navigator.clipboard.writeText(cronExpression)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyPreset = (preset: (typeof CRON_PRESETS)[0]) => {
    const [m, h, dom, mon, dow] = preset.expression.split(" ")
    setMinute(m || "*")
    setHour(h || "*")
    setDayOfMonth(dom || "*")
    setMonth(mon || "*")
    setDayOfWeek(dow || "*")
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Cron Expression Builder & Tester
              </h2>
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-[10px] font-mono text-amber-600 dark:text-amber-400"
              >
                Human Readable Schedule
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Build, translate, and verify 5-part cron schedules with next execution projections.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={handleCopy}
          className="text-xs font-mono gap-1.5 cursor-pointer h-8 bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
        >
          {copied ? (
            <>
              <Check className="size-3 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy `{cronExpression}`</span>
            </>
          )}
        </Button>
      </div>

      {/* Main Display Box: The Expression & Human Translation */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        {/* Large Visual Expression Display */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/30 p-4">
          <div className="flex items-center gap-2 sm:gap-4 font-mono font-bold text-xl sm:text-2xl text-foreground">
            <div className="flex flex-col items-center">
              <span className="text-primary">{minute}</span>
              <span className="text-[10px] text-muted-foreground font-sans font-normal">minute</span>
            </div>
            <span className="text-muted-foreground/60">:</span>
            <div className="flex flex-col items-center">
              <span className="text-primary">{hour}</span>
              <span className="text-[10px] text-muted-foreground font-sans font-normal">hour</span>
            </div>
            <span className="text-muted-foreground/60">•</span>
            <div className="flex flex-col items-center">
              <span className="text-primary">{dayOfMonth}</span>
              <span className="text-[10px] text-muted-foreground font-sans font-normal">day(m)</span>
            </div>
            <span className="text-muted-foreground/60">•</span>
            <div className="flex flex-col items-center">
              <span className="text-primary">{month}</span>
              <span className="text-[10px] text-muted-foreground font-sans font-normal">month</span>
            </div>
            <span className="text-muted-foreground/60">•</span>
            <div className="flex flex-col items-center">
              <span className="text-primary">{dayOfWeek}</span>
              <span className="text-[10px] text-muted-foreground font-sans font-normal">day(w)</span>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Human Translation
            </span>
            <p className="text-sm font-bold text-foreground mt-0.5 max-w-md">
              {humanReadable}
            </p>
          </div>
        </div>

        {/* 5 Input Segments */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* Minute */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Minute (0 - 59)</label>
            <Input
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="*"
              className="font-mono text-center text-xs h-8 bg-muted/40"
            />
            <div className="flex flex-wrap gap-1 pt-0.5">
              {["*", "*/5", "*/15", "10", "0"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMinute(v)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-muted/30 font-mono text-muted-foreground hover:bg-muted"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Hour */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Hour (0 - 23)</label>
            <Input
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="*"
              className="font-mono text-center text-xs h-8 bg-muted/40"
            />
            <div className="flex flex-wrap gap-1 pt-0.5">
              {["*", "17", "0", "9", "*/2"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setHour(v)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-muted/30 font-mono text-muted-foreground hover:bg-muted"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Month */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Day Month (1-31)</label>
            <Input
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              placeholder="*"
              className="font-mono text-center text-xs h-8 bg-muted/40"
            />
            <div className="flex flex-wrap gap-1 pt-0.5">
              {["*", "1", "15", "L"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDayOfMonth(v)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-muted/30 font-mono text-muted-foreground hover:bg-muted"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Month */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Month (1 - 12)</label>
            <Input
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="*"
              className="font-mono text-center text-xs h-8 bg-muted/40"
            />
            <div className="flex flex-wrap gap-1 pt-0.5">
              {["*", "1", "6", "12"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setMonth(v)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-muted/30 font-mono text-muted-foreground hover:bg-muted"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="font-semibold text-foreground">Day Week (0-6)</label>
            <Input
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              placeholder="*"
              className="font-mono text-center text-xs h-8 bg-muted/40"
            />
            <div className="flex flex-wrap gap-1 pt-0.5">
              {["*", "1-5", "0", "6"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDayOfWeek(v)}
                  className="text-[10px] px-1.5 py-0.5 rounded border border-border/60 bg-muted/30 font-mono text-muted-foreground hover:bg-muted"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Split: Presets and Next Execution Timestamps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Presets Column (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-foreground">
              Battle-Tested Cron Presets
            </span>
            <span className="text-[11px] text-muted-foreground">Click to apply</span>
          </div>

          <div className="space-y-2">
            {CRON_PRESETS.map((p) => {
              const isActive = cronExpression === p.expression
              return (
                <div
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border p-2.5 transition-all cursor-pointer",
                    isActive
                      ? "border-amber-500/50 bg-amber-500/10 shadow-2xs"
                      : "border-border/60 bg-muted/20 hover:bg-muted/50"
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {p.description}
                    </p>
                  </div>

                  <code className="text-xs font-mono font-bold px-2 py-1 rounded bg-background border border-border/60 text-foreground shrink-0">
                    {p.expression}
                  </code>
                </div>
              )
            })}
          </div>
        </div>

        {/* Next Scheduled Runs (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-amber-500" />
              Next 5 Projected Triggers
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {nextRuns.map((run, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] px-1 py-0">
                    #{i + 1}
                  </Badge>
                  <span className="text-foreground font-semibold">{run}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5 text-[11px] text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground block">
              Linux Crontab Quick Install:
            </span>
            <code className="block font-mono bg-background p-1.5 rounded border border-border/60 text-[10px] select-all">
              {`(crontab -l 2>/dev/null; echo "${cronExpression} /usr/bin/node /app/task.js") | crontab -`}
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}

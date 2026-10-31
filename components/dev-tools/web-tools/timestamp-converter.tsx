"use client"

import * as React from "react"
import {
  Clock,
  Copy,
  Check,
  RefreshCw,
  Calendar,
  Sparkles,
  ArrowRightLeft,
  Radio,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function TimestampConverter() {
  const [currentEpoch, setCurrentEpoch] = React.useState<number>(() =>
    Math.floor(Date.now() / 1000)
  )
  const [epochInput, setEpochInput] = React.useState<string>(() =>
    Math.floor(Date.now() / 1000).toString()
  )
  const [dateInput, setDateInput] = React.useState<string>(() => {
    const d = new Date()
    return d.toISOString().slice(0, 16)
  })

  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  // Live ticking clock
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Parse epoch input
  const parsedEpochDate = React.useMemo(() => {
    const num = Number(epochInput.trim())
    if (isNaN(num) || num <= 0) return null
    // If it has 13+ digits, it's milliseconds; otherwise seconds
    const ms = epochInput.trim().length > 11 ? num : num * 1000
    const d = new Date(ms)
    return isNaN(d.getTime()) ? null : d
  }, [epochInput])

  // Parse human date input
  const parsedDateEpoch = React.useMemo(() => {
    if (!dateInput) return null
    const d = new Date(dateInput)
    return isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000)
  }, [dateInput])

  // Relative time helper
  const formatRelative = (d: Date) => {
    const now = Date.now()
    const diffSec = Math.floor((d.getTime() - now) / 1000)
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second")
    const diffMin = Math.floor(diffSec / 60)
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute")
    const diffHr = Math.floor(diffMin / 60)
    if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour")
    const diffDay = Math.floor(diffHr / 24)
    return rtf.format(diffDay, "day")
  }

  // Quick Presets
  const setPreset = (offsetSec: number) => {
    const target = Math.floor(Date.now() / 1000) + offsetSec
    setEpochInput(target.toString())
  }

  const setStartOfDay = () => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    setEpochInput(Math.floor(d.getTime() / 1000).toString())
  }

  return (
    <div className="space-y-4">
      {/* Live Current Epoch Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500">
            <Clock className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Unix Epoch
              </span>
              <span className="flex items-center gap-1 text-[10px] text-amber-500 font-mono">
                <Radio className="size-2 animate-pulse" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
                {currentEpoch}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(currentEpoch.toString(), "current-epoch")}
                className="h-7 cursor-pointer text-xs gap-1 border-amber-500/30 hover:bg-amber-500/10"
              >
                {copiedKey === "current-epoch" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span>Copy</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEpochInput(currentEpoch.toString())}
            className="h-7 text-xs"
          >
            Insert Current
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreset(3600)}
            className="h-7 text-xs"
          >
            +1 Hour
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreset(86400)}
            className="h-7 text-xs"
          >
            +1 Day
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={setStartOfDay}
            className="h-7 text-xs"
          >
            Start of Day
          </Button>
        </div>
      </div>

      {/* Two-Column Converter: Epoch to Human & Human to Epoch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Epoch ➔ Human Date */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold">Epoch Timestamp to Human Date</h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              Sec or Millis
            </Badge>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Unix Epoch (Seconds or Milliseconds)
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={epochInput}
                onChange={(e) => setEpochInput(e.target.value)}
                placeholder="e.g. 1761890000 or 1761890000000"
                className="font-mono text-xs h-9"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEpochInput(currentEpoch.toString())}
                className="h-9 px-3 text-xs"
              >
                Now
              </Button>
            </div>
          </div>

          {/* Results Table */}
          {parsedEpochDate ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">UTC (GMT)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-foreground">
                    {parsedEpochDate.toUTCString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(parsedEpochDate.toUTCString(), "utc")
                    }
                  >
                    {copiedKey === "utc" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Tehran Time (IRST)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-amber-500">
                    {parsedEpochDate.toLocaleString("en-US", {
                      timeZone: "Asia/Tehran",
                      dateStyle: "full",
                      timeStyle: "medium",
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(
                        parsedEpochDate.toLocaleString("en-US", {
                          timeZone: "Asia/Tehran",
                        }),
                        "tehran"
                      )
                    }
                  >
                    {copiedKey === "tehran" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">ISO 8601</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-foreground">
                    {parsedEpochDate.toISOString()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(parsedEpochDate.toISOString(), "iso")
                    }
                  >
                    {copiedKey === "iso" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-muted-foreground">Relative</span>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  {formatRelative(parsedEpochDate)}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-rose-500 border border-rose-500/20 rounded-lg bg-rose-500/5">
              Invalid epoch timestamp format
            </div>
          )}
        </div>

        {/* Right: Human Date ➔ Epoch */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-blue-500" />
              <h3 className="text-sm font-bold">Human Date to Epoch Timestamp</h3>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              Local Picker
            </Badge>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">
              Select Date & Time
            </label>
            <Input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="font-mono text-xs h-9"
            />
          </div>

          {/* Results Table */}
          {parsedDateEpoch !== null ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Seconds (s)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-foreground">
                    {parsedDateEpoch}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 cursor-pointer"
                    onClick={() =>
                      copyToClipboard(parsedDateEpoch.toString(), "sec")
                    }
                  >
                    {copiedKey === "sec" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Milliseconds (ms)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-foreground">
                    {parsedDateEpoch * 1000}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 cursor-pointer"
                    onClick={() =>
                      copyToClipboard((parsedDateEpoch * 1000).toString(), "ms")
                    }
                  >
                    {copiedKey === "ms" ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-muted-foreground">UTC Representation</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {new Date(parsedDateEpoch * 1000).toISOString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-xs text-rose-500 border border-rose-500/20 rounded-lg bg-rose-500/5">
              Please enter a valid date
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

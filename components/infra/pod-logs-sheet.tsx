"use client"

import * as React from "react"
import Link from "next/link"
import type { PodTelemetry } from "@/lib/infra-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  ExternalLink,
  HardDrive,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  ShieldAlert,
  Terminal,
  XCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PodLogsSheetProps {
  pod: PodTelemetry | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRestartPod?: (podId: string) => void
}

export function PodLogsSheet({
  pod,
  open,
  onOpenChange,
  onRestartPod,
}: PodLogsSheetProps) {
  const [logFilter, setLogFilter] = React.useState("")
  const [copiedLogs, setCopiedLogs] = React.useState(false)
  const [isRestarting, setIsRestarting] = React.useState(false)

  if (!pod) return null

  const isRunning = pod.status === "Running"
  const isCrashLoop = pod.status === "CrashLoopBackOff"
  const cpuPct = Math.min(100, Math.round((pod.cpuUsageMilli / pod.cpuLimitMilli) * 100))
  const memPct = Math.min(100, Math.round((pod.memoryUsageMiB / pod.memoryLimitMiB) * 100))

  const filteredLogs = pod.logs.filter((l) => {
    if (!logFilter.trim()) return true
    const q = logFilter.toLowerCase()
    return l.message.toLowerCase().includes(q) || l.level.toLowerCase().includes(q)
  })

  const handleCopyLogs = () => {
    const logText = pod.logs
      .map((l) => `[${l.timestamp}] [${l.level}] ${l.message}`)
      .join("\n")

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(logText).catch(() => {})
    }
    setCopiedLogs(true)
    setTimeout(() => setCopiedLogs(false), 2000)
  }

  const handleTriggerRestart = () => {
    if (isRestarting) return
    setIsRestarting(true)
    setTimeout(() => {
      setIsRestarting(false)
      onRestartPod?.(pod.id)
    }, 1500)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0 border-l border-border bg-background"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 p-6 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-wider",
                    isRunning && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    isCrashLoop && "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
                    !isRunning && !isCrashLoop && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {isRunning && <CheckCircle2 className="mr-1 size-3 inline" />}
                  {isCrashLoop && <XCircle className="mr-1 size-3 inline" />}
                  {pod.status}
                </Badge>
                <Badge variant="outline" className="font-mono text-xs">
                  {pod.namespace}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">{pod.clusterId}</span>
              </div>
              <SheetTitle className="text-base font-bold text-foreground font-mono truncate max-w-md">
                {pod.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Target Service: <strong className="text-foreground">{pod.serviceName}</strong> • Uptime: {pod.age}
              </SheetDescription>
            </div>

            {/* Replicas & Restarts Pill */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-2.5 text-center shrink-0">
              <span className="text-lg font-black font-mono tracking-tight text-foreground">
                {pod.readyReplicas}/{pod.totalReplicas}
              </span>
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                Ready Replicas
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTriggerRestart}
              disabled={isRestarting}
              className="h-7 text-xs gap-1.5 cursor-pointer border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <RotateCcw className={cn("size-3", isRestarting && "animate-spin")} />
              <span>{isRestarting ? "Restarting Pod..." : "Rollout Restart Pod"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLogs}
              className="h-7 text-xs gap-1.5 cursor-pointer"
            >
              {copiedLogs ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span>Copied Logs</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy stdout Logs</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Telemetry Resource Utilization Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CPU Gauge */}
            <div className="rounded-lg border border-border bg-card/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Cpu className="size-3.5 text-primary" />
                  <span>CPU Utilization</span>
                </span>
                <span className="font-mono font-bold text-foreground">
                  {pod.cpuUsageMilli}m / {pod.cpuLimitMilli}m ({cpuPct}%)
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    cpuPct > 80 ? "bg-rose-500" : cpuPct > 50 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${cpuPct}%` }}
                />
              </div>
            </div>

            {/* Memory Gauge */}
            <div className="rounded-lg border border-border bg-card/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <HardDrive className="size-3.5 text-cyan-500" />
                  <span>Memory (RAM)</span>
                </span>
                <span className="font-mono font-bold text-foreground">
                  {pod.memoryUsageMiB}Mi / {pod.memoryLimitMiB}Mi ({memPct}%)
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    memPct > 80 ? "bg-rose-500" : memPct > 50 ? "bg-amber-500" : "bg-cyan-500"
                  )}
                  style={{ width: `${memPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Node & Container Metadata */}
          <div className="rounded-lg border border-border bg-card/40 p-4 space-y-2.5 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Node Name</span>
                <p className="font-mono font-medium text-foreground truncate">{pod.node}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Pod IP Address</span>
                <p className="font-mono font-medium text-foreground">{pod.ip}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Restarts Count</span>
                <p className={cn("font-mono font-bold", pod.restarts > 0 ? "text-rose-500" : "text-emerald-500")}>
                  {pod.restarts} restarts
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Container Image</span>
              <p className="font-mono text-[11px] text-muted-foreground truncate">{pod.image}</p>
            </div>
          </div>

          {/* stdout / stderr Log Terminal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Terminal className="size-3.5 text-primary" />
                <span>Container stdout / stderr Logs</span>
              </h4>

              <div className="relative w-48">
                <Search className="absolute left-2 top-2 size-3 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter logs..."
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="h-7 pl-7 text-[10px]"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-slate-950 p-3 font-mono text-[11px] text-slate-300 max-h-[300px] overflow-y-auto space-y-1.5 shadow-inner leading-relaxed">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-6 text-slate-500">No logs match your filter.</div>
              ) : (
                filteredLogs.map((l, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0 select-none text-[10px]">{l.timestamp}</span>
                    <span
                      className={cn(
                        "text-[9px] font-bold px-1 rounded uppercase shrink-0",
                        l.level === "INFO" && "bg-slate-800 text-sky-400",
                        l.level === "WARN" && "bg-amber-950 text-amber-400",
                        l.level === "ERROR" && "bg-rose-950 text-rose-400"
                      )}
                    >
                      {l.level}
                    </span>
                    <span
                      className={cn(
                        "break-all",
                        l.level === "ERROR" && "text-rose-300 font-semibold",
                        l.level === "WARN" && "text-amber-200"
                      )}
                    >
                      {l.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

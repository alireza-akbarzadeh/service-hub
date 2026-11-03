"use client"

import * as React from "react"
import Link from "next/link"
import type { Service } from "@/lib/db/schema"
import {
  calculateInfraSummary,
  exportInfraPodsToCsv,
  initialClusters,
  initialPods,
  type KubernetesCluster,
  type PodTelemetry,
} from "@/lib/infra-data"
import { PodLogsSheet } from "./pod-logs-sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { DashboardBottomBar } from "@/components/dashboard/dashboard-bottom-bar"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  HardDrive,
  Layers,
  Network,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  ShieldAlert,
  Terminal,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InfraViewProps {
  initialServices?: Service[]
  teamName?: string
}

export function InfraView({
  initialServices = [],
  teamName = "Frontend Squad",
}: InfraViewProps) {
  const [pods, setPods] = React.useState<PodTelemetry[]>(initialPods)
  const [clusters] = React.useState<KubernetesCluster[]>(initialClusters)
  const [selectedPod, setSelectedPod] = React.useState<PodTelemetry | null>(null)
  const [isLogsOpen, setIsLogsOpen] = React.useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCluster, setSelectedCluster] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")

  // Restart animation state
  const [restartingPodId, setRestartingPodId] = React.useState<string | null>(null)

  // Calculate telemetry summary
  const summary = React.useMemo(() => {
    return calculateInfraSummary(pods)
  }, [pods])

  // Filtered pods
  const filteredPods = React.useMemo(() => {
    return pods.filter((p) => {
      if (selectedCluster !== "all" && p.clusterId !== selectedCluster) return false
      if (selectedStatus !== "all" && p.status !== selectedStatus) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = p.name.toLowerCase().includes(q)
        const matchService = p.serviceName.toLowerCase().includes(q)
        const matchNode = p.node.toLowerCase().includes(q)
        const matchNamespace = p.namespace.toLowerCase().includes(q)
        if (!matchName && !matchService && !matchNode && !matchNamespace) return false
      }
      return true
    })
  }, [pods, selectedCluster, selectedStatus, searchQuery])

  // Simulate pod restart
  const handleRestartPod = (podId: string) => {
    setRestartingPodId(podId)

    // 1. Terminating state
    setPods((prev) =>
      prev.map((p) => (p.id === podId ? { ...p, status: "Terminating" } : p))
    )

    // 2. ContainerCreating
    setTimeout(() => {
      setPods((prev) =>
        prev.map((p) => (p.id === podId ? { ...p, status: "ContainerCreating" } : p))
      )
    }, 1200)

    // 3. Back to Running with cleared restarts
    setTimeout(() => {
      setPods((prev) =>
        prev.map((p) =>
          p.id === podId
            ? {
                ...p,
                status: "Running",
                readyReplicas: p.totalReplicas,
                restarts: p.status === "CrashLoopBackOff" ? 0 : p.restarts,
                age: "1m",
              }
            : p
        )
      )
      setRestartingPodId(null)
    }, 2500)
  }

  // Export to CSV
  const handleExportCsv = () => {
    const csv = exportInfraPodsToCsv(pods)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `k8s-pod-telemetry-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenLogs = (p: PodTelemetry) => {
    setSelectedPod(p)
    setIsLogsOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md select-none sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Catalog</span>
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Cpu className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
                Infrastructure & Pods
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Kubernetes Cluster Telemetry & Container Logs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Separator orientation="vertical" className="h-4" />
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </header>

      {/* 2. Main Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        {/* KPI Cluster Metrics */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Pod Replicas
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-foreground">
                {summary.totalPods}
              </span>
              <span className="text-xs font-mono text-emerald-500">
                {summary.runningCount} Running
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Across 2 Kubernetes clusters</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Cluster CPU Load
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-primary">
                {summary.avgCpuPercent}%
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">of allocatable</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Node pool safe boundary</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Cluster RAM Load
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-cyan-500">
                {summary.avgMemoryPercent}%
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">of allocatable</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Memory pressure nominal</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              CrashLoop & Restarts
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={cn("text-2xl font-black font-mono", summary.crashLoopCount > 0 ? "text-rose-500" : "text-emerald-500")}>
                {summary.crashLoopCount} Alerts
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                ({summary.totalRestarts} restarts)
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">OOM / Crash monitoring</p>
          </div>
        </section>

        {/* 3. Filter Bar */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-3 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by pod name, service, namespace, node..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Cluster Selector */}
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Clusters</option>
              {clusters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Pills */}
            <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              {["all", "Running", "CrashLoopBackOff"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                    selectedStatus === st
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {st === "all" ? "All Status" : st === "CrashLoopBackOff" ? "CrashLoop" : st}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Pods Telemetry Table */}
        <section>
          <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px]">
                <tr>
                  <th className="p-3">Pod Instance</th>
                  <th className="p-3">Service Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Replicas</th>
                  <th className="p-3">Restarts</th>
                  <th className="p-3">CPU (Usage / Limit)</th>
                  <th className="p-3">Memory (Usage / Limit)</th>
                  <th className="p-3">Node & Age</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPods.map((p) => {
                  const isRunning = p.status === "Running"
                  const isCrashLoop = p.status === "CrashLoopBackOff"
                  const isRestarting = restartingPodId === p.id
                  const cpuPct = Math.round((p.cpuUsageMilli / p.cpuLimitMilli) * 100)
                  const memPct = Math.round((p.memoryUsageMiB / p.memoryLimitMiB) * 100)

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleOpenLogs(p)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="p-3">
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-foreground truncate max-w-[220px]">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                            <span>{p.namespace}</span>
                            <span>•</span>
                            <span>{p.clusterId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-semibold text-foreground">
                        {p.serviceName}
                        {p.canaryVersion && (
                          <Badge variant="outline" className="ml-2 font-mono text-[9px] border-amber-500/30 text-amber-600 dark:text-amber-400">
                            Canary
                          </Badge>
                        )}
                      </td>

                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-[9px] uppercase font-bold",
                            isRunning && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                            isCrashLoop && "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse",
                            !isRunning && !isCrashLoop && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {isRestarting ? "Restarting..." : p.status}
                        </Badge>
                      </td>

                      <td className="p-3 font-mono">
                        {p.readyReplicas}/{p.totalReplicas}
                      </td>

                      <td className="p-3 font-mono">
                        <span className={cn(p.restarts > 0 ? "font-bold text-rose-500" : "text-muted-foreground")}>
                          {p.restarts}
                        </span>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[10px]">
                            <span>{p.cpuUsageMilli}m</span>
                            <span className="text-muted-foreground">{cpuPct}%</span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                cpuPct > 80 ? "bg-rose-500" : cpuPct > 50 ? "bg-amber-500" : "bg-emerald-500"
                              )}
                              style={{ width: `${cpuPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono">
                        <div className="space-y-1 w-32">
                          <div className="flex justify-between text-[10px]">
                            <span>{p.memoryUsageMiB}Mi</span>
                            <span className="text-muted-foreground">{memPct}%</span>
                          </div>
                          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                memPct > 80 ? "bg-rose-500" : memPct > 50 ? "bg-amber-500" : "bg-cyan-500"
                              )}
                              style={{ width: `${memPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-muted-foreground">
                        <div className="space-y-0.5">
                          <p className="truncate max-w-[140px]">{p.node}</p>
                          <p className="text-[10px] text-muted-foreground/75">{p.age}</p>
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary"
                        >
                          Logs
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 5. Pod Logs & Diagnostic Sheet */}
      <PodLogsSheet
        pod={selectedPod}
        open={isLogsOpen}
        onOpenChange={setIsLogsOpen}
        onRestartPod={handleRestartPod}
      />

      {/* 6. Fixed Bottom Dock */}
      <DashboardBottomBar
        totalServices={pods.length}
        activeFilter="All"
        totalIncidents={summary.crashLoopCount}
      />
    </div>
  )
}

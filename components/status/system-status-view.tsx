"use client"

import * as React from "react"
import Link from "next/link"
import {
  initialIncidents,
  upcomingMaintenanceWindows,
  generate30DayUptimeHistory,
  calculateSystemHealthSummary,
  type SystemIncident,
  type MaintenanceWindow,
  type ServiceSlaRecord,
  type DayUptimePoint,
} from "@/lib/status-data"
import type { Service } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  Layers,
  Network,
  Radio,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wrench,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SystemStatusViewProps {
  initialServices: Service[]
  teamName?: string
}

export function SystemStatusView({
  initialServices,
  teamName = "Frontend Squad",
}: SystemStatusViewProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [selectedTier, setSelectedTier] = React.useState<string>("All")
  const [activeTab, setActiveTab] = React.useState<"services" | "incidents" | "maintenance">("services")
  const [expandedIncidentIds, setExpandedIncidentIds] = React.useState<string[]>([
    "INC-2026-104",
  ])
  const [copiedLink, setCopiedLink] = React.useState<boolean>(false)
  const [hoveredPoint, setHoveredPoint] = React.useState<{
    serviceName: string
    point: DayUptimePoint
  } | null>(null)

  // Batch Ping Probe state
  const [isPingingAll, setIsPingingAll] = React.useState<boolean>(false)
  const [pingProgress, setPingProgress] = React.useState<number>(0)
  const [pingedCount, setPingedCount] = React.useState<number>(0)

  // Incidents state
  const [incidents, setIncidents] = React.useState<SystemIncident[]>(initialIncidents)

  // Map catalog services to SLA records with deterministic 30-day history
  const [slaRecords, setSlaRecords] = React.useState<ServiceSlaRecord[]>(() => {
    return initialServices.map((svc) => {
      let tier: ServiceSlaRecord["tier"] = "Core APIs"
      const catLower = (svc.category || "").toLowerCase()
      const nameLower = svc.name.toLowerCase()

      if (nameLower.includes("gateway") || nameLower.includes("ingress") || catLower.includes("api gateway")) {
        tier = "Gateways"
      } else if (catLower.includes("database") || catLower.includes("cache") || nameLower.includes("redis") || nameLower.includes("postgres") || nameLower.includes("cap")) {
        tier = "Databases & Messaging"
      } else if (catLower.includes("devops") || catLower.includes("analytics") || nameLower.includes("kibana") || nameLower.includes("harbor") || nameLower.includes("sonarqube")) {
        tier = "DevOps & Tooling"
      }

      const history = generate30DayUptimeHistory(svc.name, svc.status)
      const uptimeAvg =
        history.reduce((acc, curr) => acc + curr.uptimePercent, 0) /
        history.length

      return {
        serviceId: svc.id,
        serviceName: svc.name,
        category: svc.category || "General",
        environment: svc.environment || "Production",
        tier,
        uptime30Days: Number(uptimeAvg.toFixed(2)),
        history30Days: history,
        currentLatencyMs:
          svc.status === "degraded" ? 185 : 18 + ((svc.id * 17) % 35),
        currentStatus: (svc.status as any) || "operational",
        lastCheckedAt: "Just now",
      }
    })
  })

  // Summary Metrics
  const summary = React.useMemo(() => {
    return calculateSystemHealthSummary(slaRecords, incidents)
  }, [slaRecords, incidents])

  // Filtered Services
  const filteredRecords = React.useMemo(() => {
    return slaRecords.filter((rec) => {
      const matchesSearch =
        searchQuery === "" ||
        rec.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.tier.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTier =
        selectedTier === "All" || rec.tier === selectedTier

      return matchesSearch && matchesTier
    })
  }, [slaRecords, searchQuery, selectedTier])

  // Batch ping runner
  const handleRunBatchPing = async () => {
    if (isPingingAll) return
    setIsPingingAll(true)
    setPingProgress(0)
    setPingedCount(0)

    const total = slaRecords.length
    for (let i = 0; i < total; i++) {
      await new Promise((resolve) => setTimeout(resolve, 35))
      setPingedCount(i + 1)
      setPingProgress(Math.round(((i + 1) / total) * 100))

      // Random jitter latency update
      setSlaRecords((prev) =>
        prev.map((r, index) => {
          if (index === i) {
            const newLatency = Math.floor(12 + Math.random() * 45)
            return {
              ...r,
              currentLatencyMs: newLatency,
              lastCheckedAt: "Just now",
            }
          }
          return r
        })
      )
    }

    setIsPingingAll(false)
  }

  const toggleIncident = (id: string) => {
    setExpandedIncidentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleCopyStatusUrl = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const tiers: ServiceSlaRecord["tier"][] = [
    "Gateways",
    "Core APIs",
    "Databases & Messaging",
    "DevOps & Tooling",
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Hub</span>
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">System Status</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                Live Health & SLA Observability
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Batch Health Ping Runner */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRunBatchPing}
            disabled={isPingingAll}
            className="h-8 cursor-pointer gap-1.5 text-xs font-semibold shadow-2xs hover:bg-muted"
            title="Probe all microservices for live response code & latency"
          >
            <RefreshCw
              className={cn("size-3.5 text-primary", isPingingAll && "animate-spin")}
            />
            <span>{isPingingAll ? `Pinging (${pingedCount}/${slaRecords.length})` : "Ping All"}</span>
          </Button>

          {/* Quick Copy Link */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyStatusUrl}
            className="h-8 cursor-pointer gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {copiedLink ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span className="hidden sm:inline">Share Status</span>
              </>
            )}
          </Button>

          {/* Topology link */}
          <Link href="/topology">
            <Button
              size="sm"
              variant="outline"
              className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden md:inline-flex"
            >
              <Network className="size-3.5 text-cyan-500" />
              <span>Topology</span>
            </Button>
          </Link>

          <Separator orientation="vertical" className="h-4" />
          <NotificationCenter services={initialServices} />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Real-time Ping Progress Bar */}
        {isPingingAll && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 animate-in fade-in space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-2 text-primary font-semibold">
                <Radio className="size-3.5 animate-pulse" />
                Probing Microservices Telemetry...
              </span>
              <span className="font-bold">{pingProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-150 ease-out"
                style={{ width: `${pingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Global Overall Status Banner */}
        <div
          className={cn(
            "rounded-2xl border p-5 shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
            summary.overallStatus === "all_operational"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100"
              : summary.overallStatus === "partial_degradation"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100"
              : "border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100"
          )}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl shrink-0 shadow-xs",
                summary.overallStatus === "all_operational"
                  ? "bg-emerald-500 text-white"
                  : summary.overallStatus === "partial_degradation"
                  ? "bg-amber-500 text-white"
                  : "bg-rose-500 text-white"
              )}
            >
              {summary.overallStatus === "all_operational" ? (
                <CheckCircle2 className="size-6" />
              ) : summary.overallStatus === "partial_degradation" ? (
                <AlertTriangle className="size-6" />
              ) : (
                <AlertOctagon className="size-6" />
              )}
            </div>

            <div className="space-y-0.5">
              <h2 className="text-lg font-bold tracking-tight">
                {summary.overallStatus === "all_operational"
                  ? "All Systems Operational"
                  : summary.overallStatus === "partial_degradation"
                  ? "Partial System Degradation Detected"
                  : "Major Incident Under Active Investigation"}
              </h2>
              <p className="text-xs opacity-85 leading-relaxed">
                {summary.overallStatus === "all_operational"
                  ? `Across 4 architectural tiers, all microservices and API gateways are operating within SLA bounds (Avg 30-Day SLA: ${summary.uptime30DaysAvg}%).`
                  : `One or more non-blocking downstream dependencies are operating with elevated latency. Engineering team is monitoring.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-mono text-xs opacity-80">
            <Clock className="size-3.5" />
            <span>Updated at {summary.lastUpdated}</span>
          </div>
        </div>

        {/* KPI Stat Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Card 1: 30-Day SLA */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>30-Day SLA Uptime</span>
              <Activity className="size-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {summary.uptime30DaysAvg}%
              </span>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] px-1 py-0 font-mono"
              >
                99.9% Target
              </Badge>
            </div>
          </div>

          {/* Card 2: Operational Services */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Operational Nodes</span>
              <Server className="size-3.5 text-sky-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {summary.operationalCount}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                / {summary.totalServicesCount} total
              </span>
            </div>
          </div>

          {/* Card 3: Degraded / Alerts */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Degraded / Warning</span>
              <Flame className="size-3.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {summary.degradedCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {summary.degradedCount === 0 ? "Zero outages" : "Elevated latency"}
              </span>
            </div>
          </div>

          {/* Card 4: Active Incidents */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Active Incidents</span>
              <ShieldAlert className="size-3.5 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {summary.activeIncidentsCount}
              </span>
              <span className="text-xs text-muted-foreground">
                {summary.activeIncidentsCount === 1 ? "In monitoring" : "All resolved"}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Services SLA vs Incidents vs Maintenance) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/80 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5",
                activeTab === "services"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Server className="size-3.5" />
              <span>Microservices SLA</span>
              <Badge variant="secondary" className="text-[10px] font-mono px-1 py-0">
                {slaRecords.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("incidents")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5",
                activeTab === "incidents"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <AlertTriangle className="size-3.5 text-amber-500" />
              <span>Incident History</span>
              {summary.activeIncidentsCount > 0 && (
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("maintenance")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5",
                activeTab === "maintenance"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="size-3.5 text-sky-500" />
              <span>Maintenance Windows</span>
              <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                {upcomingMaintenanceWindows.length}
              </Badge>
            </button>
          </div>

          {/* Quick Actions (Report Issue) */}
          <div className="flex items-center gap-2">
            <Link href="/requests">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs hover:bg-muted"
              >
                <Terminal className="size-3.5 text-primary" />
                <span>Report an Issue</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* TAB 1: SERVICES SLA HEATMAPS & STATUS */}
        {activeTab === "services" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground mr-1">
                  Tier:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTier("All")}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors border",
                    selectedTier === "All"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  All Tiers
                </button>
                {tiers.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTier(t)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors border",
                      selectedTier === t
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search microservices..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            {/* Hovered Point Info Pill */}
            {hoveredPoint && (
              <div className="flex items-center justify-between text-xs font-mono bg-muted/60 border border-border px-3 py-1.5 rounded-lg text-foreground animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">
                    {hoveredPoint.serviceName}
                  </span>
                  <span>•</span>
                  <span>{hoveredPoint.point.label} ({hoveredPoint.point.date})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Latency: {hoveredPoint.point.avgLatencyMs}ms</span>
                  <span>Uptime: {hoveredPoint.point.uptimePercent}%</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1 py-0",
                      hoveredPoint.point.status === "operational"
                        ? "text-emerald-500 border-emerald-500/30"
                        : "text-amber-500 border-amber-500/30"
                    )}
                  >
                    {hoveredPoint.point.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            )}

            {/* Services List Table / Cards */}
            <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
              <div className="divide-y divide-border/60">
                {filteredRecords.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground">
                    <Server className="size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">No microservices found</p>
                    <p className="text-xs">Try adjusting your tier filter or search query.</p>
                  </div>
                ) : (
                  filteredRecords.map((rec) => (
                    <div
                      key={rec.serviceId}
                      className="p-4 hover:bg-muted/15 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                    >
                      {/* Left: Service Identity */}
                      <div className="min-w-[240px] space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {rec.serviceName}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-[9px] font-mono px-1.5 py-0 border-border text-muted-foreground"
                          >
                            {rec.tier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <span>{rec.environment}</span>
                          <span>•</span>
                          <span>{rec.category}</span>
                        </div>
                      </div>

                      {/* Middle: 30-Day Heatmap Strip */}
                      <div className="flex-1 max-w-xl space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                          <span>30 days ago</span>
                          <span className="font-semibold text-foreground">
                            {rec.uptime30Days}% uptime
                          </span>
                          <span>Today</span>
                        </div>

                        {/* 30 discrete daily blocks */}
                        <div className="flex items-center gap-1">
                          {rec.history30Days.map((day, idx) => (
                            <div
                              key={idx}
                              onMouseEnter={() =>
                                setHoveredPoint({
                                  serviceName: rec.serviceName,
                                  point: day,
                                })
                              }
                              onMouseLeave={() => setHoveredPoint(null)}
                              className={cn(
                                "h-6 flex-1 rounded-xs transition-transform hover:scale-125 cursor-pointer",
                                day.status === "operational"
                                  ? "bg-emerald-500/80 hover:bg-emerald-500"
                                  : day.status === "degraded"
                                  ? "bg-amber-500 hover:bg-amber-400"
                                  : "bg-rose-500 hover:bg-rose-400"
                              )}
                              title={`${day.label}: ${day.uptimePercent}% uptime (${day.status})`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Right: Latency & Live Status */}
                      <div className="flex items-center justify-between lg:justify-end gap-3 min-w-[170px] pt-2 lg:pt-0 border-t lg:border-t-0 border-border/50">
                        <div className="text-right font-mono text-xs">
                          <span className="text-[10px] text-muted-foreground block uppercase">
                            Latency
                          </span>
                          <span className="font-semibold text-foreground">
                            {rec.currentLatencyMs} ms
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block uppercase">
                            Status
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold gap-1 px-2 py-0.5",
                              rec.currentStatus === "operational"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                rec.currentStatus === "operational"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500 animate-pulse"
                              )}
                            />
                            {rec.currentStatus === "operational"
                              ? "Operational"
                              : "Degraded"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INCIDENT TIMELINE */}
        {activeTab === "incidents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Incident & Outage History
                </h3>
                <p className="text-xs text-muted-foreground">
                  Chronological log of service degradations, investigating steps, and post-mortems.
                </p>
              </div>

              <Badge variant="outline" className="text-xs font-mono">
                {incidents.length} recorded incidents
              </Badge>
            </div>

            <div className="space-y-3.5">
              {incidents.map((inc) => {
                const isExpanded = expandedIncidentIds.includes(inc.id)
                return (
                  <div
                    key={inc.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary">
                            {inc.id}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] uppercase font-mono px-1.5 py-0",
                              inc.status === "resolved"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}
                          >
                            {inc.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            {inc.environment}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-bold text-foreground">
                          {inc.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">
                          Started: {new Date(inc.startedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleIncident(inc.id)}
                          className="size-7 p-0 cursor-pointer"
                        >
                          {isExpanded ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Summary & Impacted Nodes */}
                    <div className="text-xs space-y-2">
                      <p className="text-foreground leading-relaxed">
                        {inc.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-muted-foreground font-semibold text-[11px]">
                          Affected Services:
                        </span>
                        {inc.affectedServices.map((svc) => (
                          <Badge
                            key={svc}
                            variant="secondary"
                            className="text-[10px] font-mono"
                          >
                            {svc}
                          </Badge>
                        ))}
                      </div>

                      {inc.rootCause && (
                        <div className="rounded-lg border border-border/80 bg-muted/30 p-3 mt-2">
                          <span className="text-[11px] font-bold text-foreground block mb-0.5">
                            Root Cause Post-Mortem:
                          </span>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {inc.rootCause}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Expandable Chronological Updates */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-border/60 space-y-2.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                          Triage & Resolution Timeline
                        </span>
                        <div className="space-y-2 relative pl-4 border-l-2 border-border/80 ml-2">
                          {inc.updates.map((upd) => (
                            <div key={upd.id} className="relative space-y-0.5">
                              <div className="absolute -left-[21px] top-1 size-2 rounded-full bg-primary" />
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-semibold text-foreground">
                                  {upd.status.toUpperCase()}
                                </span>
                                <span className="text-muted-foreground font-mono text-[10px]">
                                  {new Date(upd.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <span className="text-muted-foreground text-[10px]">
                                  by {upd.author}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {upd.message}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULED MAINTENANCE WINDOWS */}
        {activeTab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Scheduled Maintenance Windows
                </h3>
                <p className="text-xs text-muted-foreground">
                  Planned infrastructure upgrades, database patch cycles, and storage migrations.
                </p>
              </div>

              <Badge variant="outline" className="text-xs font-mono">
                {upcomingMaintenanceWindows.length} planned
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMaintenanceWindows.map((maint) => (
                <div
                  key={maint.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Wrench className="size-4 text-sky-500" />
                      <span className="font-mono text-xs font-bold text-foreground">
                        {maint.id}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] uppercase font-mono px-1.5 py-0"
                    >
                      {maint.status}
                    </Badge>
                  </div>

                  <h4 className="text-sm font-bold text-foreground">
                    {maint.title}
                  </h4>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {maint.summary}
                  </p>

                  <div className="rounded-lg border border-border/80 bg-muted/20 p-2.5 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Scheduled:</span>
                      <span className="font-semibold text-foreground">
                        {new Date(maint.scheduledStart).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Lead:</span>
                      <span className="text-foreground">{maint.conductedBy}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Target Nodes:
                    </span>
                    {maint.affectedServices.map((svc) => (
                      <Badge
                        key={svc}
                        variant="secondary"
                        className="text-[10px] font-mono"
                      >
                        {svc}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


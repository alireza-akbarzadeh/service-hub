"use client"

import * as React from "react"
import Link from "next/link"
import type { Service } from "@/lib/db/schema"
import {
  calculateDoraSummary,
  exportDoraToCsv,
  initialDeployments,
  type Deployment,
  type DoraLevel,
  type PlatformDoraSummary,
} from "@/lib/dora-metrics-data"
import { DeploymentDetailSheet } from "./deployment-detail-sheet"
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
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Flame,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Info,
  Layers,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricsViewProps {
  initialServices?: Service[]
  teamName?: string
}

const LEVEL_STYLING: Record<
  DoraLevel,
  { label: string; bg: string; text: string; border: string }
> = {
  elite: {
    label: "Elite",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
  high: {
    label: "High",
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  medium: {
    label: "Medium",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  low: {
    label: "Low",
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
  },
}

export function MetricsView({
  initialServices = [],
  teamName = "Frontend Squad",
}: MetricsViewProps) {
  const [deployments, setDeployments] = React.useState<Deployment[]>(initialDeployments)
  const [selectedDeployment, setSelectedDeployment] = React.useState<Deployment | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [squadFilter, setSquadFilter] = React.useState<string>("all")
  const [activeTab, setActiveTab] = React.useState<"stream" | "squads" | "guide">("stream")

  // Simulated deploy state
  const [isDeploying, setIsDeploying] = React.useState(false)
  const deployTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (deployTimerRef.current) {
        clearTimeout(deployTimerRef.current)
      }
    }
  }, [])

  // Calculate platform summary
  const summary: PlatformDoraSummary = React.useMemo(() => {
    return calculateDoraSummary(deployments)
  }, [deployments])

  // Filtered deployment stream
  const filteredDeployments = React.useMemo(() => {
    return deployments.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false
      if (squadFilter !== "all" && d.author.squad !== squadFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchService = d.serviceName.toLowerCase().includes(q)
        const matchCommit = d.commitHash.toLowerCase().includes(q)
        const matchMsg = d.commitMessage.toLowerCase().includes(q)
        const matchAuthor = d.author.name.toLowerCase().includes(q)
        if (!matchService && !matchCommit && !matchMsg && !matchAuthor) return false
      }
      return true
    })
  }, [deployments, statusFilter, squadFilter, searchQuery])

  // Simulate a new deployment
  const handleSimulateDeploy = () => {
    if (isDeploying) return
    setIsDeploying(true)

    deployTimerRef.current = setTimeout(() => {
      const newDep: Deployment = {
        id: `DEP-2026-${Math.floor(902 + Math.random() * 50)}`,
        serviceName: "Commerce Gateway API",
        environment: "Production",
        commitHash: Math.random().toString(16).substring(2, 9),
        commitMessage: "perf(cache): optimize Redis serialization pipeline buffer size",
        branch: "main",
        author: {
          name: teamName || "Ali Akbarzadeh",
          avatar: "#3b82f6",
          squad: "Frontend Squad",
        },
        pipelineDurationSeconds: Math.floor(90 + Math.random() * 60),
        deployedAt: new Date().toISOString(),
        status: "success",
        pipelineSteps: [
          { name: "Code Lint & Static Analysis", durationSeconds: 14, status: "success" },
          { name: "Unit & Integration Tests", durationSeconds: 38, status: "success" },
          { name: "Docker Container Build & Scan", durationSeconds: 52, status: "success" },
          { name: "Kubernetes Rolling Deployment", durationSeconds: 22, status: "success" },
        ],
      }

      setDeployments((prev) => [newDep, ...prev])
      setIsDeploying(false)
    }, 1200)
  }

  // Export to CSV
  const handleExportCsv = () => {
    const csvContent = exportDoraToCsv(deployments)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dora-metrics-report-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenDetail = (dep: Deployment) => {
    setSelectedDeployment(dep)
    setIsSheetOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20">
      {/* 1. Sticky Navigation Header */}
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
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
                Engineering Metrics
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                DORA Velocity & Production Release Stream
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulate Release Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSimulateDeploy}
            disabled={isDeploying}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <RefreshCw className={cn("size-3.5", isDeploying && "animate-spin")} />
            <span className="hidden sm:inline">
              {isDeploying ? "Deploying Pods..." : "Simulate Deploy"}
            </span>
          </Button>

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
        {/* Four Core DORA Metrics Hero */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Deployment Frequency */}
          <div className="rounded-xl border border-border bg-card/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Deployment Frequency
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[9px] uppercase font-bold",
                  LEVEL_STYLING[summary.deploymentFrequency.rating].bg,
                  LEVEL_STYLING[summary.deploymentFrequency.rating].text,
                  LEVEL_STYLING[summary.deploymentFrequency.rating].border
                )}
              >
                {summary.deploymentFrequency.rating}
              </Badge>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-foreground">
                {summary.deploymentFrequency.value}
              </span>
              <span className="text-xs font-mono text-emerald-500 flex items-center">
                <ArrowUp className="size-3 mr-0.5" />
                {summary.deploymentFrequency.trendText}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {summary.deploymentFrequency.description}
            </p>
          </div>

          {/* Card 2: Lead Time for Changes */}
          <div className="rounded-xl border border-border bg-card/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Lead Time For Changes
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[9px] uppercase font-bold",
                  LEVEL_STYLING[summary.leadTime.rating].bg,
                  LEVEL_STYLING[summary.leadTime.rating].text,
                  LEVEL_STYLING[summary.leadTime.rating].border
                )}
              >
                {summary.leadTime.rating}
              </Badge>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-foreground">
                {summary.leadTime.value}
              </span>
              <span className="text-xs font-mono text-emerald-500 flex items-center">
                <ArrowDown className="size-3 mr-0.5" />
                {summary.leadTime.trendText}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {summary.leadTime.description}
            </p>
          </div>

          {/* Card 3: Change Failure Rate */}
          <div className="rounded-xl border border-border bg-card/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Change Failure Rate
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[9px] uppercase font-bold",
                  LEVEL_STYLING[summary.changeFailureRate.rating].bg,
                  LEVEL_STYLING[summary.changeFailureRate.rating].text,
                  LEVEL_STYLING[summary.changeFailureRate.rating].border
                )}
              >
                {summary.changeFailureRate.rating}
              </Badge>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-foreground">
                {summary.changeFailureRate.value}
              </span>
              <span className="text-xs font-mono text-emerald-500 flex items-center">
                <ArrowDown className="size-3 mr-0.5" />
                {summary.changeFailureRate.trendText}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {summary.changeFailureRate.description}
            </p>
          </div>

          {/* Card 4: Mean Time to Recovery (MTTR) */}
          <div className="rounded-xl border border-border bg-card/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Time to Restore (MTTR)
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[9px] uppercase font-bold",
                  LEVEL_STYLING[summary.mttr.rating].bg,
                  LEVEL_STYLING[summary.mttr.rating].text,
                  LEVEL_STYLING[summary.mttr.rating].border
                )}
              >
                {summary.mttr.rating}
              </Badge>
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-foreground">
                {summary.mttr.value}
              </span>
              <span className="text-xs font-mono text-emerald-500 flex items-center">
                <ArrowDown className="size-3 mr-0.5" />
                {summary.mttr.trendText}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {summary.mttr.description}
            </p>
          </div>
        </section>

        {/* 3. Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("stream")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeTab === "stream"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Live Deployment Stream ({deployments.length})
            </button>
            <button
              onClick={() => setActiveTab("squads")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeTab === "squads"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Squad Benchmarks
            </button>
            <button
              onClick={() => setActiveTab("guide")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                activeTab === "guide"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              DORA Maturity Guide
            </button>
          </div>
        </div>

        {/* Tab 1: Live Deployment Stream */}
        {activeTab === "stream" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-3 shadow-2xs">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by service name, commit hash, author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status Filter */}
                <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
                  {["all", "success", "rolled_back", "failed"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium capitalize transition-all cursor-pointer",
                        statusFilter === st
                          ? "bg-background text-foreground shadow-2xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>

                {/* Squad Selector */}
                <select
                  value={squadFilter}
                  onChange={(e) => setSquadFilter(e.target.value)}
                  className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Squads</option>
                  <option value="Frontend Squad">Frontend Squad</option>
                  <option value="Commerce Squad">Commerce Squad</option>
                  <option value="Platform Engineering">Platform Engineering</option>
                  <option value="Security Compliance">Security Compliance</option>
                </select>
              </div>
            </div>

            {/* Deployments Table */}
            <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Deployment ID</th>
                    <th className="p-3">Service Name</th>
                    <th className="p-3">Commit & Branch</th>
                    <th className="p-3">Squad & Author</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredDeployments.map((d) => {
                    const isSuccess = d.status === "success"
                    const isRolledBack = d.status === "rolled_back"
                    const isFailed = d.status === "failed"

                    return (
                      <tr
                        key={d.id}
                        onClick={() => handleOpenDetail(d)}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-mono font-bold text-foreground">
                          {d.id}
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          {d.serviceName}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <GitCommit className="size-3.5 text-primary shrink-0" />
                            <span className="text-foreground">{d.commitHash}</span>
                            <span className="text-muted-foreground truncate max-w-[180px]">
                              {d.commitMessage}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <span className="text-foreground font-medium">{d.author.name}</span>
                            <p className="text-[10px] text-muted-foreground">{d.author.squad}</p>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {d.pipelineDurationSeconds}s
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-[9px] uppercase font-bold",
                              isSuccess && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                              isRolledBack && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                              isFailed && "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {d.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-primary"
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Squad Benchmarks */}
        {activeTab === "squads" && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Squad Name</th>
                    <th className="p-3">Deployments (30d)</th>
                    <th className="p-3">Lead Time (Merge to Prod)</th>
                    <th className="p-3">Change Failure Rate</th>
                    <th className="p-3">Recovery Time (MTTR)</th>
                    <th className="p-3 text-right">Overall DORA Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {summary.squadMetrics.map((sm) => {
                    const styling = LEVEL_STYLING[sm.level]
                    return (
                      <tr key={sm.squad} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-bold text-foreground">{sm.squad}</td>
                        <td className="p-3 font-mono font-medium">{sm.deploymentsCount} releases</td>
                        <td className="p-3 font-mono">{sm.leadTimeHours} hours</td>
                        <td className="p-3 font-mono">
                          <span
                            className={cn(
                              "font-bold",
                              sm.changeFailureRate === 0
                                ? "text-emerald-500"
                                : sm.changeFailureRate <= 15
                                ? "text-amber-500"
                                : "text-rose-500"
                            )}
                          >
                            {sm.changeFailureRate}%
                          </span>
                        </td>
                        <td className="p-3 font-mono">{sm.mttrMinutes} mins</td>
                        <td className="p-3 text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-[9px] uppercase font-bold",
                              styling.bg,
                              styling.text,
                              styling.border
                            )}
                          >
                            {styling.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: DORA Maturity Guide */}
        {activeTab === "guide" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span>What are DORA Metrics?</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                DevOps Research and Assessment (DORA) represents 7+ years of rigorous research by Google Cloud into engineering performance across thousands of tech organizations. It measures both <strong>velocity</strong> (speed of delivering changes) and <strong>stability</strong> (quality and resilience in production).
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-5 space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="size-4 text-emerald-500" />
                <span>Industry Classification Tiers</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-500">Elite Performers</span>
                  <span className="text-muted-foreground">Multiple deploys/day, &lt;1h lead time, &lt;5% CFR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-blue-500">High Performers</span>
                  <span className="text-muted-foreground">1 deploy/day to 1/week, &lt;1 week lead time, &lt;15% CFR</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-500">Medium Performers</span>
                  <span className="text-muted-foreground">1 deploy/month, 1 month lead time, &lt;30% CFR</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Deployment Detail Inspection Sheet */}
      <DeploymentDetailSheet
        deployment={selectedDeployment}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      {/* 5. Fixed Bottom Telemetry Dock */}
      <DashboardBottomBar
        totalServices={initialServices.length || 10}
        activeFilter="All"
        totalIncidents={deployments.filter((d) => d.status === "failed").length}
      />
    </div>
  )
}

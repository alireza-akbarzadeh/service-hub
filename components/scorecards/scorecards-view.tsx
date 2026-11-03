"use client"

import * as React from "react"
import Link from "next/link"
import type { Service } from "@/lib/db/schema"
import {
  evaluateServiceScorecard,
  calculatePlatformScorecardsSummary,
  exportScorecardsToCsv,
  type ServiceScorecard,
  type ScoreTier,
} from "@/lib/scorecards-data"
import { ScorecardDetailSheet } from "./scorecard-detail-sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { DashboardBottomBar } from "@/components/dashboard/dashboard-bottom-bar"
import {
  Activity,
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  Layers,
  LayoutGrid,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  TrendingUp,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ScorecardsViewProps {
  initialServices?: Service[]
  teamName?: string
}

const TIER_STYLING: Record<
  ScoreTier,
  { label: string; bg: string; text: string; border: string; ring: string }
> = {
  platinum: {
    label: "Platinum",
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/30",
    ring: "ring-cyan-500/20",
  },
  gold: {
    label: "Gold",
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    ring: "ring-amber-500/20",
  },
  silver: {
    label: "Silver",
    bg: "bg-slate-500/10",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/30",
    ring: "ring-slate-500/20",
  },
  bronze: {
    label: "Bronze",
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
    ring: "ring-orange-500/20",
  },
}

export function ScorecardsView({
  initialServices = [],
  teamName = "Frontend Squad",
}: ScorecardsViewProps) {
  // Evaluated scorecards state
  const [scorecards, setScorecards] = React.useState<ServiceScorecard[]>(() => {
    return initialServices.map((s) => evaluateServiceScorecard(s))
  })

  // Selected scorecard for inspection sheet
  const [selectedScorecard, setSelectedScorecard] =
    React.useState<ServiceScorecard | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTier, setSelectedTier] = React.useState<string>("All")
  const [selectedEnv, setSelectedEnv] = React.useState<string>("All")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  // Re-evaluation animation state
  const [isEvaluating, setIsEvaluating] = React.useState(false)
  const [evaluationProgress, setEvaluationProgress] = React.useState(0)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Recalculate summary metrics
  const platformSummary = React.useMemo(() => {
    return calculatePlatformScorecardsSummary(scorecards)
  }, [scorecards])

  // Environments list
  const environments = React.useMemo(() => {
    const envSet = new Set<string>()
    initialServices.forEach((s) => {
      if (s.environment) envSet.add(s.environment)
    })
    return ["All", ...Array.from(envSet)]
  }, [initialServices])

  // Filtered scorecards
  const filteredScorecards = React.useMemo(() => {
    return scorecards.filter((sc) => {
      // Tier filter
      if (selectedTier !== "All" && sc.tier !== selectedTier.toLowerCase()) {
        return false
      }
      // Env filter
      if (selectedEnv !== "All" && sc.environment !== selectedEnv) {
        return false
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesName = sc.serviceName.toLowerCase().includes(query)
        const matchesDesc = sc.description.toLowerCase().includes(query)
        const matchesOwner = sc.owner.toLowerCase().includes(query)
        const matchesCat = sc.category.toLowerCase().includes(query)
        if (!matchesName && !matchesDesc && !matchesOwner && !matchesCat) {
          return false
        }
      }
      return true
    })
  }, [scorecards, selectedTier, selectedEnv, searchQuery])

  // Batch re-evaluation simulation
  const handleReEvaluate = () => {
    if (isEvaluating) return
    setIsEvaluating(true)
    setEvaluationProgress(0)

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setEvaluationProgress((prev) => {
        if (prev >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          setIsEvaluating(false)
          // Re-evaluate
          setScorecards(initialServices.map((s) => evaluateServiceScorecard(s)))
          return 100
        }
        return prev + 15
      })
    }, 120)
  }

  // Export to CSV
  const handleExportCsv = () => {
    const csvContent = exportScorecardsToCsv(scorecards)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `service-hub-readiness-scorecards-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenDetail = (sc: ServiceScorecard) => {
    setSelectedScorecard(sc)
    setIsSheetOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20">
      {/* 1. Sticky Top Navigation Header */}
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
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Award className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
                Service Scorecards
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Production Readiness & Engineering Standards
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Re-evaluate button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReEvaluate}
            disabled={isEvaluating}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw
              className={cn("size-3.5 text-primary", isEvaluating && "animate-spin")}
            />
            <span className="hidden sm:inline">
              {isEvaluating ? `Evaluating ${evaluationProgress}%` : "Run Audit"}
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

      {/* Evaluation Progress Bar */}
      {isEvaluating && (
        <div className="w-full bg-muted h-1 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${evaluationProgress}%` }}
          />
        </div>
      )}

      {/* 2. Main Content Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        {/* Platform Readiness Executive Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Card 1: Overall Average Readiness Score */}
          <div className="rounded-xl border border-border bg-card/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Platform Readiness
              </span>
              <Sparkles className="size-4 text-primary" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-black font-mono tracking-tight text-foreground">
                {platformSummary.overallAverageScore}%
              </span>
              <Badge
                variant="outline"
                className="font-mono text-xs border-primary/30 text-primary bg-primary/10"
              >
                {platformSummary.totalServicesEvaluated} Services
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated audit across 15 criteria including SLA, TLS, observability, and team ownership.
            </p>
          </div>

          {/* Card 2: Tier Breakdown Distribution */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card/60 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Production Readiness Tiers
              </span>
              <span className="text-xs text-muted-foreground">Click tier to filter</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Platinum */}
              <button
                onClick={() =>
                  setSelectedTier(selectedTier === "Platinum" ? "All" : "Platinum")
                }
                className={cn(
                  "p-3 rounded-lg border text-left transition-all cursor-pointer",
                  TIER_STYLING.platinum.bg,
                  TIER_STYLING.platinum.border,
                  selectedTier === "Platinum" && "ring-2 ring-cyan-500"
                )}
              >
                <div className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400">
                  Platinum (≥90%)
                </div>
                <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                  {platformSummary.tierCounts.platinum}
                </div>
                <div className="text-[10px] text-muted-foreground">Certified Mission-Critical</div>
              </button>

              {/* Gold */}
              <button
                onClick={() => setSelectedTier(selectedTier === "Gold" ? "All" : "Gold")}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all cursor-pointer",
                  TIER_STYLING.gold.bg,
                  TIER_STYLING.gold.border,
                  selectedTier === "Gold" && "ring-2 ring-amber-500"
                )}
              >
                <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                  Gold (75-89%)
                </div>
                <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                  {platformSummary.tierCounts.gold}
                </div>
                <div className="text-[10px] text-muted-foreground">Production Hardened</div>
              </button>

              {/* Silver */}
              <button
                onClick={() =>
                  setSelectedTier(selectedTier === "Silver" ? "All" : "Silver")
                }
                className={cn(
                  "p-3 rounded-lg border text-left transition-all cursor-pointer",
                  TIER_STYLING.silver.bg,
                  TIER_STYLING.silver.border,
                  selectedTier === "Silver" && "ring-2 ring-slate-500"
                )}
              >
                <div className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">
                  Silver (60-74%)
                </div>
                <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                  {platformSummary.tierCounts.silver}
                </div>
                <div className="text-[10px] text-muted-foreground">Staging / Test Ready</div>
              </button>

              {/* Bronze */}
              <button
                onClick={() =>
                  setSelectedTier(selectedTier === "Bronze" ? "All" : "Bronze")
                }
                className={cn(
                  "p-3 rounded-lg border text-left transition-all cursor-pointer",
                  TIER_STYLING.bronze.bg,
                  TIER_STYLING.bronze.border,
                  selectedTier === "Bronze" && "ring-2 ring-orange-500"
                )}
              >
                <div className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">
                  Bronze (&lt;60%)
                </div>
                <div className="text-2xl font-black font-mono text-foreground mt-0.5">
                  {platformSummary.tierCounts.bronze}
                </div>
                <div className="text-[10px] text-muted-foreground">Remediation Needed</div>
              </button>
            </div>
          </div>

          {/* Card 3: 5 Pillar Radar Averages */}
          <div className="rounded-xl border border-border bg-card/60 p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Pillar Averages
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Reliability & SLA</span>
                <span className="font-mono font-bold text-foreground">
                  {platformSummary.pillarAverages.reliability}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Security & TLS</span>
                <span className="font-mono font-bold text-foreground">
                  {platformSummary.pillarAverages.security}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Observability</span>
                <span className="font-mono font-bold text-foreground">
                  {platformSummary.pillarAverages.observability}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Docs & Swagger</span>
                <span className="font-mono font-bold text-foreground">
                  {platformSummary.pillarAverages.documentation}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ops & Ownership</span>
                <span className="font-mono font-bold text-foreground">
                  {platformSummary.pillarAverages.operations}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Filter Bar & Controls */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-lg border border-border bg-card/40 p-3 shadow-2xs">
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by service name, description, owner, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>

          {/* Right: Tier Pills & Environment Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tier Filters */}
            <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-xs">
              {["All", "Platinum", "Gold", "Silver", "Bronze"].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition-all cursor-pointer",
                    selectedTier === tier
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Environment Selector */}
            <select
              value={selectedEnv}
              onChange={(e) => setSelectedEnv(e.target.value)}
              className="h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {environments.map((env) => (
                <option key={env} value={env}>
                  {env === "All" ? "All Envs" : env}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1 rounded cursor-pointer",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Grid Cards View"
              >
                <LayoutGrid className="size-3.5" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1 rounded cursor-pointer",
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Dense Table View"
              >
                <TableIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* 4. Service Cards Grid or Table */}
        <section>
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{filteredScorecards.length}</strong> of{" "}
              {scorecards.length} evaluated services
            </span>
            {(selectedTier !== "All" || selectedEnv !== "All" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTier("All")
                  setSelectedEnv("All")
                  setSearchQuery("")
                }}
                className="h-6 text-xs text-primary hover:text-primary/80 cursor-pointer"
              >
                Reset Filters
              </Button>
            )}
          </div>

          {filteredScorecards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
              <Award className="mx-auto size-8 text-muted-foreground/50" />
              <h3 className="text-sm font-semibold text-foreground">
                No matching service scorecards
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No microservices matched your current search filters. Try adjusting the tier or search terms.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScorecards.map((sc) => {
                const styling = TIER_STYLING[sc.tier]
                const passedCount = sc.rules.filter((r) => r.passed).length

                return (
                  <div
                    key={sc.serviceId}
                    onClick={() => handleOpenDetail(sc)}
                    className="group rounded-xl border border-border bg-card/60 p-4 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-mono text-[10px] font-bold uppercase tracking-wider",
                            styling.bg,
                            styling.text,
                            styling.border
                          )}
                        >
                          <Award className="mr-1 size-3" />
                          {styling.label} ({sc.percentage}%)
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {sc.environment}
                        </Badge>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                        {sc.serviceName}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    {/* Middle: Pillar Mini Gauges */}
                    <div className="my-3 space-y-1.5 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Passed Checks</span>
                        <span className="font-mono font-medium text-foreground">
                          {passedCount} / {sc.rules.length}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            sc.percentage >= 90
                              ? "bg-cyan-500"
                              : sc.percentage >= 75
                              ? "bg-amber-500"
                              : sc.percentage >= 60
                              ? "bg-slate-500"
                              : "bg-orange-500"
                          )}
                          style={{ width: `${sc.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                      <span className="truncate max-w-[140px]">{sc.owner}</span>
                      <div className="flex items-center gap-1 text-primary group-hover:translate-x-0.5 transition-transform">
                        <span>Audit Rules</span>
                        <ChevronRight className="size-3" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Dense Table View */
            <div className="overflow-x-auto rounded-xl border border-border bg-card/60">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 text-muted-foreground uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Service</th>
                    <th className="p-3">Environment</th>
                    <th className="p-3">Owner Squad</th>
                    <th className="p-3">Readiness Tier</th>
                    <th className="p-3">Total Score</th>
                    <th className="p-3">Checks Passed</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredScorecards.map((sc) => {
                    const styling = TIER_STYLING[sc.tier]
                    const passedCount = sc.rules.filter((r) => r.passed).length

                    return (
                      <tr
                        key={sc.serviceId}
                        onClick={() => handleOpenDetail(sc)}
                        className="hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="p-3 font-semibold text-foreground">
                          {sc.serviceName}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="text-[10px]">
                            {sc.environment}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{sc.owner}</td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-mono text-[10px] uppercase font-bold",
                              styling.bg,
                              styling.text,
                              styling.border
                            )}
                          >
                            {styling.label}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono font-bold text-foreground">
                          {sc.percentage}%
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {passedCount}/{sc.rules.length}
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
          )}
        </section>
      </main>

      {/* 5. Scorecard Detail Inspection Sheet */}
      <ScorecardDetailSheet
        scorecard={selectedScorecard}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      />

      {/* 6. Fixed Bottom Telemetry Dock */}
      <DashboardBottomBar
        totalServices={scorecards.length}
        activeFilter={selectedEnv}
        totalIncidents={0}
      />
    </div>
  )
}

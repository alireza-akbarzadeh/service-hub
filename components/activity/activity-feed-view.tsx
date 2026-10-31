"use client"

import * as React from "react"
import Link from "next/link"
import {
  initialActivityEvents,
  filterActivityEvents,
  exportActivityLogCsv,
  type ActivityEvent,
  type ActivityCategory,
  type ActivityFilterOptions,
} from "@/lib/activity-data"
import type { Service } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  ExternalLink,
  Flame,
  GitPullRequest,
  History,
  Layers,
  Network,
  Radio,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  UserCheck,
  Wrench,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityFeedViewProps {
  initialServices: Service[]
  teamName?: string
}

const CATEGORY_TABS: { id: ActivityCategory; label: string; icon: any }[] = [
  { id: "all", label: "All Activity", icon: History },
  { id: "services", label: "Services & Deployments", icon: Server },
  { id: "requests", label: "PRs & Code Reviews", icon: GitPullRequest },
  { id: "security", label: "Security & IAM", icon: ShieldCheck },
  { id: "incidents", label: "Incidents & Outages", icon: AlertTriangle },
]

export function ActivityFeedView({
  initialServices,
  teamName = "Frontend Squad",
}: ActivityFeedViewProps) {
  const [events, setEvents] = React.useState<ActivityEvent[]>(initialActivityEvents)
  const [filter, setFilter] = React.useState<ActivityFilterOptions>({
    category: "all",
    searchQuery: "",
    actorTeam: "all",
    dateRange: "all",
  })
  const [expandedEventId, setExpandedEventId] = React.useState<string | null>(null)

  // Teams list for filter
  const teams = React.useMemo(() => {
    const set = new Set<string>()
    events.forEach((e) => set.add(e.actor.team))
    return Array.from(set)
  }, [events])

  // Filtered Events
  const filteredEvents = React.useMemo(() => {
    return filterActivityEvents(events, filter)
  }, [events, filter])

  // KPI Metrics
  const stats = React.useMemo(() => {
    return {
      total: events.length,
      services: events.filter((e) => e.category === "services").length,
      requests: events.filter((e) => e.category === "requests").length,
      security: events.filter((e) => e.category === "security").length,
      incidents: events.filter((e) => e.category === "incidents").length,
    }
  }, [events])

  const handleExportCsv = () => {
    const csvContent = exportActivityLogCsv(filteredEvents)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `service-hub-audit-log-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getEventBadge = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "service_created":
        return {
          label: "New Service",
          icon: Server,
          className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        }
      case "service_updated":
        return {
          label: "Service Updated",
          icon: Wrench,
          className: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
        }
      case "request_status_changed":
        return {
          label: "PR Merged",
          icon: GitPullRequest,
          className: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
        }
      case "request_submitted":
        return {
          label: "Feature Request",
          icon: Sparkles,
          className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
        }
      case "access_granted":
        return {
          label: "Role Elevated",
          icon: UserCheck,
          className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        }
      case "incident_reported":
        return {
          label: "Incident Triage",
          icon: AlertTriangle,
          className: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        }
      case "incident_resolved":
        return {
          label: "Incident Mitigated",
          icon: CheckCircle2,
          className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        }
      case "maintenance_scheduled":
        return {
          label: "Maintenance Scheduled",
          icon: Calendar,
          className: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
        }
      default:
        return {
          label: "Audit Event",
          icon: History,
          className: "border-border text-muted-foreground",
        }
    }
  }

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
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30">
              <History className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">Activity Feed</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                Enterprise Audit Trail
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Audit Log CSV */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="h-8 cursor-pointer gap-1.5 text-xs font-semibold shadow-2xs hover:bg-muted"
            title="Export filtered audit logs as CSV file"
          >
            <Download className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          {/* Quick links */}
          <Link href="/status">
            <Button
              size="sm"
              variant="outline"
              className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden md:inline-flex"
            >
              <Activity className="size-3.5 text-emerald-500" />
              <span>Status</span>
            </Button>
          </Link>

          <Link href="/playground">
            <Button
              size="sm"
              variant="outline"
              className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden lg:inline-flex"
            >
              <Zap className="size-3.5 text-amber-500" />
              <span>Playground</span>
            </Button>
          </Link>

          <Separator orientation="vertical" className="h-4" />
          <NotificationCenter services={initialServices} />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Audit Events</span>
              <History className="size-3.5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.total}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">
                Live Log
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Services & Deploys</span>
              <Server className="size-3.5 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.services}
              </span>
              <span className="text-xs text-muted-foreground">Catalog modifications</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>PRs & Reviews</span>
              <GitPullRequest className="size-3.5 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.requests}
              </span>
              <span className="text-xs text-muted-foreground">Code proposals</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Security & Triage</span>
              <ShieldAlert className="size-3.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stats.security + stats.incidents}
              </span>
              <span className="text-xs text-muted-foreground">IAM & Health</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/80 w-fit">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = filter.category === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter((prev) => ({ ...prev, category: tab.id }))}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5",
                    isActive
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search & Team Filter */}
          <div className="flex items-center gap-2">
            <select
              value={filter.actorTeam}
              onChange={(e) => setFilter((prev) => ({ ...prev, actorTeam: e.target.value }))}
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground cursor-pointer"
            >
              <option value="all">All Squads</option>
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={filter.searchQuery}
                onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search audit trail..."
                className="h-8 pl-8 text-xs rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Activity Timeline List */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
              <History className="size-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">No audit events match your filters</p>
              <p className="text-xs">Try selecting a different squad or clearing the search text.</p>
            </div>
          ) : (
            <div className="relative pl-6 border-l-2 border-border/80 ml-3 space-y-6">
              {filteredEvents.map((evt) => {
                const badge = getEventBadge(evt.type)
                const BadgeIcon = badge.icon
                const isExpanded = expandedEventId === evt.id

                return (
                  <div key={evt.id} className="relative space-y-2">
                    {/* Pulsing Timeline Marker */}
                    <div className="absolute -left-[31px] top-1 flex size-5 items-center justify-center rounded-full bg-background border-2 border-primary shadow-xs">
                      <div className="size-2 rounded-full bg-primary" />
                    </div>

                    {/* Event Card */}
                    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs hover:border-primary/40 transition-colors space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-mono px-2 py-0.5 gap-1 font-semibold",
                              badge.className
                            )}
                          >
                            <BadgeIcon className="size-3" />
                            <span>{badge.label}</span>
                          </Badge>

                          <span className="font-mono text-xs text-muted-foreground">
                            {evt.id}
                          </span>

                          <span className="text-xs font-semibold text-foreground">
                            {evt.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <Clock className="size-3" />
                          <span>
                            {new Date(evt.timestamp).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Event Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Actor & Target Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                            {evt.actor.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              {evt.actor.name}
                            </span>
                            <span className="text-muted-foreground ml-1">
                              • {evt.actor.role} ({evt.actor.team})
                            </span>
                          </div>
                        </div>

                        {evt.target.url && (
                          <Link href={evt.target.url}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs gap-1.5 px-2 text-primary hover:text-primary/80 cursor-pointer"
                            >
                              <span>Inspect {evt.target.name}</span>
                              <ExternalLink className="size-3" />
                            </Button>
                          </Link>
                        )}
                      </div>

                      {/* Expandable Metadata Payload */}
                      {evt.metadata && (
                        <div className="pt-2 border-t border-border/50">
                          <button
                            type="button"
                            onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                            className="text-[11px] font-mono text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                          >
                            <span>{isExpanded ? "Hide Metadata" : "View Event Payload"}</span>
                          </button>

                          {isExpanded && (
                            <pre className="mt-2 rounded-lg bg-muted/40 p-2.5 font-mono text-[11px] text-foreground overflow-auto">
                              {JSON.stringify(evt.metadata, null, 2)}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

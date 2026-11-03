"use client"

import * as React from "react"
import Link from "next/link"
import type { Service } from "@/lib/db/schema"
import {
  executeMockRequest,
  exportMocksToOpenApi,
  getStoredMocks,
  HTTP_STATUS_OPTIONS,
  initialMockEndpoints,
  METHOD_COLORS,
  saveStoredMocks,
  type HttpMethod,
  type MockEndpoint,
  type MockExecutionResult,
} from "@/lib/mock-server-utils"
import { MockCreateDialog } from "./mock-create-dialog"
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
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Flame,
  Layers,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Server,
  Sliders,
  Sparkles,
  Terminal,
  Trash2,
  XCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MockServerViewProps {
  initialServices?: Service[]
  teamName?: string
}

export function MockServerView({
  initialServices = [],
  teamName = "Frontend Squad",
}: MockServerViewProps) {
  const [mocks, setMocks] = React.useState<MockEndpoint[]>(() => getStoredMocks())
  const [selectedMock, setSelectedMock] = React.useState<MockEndpoint>(() => {
    const list = getStoredMocks()
    return list[0] || initialMockEndpoints[0]
  })

  // Workbench state
  const [activeTab, setActiveTab] = React.useState<"body" | "headers" | "runner">("runner")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [methodFilter, setMethodFilter] = React.useState<string>("all")
  const [serviceFilter, setServiceFilter] = React.useState<string>("all")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

  // Live simulation execution state
  const [isRunning, setIsRunning] = React.useState(false)
  const [executionResult, setExecutionResult] = React.useState<MockExecutionResult | null>(null)
  const [copiedCurl, setCopiedCurl] = React.useState(false)

  // Save to localStorage when mocks change
  React.useEffect(() => {
    saveStoredMocks(mocks)
  }, [mocks])

  // Services list
  const serviceOptions = React.useMemo(() => {
    const set = new Set<string>()
    initialServices.forEach((s) => set.add(s.name))
    mocks.forEach((m) => set.add(m.serviceName))
    return Array.from(set).sort()
  }, [initialServices, mocks])

  // Filtered mocks list
  const filteredMocks = React.useMemo(() => {
    return mocks.filter((m) => {
      if (methodFilter !== "all" && m.method !== methodFilter) return false
      if (serviceFilter !== "all" && m.serviceName !== serviceFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = m.name.toLowerCase().includes(q)
        const matchPath = m.path.toLowerCase().includes(q)
        const matchService = m.serviceName.toLowerCase().includes(q)
        if (!matchName && !matchPath && !matchService) return false
      }
      return true
    })
  }, [mocks, methodFilter, serviceFilter, searchQuery])

  // Execute request
  const handleRunMock = async () => {
    if (isRunning) return
    setIsRunning(true)
    setExecutionResult(null)

    const res = await executeMockRequest(selectedMock)
    setExecutionResult(res)
    setIsRunning(false)

    // Update invocation count
    setMocks((prev) =>
      prev.map((m) =>
        m.id === selectedMock.id
          ? { ...m, callCount: m.callCount + 1, lastCalledAt: new Date().toISOString() }
          : m
      )
    )
  }

  // Toggle endpoint enabled state
  const handleToggleMock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setMocks((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m))
    )
    if (selectedMock.id === id) {
      setSelectedMock((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))
    }
  }

  // Delete mock
  const handleDeleteMock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const remaining = mocks.filter((m) => m.id !== id)
    setMocks(remaining)
    if (selectedMock.id === id && remaining.length > 0) {
      setSelectedMock(remaining[0])
    }
  }

  // Add new mock
  const handleAddMock = (newMock: MockEndpoint) => {
    setMocks((prev) => [newMock, ...prev])
    setSelectedMock(newMock)
  }

  // Reset to default presets
  const handleResetDefaults = () => {
    if (confirm("Reset all mock endpoints back to default presets?")) {
      setMocks(initialMockEndpoints)
      setSelectedMock(initialMockEndpoints[0])
    }
  }

  // Export OpenAPI spec
  const handleExportOpenApi = () => {
    const spec = exportMocksToOpenApi(mocks)
    const blob = new Blob([spec], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `service-hub-mocks-openapi-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Copy cURL
  const handleCopyCurl = () => {
    const curl = `curl -X ${selectedMock.method} "http://localhost:3000${selectedMock.path}" \\\n  -H "Content-Type: application/json"`
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(curl).catch(() => {})
    }
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  // Metrics
  const activeCount = mocks.filter((m) => m.isEnabled).length
  const totalCalls = mocks.reduce((sum, m) => sum + m.callCount, 0)
  const avgDelay = Math.round(
    mocks.reduce((sum, m) => sum + m.delayMs, 0) / (mocks.length || 1)
  )

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground pb-20">
      {/* 1. Top Header */}
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
            <div className="flex size-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
              <Server className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground leading-none">
                Mock API Server
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Contract Simulator & Schema Prototyping
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* New Mock Endpoint Button */}
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <Plus className="size-3.5" />
            <span>New Mock</span>
          </Button>

          {/* Export OpenAPI Spec */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportOpenApi}
            className="h-8 text-xs gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="size-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Export OpenAPI</span>
          </Button>

          {/* Reset Defaults */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Reset to initial presets"
          >
            <RotateCcw className="size-3.5" />
          </Button>

          <Separator orientation="vertical" className="h-4" />
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </header>

      {/* 2. Main Content Canvas */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Mocks
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">
              {mocks.length}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Simulated microservice routes</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Active Endpoints
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-500">
              {activeCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Ready for client testing</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Simulated Invocations
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-primary">
              {totalCalls}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Executed contract runs</p>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-4 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Simulated Delay
            </span>
            <div className="mt-2 text-2xl font-black font-mono text-amber-500">
              {avgDelay}ms
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Network latency buffer</p>
          </div>
        </section>

        {/* 3. Split Workbench: Left Endpoints List, Right Interactive Runner */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Endpoints Directory (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* Filter Bar */}
            <div className="rounded-lg border border-border bg-card/40 p-3 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search mock routes, name, service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Method Pills */}
                <div className="flex items-center rounded-md border border-border bg-muted/40 p-0.5 text-[10px]">
                  {["all", "GET", "POST", "PUT", "DELETE"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethodFilter(m)}
                      className={cn(
                        "rounded px-2 py-0.5 font-medium transition-all cursor-pointer",
                        methodFilter === m
                          ? "bg-background text-foreground shadow-2xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Service Filter */}
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="h-7 rounded border border-border bg-background px-2 text-[11px] text-foreground cursor-pointer focus:outline-none"
                >
                  <option value="all">All Services</option>
                  {serviceOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of Mock Endpoints */}
            <div className="space-y-2">
              {filteredMocks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                  No mock endpoints match your search.
                </div>
              ) : (
                filteredMocks.map((m) => {
                  const isSelected = selectedMock.id === m.id
                  const col = METHOD_COLORS[m.method] || METHOD_COLORS.GET

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMock(m)
                        setExecutionResult(null)
                      }}
                      className={cn(
                        "group rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between space-y-2",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs"
                          : "border-border bg-card/60 hover:border-primary/40 hover:bg-muted/20"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Badge
                            variant="outline"
                            className={cn("font-mono text-[9px] font-bold px-1.5 py-0 uppercase shrink-0", col.badge)}
                          >
                            {m.method}
                          </Badge>
                          <span className="font-mono text-xs font-semibold text-foreground truncate">
                            {m.path}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold px-1.5 py-0.2 rounded",
                              m.status >= 200 && m.status < 300
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : m.status >= 400 && m.status < 500
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {m.status}
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {m.delayMs}ms
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="truncate max-w-[200px]">{m.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px]">{m.callCount} calls</span>
                          <button
                            type="button"
                            onClick={(e) => handleToggleMock(m.id, e)}
                            className={cn(
                              "size-2 rounded-full",
                              m.isEnabled ? "bg-emerald-500 shadow-xs" : "bg-muted-foreground/40"
                            )}
                            title={m.isEnabled ? "Mock is active" : "Mock is disabled"}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Column: Interactive Mock Workbench & Runner (7 cols) */}
          <div className="lg:col-span-7 rounded-xl border border-border bg-card/60 p-5 shadow-xs space-y-5">
            {/* Endpoint Hero & Method/Path */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-mono text-xs font-bold uppercase",
                      METHOD_COLORS[selectedMock.method]?.badge
                    )}
                  >
                    {selectedMock.method}
                  </Badge>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {selectedMock.path}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedMock.serviceName} • {selectedMock.name}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleRunMock}
                  disabled={isRunning}
                  className="h-8 text-xs gap-1.5 cursor-pointer shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Play className={cn("size-3.5 fill-current", isRunning && "animate-spin")} />
                  <span>{isRunning ? "Simulating..." : "Send Request"}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCurl}
                  className="h-8 text-xs gap-1 cursor-pointer"
                  title="Copy cURL command"
                >
                  {copiedCurl ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span className="hidden sm:inline">cURL</span>
                </Button>

                <Link
                  href={`/playground?url=http://localhost:3000${selectedMock.path}&method=${selectedMock.method}`}
                  target="_blank"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                  >
                    <Zap className="size-3 text-amber-500" />
                    <span className="hidden sm:inline">Playground</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Config Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Status Code
                </span>
                <p className="font-mono font-bold text-foreground">{selectedMock.status}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Simulated Latency
                </span>
                <p className="font-mono font-bold text-foreground">{selectedMock.delayMs}ms</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Mock State
                </span>
                <p className={cn("font-semibold", selectedMock.isEnabled ? "text-emerald-500" : "text-muted-foreground")}>
                  {selectedMock.isEnabled ? "Active" : "Disabled"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Total Runs
                </span>
                <p className="font-mono font-bold text-foreground">{selectedMock.callCount} calls</p>
              </div>
            </div>

            {/* Tabs: Response Body vs Runner Execution */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("runner")}
                    className={cn(
                      "px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer",
                      activeTab === "runner"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Live Response Runner
                  </button>
                  <button
                    onClick={() => setActiveTab("body")}
                    className={cn(
                      "px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer",
                      activeTab === "body"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Template Schema & Macros
                  </button>
                </div>
              </div>

              {/* Tab 1: Live Response Runner */}
              {activeTab === "runner" && (
                <div className="space-y-3">
                  {executionResult ? (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs rounded-lg border border-border bg-muted/30 p-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-mono font-bold px-2 py-0.5 rounded text-xs",
                              executionResult.status >= 200 && executionResult.status < 300
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                            )}
                          >
                            {executionResult.status} {executionResult.statusText}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="font-mono text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {executionResult.durationMs}ms roundtrip
                          </span>
                        </div>

                        <span className="text-[10px] font-mono text-muted-foreground">
                          {new Date(executionResult.executedAt).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Formatted Output */}
                      <div className="rounded-lg border border-border bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[320px] leading-relaxed shadow-inner">
                        <pre>{executionResult.body}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                      <Play className="mx-auto size-8 text-primary/60" />
                      <h4 className="text-xs font-semibold text-foreground">
                        Ready to simulate response
                      </h4>
                      <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                        Click "Send Request" above to execute this mock with simulated {selectedMock.delayMs}ms latency and dynamic macro resolution.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Raw Schema & Macros */}
              {activeTab === "body" && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-border bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[320px] leading-relaxed">
                    <pre>{selectedMock.responseBody}</pre>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Macros like <code className="text-primary font-mono">&#123;&#123;uuid&#125;&#125;</code>, <code className="text-primary font-mono">&#123;&#123;isoDate&#125;&#125;</code>, and <code className="text-primary font-mono">&#123;&#123;randomPrice&#125;&#125;</code> are resolved dynamically on each execution.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 4. Create Modal Dialog */}
      <MockCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onAddMock={handleAddMock}
        services={serviceOptions}
      />

      {/* 5. Fixed Bottom Dock */}
      <DashboardBottomBar
        totalServices={mocks.length}
        activeFilter="All"
        totalIncidents={0}
      />
    </div>
  )
}

"use client"

import {
  checkEndpointHealth,
  testServiceEndpoint,
  getServiceHealthTelemetry,
  recordServicePing,
  type EndpointTestResult,
  type HealthCheckResult,
} from "@/app/actions/services"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Service } from "@/lib/db/schema"
import { cn } from "@/lib/utils"
import {
  Activity,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Globe,
  Play,
  RefreshCw,
  Send,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react"
import * as React from "react"

interface ServiceDetailSheetProps {
  service: Service | null
  open: boolean
  onOpenChange: (open: boolean) => void
  mirrors: Service[]
}

interface PingRecord {
  timestamp: number
  latencyMs: number
  status: "online" | "warning" | "offline"
}

export function ServiceDetailSheet({
  service,
  open,
  onOpenChange,
  mirrors,
}: ServiceDetailSheetProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "tester">(
    "overview"
  )
  const [copiedSnippet, setCopiedSnippet] = React.useState<string | null>(null)
  const [health, setHealth] = React.useState<HealthCheckResult | null>(null)
  const [isPinging, setIsPinging] = React.useState(false)
  const [pingHistory, setPingHistory] = React.useState<PingRecord[]>([])

  // API Tester States
  const [testerPath, setTesterPath] = React.useState("/health")
  const [testerMethod, setTesterMethod] = React.useState<
    "GET" | "POST" | "HEAD"
  >("GET")
  const [isTesting, setIsTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<EndpointTestResult | null>(
    null
  )
  const [showHeaders, setShowHeaders] = React.useState(false)

  // Load / Reset on service change
  React.useEffect(() => {
    if (!service) return

    setHealth(null)
    setIsPinging(false)
    setTestResult(null)
    setShowHeaders(false)

    // Pre-populate tester path based on service category / name
    if (
      service.category === "API & Swagger" ||
      service.name.toLowerCase().includes("swagger") ||
      service.url.includes("swagger")
    ) {
      setTesterPath("/swagger/v1/swagger.json")
    } else {
      setTesterPath("/health")
    }

    // Load telemetry from Neon Postgres with localStorage fallback
    getServiceHealthTelemetry(service.id)
      .then((telemetry) => {
        if (telemetry && telemetry.history && telemetry.history.length > 0) {
          setPingHistory(
            telemetry.history.map((h) => ({
              timestamp: new Date(h.checkedAt).getTime(),
              latencyMs: h.latencyMs,
              status: h.status === "error" ? "offline" : (h.status as PingRecord["status"]),
            }))
          )
        } else {
          try {
            const stored = localStorage.getItem(`service_pings_${service.id}`)
            if (stored) setPingHistory(JSON.parse(stored))
            else setPingHistory([])
          } catch {
            setPingHistory([])
          }
        }
      })
      .catch(() => {
        try {
          const stored = localStorage.getItem(`service_pings_${service.id}`)
          if (stored) setPingHistory(JSON.parse(stored))
          else setPingHistory([])
        } catch {
          setPingHistory([])
        }
      })
  }, [service?.id])

  if (!service) return null

  const recordPing = (record: PingRecord, rawResult?: HealthCheckResult) => {
    setPingHistory((prev) => {
      const updated = [...prev.slice(-29), record]
      try {
        localStorage.setItem(
          `service_pings_${service.id}`,
          JSON.stringify(updated)
        )
      } catch {
        // ignore
      }
      return updated
    })

    if (rawResult) {
      recordServicePing(service.id, service.url, rawResult).catch(() => {})
    }
  }

  const handlePing = async () => {
    setIsPinging(true)
    try {
      const res = await checkEndpointHealth(service.url)
      setHealth(res)
      recordPing(
        {
          timestamp: Date.now(),
          latencyMs: res.latencyMs,
          status: res.status === "error" ? "offline" : res.status,
        },
        res
      )
    } catch {
      const failRes: HealthCheckResult = {
        url: service.url,
        status: "offline",
        latencyMs: 3500,
        message: "Ping failed",
      }
      setHealth(failRes)
      recordPing(
        {
          timestamp: Date.now(),
          latencyMs: 3500,
          status: "offline",
        },
        failRes
      )
    } finally {
      setIsPinging(false)
    }
  }

  const handleQuickBurstPing = async () => {
    setIsPinging(true)
    for (let i = 0; i < 3; i++) {
      try {
        const res = await checkEndpointHealth(service.url)
        setHealth(res)
        recordPing(
          {
            timestamp: Date.now(),
            latencyMs: res.latencyMs,
            status: res.status === "error" ? "offline" : res.status,
          },
          res
        )
      } catch {
        const failRes: HealthCheckResult = {
          url: service.url,
          status: "offline",
          latencyMs: 3500,
          message: "Burst Ping Failed",
        }
        recordPing(
          {
            timestamp: Date.now(),
            latencyMs: 3500,
            status: "offline",
          },
          failRes
        )
      }
      if (i < 2) {
        await new Promise((r) => setTimeout(r, 400))
      }
    }
    setIsPinging(false)
  }

  const handleRunApiTest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!service) return

    setIsTesting(true)
    try {
      const res = await testServiceEndpoint(
        service.url,
        testerPath,
        testerMethod
      )
      setTestResult(res)
      if (res.status > 0) {
        recordPing({
          timestamp: Date.now(),
          latencyMs: res.latencyMs,
          status: res.status >= 200 && res.status < 400 ? "online" : "warning",
        })
      }
    } catch (err) {
      setTestResult({
        url: service.url,
        status: 0,
        statusText: "Error",
        latencyMs: 0,
        headers: {},
        isJson: false,
        error: (err as Error).message,
      })
    } finally {
      setIsTesting(false)
    }
  }

  const copyText = (text: string, snippetId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSnippet(snippetId)
    setTimeout(() => setCopiedSnippet(null), 1500)
  }

  // Calculate sparkline stats
  const successfulPings = pingHistory.filter((p) => p.status !== "offline")
  const avgLatency =
    successfulPings.length > 0
      ? Math.round(
          successfulPings.reduce((sum, p) => sum + p.latencyMs, 0) /
            successfulPings.length
        )
      : null

  const minLatency =
    successfulPings.length > 0
      ? Math.min(...successfulPings.map((p) => p.latencyMs))
      : null
  const maxLatency =
    successfulPings.length > 0
      ? Math.max(...successfulPings.map((p) => p.latencyMs))
      : null

  const uptimeRate =
    pingHistory.length > 0
      ? Math.round((successfulPings.length / pingHistory.length) * 100)
      : null

  // Generate clean env variable name
  const envVarKey = `NEXT_PUBLIC_${service.name
    .replace(/\s*\([^\)]*\)\s*/gi, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .toUpperCase()}_URL`

  const curlSnippet = `curl -i -X GET "${service.url}" \\\n  -H "User-Agent: ServiceHub/1.0"`
  const fetchSnippet = `// Frontend Fetch Example\nconst response = await fetch("${service.url}", {\n  headers: {\n    "Content-Type": "application/json",\n  },\n});\nconst data = await response.json();`

  // Preset subpaths
  const presetPaths = [
    { label: "/health (Standard Health Probe)", value: "/health" },
    { label: "/ (Root Endpoint)", value: "/" },
    { label: "/metrics (Prometheus Metrics)", value: "/metrics" },
    { label: "/version (Build Info)", value: "/version" },
    {
      label: "/swagger/v1/swagger.json (OpenAPI 3.0)",
      value: "/swagger/v1/swagger.json",
    },
    { label: "/api/swagger.json (Swagger Spec)", value: "/api/swagger.json" },
    { label: "/swagger/index.html (Swagger UI)", value: "/swagger/index.html" },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto border-l border-border bg-card p-0 sm:max-w-lg lg:max-w-xl"
      >
        {/* Header */}
        <SheetHeader className="border-b border-border bg-muted/20 p-5 pb-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[11px]">
                {service.environment}
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                {service.category}
              </Badge>
            </div>
            {uptimeRate !== null && (
              <Badge
                variant="outline"
                className={cn(
                  "gap-1 font-mono text-[10px]",
                  uptimeRate >= 90
                    ? "border-emerald-500/30 text-emerald-500"
                    : uptimeRate >= 50
                      ? "border-amber-500/30 text-amber-500"
                      : "border-destructive/30 text-destructive"
                )}
              >
                <Activity className="size-2.5" />
                <span>{uptimeRate}% Reachable</span>
              </Badge>
            )}
          </div>

          <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
            {service.name}
          </SheetTitle>
          <SheetDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {service.description}
          </SheetDescription>

          {/* Navigation Tabs */}
          <div className="mt-4 flex rounded-lg border border-border bg-muted/40 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-1.5 font-medium transition-all",
                activeTab === "overview"
                  ? "bg-background font-semibold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Compass className="size-3.5 text-primary" />
              <span>Overview & Snippets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("tester")}
              className={cn(
                "flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-1.5 font-medium transition-all",
                activeTab === "tester"
                  ? "bg-background font-semibold text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Terminal className="size-3.5 text-emerald-500" />
              <span>Interactive API Tester</span>
              {testResult?.swaggerDetected && (
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </SheetHeader>

        {/* Content Body */}
        <div className="space-y-5 p-5">
          {activeTab === "overview" ? (
            <>
              {/* Endpoint URL Card with Live Ping */}
              <div className="space-y-3 rounded-xl border border-border bg-background p-4 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Globe className="size-3.5 text-primary" />
                    <span>Base Endpoint URL</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePing}
                      disabled={isPinging}
                      className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-primary hover:underline disabled:opacity-50"
                      title="Single ping"
                    >
                      <RefreshCw
                        className={cn("size-3", isPinging && "animate-spin")}
                      />
                      <span>
                        {isPinging ? "Pinging..." : "Check Live Health"}
                      </span>
                    </button>
                    <span className="text-muted-foreground/40">•</span>
                    <button
                      type="button"
                      onClick={handleQuickBurstPing}
                      disabled={isPinging}
                      className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
                      title="Run 3 consecutive pings to measure stability"
                    >
                      <Zap className="size-3 text-amber-500" />
                      <span>Burst 3x</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/30 px-3 py-2 font-mono text-xs">
                  <span className="truncate font-medium text-foreground select-all">
                    {service.url}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyText(service.url, "url")}
                      className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground"
                      title="Copy URL"
                    >
                      {copiedSnippet === "url" ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                    <a
                      href={service.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer rounded p-1 text-primary hover:text-primary/80"
                      title="Open in new tab"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                </div>

                {/* Health result indicator */}
                {health && (
                  <div
                    className={cn(
                      "flex animate-in items-center justify-between rounded-lg border px-3 py-2 text-xs duration-150 fade-in-0",
                      health.status === "online"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : health.status === "warning"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          health.status === "online"
                            ? "animate-pulse bg-emerald-500"
                            : health.status === "warning"
                              ? "bg-amber-500"
                              : "bg-destructive"
                        )}
                      />
                      <span className="font-semibold">
                        {health.status === "online"
                          ? "Online & Reachable"
                          : health.status === "warning"
                            ? `Reachable (${health.message})`
                            : "Unreachable / Offline"}
                      </span>
                      {health.httpStatus && (
                        <Badge
                          variant="outline"
                          className="px-1 py-0 font-mono text-[10px]"
                        >
                          HTTP {health.httpStatus}
                        </Badge>
                      )}
                    </div>
                    <span className="font-mono text-[11px] font-semibold">
                      {health.latencyMs}ms
                    </span>
                  </div>
                )}

                {/* Latency Sparkline Graph & Stability Stats */}
                {pingHistory.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                          <Activity className="size-3 text-primary" />
                          <span>
                            Latency Sparkline ({pingHistory.length} samples)
                          </span>
                        </span>
                        <Badge
                          variant="outline"
                          className="h-4 gap-1 border-emerald-500/30 bg-emerald-500/5 px-1 py-0 font-mono text-[9px] text-emerald-500"
                        >
                          <span className="size-1 animate-pulse rounded-full bg-emerald-500" />
                          Neon Telemetry
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        {avgLatency !== null && (
                          <span className="text-foreground">
                            Avg:{" "}
                            <span className="font-semibold text-primary">
                              {avgLatency}ms
                            </span>
                          </span>
                        )}
                        {minLatency !== null && maxLatency !== null && (
                          <span className="text-muted-foreground">
                            ({minLatency}-{maxLatency}ms)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SVG Sparkline Curve */}
                    <div className="relative h-10 w-full overflow-hidden rounded border border-border/40 bg-background/50">
                      <svg
                        className="h-full w-full overflow-visible"
                        preserveAspectRatio="none"
                        viewBox="0 0 200 40"
                      >
                        <defs>
                          <linearGradient
                            id="sparkline-grad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity="0.35"
                            />
                            <stop
                              offset="100%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity="0.0"
                            />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const points = pingHistory.map((p, idx) => {
                            const x =
                              (idx / Math.max(pingHistory.length - 1, 1)) *
                                190 +
                              5
                            const maxVal = Math.max(
                              ...pingHistory.map((pt) => pt.latencyMs),
                              200
                            )
                            const y =
                              35 - (Math.min(p.latencyMs, maxVal) / maxVal) * 28
                            return { x, y, ...p }
                          })

                          const pathD = points.reduce(
                            (acc, pt, i) =>
                              `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`,
                            ""
                          )
                          const areaD = `${pathD} L ${points[points.length - 1].x} 40 L ${points[0].x} 40 Z`

                          return (
                            <>
                              <path d={areaD} fill="url(#sparkline-grad)" />
                              <path
                                d={pathD}
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              {points.map((pt, i) => (
                                <circle
                                  key={i}
                                  cx={pt.x}
                                  cy={pt.y}
                                  r="2.5"
                                  className={cn(
                                    pt.status === "online"
                                      ? "fill-emerald-500"
                                      : pt.status === "warning"
                                        ? "fill-amber-500"
                                        : "fill-destructive"
                                  )}
                                />
                              ))}
                            </>
                          )
                        })()}
                      </svg>
                    </div>

                    {/* Timeline status dots */}
                    <div className="flex items-center justify-between pt-0.5 text-[10px] text-muted-foreground">
                      <span>Oldest</span>
                      <div className="flex items-center gap-1.5">
                        {pingHistory.map((p, i) => (
                          <span
                            key={i}
                            title={`${new Date(p.timestamp).toLocaleTimeString()}: ${p.latencyMs}ms (${p.status})`}
                            className={cn(
                              "size-2 rounded-full",
                              p.status === "online"
                                ? "bg-emerald-500"
                                : p.status === "warning"
                                  ? "bg-amber-500"
                                  : "bg-destructive"
                            )}
                          />
                        ))}
                      </div>
                      <span>Latest</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="block text-[11px] text-muted-foreground">
                    Owner Team
                  </span>
                  <span className="mt-0.5 block truncate font-semibold text-foreground">
                    {service.owner || "Platform Team"}
                  </span>
                </div>
                <div className="rounded-xl border border-border bg-background p-3">
                  <span className="block text-[11px] text-muted-foreground">
                    Configured Status
                  </span>
                  <span className="mt-0.5 block font-semibold text-foreground capitalize">
                    {service.status}
                  </span>
                </div>
              </div>

              {/* Mirror Counterparts */}
              {mirrors.length > 0 && (
                <div className="space-y-2 rounded-xl border border-border bg-background p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-semibold text-foreground">
                      Mirror Environments ({mirrors.length})
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Same service in other stacks
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {mirrors.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 p-2 text-xs"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 font-mono text-[10px]"
                          >
                            {m.environment}
                          </Badge>
                          <span className="truncate font-medium text-foreground">
                            {m.name}
                          </span>
                        </div>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/10 hover:underline"
                        >
                          <span>Jump</span>
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Developer Testing Snippets */}
              <div className="space-y-3 rounded-xl border border-border bg-background p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Terminal className="size-3.5 text-primary" />
                    <span>Quick Code Snippets</span>
                  </div>
                </div>

                {/* .env variable */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>.env.local variable</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(`${envVarKey}="${service.url}"`, "env")
                      }
                      className="flex cursor-pointer items-center gap-1 text-primary hover:underline"
                    >
                      {copiedSnippet === "env" ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-muted/40 p-2 font-mono text-[11px] text-foreground select-all">
                    {envVarKey}=&quot;{service.url}&quot;
                  </pre>
                </div>

                {/* cURL */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>cURL test</span>
                    <button
                      type="button"
                      onClick={() => copyText(curlSnippet, "curl")}
                      className="flex cursor-pointer items-center gap-1 text-primary hover:underline"
                    >
                      {copiedSnippet === "curl" ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-muted/40 p-2 font-mono text-[11px] text-foreground select-all">
                    {curlSnippet}
                  </pre>
                </div>

                {/* fetch() */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>fetch() client snippet</span>
                    <button
                      type="button"
                      onClick={() => copyText(fetchSnippet, "fetch")}
                      className="flex cursor-pointer items-center gap-1 text-primary hover:underline"
                    >
                      {copiedSnippet === "fetch" ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-muted/40 p-2 font-mono text-[10px] leading-relaxed text-foreground select-all">
                    {fetchSnippet}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            /* TAB 2: INTERACTIVE API ROUTE TESTER & OPENAPI EXPLORER */
            <div className="space-y-4">
              <div className="space-y-3 rounded-xl border border-border bg-background p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Send className="size-3.5 text-emerald-500" />
                    <span>Send API Request</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Proxied securely via Next.js server
                  </span>
                </div>

                {/* Preset Subpaths */}
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    Preset:
                  </span>
                  <select
                    className="w-full rounded-md border border-border bg-muted/30 px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                    value={testerPath}
                    onChange={(e) => setTesterPath(e.target.value)}
                  >
                    {presetPaths.map((p) => (
                      <option
                        key={p.value}
                        value={p.value}
                        className="bg-background text-foreground"
                      >
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Request URL Input Bar */}
                <form onSubmit={handleRunApiTest} className="flex gap-1.5">
                  <select
                    value={testerMethod}
                    onChange={(e) => setTesterMethod(e.target.value as any)}
                    className="w-20 rounded-lg border border-border bg-muted/50 px-2 py-1.5 font-mono text-xs font-bold text-foreground focus:outline-hidden"
                  >
                    <option
                      value="GET"
                      className="bg-background text-foreground"
                    >
                      GET
                    </option>
                    <option
                      value="POST"
                      className="bg-background text-foreground"
                    >
                      POST
                    </option>
                    <option
                      value="HEAD"
                      className="bg-background text-foreground"
                    >
                      HEAD
                    </option>
                  </select>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={testerPath}
                      onChange={(e) => setTesterPath(e.target.value)}
                      placeholder="/health or /swagger/v1/swagger.json"
                      className="w-full rounded-lg border border-border bg-muted/30 px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-hidden"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isTesting}
                    size="sm"
                    className="h-auto shrink-0 cursor-pointer gap-1.5 px-3 py-1.5 text-xs font-semibold"
                  >
                    {isTesting ? (
                      <RefreshCw className="size-3.5 animate-spin" />
                    ) : (
                      <Play className="size-3.5 fill-current" />
                    )}
                    <span>{isTesting ? "Sending" : "Send"}</span>
                  </Button>
                </form>

                <div className="text-[10px] text-muted-foreground">
                  Resolves to:{" "}
                  <code className="font-mono text-foreground">
                    {service.url.replace(/\/+$/, "")}
                    {testerPath.startsWith("/") ? testerPath : "/" + testerPath}
                  </code>
                </div>
              </div>

              {/* Discovered OpenAPI / Swagger Endpoints */}
              {testResult?.discoveredEndpoints &&
                testResult.discoveredEndpoints.length > 0 && (
                  <div className="animate-in space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 fade-in-0">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="size-3.5" />
                        <span>
                          OpenAPI Spec Discovered (
                          {testResult.discoveredEndpoints.length} routes)
                        </span>
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Click route to test
                      </span>
                    </div>

                    <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
                      {testResult.discoveredEndpoints.map((ep, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setTesterPath(ep.path)
                            setTesterMethod(ep.method as any)
                          }}
                          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-border/60 bg-background/80 px-2 py-1 text-left text-xs transition-colors hover:border-primary hover:bg-primary/5"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-1 py-0 font-mono text-[9px] font-bold",
                                ep.method === "GET"
                                  ? "border-emerald-500/40 text-emerald-500"
                                  : ep.method === "POST"
                                    ? "border-blue-500/40 text-blue-500"
                                    : ep.method === "DELETE"
                                      ? "border-destructive/40 text-destructive"
                                      : "border-amber-500/40 text-amber-500"
                              )}
                            >
                              {ep.method}
                            </Badge>
                            <span className="truncate font-mono text-[11px] text-foreground">
                              {ep.path}
                            </span>
                          </div>
                          {ep.summary && (
                            <span className="max-w-[140px] truncate text-[10px] text-muted-foreground">
                              {ep.summary}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* Response Card */}
              {testResult && (
                <div className="animate-in space-y-3 rounded-xl border border-border bg-background p-4 shadow-2xs fade-in-0">
                  {/* Status & Latency Banner */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1 font-mono text-xs font-bold",
                          testResult.status >= 200 && testResult.status < 300
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : testResult.status >= 300 &&
                                testResult.status < 400
                              ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                              : testResult.status >= 400 &&
                                  testResult.status < 500
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "border-destructive/30 bg-destructive/10 text-destructive"
                        )}
                      >
                        <span>
                          {testResult.status > 0
                            ? `${testResult.status} ${testResult.statusText}`
                            : testResult.statusText}
                        </span>
                      </Badge>
                      {testResult.contentType && (
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {testResult.contentType.split(";")[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs font-semibold text-foreground">
                      <Clock className="size-3 text-muted-foreground" />
                      <span>{testResult.latencyMs}ms</span>
                    </div>
                  </div>

                  {/* Error if present */}
                  {testResult.error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                      <p className="font-semibold">Request Notice:</p>
                      <p className="mt-0.5 text-[11px]">{testResult.error}</p>
                    </div>
                  )}

                  {/* Response Body Viewer */}
                  {testResult.dataPreview && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted-foreground">
                          Response Body{" "}
                          {testResult.isJson && "(Formatted JSON)"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyText(testResult.dataPreview || "", "resp")
                          }
                          className="flex cursor-pointer items-center gap-1 text-[11px] text-primary hover:underline"
                        >
                          {copiedSnippet === "resp" ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>Copy Response</span>
                        </button>
                      </div>

                      <div className="relative overflow-hidden rounded-lg border border-border/80 bg-[#1e1e1e] p-3 text-white shadow-inner">
                        <pre className="max-h-72 overflow-auto font-mono text-[11px] leading-relaxed text-[#9cdcfe] select-all">
                          {testResult.dataPreview}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Headers Toggle */}
                  {Object.keys(testResult.headers).length > 0 && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowHeaders(!showHeaders)}
                        className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <span>
                          Response Headers (
                          {Object.keys(testResult.headers).length})
                        </span>
                        {showHeaders ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )}
                      </button>

                      {showHeaders && (
                        <div className="mt-2 max-h-40 animate-in space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-muted/30 p-2.5 font-mono text-[10px] fade-in-0">
                          {Object.entries(testResult.headers).map(([k, v]) => (
                            <div key={k} className="flex gap-2">
                              <span className="font-semibold text-primary">
                                {k}:
                              </span>
                              <span className="truncate text-foreground select-all">
                                {v}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

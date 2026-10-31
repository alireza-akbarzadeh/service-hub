"use client"

import * as React from "react"
import Link from "next/link"
import type { Service } from "@/lib/db/schema"
import {
  defaultRequest,
  defaultHeaders,
  buildEffectiveUrl,
  buildEffectiveHeaders,
  generateCurlSnippet,
  generateFetchSnippet,
  generateAxiosSnippet,
  generatePythonSnippet,
  generateGoSnippet,
  type HttpMethod,
  type KeyValueItem,
  type AuthType,
  type PlaygroundRequest,
  type PlaygroundResponse,
  type RequestHistoryItem,
} from "@/lib/api-playground-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  History,
  Layers,
  Network,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  X,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const HTTP_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  POST: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  PUT: "text-sky-500 bg-sky-500/10 border-sky-500/30",
  PATCH: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  DELETE: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  HEAD: "text-teal-500 bg-teal-500/10 border-teal-500/30",
  OPTIONS: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
}

const BODY_TEMPLATES = [
  {
    name: "User Authentication",
    payload: JSON.stringify(
      {
        username: "developer@company.local",
        password: "SuperSecretPassword123!",
        scope: "services:read write",
      },
      null,
      2
    ),
  },
  {
    name: "Order / Entity Create",
    payload: JSON.stringify(
      {
        customerId: "cust-9812",
        items: [{ id: "sku-101", quantity: 2, unitPrice: 49.99 }],
        currency: "USD",
        notes: "Automated test order via Service Hub Playground",
      },
      null,
      2
    ),
  },
  {
    name: "Health Ping Payload",
    payload: JSON.stringify(
      {
        client: "ServiceHub-Agent",
        timestamp: new Date().toISOString(),
        traceId: "tr-test-9901",
      },
      null,
      2
    ),
  },
]

interface ApiPlaygroundViewProps {
  initialServices: Service[]
  teamName?: string
}

export function ApiPlaygroundView({
  initialServices,
  teamName = "Frontend Squad",
}: ApiPlaygroundViewProps) {
  // Current Request State
  const [request, setRequest] = React.useState<PlaygroundRequest>(defaultRequest)
  const [activeReqTab, setActiveReqTab] = React.useState<
    "params" | "headers" | "auth" | "body" | "code"
  >("params")
  const [codeLang, setCodeLang] = React.useState<"curl" | "fetch" | "axios" | "python" | "go">(
    "curl"
  )

  // Response State
  const [response, setResponse] = React.useState<PlaygroundResponse | null>(null)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [activeResTab, setActiveResTab] = React.useState<"body" | "headers">("body")
  const [copiedCode, setCopiedCode] = React.useState<boolean>(false)
  const [copiedResponse, setCopiedResponse] = React.useState<boolean>(false)

  // History State
  const [history, setHistory] = React.useState<RequestHistoryItem[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = React.useState<boolean>(false)

  // Pre-load history from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("service_hub_playground_history_v1")
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [])

  const saveHistory = (item: RequestHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, 15)
      try {
        localStorage.setItem("service_hub_playground_history_v1", JSON.stringify(updated))
      } catch {
        // ignore
      }
      return updated
    })
  }

  // Quick prefill from catalog service
  const handleSelectService = (svc: Service) => {
    setRequest((prev) => ({
      ...prev,
      name: svc.name,
      url: svc.url,
      method: "GET",
    }))
  }

  // Param manipulation
  const addQueryParam = () => {
    setRequest((prev) => ({
      ...prev,
      queryParams: [
        ...prev.queryParams,
        { id: `q-${Date.now()}`, key: "", value: "", enabled: true },
      ],
    }))
  }

  const updateQueryParam = (id: string, field: "key" | "value" | "enabled", val: any) => {
    setRequest((prev) => ({
      ...prev,
      queryParams: prev.queryParams.map((q) => (q.id === id ? { ...q, [field]: val } : q)),
    }))
  }

  const removeQueryParam = (id: string) => {
    setRequest((prev) => ({
      ...prev,
      queryParams: prev.queryParams.filter((q) => q.id !== id),
    }))
  }

  // Header manipulation
  const addHeader = () => {
    setRequest((prev) => ({
      ...prev,
      headers: [
        ...prev.headers,
        { id: `h-${Date.now()}`, key: "", value: "", enabled: true },
      ],
    }))
  }

  const updateHeader = (id: string, field: "key" | "value" | "enabled", val: any) => {
    setRequest((prev) => ({
      ...prev,
      headers: prev.headers.map((h) => (h.id === id ? { ...h, [field]: val } : h)),
    }))
  }

  const removeHeader = (id: string) => {
    setRequest((prev) => ({
      ...prev,
      headers: prev.headers.filter((h) => h.id !== id),
    }))
  }

  // Execute Request via Server Proxy
  const handleExecuteRequest = async () => {
    if (!request.url.trim()) return
    setIsLoading(true)
    setResponse(null)

    const fullUrl = buildEffectiveUrl(request.url, request.queryParams)
    const effectiveHeaders = buildEffectiveHeaders(request.headers, request.auth)

    const startTime = performance.now()

    try {
      const res = await fetch("/api/playground/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: request.method,
          url: fullUrl,
          headers: effectiveHeaders,
          body:
            ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
            request.bodyType !== "none"
              ? request.body
              : undefined,
        }),
      })

      const json = await res.json()
      if (json.success && json.data) {
        setResponse(json.data)
        saveHistory({
          id: `hist-${Date.now()}`,
          timestamp: new Date().toISOString(),
          method: request.method,
          url: fullUrl,
          status: json.data.status,
          timeMs: json.data.timeMs,
          request: { ...request },
        })
      } else {
        const elapsed = Math.round(performance.now() - startTime)
        setResponse({
          status: 500,
          statusText: "Proxy Error",
          timeMs: elapsed,
          sizeBytes: 0,
          headers: {},
          body: JSON.stringify({ error: json.error || "Failed to proxy request" }, null, 2),
          isJson: true,
          error: json.error,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime)
      setResponse({
        status: 0,
        statusText: "Network Client Error",
        timeMs: elapsed,
        sizeBytes: 0,
        headers: {},
        body: JSON.stringify({ error: err.message || "Failed to send request" }, null, 2),
        isJson: true,
        error: err.message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format active code snippet
  const activeCodeSnippet = React.useMemo(() => {
    switch (codeLang) {
      case "curl":
        return generateCurlSnippet(request)
      case "fetch":
        return generateFetchSnippet(request)
      case "axios":
        return generateAxiosSnippet(request)
      case "python":
        return generatePythonSnippet(request)
      case "go":
        return generateGoSnippet(request)
    }
  }, [request, codeLang])

  const copySnippet = () => {
    navigator.clipboard.writeText(activeCodeSnippet)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const copyResponseBody = () => {
    if (!response) return
    navigator.clipboard.writeText(response.body)
    setCopiedResponse(true)
    setTimeout(() => setCopiedResponse(false), 2000)
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
              <Terminal className="size-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">API Playground</span>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                In-Browser HTTP Sandbox
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* History Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="h-8 cursor-pointer gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <History className="size-3.5 text-amber-500" />
            <span>History ({history.length})</span>
          </Button>

          {/* Quick links to Status & Topology */}
          <Link href="/status">
            <Button
              size="sm"
              variant="outline"
              className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            >
              <Activity className="size-3.5 text-emerald-500" />
              <span>Status</span>
            </Button>
          </Link>

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

      {/* Main Workspace */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 max-w-7xl mx-auto w-full space-y-5">
        {/* URL Input Strip & Method Selector */}
        <div className="rounded-2xl border border-border bg-card p-3 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            {/* Method Select */}
            <select
              value={request.method}
              onChange={(e) =>
                setRequest((prev) => ({ ...prev, method: e.target.value as HttpMethod }))
              }
              className={cn(
                "h-10 rounded-xl border px-3 text-xs font-bold font-mono cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                METHOD_COLORS[request.method]
              )}
            >
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m} className="bg-popover text-foreground font-semibold">
                  {m}
                </option>
              ))}
            </select>

            {/* URL Input */}
            <div className="relative flex-1">
              <Input
                value={request.url}
                onChange={(e) => setRequest((prev) => ({ ...prev, url: e.target.value }))}
                placeholder="https://api.example.com/v1/resource or choose catalog service below..."
                className="h-10 font-mono text-xs pr-28 rounded-xl"
              />
              {/* Preset Service Select Dropdown */}
              <select
                onChange={(e) => {
                  const svc = initialServices.find((s) => s.id === Number(e.target.value))
                  if (svc) handleSelectService(svc)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 rounded-lg bg-muted/60 border border-border/80 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Prefill Service...
                </option>
                {initialServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleExecuteRequest}
              disabled={isLoading || !request.url.trim()}
              className="h-10 px-5 gap-2 text-xs font-bold cursor-pointer rounded-xl shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="size-4" />
                  <span>Send</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Split Workbench: Request Builder (Left) & Response Viewer (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: REQUEST CONFIGURATION */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col min-h-[520px]">
            {/* Request Tabs Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-3 py-2">
              <div className="flex items-center gap-1">
                {(["params", "headers", "auth", "body", "code"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveReqTab(tab)}
                    className={cn(
                      "rounded-lg px-2.5 py-1 text-xs font-semibold uppercase font-mono tracking-wider transition-all cursor-pointer",
                      activeReqTab === tab
                        ? "bg-background text-foreground shadow-2xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab}
                    {tab === "params" && request.queryParams.length > 0 && (
                      <span className="ml-1 text-[10px] text-primary">
                        ({request.queryParams.filter((q) => q.enabled).length})
                      </span>
                    )}
                    {tab === "headers" && (
                      <span className="ml-1 text-[10px] text-primary">
                        ({request.headers.filter((h) => h.enabled).length})
                      </span>
                    )}
                    {tab === "auth" && request.auth.type !== "none" && (
                      <span className="ml-1 size-1.5 rounded-full bg-emerald-500 inline-block" />
                    )}
                  </button>
                ))}
              </div>

              {activeReqTab === "code" && (
                <div className="flex items-center gap-1">
                  {(["curl", "fetch", "axios", "python", "go"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCodeLang(lang)}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-mono uppercase cursor-pointer",
                        codeLang === lang
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tab 1: Query Params */}
            {activeReqTab === "params" && (
              <div className="p-4 flex-1 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Query Parameters</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addQueryParam}
                    className="h-7 text-xs gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Add Param</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {request.queryParams.map((param) => (
                    <div key={param.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={(e) => updateQueryParam(param.id, "enabled", e.target.checked)}
                        className="rounded accent-primary size-4 cursor-pointer"
                      />
                      <Input
                        value={param.key}
                        onChange={(e) => updateQueryParam(param.id, "key", e.target.value)}
                        placeholder="Key (e.g. limit)"
                        className="h-8 font-mono text-xs flex-1"
                      />
                      <Input
                        value={param.value}
                        onChange={(e) => updateQueryParam(param.id, "value", e.target.value)}
                        placeholder="Value (e.g. 50)"
                        className="h-8 font-mono text-xs flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQueryParam(param.id)}
                        className="size-8 p-0 text-muted-foreground hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  {request.queryParams.length === 0 && (
                    <p className="text-xs text-muted-foreground/70 italic py-4 text-center">
                      No query parameters configured. Click &quot;Add Param&quot; above.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Headers */}
            {activeReqTab === "headers" && (
              <div className="p-4 flex-1 space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Request Headers</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addHeader}
                    className="h-7 text-xs gap-1 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    <span>Add Header</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {request.headers.map((h) => (
                    <div key={h.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={(e) => updateHeader(h.id, "enabled", e.target.checked)}
                        className="rounded accent-primary size-4 cursor-pointer"
                      />
                      <Input
                        value={h.key}
                        onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                        placeholder="Header (e.g. Authorization)"
                        className="h-8 font-mono text-xs flex-1"
                      />
                      <Input
                        value={h.value}
                        onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                        placeholder="Value"
                        className="h-8 font-mono text-xs flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeHeader(h.id)}
                        className="size-8 p-0 text-muted-foreground hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Auth */}
            {activeReqTab === "auth" && (
              <div className="p-4 flex-1 space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-muted-foreground">Auth Type:</span>
                  {(["none", "bearer", "basic", "apiKey"] as const).map((at) => (
                    <button
                      key={at}
                      type="button"
                      onClick={() =>
                        setRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, type: at },
                        }))
                      }
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-mono capitalize border cursor-pointer",
                        request.auth.type === at
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
                      )}
                    >
                      {at === "apiKey" ? "API Key" : at}
                    </button>
                  ))}
                </div>

                {request.auth.type === "bearer" && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Bearer Token
                    </label>
                    <Input
                      value={request.auth.bearerToken || ""}
                      onChange={(e) =>
                        setRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, bearerToken: e.target.value },
                        }))
                      }
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="font-mono text-xs h-9"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Will be automatically passed as Authorization: Bearer &lt;token&gt;
                    </p>
                  </div>
                )}

                {request.auth.type === "basic" && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Username
                      </label>
                      <Input
                        value={request.auth.basicUsername || ""}
                        onChange={(e) =>
                          setRequest((prev) => ({
                            ...prev,
                            auth: { ...prev.auth, basicUsername: e.target.value },
                          }))
                        }
                        placeholder="admin"
                        className="font-mono text-xs h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Password
                      </label>
                      <Input
                        type="password"
                        value={request.auth.basicPassword || ""}
                        onChange={(e) =>
                          setRequest((prev) => ({
                            ...prev,
                            auth: { ...prev.auth, basicPassword: e.target.value },
                          }))
                        }
                        placeholder="••••••••"
                        className="font-mono text-xs h-8"
                      />
                    </div>
                  </div>
                )}

                {request.auth.type === "apiKey" && (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Key Name
                        </label>
                        <Input
                          value={request.auth.apiKeyName || "X-API-Key"}
                          onChange={(e) =>
                            setRequest((prev) => ({
                              ...prev,
                              auth: { ...prev.auth, apiKeyName: e.target.value },
                            }))
                          }
                          className="font-mono text-xs h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">
                          Location
                        </label>
                        <select
                          value={request.auth.apiKeyLocation || "header"}
                          onChange={(e) =>
                            setRequest((prev) => ({
                              ...prev,
                              auth: {
                                ...prev.auth,
                                apiKeyLocation: e.target.value as "header" | "query",
                              },
                            }))
                          }
                          className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-mono"
                        >
                          <option value="header">Header</option>
                          <option value="query">Query Parameter</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">
                        Value
                      </label>
                      <Input
                        value={request.auth.apiKeyValue || ""}
                        onChange={(e) =>
                          setRequest((prev) => ({
                            ...prev,
                            auth: { ...prev.auth, apiKeyValue: e.target.value },
                          }))
                        }
                        placeholder="api_live_..."
                        className="font-mono text-xs h-8"
                      />
                    </div>
                  </div>
                )}

                {request.auth.type === "none" && (
                  <p className="text-xs text-muted-foreground/70 italic py-6 text-center">
                    This request does not use authentication.
                  </p>
                )}
              </div>
            )}

            {/* Tab 4: Body */}
            {activeReqTab === "body" && (
              <div className="p-4 flex-1 space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setRequest((prev) => ({ ...prev, bodyType: "json" }))}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-semibold",
                        request.bodyType === "json"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      JSON
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequest((prev) => ({ ...prev, bodyType: "none" }))}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-semibold",
                        request.bodyType === "none"
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      None
                    </button>
                  </div>

                  {/* Templates */}
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground mr-1">Templates:</span>
                    {BODY_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.name}
                        type="button"
                        onClick={() =>
                          setRequest((prev) => ({
                            ...prev,
                            bodyType: "json",
                            body: tmpl.payload,
                          }))
                        }
                        className="rounded border border-border/80 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {tmpl.name}
                      </button>
                    ))}
                  </div>
                </div>

                {request.bodyType === "json" ? (
                  <textarea
                    value={request.body}
                    onChange={(e) => setRequest((prev) => ({ ...prev, body: e.target.value }))}
                    rows={14}
                    placeholder="Enter valid JSON payload..."
                    className="w-full flex-1 rounded-xl border border-border bg-muted/20 p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground italic">
                    No body will be transmitted with this request.
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Code Export */}
            {activeReqTab === "code" && (
              <div className="p-4 flex-1 space-y-3 flex flex-col">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Generated Code Snippet ({codeLang.toUpperCase()})</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copySnippet}
                    className="h-7 text-xs gap-1.5 cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="size-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy Snippet</span>
                      </>
                    )}
                  </Button>
                </div>

                <pre className="flex-1 overflow-auto rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed text-foreground select-all">
                  {activeCodeSnippet}
                </pre>
              </div>
            )}
          </div>

          {/* RIGHT: RESPONSE VIEWER */}
          <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden flex flex-col min-h-[520px]">
            {/* Response Bar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
                  Response
                </span>
                {response && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 font-bold",
                        response.status >= 200 && response.status < 300
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : response.status >= 400
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {response.status} {response.statusText}
                    </Badge>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {response.timeMs} ms
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {(response.sizeBytes / 1024).toFixed(2)} KB
                    </span>
                  </div>
                )}
              </div>

              {response && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveResTab("body")}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-mono uppercase cursor-pointer",
                        activeResTab === "body"
                          ? "bg-background text-foreground shadow-2xs border border-border font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Body
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResTab("headers")}
                      className={cn(
                        "rounded px-2 py-0.5 text-xs font-mono uppercase cursor-pointer",
                        activeResTab === "headers"
                          ? "bg-background text-foreground shadow-2xs border border-border font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Headers ({Object.keys(response.headers).length})
                    </button>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyResponseBody}
                    className="size-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                    title="Copy response body"
                  >
                    {copiedResponse ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Response Content View */}
            <div className="p-4 flex-1 flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-2">
                  <RefreshCw className="size-6 animate-spin text-primary" />
                  <p className="text-xs font-mono">Executing HTTP request...</p>
                </div>
              ) : response ? (
                activeResTab === "body" ? (
                  <pre className="flex-1 overflow-auto rounded-xl border border-border bg-muted/30 p-3.5 font-mono text-xs leading-relaxed text-foreground select-all max-h-[460px]">
                    {response.body}
                  </pre>
                ) : (
                  <div className="flex-1 overflow-auto max-h-[460px]">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-border/80 text-left text-muted-foreground uppercase text-[10px]">
                          <th className="py-1.5 px-2">Header</th>
                          <th className="py-1.5 px-2">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {Object.entries(response.headers).map(([k, v]) => (
                          <tr key={k} className="hover:bg-muted/20">
                            <td className="py-1.5 px-2 font-semibold text-primary">{k}</td>
                            <td className="py-1.5 px-2 text-foreground break-all">{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <Zap className="size-10 stroke-1 opacity-50 mb-2.5 text-amber-500" />
                  <p className="text-sm font-semibold text-foreground">
                    Sandbox Ready to Execute
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                    Choose a service or enter an endpoint URL, customize your parameters, and click &quot;Send&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Flyout / Bottom Strip */}
        {isHistoryOpen && (
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <History className="size-4 text-amber-500" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Request Execution History ({history.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setHistory([])
                    localStorage.removeItem("service_hub_playground_history_v1")
                  }}
                  className="h-6 text-[10px] text-muted-foreground hover:text-rose-500 cursor-pointer"
                >
                  Clear History
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsHistoryOpen(false)}
                  className="size-6 p-0 cursor-pointer"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRequest({ ...item.request })
                    setIsHistoryOpen(false)
                  }}
                  className="text-left rounded-lg border border-border/80 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span className={cn("font-bold", METHOD_COLORS[item.method])}>
                        {item.method}
                      </span>
                      {item.status && (
                        <span
                          className={cn(
                            "px-1 py-0 rounded text-[9px] font-bold",
                            item.status < 400 ? "text-emerald-500" : "text-rose-500"
                          )}
                        >
                          {item.status}
                        </span>
                      )}
                      {item.timeMs && (
                        <span className="text-muted-foreground">{item.timeMs}ms</span>
                      )}
                    </div>
                    <span className="text-xs text-foreground truncate block font-mono">
                      {item.url}
                    </span>
                  </div>
                  <Play className="size-3 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

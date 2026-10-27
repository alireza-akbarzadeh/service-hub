"use client"

import * as React from "react"
import Link from "next/link"
import {
  Activity,
  ArrowLeft,
  FileJson,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Binary,
  Clock,
  Radio,
  Sparkles,
  Layers,
  Wrench,
  Compass,
  Terminal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { JsonFormatterViewer } from "./json-formatter/json-formatter-viewer"
import { CurlInspector } from "./curl-inspector/curl-inspector"
import { JwtInspector } from "./jwt-inspector/jwt-inspector"
import { Base64Tool } from "./base64-tool/base64-tool"
import { HashGenerator } from "./hash-generator/hash-generator"
import { HeaderMarketSection } from "@/components/market-rates/header-market-section"

export type ActiveTool = "curl" | "json" | "jwt" | "base64" | "hash"

export function DevToolsView() {
  const [activeTool, setActiveTool] = React.useState<ActiveTool>("curl")
  const [passedJson, setPassedJson] = React.useState<string | null>(null)

  const handleSendToJsonFormatter = (jsonString: string) => {
    setPassedJson(jsonString)
    setActiveTool("json")
  }

  // Live mini clock for Tehran time in header
  const [tehranTime, setTehranTime] = React.useState<string>("")

  React.useEffect(() => {
    function tick() {
      const date = new Date()
      const str = date.toLocaleTimeString("en-US", {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      setTehranTime(str)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 flex flex-col">
      {/* Top Application Header */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
        {/* Left: Branding & Back link */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </Link>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Wrench className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight">Developer Tools</span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-primary/30 text-primary text-[10px] font-mono px-1.5 py-0"
              >
                Hub
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Market Rates, Tehran Time & Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Dollar & Gold Market Rates (Click: Convert to Persian / Double-Click: Dialog Chart & Info) */}
          <HeaderMarketSection />

          {/* Live Tehran Time Pill */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground font-mono">
            <Clock className="size-3.5 text-amber-500" />
            <span className="font-semibold text-foreground">{tehranTime}</span>
            <span className="text-[10px] opacity-75">IRST</span>
            <Radio className="size-2 text-emerald-500 animate-pulse" />
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Container - Full Widescreen Optimized */}
      <main className="w-full max-w-[1920px] mx-auto flex-1 space-y-3.5 px-3 sm:px-6 lg:px-8 py-3.5">
        {/* Compact Top Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-2.5 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-bold tracking-tight">
              Developer Utilities Suite
            </h1>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1 font-mono hidden sm:inline-flex"
            >
              <Sparkles className="size-2.5" />
              100% Client-Side Privacy
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden lg:inline text-[11px]">
              Fast AST tree inspection, auto-repair, token decoding, and cURL analysis.
            </span>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
          {[
            {
              id: "curl" as const,
              label: "cURL Inspector",
              icon: Terminal,
              badge: "New",
              badgeColor: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
            },
            {
              id: "json" as const,
              label: "JSON Formatter & Viewer",
              icon: FileJson,
              badge: "Featured",
              badgeColor: "border-primary/30 text-primary bg-primary/10",
            },
            {
              id: "jwt" as const,
              label: "JWT Token Inspector",
              icon: ShieldCheck,
            },
            {
              id: "base64" as const,
              label: "Base64 & URL Encoder",
              icon: Binary,
            },
            {
              id: "hash" as const,
              label: "UUID & Hash Generator",
              icon: Fingerprint,
            },
          ].map((tool) => {
            const isActive = activeTool === tool.id
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span>{tool.label}</span>
                {tool.badge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-1 px-1.5 py-0 text-[10px] font-mono",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
                        : tool.badgeColor
                    )}
                  >
                    {tool.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Active Tool View */}
        <div className="pt-2">
          {activeTool === "curl" && (
            <CurlInspector onSendToJsonFormatter={handleSendToJsonFormatter} />
          )}
          {activeTool === "json" && (
            <JsonFormatterViewer initialJson={passedJson || undefined} />
          )}
          {activeTool === "jwt" && <JwtInspector />}
          {activeTool === "base64" && <Base64Tool />}
          {activeTool === "hash" && <HashGenerator />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-4 px-6 text-center text-xs text-muted-foreground">
        <p>
          Service Hub Developer Tools • All sensitive payloads stay strictly within your browser.
        </p>
      </footer>
    </div>
  )
}

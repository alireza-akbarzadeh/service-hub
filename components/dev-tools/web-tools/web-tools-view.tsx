"use client"

import * as React from "react"
import Link from "next/link"
import {
  Globe,
  Clock,
  Link2,
  Fingerprint,
  FileText,
  Server,
  ArrowLeft,
  Sparkles,
  Layers,
  Wrench,
  Radio,
  FileJson,
  Bot,
  FileImage,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { HeaderMarketSection } from "@/components/market-rates/header-market-section"
import { cn } from "@/lib/utils"

import { InternetLaunchpad } from "./internet-launchpad"
import { TimestampConverter } from "./timestamp-converter"
import { UrlInspector } from "./url-inspector"
import { UuidGenerator } from "./uuid-generator"
import { MarkdownPreviewer } from "./markdown-previewer"
import { HttpReference } from "./http-reference"

export type WebToolId =
  | "launchpad"
  | "timestamp"
  | "url"
  | "uuid"
  | "markdown"
  | "http"

interface WebToolsViewProps {
  initialTab?: WebToolId
}

export function WebToolsView({ initialTab = "launchpad" }: WebToolsViewProps) {
  const [activeTab, setActiveTab] = React.useState<WebToolId>(initialTab)

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
        {/* Left: Branding & Navigation */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Catalog</span>
          </Link>

          <div className="h-5 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
              <Globe className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight">Internet Dev Tools & Launchpad</span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-sky-500/30 text-sky-600 dark:text-sky-400 text-[10px] font-mono px-1.5 py-0"
              >
                Web Hub
              </Badge>
            </div>
          </div>
        </div>

        {/* Right: Quick Links, Market, Tehran Time, Theme Toggle */}
        <div className="flex items-center gap-2">
          {/* Quick link to standard tools */}
          <Link
            href="/tools"
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileJson className="size-3 text-violet-500" />
            <span>JSON/JWT</span>
          </Link>

          {/* Quick link to advanced tools */}
          <Link
            href="/tools/advanced"
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileImage className="size-3 text-emerald-500" />
            <span>Image/RegEx</span>
          </Link>

          {/* Quick link to AI Catalog */}
          <Link
            href="/ai"
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bot className="size-3 text-primary" />
            <span>AI for Devs</span>
          </Link>

          {/* Market Rates Section */}
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

      {/* Main Container */}
      <main className="w-full max-w-[1920px] mx-auto flex-1 space-y-3.5 px-3 sm:px-6 lg:px-8 py-3.5">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-2.5 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-bold tracking-tight">
              Web Developer Utilities & External Tools Launchpad
            </h1>
            <Badge
              variant="outline"
              className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] gap-1 font-mono hidden sm:inline-flex"
            >
              <Sparkles className="size-2.5" />
              Everyday Software Engineering Toolbox
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-[11px]">
              Direct access to top online tools: Transform.tools, Ray.so, CyberChef, Webhook.site, plus in-browser utilities.
            </span>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
          {[
            {
              id: "launchpad" as const,
              label: "Internet Tools Launchpad",
              icon: Globe,
              badge: "24+ Tools",
              badgeColor: "border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10",
            },
            {
              id: "timestamp" as const,
              label: "Epoch & Timestamp",
              icon: Clock,
              badge: "Live Clock",
              badgeColor: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
            },
            {
              id: "url" as const,
              label: "URL & Query Params",
              icon: Link2,
              badge: "Parser",
              badgeColor: "border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
            },
            {
              id: "uuid" as const,
              label: "UUID & Tokens",
              icon: Fingerprint,
              badge: "Crypto",
              badgeColor: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
            },
            {
              id: "markdown" as const,
              label: "Markdown GFM Editor",
              icon: FileText,
              badge: "Live Preview",
              badgeColor: "border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10",
            },
            {
              id: "http" as const,
              label: "HTTP Codes & Scenarios",
              icon: Server,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-card/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
                )}
              >
                <Icon className={cn("size-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] px-1 py-0 font-mono transition-colors",
                      isActive
                        ? "border-primary-foreground/40 bg-primary-foreground/20 text-primary-foreground"
                        : tab.badgeColor
                    )}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Views */}
        <div className="pt-2">
          {activeTab === "launchpad" && <InternetLaunchpad />}
          {activeTab === "timestamp" && <TimestampConverter />}
          {activeTab === "url" && <UrlInspector />}
          {activeTab === "uuid" && <UuidGenerator />}
          {activeTab === "markdown" && <MarkdownPreviewer />}
          {activeTab === "http" && <HttpReference />}
        </div>
      </main>
    </div>
  )
}

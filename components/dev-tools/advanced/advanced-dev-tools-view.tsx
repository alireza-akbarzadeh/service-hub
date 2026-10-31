"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileImage,
  Code2,
  GitCompare,
  Clock,
  Palette,
  Database,
  QrCode,
  ArrowLeft,
  Sparkles,
  Layers,
  Wrench,
  Radio,
  FileJson,
  Bot,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { HeaderMarketSection } from "@/components/market-rates/header-market-section"
import { cn } from "@/lib/utils"

import { ImageCompressor } from "./image-compressor"
import { RegexTester } from "./regex-tester"
import { CodeDiffChecker } from "./code-diff-checker"
import { CronExplainer } from "./cron-explainer"
import { ColorPaletteGenerator } from "./color-palette-generator"
import { SqlFormatter } from "./sql-formatter"
import { QrGenerator } from "./qr-generator"

export type AdvancedToolId =
  | "image"
  | "regex"
  | "diff"
  | "cron"
  | "palette"
  | "sql"
  | "qr"

interface AdvancedDevToolsViewProps {
  initialTab?: AdvancedToolId
}

export function AdvancedDevToolsView({ initialTab = "image" }: AdvancedDevToolsViewProps) {
  const [activeTab, setActiveTab] = React.useState<AdvancedToolId>(initialTab)

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
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Sparkles className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight">Advanced Dev Tools</span>
              <Badge
                variant="outline"
                className="hidden sm:inline-flex border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono px-1.5 py-0"
              >
                Pro Suite
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
            <span>Standard JSON/JWT</span>
          </Link>

          {/* Quick link to Web Tools Hub */}
          <Link
            href="/tools/web"
            className="hidden lg:flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 transition-colors"
          >
            <Globe className="size-3 text-sky-500" />
            <span>Web Tools & Launchpad</span>
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
              Advanced Software Engineering Utilities
            </h1>
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1 font-mono hidden sm:inline-flex"
            >
              <Sparkles className="size-2.5" />
              100% Client-Side • Zero Server Latency
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-[11px]">
              Offline-ready utilities: Image compressor, RegEx evaluator, Git diff, Cron builder, Color palettes.
            </span>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
          {[
            {
              id: "image" as const,
              label: "Image Compressor & WebP",
              icon: FileImage,
              badge: "Hot",
              badgeColor: "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
            },
            {
              id: "regex" as const,
              label: "RegEx Tester & Evaluator",
              icon: Code2,
              badge: "AST",
              badgeColor: "border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
            },
            {
              id: "diff" as const,
              label: "Code & Text Diff Checker",
              icon: GitCompare,
              badge: "Git",
              badgeColor: "border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10",
            },
            {
              id: "cron" as const,
              label: "Cron Expression Builder",
              icon: Clock,
              badge: "5:10 PM CS2",
              badgeColor: "border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10",
            },
            {
              id: "palette" as const,
              label: "Color & Tailwind Palette",
              icon: Palette,
              badge: "WCAG",
              badgeColor: "border-pink-500/40 text-pink-600 dark:text-pink-400 bg-pink-500/10",
            },
            {
              id: "sql" as const,
              label: "SQL Formatter & Minifier",
              icon: Database,
            },
            {
              id: "qr" as const,
              label: "QR Code & WiFi Generator",
              icon: QrCode,
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
                    ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-1 px-1.5 py-0 text-[10px] font-mono",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground border-transparent"
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

        {/* Active Tool View */}
        <div className="pt-2">
          {activeTab === "image" && <ImageCompressor />}
          {activeTab === "regex" && <RegexTester />}
          {activeTab === "diff" && <CodeDiffChecker />}
          {activeTab === "cron" && <CronExplainer />}
          {activeTab === "palette" && <ColorPaletteGenerator />}
          {activeTab === "sql" && <SqlFormatter />}
          {activeTab === "qr" && <QrGenerator />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40 py-4 px-6 text-center text-xs text-muted-foreground">
        <p>
          Service Hub Advanced Developer Tools • All transformations run strictly inside your browser. Zero data leaves your computer.
        </p>
      </footer>
    </div>
  )
}

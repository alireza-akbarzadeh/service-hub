"use client"

import * as React from "react"
import Link from "next/link"
import { HeaderMarketSection } from "@/components/market-rates/header-market-section"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  CalendarDays,
  Clock,
  History,
  KeyRound,
  Network,
  Radio,
  Server,
  Terminal,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Service } from "@/lib/db/schema"

interface DashboardBottomBarProps {
  branchName?: string
  services?: Service[]
}

export function DashboardBottomBar({
  branchName = "production",
  services = [],
}: DashboardBottomBarProps) {
  // Live mini clock for Tehran time in the bottom ticker
  const [tehranTime, setTehranTime] = React.useState<string>("")

  React.useEffect(() => {
    function tick() {
      const date = new Date()
      const str = date.toLocaleTimeString("en-US", {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      setTehranTime(str)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate live health summary
  const degradedCount = services.filter((s) => s.status === "degraded").length
  const totalCount = services.length

  return (
    <footer className="fixed bottom-0 inset-x-0 z-30 flex h-10 shrink-0 items-center justify-between border-t border-border bg-background/90 px-3 sm:px-4 backdrop-blur-md shadow-xs select-none">
      {/* Left: Time Sync, Market Rates, and Health Status */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
        {/* Tehran Time Clock Ticker */}
        <Link href="/calendar">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 cursor-pointer gap-1.5 px-2 text-[11px] font-medium text-foreground hover:bg-muted/80"
            title="Tehran Local Time & Iran Calendar Sync (/calendar)"
          >
            <Clock className="size-3 text-amber-500" />
            <span className="font-mono font-semibold">{tehranTime || "Tehran"}</span>
            <span className="hidden items-center gap-1 opacity-80 sm:inline-flex">
              <span>IRST</span>
              <Radio className="size-2 animate-pulse text-sky-400" />
            </span>
          </Button>
        </Link>

        <Separator orientation="vertical" className="h-4 hidden sm:block" />

        {/* Live Dollar & Gold Market Rates */}
        <div className="shrink-0 scale-90 origin-left">
          <HeaderMarketSection />
        </div>

        <Separator orientation="vertical" className="h-4 hidden md:block" />

        {/* Live Cluster Health Status Pill - Sleek Unified Beacon */}
        <Link href="/status" className="hidden lg:inline-flex items-center">
          <div
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all duration-150 cursor-pointer select-none",
              degradedCount === 0
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/15"
                : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:border-amber-500/50 hover:bg-amber-500/15"
            )}
            title="View Live System Health & 30-Day SLA (/status)"
          >
            {/* Live Pulsing Beacon Dot */}
            <span className="relative flex size-2 shrink-0">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full rounded-full opacity-75",
                  degradedCount === 0
                    ? "animate-ping bg-emerald-400 duration-1000"
                    : "animate-ping bg-amber-400 duration-700"
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2 rounded-full",
                  degradedCount === 0 ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
            </span>

            {/* Status Label */}
            <span className="font-semibold tracking-tight">
              {degradedCount === 0 ? "All Systems Operational" : `${degradedCount} Degraded`}
            </span>

            {/* Seamless Inline SLA Indicator */}
            <span className="opacity-40 font-mono text-[9px]">•</span>
            <span className="font-mono text-[10px] font-medium opacity-85">
              99.98% SLA
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Developer Quick Dock & Branch Pill */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground mr-1 hidden xl:inline-block">
          Quick Dock:
        </span>

        {/* Playground */}
        <Link href="/playground">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 cursor-pointer gap-1 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            title="API Playground & HTTP Sandbox (/playground)"
          >
            <Zap className="size-3 text-amber-500" />
            <span className="hidden sm:inline">Playground</span>
          </Button>
        </Link>

        {/* Topology */}
        <Link href="/topology">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 cursor-pointer gap-1 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Microservice Topology & Dependency Graph (/topology)"
          >
            <Network className="size-3 text-cyan-500" />
            <span className="hidden sm:inline">Topology</span>
          </Button>
        </Link>

        {/* Env Studio */}
        <Link href="/env">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 cursor-pointer gap-1 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Environment Variables & Secrets Studio (/env)"
          >
            <KeyRound className="size-3 text-emerald-500" />
            <span className="hidden md:inline">Env Studio</span>
          </Button>
        </Link>

        {/* Activity Feed */}
        <Link href="/activity">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 cursor-pointer gap-1 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Activity Feed & Enterprise Audit Trail (/activity)"
          >
            <History className="size-3 text-sky-500" />
            <span className="hidden lg:inline">Activity</span>
          </Button>
        </Link>

        {/* Dev Tools Suite */}
        <Link href="/tools">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-7 cursor-pointer gap-1 px-2 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Developer Tools Suite (/tools)"
          >
            <Terminal className="size-3 text-violet-500" />
            <span className="hidden xl:inline">Dev Tools</span>
          </Button>
        </Link>

        <Separator orientation="vertical" className="h-4" />

        {/* Branch / Cloud indicator */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground px-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span className="hidden sm:inline uppercase">{branchName}</span>
        </div>
      </div>
    </footer>
  )
}


"use client"

import * as React from "react"
import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CalendarDays,
  Clock,
  Network,
  PanelRight,
  PanelRightClose,
  Radio,
  Settings,
  Search,
} from "lucide-react"
import { HeaderMarketSection } from "@/components/market-rates/header-market-section"
import { MeetQuickAction } from "@/components/meetings/meet-quick-action"
import { NotificationCenter } from "@/components/notifications/notification-center"
import type { Service } from "@/lib/db/schema"

interface DashboardHeaderProps {
  selectedEnv: string
  selectedCategory: string
  onResetFilters: () => void
  onOpenCommandPalette: () => void
  isRightPanelOpen: boolean
  onToggleRightPanel: () => void
  onOpenSettings?: () => void
  onOpenSubmitRequest?: (type?: "feature" | "bug" | "pull_request") => void
  services?: Service[]
  onInspectServiceByName?: (name: string) => void
}

export function DashboardHeader({
  selectedEnv,
  selectedCategory,
  onResetFilters,
  onOpenCommandPalette,
  isRightPanelOpen,
  onToggleRightPanel,
  onOpenSettings,
  onOpenSubmitRequest,
  services,
  onInspectServiceByName,
}: DashboardHeaderProps) {
  // Live mini clock for Tehran time in the header toggle button
  const [tehranTimeMini, setTehranTimeMini] = React.useState<string>("")

  React.useEffect(() => {
    function tick() {
      const date = new Date()
      const str = date.toLocaleTimeString("en-US", {
        timeZone: "Asia/Tehran",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      setTehranTimeMini(str)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Sidebar trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="shrink-0 cursor-pointer" />
        <Separator orientation="vertical" className="h-5 shrink-0" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onResetFilters()
                }}
                className="cursor-pointer text-xs"
              >
                Service Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-semibold">
                {selectedEnv}
              </BreadcrumbPage>
            </BreadcrumbItem>
            {selectedCategory !== "All" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-medium text-muted-foreground">
                    {selectedCategory}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Search, Market Rates, Dev Tools, Tehran Time & Meeting Toggle, Theme */}
      <div className="flex items-center gap-2">
        {/* Quick Search Button (Ctrl+K or /) */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenCommandPalette}
          className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground shadow-2xs hover:text-foreground hover:bg-muted"
          title="Quick Search & Command Palette (Ctrl+K or /)"
        >
          <Search className="size-3.5 text-primary" />
          <span className="hidden md:inline font-medium">Search</span>
          <kbd className="hidden lg:inline-flex rounded border border-border bg-muted/60 px-1 py-0 font-mono text-[9px] text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        {/* Dollar & Gold Market Rates (Click: Convert to Persian / Double-Click: Dialog Chart & Info) */}
        <HeaderMarketSection />

        {/* Meet Quick Action Popover */}
        <MeetQuickAction variant="pill" />

        {/* Topology Fast Link */}
        <Link href="/topology">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground shadow-2xs hover:text-foreground hover:bg-muted hidden 2xl:inline-flex"
            title="Microservice Topology & Dependency Graph (/topology)"
          >
            <Network className="size-3.5 text-cyan-500" />
            <span className="font-medium">Topology</span>
          </Button>
        </Link>

        {/* Dedicated Calendar & Iran Sync Page Link */}
        <Link href="/calendar">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-medium text-foreground shadow-2xs hover:bg-muted"
            title="Open Dedicated Calendar, Meetings & Iran Sync (/calendar)"
          >
            <Clock className="size-3.5 text-amber-500" />
            <span className="font-mono font-semibold">
              {tehranTimeMini || "Tehran"}
            </span>
            <span className="hidden items-center gap-1 opacity-90 sm:inline-flex">
              <span>• IRST</span>
              <Radio className="size-2.5 animate-pulse text-sky-400" />
            </span>
          </Button>
        </Link>

        {/* Notifications & Announcements Popover Center */}
        <NotificationCenter
          services={services}
          onInspectServiceByName={onInspectServiceByName}
        />

        {onOpenSettings && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground shadow-2xs hover:text-foreground"
            title="Dashboard Settings & JSON Config Editor"
          >
            <Settings className="size-3.5 text-primary" />
            <span className="hidden xl:inline">Settings</span>
          </Button>
        )}

        <Separator orientation="vertical" className="h-5" />
        <ThemeToggle />
      </div>
    </header>
  )
}

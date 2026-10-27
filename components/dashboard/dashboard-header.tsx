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
  Clock,
  FileJson,
  Gamepad2,
  GitPullRequest,
  PanelRight,
  PanelRightClose,
  Radio,
  Settings,
} from "lucide-react"
import { HeaderMarketSection } from "@/components/market-rates/header-market-section"

interface DashboardHeaderProps {
  selectedEnv: string
  selectedCategory: string
  onResetFilters: () => void
  onOpenCommandPalette: () => void
  isRightPanelOpen: boolean
  onToggleRightPanel: () => void
  onOpenSettings?: () => void
  onOpenSubmitRequest?: (type?: "feature" | "bug" | "pull_request") => void
}

export function DashboardHeader({
  selectedEnv,
  selectedCategory,
  onResetFilters,
  isRightPanelOpen,
  onToggleRightPanel,
  onOpenSettings,
  onOpenSubmitRequest,
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

      {/* Right: Market Rates, Dev Tools, Search, Tehran Time & Meeting Toggle, Theme */}
      <div className="flex items-center gap-2">
        {/* Dollar & Gold Market Rates (Click: Convert to Persian / Double-Click: Dialog Chart & Info) */}
        <HeaderMarketSection />

        <Separator orientation="vertical" className="hidden h-5 sm:block" />

        {/* Developer Tools Link */}
        <Link href="/tools">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-medium text-foreground shadow-2xs hover:bg-muted"
            title="Open Developer Tools Suite (JSON Formatter, JWT, Encoders)"
          >
            <FileJson className="size-3.5 text-violet-500" />
            <span className="hidden sm:inline">Dev Tools</span>
          </Button>
        </Link>

        {/* Anonymous Chat Lounge Link */}
        <Link href="/chat">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-medium text-foreground shadow-2xs hover:bg-muted"
            title="Open Anonymous Chat Lounge (#general, #game, etc.)"
          >
            <Gamepad2 className="size-3.5 text-pink-500" />
            <span className="hidden sm:inline">Anon Chat</span>
          </Button>
        </Link>

        {/* Requests & Bug Fix PRs Link */}
        <Link href="/requests">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-semibold border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 shadow-2xs"
            title="Open Feature Requests & Coworker Bug Fix PRs Hub"
          >
            <GitPullRequest className="size-3.5 text-purple-500" />
            <span className="hidden sm:inline">Requests & PRs</span>
          </Button>
        </Link>
        {/* Iranian Timezone & Meeting Panel Toggle Pill */}
        <Button
          type="button"
          variant={isRightPanelOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleRightPanel}
          className={cn(
            "h-8 cursor-pointer gap-2 px-3 text-xs font-medium shadow-2xs transition-all",
            isRightPanelOpen
              ? "bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
              : "text-foreground hover:bg-muted"
          )}
          title="Toggle Iranian Timezone Calendar & Frontend Meeting notifications"
        >
          <Clock className="size-3.5 shrink-0" />
          <span className="font-mono font-semibold">
            {tehranTimeMini || "Tehran"}
          </span>
          <span className="hidden items-center gap-1 opacity-90 sm:inline-flex">
            <span>• IRST</span>
            <Radio className="size-2.5 animate-pulse text-sky-300" />
          </span>
          {isRightPanelOpen ? (
            <PanelRightClose className="size-3.5 opacity-80" />
          ) : (
            <PanelRight className="size-3.5 opacity-80" />
          )}
        </Button>

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

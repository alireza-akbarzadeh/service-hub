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
import { Clock, FileJson, PanelRight, PanelRightClose, Radio, Search } from "lucide-react"
import { HeaderMarketSection } from "@/components/market-rates/header-market-section"

interface DashboardHeaderProps {
  selectedEnv: string
  selectedCategory: string
  onResetFilters: () => void
  onOpenCommandPalette: () => void
  isRightPanelOpen: boolean
  onToggleRightPanel: () => void
}

export function DashboardHeader({
  selectedEnv,
  selectedCategory,
  onResetFilters,
  onOpenCommandPalette,
  isRightPanelOpen,
  onToggleRightPanel,
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

        <Separator orientation="vertical" className="hidden sm:block h-5" />

        {/* Developer Tools Link */}
        <Link href="/tools">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-medium text-foreground hover:bg-muted shadow-2xs"
            title="Open Developer Tools Suite (JSON Formatter, JWT, Encoders)"
          >
            <FileJson className="size-3.5 text-violet-500" />
            <span className="hidden sm:inline">Dev Tools</span>
          </Button>
        </Link>

        {/* Quick Search */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground shadow-2xs transition-all hover:bg-muted hover:text-foreground md:flex"
          title="Quick Search & Launcher (Ctrl + K)"
        >
          <Search className="size-3.5 text-primary" />
          <span>Quick search...</span>
          <kbd className="pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-2xs select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

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

        <Separator orientation="vertical" className="h-5" />
        <ThemeToggle />
      </div>
    </header>
  )
}

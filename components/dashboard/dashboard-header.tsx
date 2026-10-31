"use client"

import * as React from "react"
import { MeetQuickAction } from "@/components/meetings/meet-quick-action"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { Service } from "@/lib/db/schema"
import { Search, Settings } from "lucide-react"

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
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6 select-none">
      {/* Left: Sidebar trigger & Navigation Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="shrink-0 cursor-pointer" />
        <Separator orientation="vertical" className="h-5 shrink-0" />
        <Breadcrumb className="truncate">
          <BreadcrumbList className="flex-nowrap">
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onResetFilters()
                }}
                className="cursor-pointer text-xs font-medium hover:text-foreground"
              >
                Service Hub
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-xs font-semibold text-foreground">
                {selectedEnv}
              </BreadcrumbPage>
            </BreadcrumbItem>
            {selectedCategory !== "All" && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs font-medium text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                    {selectedCategory}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Core Quick Actions (Search, Meet, Alerts, Settings, Theme) */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Universal Search (Ctrl+K) */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenCommandPalette}
          className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground"
          title="Quick Search & Command Palette (Ctrl+K or /)"
        >
          <Search className="size-3.5 text-primary" />
          <span className="hidden font-medium md:inline">Search</span>
          <kbd className="hidden rounded border border-border bg-muted/60 px-1 py-0 font-mono text-[9px] text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        </Button>

        {/* Instant Google Meet Launcher */}
        <MeetQuickAction variant="pill" />

        {/* Notification Center (Alerts, Outages & PRs) */}
        <NotificationCenter
          services={services}
          onInspectServiceByName={onInspectServiceByName}
        />

        {/* Dashboard Settings */}
        {onOpenSettings && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground shadow-2xs hover:bg-muted hover:text-foreground"
            title="Dashboard Settings & JSON Config Editor"
          >
            <Settings className="size-3.5 text-primary" />
            <span className="hidden xl:inline">Settings</span>
          </Button>
        )}

        <Separator orientation="vertical" className="h-5" />

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}

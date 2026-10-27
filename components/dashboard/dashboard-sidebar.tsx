"use client"

import * as React from "react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { NetworkStatusPill } from "@/components/network-status-indicator"
import { logoutAction } from "@/app/actions/services"
import {
  Activity,
  BookOpen,
  Building2,
  Code2,
  Compass,
  Cpu,
  Database,
  FileCode,
  FileJson,
  Terminal,
  Wrench,
  Layers,
  LogOut,
  MonitorCheck,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

const ENVIRONMENTS = [
  { id: "All", name: "All Environments", icon: Layers },
  { id: "Develop", name: "Development", icon: Code2 },
  { id: "Test", name: "QA & Testing", icon: MonitorCheck },
  { id: "Stage", name: "Staging Replica", icon: Cpu },
  { id: "DevOps & Tools", name: "DevOps & CI/CD", icon: Network },
  { id: "Portals & HR", name: "Portals & Enterprise", icon: Building2 },
]

interface DashboardSidebarProps {
  selectedEnv: string
  onSelectEnv: (envId: string) => void
  envCounts: Record<string, number>
  branchName: string
  teamName?: string
  networkInfo: any
  isRefreshingNetwork: boolean
  onRefreshNetwork: () => void
  onOpenEnvModal: () => void
  onOpenTour: () => void
  onOpenCommandPalette: () => void
  onPingVisibleServices: () => void
  isCheckingAllHealth: boolean
  visibleServicesCount: number
}

export function DashboardSidebar({
  selectedEnv,
  onSelectEnv,
  envCounts,
  branchName,
  teamName,
  networkInfo,
  isRefreshingNetwork,
  onRefreshNetwork,
  onOpenEnvModal,
  onOpenTour,
  onOpenCommandPalette,
  onPingVisibleServices,
  isCheckingAllHealth,
  visibleServicesCount,
}: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Activity className="size-4" />
          </div>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-bold tracking-tight">
              Service Catalog
            </span>
            <span className="truncate text-[11px] text-muted-foreground">
              Enterprise Hub
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Scrollable Content Divided into Shadcn Sidebar Groups */}
      <SidebarContent className="overflow-y-auto">
        {/* Section 1: Environments Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold">
            Environments
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ENVIRONMENTS.map((env) => {
                const Icon = env.icon
                const isActive = selectedEnv === env.id
                const count = envCounts[env.id] || 0
                return (
                  <SidebarMenuItem key={env.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => onSelectEnv(env.id)}
                      className="cursor-pointer justify-between"
                      tooltip={env.name}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-4" />
                        <span>{env.name}</span>
                      </div>
                      <span className="ml-auto font-mono text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                        {count}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section 2: Developer Tools (Moved from crowded header) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold">
            Developer Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* cURL Inspector */}
              <SidebarMenuItem>
                <Link href="/tools" className="w-full">
                  <SidebarMenuButton
                    tooltip="cURL Command Inspector"
                    className="cursor-pointer w-full"
                  >
                    <Terminal className="size-4 text-emerald-500" />
                    <span>cURL Inspector</span>
                    <Badge
                      variant="outline"
                      className="ml-auto px-1 py-0 text-[9px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 group-data-[collapsible=icon]:hidden"
                    >
                      New
                    </Badge>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* JSON Formatter & Dev Tools Suite */}
              <SidebarMenuItem>
                <Link href="/tools" className="w-full">
                  <SidebarMenuButton
                    tooltip="JSON Formatter & Dev Tools"
                    className="cursor-pointer w-full"
                  >
                    <FileJson className="size-4 text-violet-500" />
                    <span>JSON Formatter</span>
                    <Badge
                      variant="outline"
                      className="ml-auto px-1 py-0 text-[9px] font-mono border-violet-500/30 text-violet-600 dark:text-violet-400 group-data-[collapsible=icon]:hidden"
                    >
                      Viewer
                    </Badge>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              {/* Quick Search Trigger */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onOpenCommandPalette}
                  className="cursor-pointer"
                  tooltip="Search & Commands (Ctrl+K)"
                >
                  <Search className="size-4 text-primary" />
                  <span>Quick Search</span>
                  <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">
                    ⌘K
                  </kbd>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* .env Export Tool */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onOpenEnvModal}
                  className="cursor-pointer"
                  tooltip=".env Export Generator"
                >
                  <FileCode className="size-4 text-emerald-500" />
                  <span>.env Export</span>
                  <Badge
                    variant="outline"
                    className="ml-auto px-1 py-0 text-[9px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 group-data-[collapsible=icon]:hidden"
                  >
                    Generator
                  </Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Interactive Tour */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onOpenTour}
                  className="cursor-pointer"
                  tooltip="Guided Tour"
                >
                  <Compass className="size-4 text-sky-500" />
                  <span>Interactive Tour</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Documentation Hub */}
              <SidebarMenuItem>
                <Link href="/onboarding" className="w-full">
                  <SidebarMenuButton
                    tooltip="Documentation"
                    className="cursor-pointer w-full"
                  >
                    <BookOpen className="size-4 text-amber-500" />
                    <span>Documentation</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section 3: Health & Diagnostics (Ping visible services moved here) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold">
            Health & Observability
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2 py-1 group-data-[collapsible=icon]:px-0">
              <Button
                variant="outline"
                size="sm"
                onClick={onPingVisibleServices}
                disabled={isCheckingAllHealth || visibleServicesCount === 0}
                className="w-full justify-start gap-2 text-xs font-medium cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                title="Ping all visible service endpoints"
              >
                <Activity
                  className={cn(
                    "size-3.5 text-primary shrink-0",
                    isCheckingAllHealth && "animate-spin"
                  )}
                />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {isCheckingAllHealth ? "Pinging..." : "Ping Visible Services"}
                </span>
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section 4: Infrastructure & Neon Info */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel className="text-xs font-semibold group-data-[collapsible=icon]:hidden">
            Infrastructure
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2 px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Database className="size-3 text-emerald-500" />
                Branch:
              </span>
              <code className="font-mono font-semibold text-foreground">
                {branchName}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3 text-sky-500" />
                Driver:
              </span>
              <span className="font-mono text-[11px] text-foreground">
                drizzle-orm/neon
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3 text-primary" />
                Database:
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Network Status & Team Logout */}
      <SidebarFooter className="border-t border-border p-3 space-y-2">
        {/* Network Location Pill */}
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="group-data-[collapsible=icon]:hidden">
            <NetworkStatusPill
              locationInfo={networkInfo}
              isRefreshing={isRefreshingNetwork}
              onRefresh={onRefreshNetwork}
            />
          </div>
        </div>

        {/* Team Profile & Logout */}
        {teamName && (
          <div className="flex items-center justify-between border-t border-border/50 pt-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Users className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">
                  {teamName}
                </span>
                <span className="text-[10px] text-muted-foreground">Team Member</span>
              </div>
            </div>

            <form action={logoutAction}>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="size-7 cursor-pointer text-muted-foreground hover:text-destructive"
                title="Log out"
              >
                <LogOut className="size-3.5" />
              </Button>
            </form>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

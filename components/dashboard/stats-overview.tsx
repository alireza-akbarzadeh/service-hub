"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Clock, GitPullRequest, Server } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    total: number
    operational: number
    degraded: number
    maintenance: number
  }
  pendingRequestsCount?: number
}

export function StatsOverview({ stats, pendingRequestsCount }: StatsOverviewProps) {
  const hasRequests = typeof pendingRequestsCount === "number"

  return (
    <div
      className={
        hasRequests
          ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4"
          : "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      }
    >
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Total Registered</span>
          <Server className="size-4 text-primary opacity-80" />
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight">{stats.total}</div>
        <div className="text-[11px] text-muted-foreground">Across all microservices</div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Operational</span>
          <CheckCircle2 className="size-4 text-emerald-500" />
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
          {stats.operational}
        </div>
        <div className="text-[11px] text-muted-foreground">100% SLA target</div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Degraded / Warning</span>
          <AlertTriangle className="size-4 text-amber-500" />
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
          {stats.degraded}
        </div>
        <div className="text-[11px] text-muted-foreground">Investigating incident</div>
      </div>

      <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Under Maintenance</span>
          <Clock className="size-4 text-sky-500" />
        </div>
        <div className="mt-2 text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400">
          {stats.maintenance}
        </div>
        <div className="text-[11px] text-muted-foreground">Scheduled deployments</div>
      </div>

      {hasRequests && (
        <Link
          href="/requests"
          className="group rounded-xl border border-violet-500/30 bg-violet-500/5 p-3.5 shadow-2xs transition-all hover:border-violet-500/50 hover:bg-violet-500/10 cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-xs font-medium text-violet-600 dark:text-violet-400">
            <span>Pending Requests</span>
            <GitPullRequest className="size-4 text-violet-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
            {pendingRequestsCount}
          </div>
          <div className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
            PR reviews & bug reports &rarr;
          </div>
        </Link>
      )}
    </div>
  )
}

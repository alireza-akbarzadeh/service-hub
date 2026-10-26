"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, Clock, Server } from "lucide-react"

interface StatsOverviewProps {
  stats: {
    total: number
    operational: number
    degraded: number
    maintenance: number
  }
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Total Registered</span>
          <Server className="size-4 text-primary opacity-80" />
        </div>
        <div className="mt-2 text-2xl font-bold">{stats.total}</div>
        <div className="text-[11px] text-muted-foreground">Across all microservices</div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Operational</span>
          <CheckCircle2 className="size-4 text-emerald-500" />
        </div>
        <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {stats.operational}
        </div>
        <div className="text-[11px] text-muted-foreground">100% SLA target</div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Degraded / Warning</span>
          <AlertTriangle className="size-4 text-amber-500" />
        </div>
        <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
          {stats.degraded}
        </div>
        <div className="text-[11px] text-muted-foreground">Investigating incident</div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Under Maintenance</span>
          <Clock className="size-4 text-sky-500" />
        </div>
        <div className="mt-2 text-2xl font-bold text-sky-600 dark:text-sky-400">
          {stats.maintenance}
        </div>
        <div className="text-[11px] text-muted-foreground">Scheduled deployments</div>
      </div>
    </div>
  )
}
